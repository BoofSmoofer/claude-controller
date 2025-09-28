import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Loader2, FolderOpen } from 'lucide-react';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import AgentStatus from '@/components/AgentStatus';
import { useWorkflowStore } from '@/stores/worflowStore';
import { useAgentStore } from '@/stores/agentStore';

type InitializationStep =
	| 'directory'
	| 'starting-acp'
	| 'configuring'
	| 'ready';

interface StepConfig {
	title: string;
	description: string;
	isActive: (step: InitializationStep) => boolean;
	isComplete: (step: InitializationStep) => boolean;
	showDirectorySelector?: boolean;
}

const steps: StepConfig[] = [
	{
		title: 'Select Working Directory',
		description: 'Choose your project folder',
		isActive: step => step === 'directory',
		isComplete: step => step !== 'directory',
		showDirectorySelector: true,
	},
	{
		title: 'Initialize ACP Process',
		description: 'Starting Claude agent subprocess',
		isActive: step => step === 'starting-acp',
		isComplete: step => ['configuring', 'ready'].includes(step),
	},
	{
		title: 'Configure Environment',
		description: 'Setting up workspace configuration',
		isActive: step => step === 'configuring',
		isComplete: step => step === 'ready',
	},
	{
		title: 'Workflow Ready',
		description: 'Environment initialized and ready to use',
		isActive: step => step === 'ready',
		isComplete: step => step === 'ready',
	},
];

function StepIndicator({
	step,
	config,
	workingDirectory,
}: {
	step: InitializationStep;
	config: StepConfig;
	workingDirectory: string | null;
}) {
	const isActive = config.isActive(step);
	const isComplete = config.isComplete(step);
	const isLoading = isActive && step !== 'directory';

	return (
		<div className='flex items-center gap-3 p-3 rounded-lg border'>
			<div className='flex-shrink-0'>
				{isLoading ? (
					<Loader2 className='w-6 h-6 text-blue-500 animate-spin' />
				) : isComplete ? (
					<CheckCircle className='w-6 h-6 text-green-500' />
				) : isActive ? (
					<div className='w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center'>
						<div className='w-2 h-2 rounded-full bg-primary' />
					</div>
				) : (
					<div className='w-6 h-6 rounded-full border-2 border-muted-foreground/30' />
				)}
			</div>
			<div className='flex flex-col w-full gap-3'>
				<div className='flex-1'>
					<div className='font-medium'>{config.title}</div>
					<div className='text-sm text-muted-foreground'>
						{config.title === 'Select Working Directory' &&
						workingDirectory
							? workingDirectory
							: config.description}
					</div>
				</div>
				{config.showDirectorySelector && isActive && (
					<WorkingDirectorySelector />
				)}
			</div>
		</div>
	);
}

export function WorkflowInitialization() {
	const { workingDirectory, setWorkflowInitialised } = useWorkflowStore();
	const {
		agentStatus,
		agentDetails,
		setAcpStatus,
		setAgentDetails,
		setAgentStatus,
	} = useAgentStore();

	const [initializationStep, setInitializationStep] =
		useState<InitializationStep>('directory');

	useEffect(() => {
		if (workingDirectory && initializationStep === 'directory') {
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

	return (
		<div className='bg-background min-h-screen flex items-center justify-center p-6'>
			<div className='max-w-2xl w-full space-y-6'>
				<div className='text-center space-y-2'>
					<h1 className='text-2xl font-bold'>
						Claude Controller Setup
					</h1>
					<p className='text-muted-foreground'>
						Initialize your development workflow
					</p>
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
						{steps.map((stepConfig, index) => (
							<StepIndicator
								key={index}
								step={initializationStep}
								config={stepConfig}
								workingDirectory={workingDirectory}
							/>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
