use agent_client_protocol::{
    Agent, Client, ClientCapabilities, ClientSideConnection, ContentBlock, CreateTerminalRequest,
    CreateTerminalResponse, Error, ExtNotification, ExtRequest, FileSystemCapability, InitializeRequest,
    KillTerminalCommandRequest, KillTerminalCommandResponse, McpServer, NewSessionRequest,
    PromptRequest, PromptResponse, ProtocolVersion, ReadTextFileRequest, ReadTextFileResponse,
    ReleaseTerminalRequest, ReleaseTerminalResponse, RequestPermissionRequest, RequestPermissionResponse,
    SessionId, SessionNotification, SessionUpdate, StopReason, TerminalOutputRequest, TerminalOutputResponse,
    TextContent, WaitForTerminalExitRequest, WaitForTerminalExitResponse, WriteTextFileRequest,
    WriteTextFileResponse,
};
use anyhow::Context;
use serde::Serialize;
use std::{path::PathBuf, sync::Arc, thread};
use tokio::{
    process::Command,
    sync::{mpsc, oneshot},
    task::LocalSet,
};
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};

pub struct TauriClient {
    pub root: PathBuf,
    pub notification_tx: mpsc::UnboundedSender<SessionNotification>,
}

#[async_trait::async_trait(?Send)]
impl Client for TauriClient {
	async fn request_permission(&self, _req: RequestPermissionRequest) -> Result<RequestPermissionResponse, Error> {
		Err(Error::new((-32601, "Permission requests not supported".to_string())))
	}

	async fn read_text_file(&self, r: ReadTextFileRequest) -> Result<ReadTextFileResponse, Error> {
		let path = self.root.join(r.path);
		let content = tokio::fs::read_to_string(path).await
			.map_err(|e| Error::new((-32603, format!("File read error: {}", e))))?;
		Ok(ReadTextFileResponse {
			content,
			meta: None,
		})
	}

	async fn write_text_file(&self, r: WriteTextFileRequest) -> Result<WriteTextFileResponse, Error> {
		let path = self.root.join(r.path);
		if let Some(parent) = path.parent() {
			tokio::fs::create_dir_all(parent).await.ok();
		}
		tokio::fs::write(path, r.content).await
			.map_err(|e| Error::new((-32603, format!("File write error: {}", e))))?;
		Ok(WriteTextFileResponse {
			meta: None,
		})
	}

	async fn session_notification(&self, n: SessionNotification) -> Result<(), Error> {
		let _ = self.notification_tx.send(n);
		Ok(())
	}

	async fn create_terminal(&self, _req: CreateTerminalRequest) -> Result<CreateTerminalResponse, Error> {
		Err(Error::new((-32601, "Terminal functionality not supported".to_string())))
	}

	async fn terminal_output(&self, _req: TerminalOutputRequest) -> Result<TerminalOutputResponse, Error> {
		Err(Error::new((-32601, "Terminal functionality not supported".to_string())))
	}

	async fn release_terminal(&self, _req: ReleaseTerminalRequest) -> Result<ReleaseTerminalResponse, Error> {
		Err(Error::new((-32601, "Terminal functionality not supported".to_string())))
	}

	async fn wait_for_terminal_exit(&self, _req: WaitForTerminalExitRequest) -> Result<WaitForTerminalExitResponse, Error> {
		Err(Error::new((-32601, "Terminal functionality not supported".to_string())))
	}

	async fn kill_terminal_command(&self, _req: KillTerminalCommandRequest) -> Result<KillTerminalCommandResponse, Error> {
		Err(Error::new((-32601, "Terminal functionality not supported".to_string())))
	}

	async fn ext_method(&self, _req: ExtRequest) -> Result<Arc<serde_json::value::RawValue>, Error> {
		Err(Error::new((-32601, "Extension methods not supported".to_string())))
	}

	async fn ext_notification(&self, _req: ExtNotification) -> Result<(), Error> {
		Ok(())
	}
}

#[derive(Clone)]
pub struct AcpHandle {
    command_tx: mpsc::UnboundedSender<AcpCommand>,
    session_id: SessionId,
}

impl AcpHandle {
    pub fn session_id(&self) -> SessionId {
        self.session_id.clone()
    }

    pub async fn prompt(&self, text: String) -> Result<PromptResult, String> {
        let (tx, rx) = oneshot::channel();
        self.command_tx
            .send(AcpCommand::Prompt { text, responder: tx })
            .map_err(|_| "ACP runtime not available".to_string())?;

        rx.await
            .map_err(|_| "ACP runtime shut down".to_string())?
            .map_err(|e| e.to_string())
    }
}

