import { IntegrationStatus } from './components/IntegrationStatus';
import { JiraTicketSelector } from './components/JiraTicketSelector';
import { PlanEditor } from './components/PlanEditor';
import { StatusIndicator } from './components/StatusIndicator';
import { WorkflowPipeline } from './components/WorkflowPipeline';

function App() {
	return (
		<div className='min-h-screen bg-background p-6'>
			<div className='max-w-7xl mx-auto space-y-6'>
				{/* Header */}
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-foreground'>
							Agent Control Plane
						</h1>
						<p className='text-muted-foreground mt-1'>
							Claude-powered development workflow automation
						</p>
					</div>
					<IntegrationStatus />
				</header>

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

				{/* Status Bar */}
				<div className='flex items-center justify-between bg-card border border-border rounded-lg p-4'>
					<div className='flex items-center gap-4'>
						<StatusIndicator
							status='pending'
							label='ACP Subprocess'
						/>
						<StatusIndicator
							status='in-progress'
							label='Claude Agent'
						/>
						<StatusIndicator
							status='completed'
							label='Last Execution'
						/>
					</div>
					<div className='text-sm text-muted-foreground'>
						Ready for next workflow
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
