import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Integration {
	name: string;
	status: 'connected' | 'error' | 'connecting';
	lastSync?: string;
	details?: string;
}

const integrations: Integration[] = [
	{
		name: 'Jira',
		status: 'connected',
		lastSync: '2 minutes ago',
		details: '123 tickets synced',
	},
	{
		name: 'Bitbucket',
		status: 'connected',
		lastSync: '5 minutes ago',
		details: '15 repositories accessible',
	},
];

export const IntegrationStatus = () => {
	const getStatusIcon = (status: Integration['status']) => {
		switch (status) {
			case 'connected':
				return <CheckCircle className='h-4 w-4 text-success' />;
			case 'error':
				return <AlertCircle className='h-4 w-4 text-destructive' />;
			case 'connecting':
				return (
					<RefreshCw className='h-4 w-4 text-accent animate-spin' />
				);
		}
	};

	const getStatusColor = (status: Integration['status']) => {
		switch (status) {
			case 'connected':
				return 'bg-success/10 border-success/20';
			case 'error':
				return 'bg-destructive/10 border-destructive/20';
			case 'connecting':
				return 'bg-accent/10 border-accent/20';
		}
	};

	return (
		<Card className='p-4'>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-sm font-semibold text-foreground'>
					Integrations
				</h3>
				<Button variant='outline' size='sm'>
					<RefreshCw className='h-3 w-3 mr-1' />
					Sync
				</Button>
			</div>

			<div className='space-y-2'>
				{integrations.map(integration => (
					<div
						key={integration.name}
						className={`flex items-center justify-between p-2 rounded-md border transition-smooth ${getStatusColor(
							integration.status
						)}`}>
						<div className='flex items-center gap-2'>
							{getStatusIcon(integration.status)}
							<span className='text-sm font-medium text-foreground'>
								{integration.name}
							</span>
						</div>

						<div className='text-right'>
							<div className='text-xs text-muted-foreground'>
								{integration.lastSync}
							</div>
							{integration.details && (
								<div className='text-xs text-muted-foreground'>
									{integration.details}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
};
