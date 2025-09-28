import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Loader2, FolderOpen, Settings } from 'lucide-react';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import { useWorkflowStore } from '@/stores/worflowStore';
import { useAgentStore } from '@/stores/agentStore';
import { useIntegrationsStore } from '@/stores/integrationsStore';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigationStore';

type InitializationStep =
	| 'jira-check'
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
	showJiraSetup?: boolean;
}

const steps: StepConfig[] = [
	{
		title: 'Check Jira Integration',
		description: 'Verify Jira connection is configured',
		isActive: step => step === 'jira-check',
		isComplete: step => !['jira-check'].includes(step),
		showJiraSetup: true,
	},
	{
		title: 'Select Working Directory',
		description: 'Choose your project folder',
		isActive: step => step === 'directory',
		isComplete: step => !['jira-check', 'directory'].includes(step),
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
	jiraConfigured,
	onJiraSetup,
}: {
	step: InitializationStep;
	config: StepConfig;
	workingDirectory: string | null;
	jiraConfigured: boolean;
	onJiraSetup: () => void;
}) {
	const isActive = config.isActive(step);
	const isComplete = config.isComplete(step);
	const isLoading = isActive && step !== 'directory' && step !== 'jira-check';

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
							: config.title === 'Check Jira Integration' &&
							  jiraConfigured
							? 'Jira integration is configured'
							: config.description}
					</div>
				</div>
				{config.showDirectorySelector && isActive && (
					<WorkingDirectorySelector />
				)}
				{config.showJiraSetup && isActive && !jiraConfigured && (
					<Button
						onClick={onJiraSetup}
						variant='outline'
						size='sm'
						className='flex items-center gap-2'>
						<Settings className='h-4 w-4' />
						Configure Jira
					</Button>
				)}
			</div>
		</div>
	);
}

export function WorkflowInitialization() {
	const { workingDirectory, setWorkflowInitialised } = useWorkflowStore();
	const { setAcpStatus, setAgentDetails, setAgentStatus } = useAgentStore();
	const { jira } = useIntegrationsStore();
	const { setActiveView } = useNavigationStore();

	const [initializationStep, setInitializationStep] =
		useState<InitializationStep>('jira-check');

	const jiraConfigured = useMemo(
		() => Boolean(jira.baseUrl && jira.email && jira.apiToken),
		[jira.baseUrl, jira.email, jira.apiToken]
	);

	useEffect(() => {
		if (jiraConfigured && initializationStep === 'jira-check') {
			setInitializationStep('directory');
		}
	}, [jiraConfigured, initializationStep]);

	useEffect(() => {
		if (workingDirectory && initializationStep === 'directory') {
			initializeWorkflow();
		}
	}, [workingDirectory]);

	const handleJiraSetup = () => {
		setActiveView('integrations');
	};

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
						{steps.map((stepConfig, index) => (
							<StepIndicator
								key={index}
								step={initializationStep}
								config={stepConfig}
								workingDirectory={workingDirectory}
								jiraConfigured={jiraConfigured}
								onJiraSetup={handleJiraSetup}
							/>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
