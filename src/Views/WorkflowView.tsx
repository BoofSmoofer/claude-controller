import { JiraTicketSelector } from '@/components/JiraTicketSelector';
import { PlanEditor } from '@/components/PlanEditor';
import { StatusIndicator } from '@/components/StatusIndicator';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import AgentStatus from '@/components/AgentStatus';
import { useWorkflowStore } from '@/stores/worflowStore';
import { Folder } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';

const WorkingDirectoryStatus = () => {
	const { workingDirectory } = useWorkflowStore();

	if (!workingDirectory) {
		return (
			<div className='flex items-center gap-2 text-sm text-muted-foreground'>
				<Folder className='h-4 w-4' />
				<span>No directory selected</span>
			</div>
		);
	}

	const shortPath =
		workingDirectory.length > 40
			? '...' + workingDirectory.slice(-37)
			: workingDirectory;

	return (
		<div className='flex items-center gap-2 text-sm text-muted-foreground'>
			<Folder className='h-4 w-4' />
			<span className='font-mono'>{shortPath}</span>
		</div>
	);
};

export function WorkflowView() {
	const { agentStatus, agentDetails, setAgentDetails, setAgentStatus } =
		useAgentStore();

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
					<StatusIndicator status='pending' label='ACP Subprocess' />
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
