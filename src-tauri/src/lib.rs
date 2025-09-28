// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod acp;

use std::sync::{Arc, Mutex};
use agent_client_protocol::SessionId;

use crate::acp::PromptResult;

#[derive(Default)]
pub struct AppState {
    handle: Arc<Mutex<Option<acp::AcpHandle>>>,
}

impl AppState {
    pub fn set_handle(&self, handle: acp::AcpHandle) {
        *self.handle.lock().unwrap() = Some(handle);
    }

    pub fn handle(&self) -> Result<acp::AcpHandle, String> {
        let guard = self.handle.lock().map_err(|e| format!("Lock error: {}", e))?;
        match guard.as_ref() {
            Some(h) => Ok(h.clone()),
            None => Err("ACP connection not initialized".to_string()),
        }
    }

    pub fn session_id(&self) -> Result<SessionId, String> {
        let guard = self.handle.lock().map_err(|e| format!("Lock error: {}", e))?;
        match guard.as_ref() {
            Some(h) => Ok(h.session_id()),
            None => Err("ACP connection not initialized".to_string()),
        }
    }
}

#[tauri::command]
async fn acp_start(use_cli_auth: bool, project_root: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
  let handle = acp::start(project_root.into(), use_cli_auth).await.map_err(|e| e.to_string())?;
  state.set_handle(handle);
  Ok(())
}

#[tauri::command]
async fn acp_prompt(text: String, state: tauri::State<'_, AppState>) -> Result<PromptResult, String> {
  let handle = state.handle()?;
  handle.prompt(text).await
}

#[tauri::command]
async fn select_working_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app.dialog()
        .file()
        .blocking_pick_folder();

    match file_path {
        Some(path) => Ok(Some(path.to_string())),
        None => Ok(None),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![acp_start, acp_prompt, select_working_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
