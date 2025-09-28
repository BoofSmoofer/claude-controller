import { useState } from 'react';
import { Search, ExternalLink, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { invoke } from '@tauri-apps/api/core';

interface PromptResult {
	stopReason: string;
	meta?: unknown;
	text: string;
}

interface JiraTicket {
	id: string;
	key: string;
	title: string;
	type: 'Story' | 'Bug' | 'Task' | 'Epic';
	priority: 'Low' | 'Medium' | 'High' | 'Critical';
	assignee: string;
	status: string;
	created: string;
	description: string;
}

const mockTickets: JiraTicket[] = [
	{
		id: '1',
		key: 'ACP-123',
		title: 'Implement user authentication flow',
		type: 'Story',
		priority: 'High',
		assignee: 'John Smith',
		status: 'To Do',
		created: '2024-01-15',
		description:
			'Add OAuth2 authentication with role-based access control for the admin panel.',
	},
	{
		id: '2',
		key: 'ACP-124',
		title: 'Fix memory leak in background service',
		type: 'Bug',
		priority: 'Critical',
		assignee: 'Sarah Johnson',
		status: 'In Progress',
		created: '2024-01-14',
		description:
			'Background service consuming excessive memory during long-running operations.',
	},
	{
		id: '3',
		key: 'ACP-125',
		title: 'Add API rate limiting',
		type: 'Task',
		priority: 'Medium',
		assignee: 'Mike Chen',
		status: 'To Do',
		created: '2024-01-13',
		description:
			'Implement rate limiting for public API endpoints to prevent abuse.',
	},
];

export const JiraTicketSelector = () => {
	const [selectedTicket, setSelectedTicket] = useState<JiraTicket | null>(
		mockTickets[0]
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
	const [isPrompting, setIsPrompting] = useState(false);

	const filteredTickets = mockTickets.filter(
		ticket =>
			ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.key.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'Critical':
				return 'bg-destructive/10 text-destructive border-destructive/20';
			case 'High':
				return 'bg-warning/10 text-warning border-warning/20';
			case 'Medium':
				return 'bg-accent/10 text-accent border-accent/20';
			case 'Low':
				return 'bg-muted/10 text-muted-foreground border-muted/20';
			default:
				return 'bg-muted/10 text-muted-foreground border-muted/20';
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'Bug':
				return 'bg-destructive/10 text-destructive border-destructive/20';
			case 'Story':
				return 'bg-success/10 text-success border-success/20';
			case 'Epic':
				return 'bg-primary/10 text-primary border-primary/20';
			default:
				return 'bg-muted/10 text-muted-foreground border-muted/20';
		}
	};

	async function handleTestPrompt() {
		setIsPrompting(true);
		try {
			const reply = await invoke<PromptResult>('acp_prompt', {
				text: 'Hello Claude',
			});
			setPromptResult(reply);
			console.log('ACP reply', reply);
		} catch (error) {
			console.error('Prompt failed', error);
			setPromptResult(null);
		} finally {
			setIsPrompting(false);
		}
	}

	return (
		<div className='space-y-4'>
			<Card className='p-4'>
				<h2 className='text-lg font-semibold text-foreground mb-4'>
					Jira Tickets
				</h2>

				<div className='relative mb-4'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search tickets...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-10'
					/>
				</div>

				<div className='space-y-2 max-h-96 overflow-y-auto'>
					{filteredTickets.map(ticket => (
						<div
							key={ticket.id}
							className={`p-3 rounded-lg border cursor-pointer transition-smooth hover:bg-muted/20 ${
								selectedTicket?.id === ticket.id
									? 'bg-primary/10 border-primary/20'
									: 'border-border'
							}`}
							onClick={() => setSelectedTicket(ticket)}>
							<div className='flex items-start justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<span className='font-mono text-sm text-primary'>
										{ticket.key}
									</span>
									<Badge
										className={`text-xs ${getTypeColor(
											ticket.type
										)}`}>
										{ticket.type}
									</Badge>
									<Badge
										className={`text-xs ${getPriorityColor(
											ticket.priority
										)}`}>
										{ticket.priority}
									</Badge>
								</div>
								<ExternalLink className='h-4 w-4 text-muted-foreground hover:text-foreground transition-smooth' />
							</div>

							<h3 className='font-medium text-sm text-foreground mb-2 line-clamp-2'>
								{ticket.title}
							</h3>

							<div className='flex items-center gap-4 text-xs text-muted-foreground'>
								<div className='flex items-center gap-1'>
									<User className='h-3 w-3' />
									{ticket.assignee}
								</div>
								<div className='flex items-center gap-1'>
									<Calendar className='h-3 w-3' />
									{ticket.created}
								</div>
							</div>
						</div>
					))}
				</div>

				{selectedTicket && (
					<div className='mt-4 pt-4 border-t border-border'>
						<Button
							className='w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-smooth'
							onClick={handleTestPrompt}
							disabled={isPrompting}>
							{isPrompting ? 'Requesting…' : `Start Planning for ${selectedTicket.key}`}
						</Button>
					</div>
				)}
			</Card>

			{promptResult && (
				<Card className='p-4 space-y-2'>
					<h3 className='text-sm font-semibold text-foreground'>Claude Reply</h3>
					<p className='text-sm text-muted-foreground whitespace-pre-wrap'>
						{promptResult.text || '[no content received]'}
					</p>
					<p className='text-xs text-muted-foreground'>
						Stop reason: {promptResult.stopReason}
					</p>
				</Card>
			)}
		</div>
	);
};
