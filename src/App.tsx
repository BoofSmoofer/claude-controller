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
import { Home } from 'lucide-react';
import { ViewsDetails } from './Views';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAppStore } from './stores/appStore';
import { Startup } from './Views/Startup';

function App() {
	const { hasInitiliased } = useAppStore();
	const { activeView, setActiveView } = useNavigationStore();
	const currentView = ViewsDetails.find(view => view.id === activeView);

	if (!hasInitiliased) {
		return <Startup />;
	}

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<div className='flex items-center gap-2 px-2 py-1'>
						<div className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center'>
							<Home className='h-4 w-4 text-primary-foreground' />
						</div>
						<span className='font-semibold'>Claude Controller</span>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{ViewsDetails.map(view => (
									<SidebarMenuItem key={view.id}>
										<SidebarMenuButton
											isActive={activeView === view.id}
											onClick={() =>
												setActiveView(view.id)
											}>
											<view.icon className='h-4 w-4' />
											<span>{view.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
					<SidebarTrigger className='-ml-1' />
					<div className='h-4 w-px bg-border' />
					<h1 className='text-lg font-semibold'>
						{currentView?.title}
					</h1>
				</header>
				{currentView?.component}
			</SidebarInset>
		</SidebarProvider>
	);
}

export default App;
