import { IntegrationStatus } from './components/IntegrationStatus';
import { JiraTicketSelector } from './components/JiraTicketSelector';
import { PlanEditor } from './components/PlanEditor';
import { StatusIndicator } from './components/StatusIndicator';
import { WorkflowPipeline } from './components/WorkflowPipeline';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { Settings, Workflow, Home } from 'lucide-react';

function App() {
	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<div className="flex items-center gap-2 px-2 py-1">
						<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
							<Home className="h-4 w-4 text-primary-foreground" />
						</div>
						<span className="font-semibold">Claude Controller</span>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton isActive>
										<Workflow className="h-4 w-4" />
										<span>Workflow</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<Settings className="h-4 w-4" />
										<span>Settings</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<div className="h-4 w-px bg-border" />
					<h1 className="text-lg font-semibold">Workflow</h1>
				</header>
				<div className='min-h-screen bg-background p-6'>
					<div className='max-w-7xl mx-auto space-y-6'>
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
					<div className='text-sm text-muted-foreground'>
						Ready for next workflow
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export default App;
