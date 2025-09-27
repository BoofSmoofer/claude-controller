import { JiraTicketSelector } from '@/components/JiraTicketSelector';
import { PlanEditor } from '@/components/PlanEditor';
import { StatusIndicator } from '@/components/StatusIndicator';
import { WorkflowPipeline } from '@/components/WorkflowPipeline';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import { useWorkflowStore } from '@/stores/worflowStore';
import { Folder } from 'lucide-react';

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

	const shortPath = workingDirectory.length > 40
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
	return (
		<div>
			<div className='min-h-screen bg-background p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Working Directory Selection */}
					<WorkingDirectorySelector />

					{/* Workflow Pipeline */}
					<WorkflowPipeline />

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
					<WorkingDirectoryStatus />
					<div className='text-sm text-muted-foreground'>
						Ready for next workflow
					</div>
				</div>
			</div>
		</div>
	);
}
