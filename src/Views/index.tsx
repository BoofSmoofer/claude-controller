import { WorkflowView } from './WorkflowView';
import { ViewId } from '@/stores/navigationStore';
import { Workflow, Settings, Blocks } from 'lucide-react';

export const ViewsDetails: ViewDetails[] = [
	{
		id: 'workflow',
		title: 'Workflow',
		icon: Workflow,
		component: <WorkflowView />,
	},
	{
		id: 'integrations',
		title: 'Integrations',
		icon: Blocks,
		component: <div />,
	},
	{
		id: 'settings',
		title: 'Settings',
		icon: Settings,
		component: <div />,
	},
];

interface ViewDetails {
	id: ViewId;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	component: React.ReactNode;
}
