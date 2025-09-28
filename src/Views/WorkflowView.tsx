import { JiraTicketSelector } from '@/components/JiraTicketSelector';
import { PlanEditor } from '@/components/PlanEditor';
import { StatusIndicator } from '@/components/StatusIndicator';
import { WorkingDirectorySelector } from '@/components/WorkingDirectorySelector';
import { WorkflowInitialization } from '@/components/WorkflowInitialization';
import AgentStatus from '@/components/AgentStatus';
import { useWorkflowStore } from '@/stores/worflowStore';
import { useAgentStore } from '@/stores/agentStore';

export function WorkflowView() {
	const { agentStatus, agentDetails, acpStatus } = useAgentStore();
	const { workflowInitialised } = useWorkflowStore();

	if (!workflowInitialised) {
		return <WorkflowInitialization />;
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

			{/* Footer Status Bar */}
			<div className='flex items-center justify-between bg-card border border-border p-4 sticky bottom-0'>
				<div className='flex items-center gap-4'>
					<StatusIndicator
						status={acpStatus ? 'completed' : 'pending'}
						label='ACP Subprocess'
					/>
				</div>
				<div className='flex items-center gap-4'>
					<WorkingDirectorySelector />
				</div>
			</div>
		</div>
	);
}
