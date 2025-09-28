import { JiraTicketSelector } from '@/components/JiraTicketSelector';
import { PlanEditor } from '@/components/PlanEditor';
import { StatusIndicator } from '@/components/StatusIndicator';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import AgentStatus from '@/components/AgentStatus';
import { useWorkflowStore } from '@/stores/worflowStore';
import { useAgentStore } from '@/stores/agentStore';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	CheckCircle,
	Loader2,
	AlertCircle,
	FolderOpen,
	Settings,
	Zap,
} from 'lucide-react';

export function WorkflowView() {
	const {
		agentStatus,
		agentDetails,
		acpStatus,
		setAcpStatus,
		setAgentDetails,
		setAgentStatus,
	} = useAgentStore();
	const { workingDirectory, workflowInitialised, setWorkflowInitialised } =
		useWorkflowStore();

	const [initializationStep, setInitializationStep] = useState<
		'directory' | 'starting-acp' | 'configuring' | 'ready'
	>('directory');

	useEffect(() => {
		if (workingDirectory && !workflowInitialised) {
			initializeWorkflow();
		}
	}, [workingDirectory]);

	const initializeWorkflow = async () => {
		setInitializationStep('starting-acp');
		setAgentStatus('processing');
		setAgentDetails('Starting ACP subprocess...');

		try {
			await invoke('acp_start', {
				useCliAuth: true,
				projectRoot: workingDirectory,
			});

			setInitializationStep('configuring');
			setAgentDetails('Configuring workspace environment...');

			// Simulate configuration time
			await new Promise(resolve => setTimeout(resolve, 1500));

			setInitializationStep('ready');
			setAcpStatus(true);
			setAgentStatus('idle');
			setAgentDetails('Ready to begin workflow');
			setWorkflowInitialised(true);
		} catch (error) {
			setAcpStatus(false);
			setAgentStatus('error');
			setAgentDetails(
				'Failed to initialize workspace. Please check your working directory.'
			);
			setInitializationStep('directory');
		}
	};

	if (!workflowInitialised) {
		return (
			<div className='bg-background min-h-screen flex items-center justify-center p-6'>
				<div className='max-w-2xl w-full space-y-6'>
					<div className='text-center space-y-2'>
						<h1 className='text-2xl font-bold'>
							Initialize your development workflow
						</h1>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FolderOpen className='h-5 w-5' />
								Workspace Initialization
							</CardTitle>
							<CardDescription>
								Setting up your development environment
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{/* Step 1: Directory Selection */}
							<div className='flex items-center gap-3 p-3 rounded-lg border'>
								<div className='flex-shrink-0'>
									{initializationStep === 'directory' ? (
										<div className='w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center'>
											<div className='w-2 h-2 rounded-full bg-primary' />
										</div>
									) : (
										<CheckCircle className='w-6 h-6 text-green-500' />
									)}
								</div>
								<div className='flex flex-col w-full gap-3'>
									<div className='flex-1'>
										<div className='font-medium'>
											Select Working Directory
										</div>
										<div className='text-sm text-muted-foreground'>
											{workingDirectory ||
												'Choose your project folder'}
										</div>
									</div>
									{initializationStep === 'directory' && (
										<WorkingDirectorySelector />
									)}
								</div>
							</div>

							{/* Step 2: ACP Initialization */}
							<div className='flex items-center gap-3 p-3 rounded-lg border'>
								<div className='flex-shrink-0'>
									{initializationStep === 'starting-acp' ? (
										<Loader2 className='w-6 h-6 text-blue-500 animate-spin' />
									) : initializationStep === 'directory' ? (
										<div className='w-6 h-6 rounded-full border-2 border-muted-foreground/30' />
									) : (
										<CheckCircle className='w-6 h-6 text-green-500' />
									)}
								</div>
								<div className='flex-1'>
									<div className='font-medium'>
										Initialize ACP Process
									</div>
									<div className='text-sm text-muted-foreground'>
										Starting Claude agent subprocess
									</div>
								</div>
							</div>

							{/* Step 3: Configuration */}
							<div className='flex items-center gap-3 p-3 rounded-lg border'>
								<div className='flex-shrink-0'>
									{initializationStep === 'configuring' ? (
										<Loader2 className='w-6 h-6 text-amber-500 animate-spin' />
									) : ['directory', 'starting-acp'].includes(
											initializationStep
									  ) ? (
										<div className='w-6 h-6 rounded-full border-2 border-muted-foreground/30' />
									) : (
										<CheckCircle className='w-6 h-6 text-green-500' />
									)}
								</div>
								<div className='flex-1'>
									<div className='font-medium'>
										Configure Environment
									</div>
									<div className='text-sm text-muted-foreground'>
										Setting up workspace configuration
									</div>
								</div>
							</div>

							{/* Step 4: Ready */}
							<div className='flex items-center gap-3 p-3 rounded-lg border'>
								<div className='flex-shrink-0'>
									{initializationStep === 'ready' ? (
										<CheckCircle className='w-6 h-6 text-green-500' />
									) : (
										<div className='w-6 h-6 rounded-full border-2 border-muted-foreground/30' />
									)}
								</div>
								<div className='flex-1'>
									<div className='font-medium'>
										Workflow Ready
									</div>
									<div className='text-sm text-muted-foreground'>
										Environment initialized and ready to use
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className='min-h-screen bg-background p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Agent Status */}
					<AgentStatus
						status={agentStatus}
						message={agentDetails}
						className='w-full'
					/>

					{/* Main Content Grid */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Left Column - Ticket Selection */}
						<div className='lg:col-span-1'>
							<JiraTicketSelector />
						</div>

						{/* Right Column - Plan and Implementation */}
						<div className='lg:col-span-2'>
							<PlanEditor />
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center justify-between bg-card border border-border p-4 sticky bottom-0'>
				<div className='flex items-center gap-4'>
					<StatusIndicator
						status={acpStatus ? 'completed' : 'pending'}
						label='ACP Subprocess'
					/>
					<StatusIndicator
						status='completed'
						label='Last Execution'
					/>
				</div>
				<div className='flex items-center gap-4'>
					<WorkingDirectorySelector />
				</div>
			</div>
		</div>
	);
}