enum AcpCommand {
    Prompt {
        text: String,
        responder: oneshot::Sender<Result<PromptResult, Error>>,
    },
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptResult {
    pub stop_reason: StopReason,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<serde_json::Value>,
    pub text: String,
}

pub async fn start(root: PathBuf, use_cli_auth: bool) -> anyhow::Result<AcpHandle> {
    let (command_tx, command_rx) = mpsc::unbounded_channel();
    let (ready_tx, ready_rx) = oneshot::channel();

    let thread_root = root.clone();

    thread::Builder::new()
        .name("acp-runtime".into())
        .spawn(move || {
            let runtime = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("failed to build ACP runtime");

            runtime.block_on(async move {
                let local = LocalSet::new();
                local
                    .run_until(async move {
                        run_acp_worker(thread_root, use_cli_auth, command_rx, ready_tx).await;
                    })
                    .await;
            });
        })
        .map_err(|e| anyhow::anyhow!("failed to spawn ACP runtime thread: {e}"))?;

    let session_id = ready_rx
        .await
        .map_err(|e| anyhow::anyhow!("ACP runtime aborted before initialization: {e}"))??;

    Ok(AcpHandle {
        command_tx,
        session_id,
    })
}

async fn run_acp_worker(
    root: PathBuf,
    use_cli_auth: bool,
    mut command_rx: mpsc::UnboundedReceiver<AcpCommand>,
    ready_tx: oneshot::Sender<anyhow::Result<SessionId>>,
) {
    match setup_connection(root, use_cli_auth).await {
        Ok((mut ctx, mut notification_rx)) => {
            let session_id = ctx.session_id.clone();
            let _ = ready_tx.send(Ok(session_id.clone()));

            while let Some(cmd) = command_rx.recv().await {
                match cmd {
                    AcpCommand::Prompt { text, responder } => {
                        let mut agent_text = String::new();
                        let mut prompt_fut = Box::pin(ctx.agent.prompt(PromptRequest {
                            session_id: ctx.session_id.clone(),
                            prompt: vec![ContentBlock::Text(TextContent {
                                text,
                                annotations: None,
                                meta: None,
                            })],
                            meta: None,
                        }));

                        let mut prompt_result: Option<Result<PromptResponse, Error>> = None;

                        loop {
                            tokio::select! {
                                res = &mut prompt_fut => {
                                    prompt_result = Some(res);
                                    break;
                                }
                                notif = notification_rx.recv() => {
                                    match notif {
                                        Some(notification) => handle_notification(
                                            notification,
                                            &ctx.session_id,
                                            &mut agent_text,
                                        ),
                                        None => break,
                                    }
                                }
                            }
                        }

                        while let Ok(notification) = notification_rx.try_recv() {
                            handle_notification(notification, &ctx.session_id, &mut agent_text);
                        }

                        let result = prompt_result
                            .unwrap_or_else(|| Err(Error::new((-32603, "Prompt cancelled".into()))))
                            .map(|response| PromptResult {
                                stop_reason: response.stop_reason,
                                meta: response.meta,
                                text: agent_text,
                            });

                        let _ = responder.send(result);
                    }
                }
            }

            // All senders dropped; shut down the child if still running.
            let _ = ctx.child.kill().await;
            let _ = ctx.child.wait().await;
        }
        Err(err) => {
            let _ = ready_tx.send(Err(err));
        }
    }
}

struct WorkerContext {
    agent: ClientSideConnection,
    session_id: SessionId,
    child: tokio::process::Child,
}

async fn setup_connection(
    root: PathBuf,
    use_cli_auth: bool,
) -> anyhow::Result<(WorkerContext, mpsc::UnboundedReceiver<SessionNotification>)> {
    let mut cmd = if use_cli_auth {
        let mut c = Command::new(if cfg!(windows) { "npx.cmd" } else { "npx" });
        c.args(["acp-claude-code"]);
        c.env("ACP_PERMISSION_MODE", "acceptEdits");
        c
    } else {
        Command::new("claude-code-acp")
    };

    let mut child = cmd
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .context("failed to spawn ACP process")?;

    let incoming = child
        .stdout
        .take()
        .context("ACP child has no stdout")?
        .compat();
    let outgoing = child
        .stdin
        .take()
        .context("ACP child has no stdin")?
        .compat_write();

    let (notification_tx, notification_rx) = mpsc::unbounded_channel();

    let (agent, io_task) = ClientSideConnection::new(
        TauriClient {
            root: root.clone(),
            notification_tx,
        },
        outgoing,
        incoming,
        |fut| {
            tokio::task::spawn_local(fut);
        },
    );
    tokio::task::spawn_local(io_task);

    let init = InitializeRequest {
        protocol_version: ProtocolVersion::default(),
        client_capabilities: ClientCapabilities {
            fs: FileSystemCapability {
                read_text_file: true,
                write_text_file: true,
                meta: None,
            },
            terminal: false,
            meta: None,
        },
        meta: None,
    };

    agent.initialize(init).await?;

    let session_response = agent
        .new_session(NewSessionRequest {
            cwd: PathBuf::from(root.to_string_lossy().to_string()),
            mcp_servers: Vec::<McpServer>::new(),
            meta: None,
        })
        .await?;

    Ok((
        WorkerContext {
            agent,
            session_id: session_response.session_id,
            child,
        },
        notification_rx,
    ))
}

fn handle_notification(
    notification: SessionNotification,
    session_id: &SessionId,
    agent_text: &mut String,
) {
    if &notification.session_id != session_id {
        return;
    }

    if let SessionUpdate::AgentMessageChunk { content } = notification.update {
        if let ContentBlock::Text(text_content) = content {
            agent_text.push_str(&text_content.text);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use agent_client_protocol::StopReason;

    #[cfg(test)]
    fn mock_handle() -> (AcpHandle, mpsc::UnboundedReceiver<AcpCommand>) {
        let (command_tx, command_rx) = mpsc::unbounded_channel();
        let handle = AcpHandle {
            command_tx,
            session_id: SessionId(Arc::<str>::from("test-session")),
        };
        (handle, command_rx)
    }

    #[tokio::test(flavor = "current_thread")]
    async fn prompt_sends_command_and_returns_response() {
        let (handle, mut command_rx) = mock_handle();

        let prompt_fut = handle.prompt("hello world".into());

        match command_rx.recv().await.expect("command sent") {
            AcpCommand::Prompt { text, responder } => {
                assert_eq!(text, "hello world");
                let response = PromptResult {
                    stop_reason: StopReason::EndTurn,
                    meta: None,
                    text: "hi there".into(),
                };
                responder.send(Ok(response)).expect("response channel open");
            }
        }

        let result = prompt_fut.await.expect("prompt succeeds");
        assert_eq!(result.stop_reason, StopReason::EndTurn);
        assert_eq!(result.text, "hi there");
    }
}
