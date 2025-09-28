import { useMemo, useState } from 'react';
import { Search, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { invoke } from '@tauri-apps/api/core';
import { useIntegrationsStore } from '@/stores/integrationsStore';
import dayjs from 'dayjs';

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

const normalizeType = (value?: string): JiraTicket['type'] => {
	switch (value) {
		case 'Bug':
		case 'Story':
		case 'Task':
		case 'Epic':
			return value;
		default:
			return 'Task';
	}
};

const normalizePriority = (value?: string): JiraTicket['priority'] => {
	switch (value) {
		case 'Low':
		case 'Medium':
		case 'High':
		case 'Critical':
			return value;
		default:
			return 'Medium';
	}
};

export const JiraTicketSelector = () => {
	const [ticketId, setTicketId] = useState('');
	const [ticket, setTicket] = useState<JiraTicket | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
	const [isPrompting, setIsPrompting] = useState(false);
	const { jira } = useIntegrationsStore();

	const jiraConfigured = useMemo(
		() => Boolean(jira.baseUrl && jira.email && jira.apiToken),
		[jira.baseUrl, jira.email, jira.apiToken]
	);

	const fetchTicketDetails = async (id: string) => {
		if (!id.trim()) {
			setTicket(null);
			setError(null);
			return;
		}

		if (!jiraConfigured) {
			setTicket(null);
			setError(
				'Configure Jira credentials in Integrations before searching.'
			);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const raw = await invoke<Record<string, unknown>>('get_issue', {
				baseUrl: jira.baseUrl,
				email: jira.email,
				apiToken: jira.apiToken,
				issueKey: id,
			});

			if (!raw || typeof raw !== 'object') {
				setTicket(null);
				setError(`Ticket ${id} not found`);
				return;
			}

			const fields = (raw as any).fields ?? {};
			const description = (() => {
				const value = fields.description;
				if (!value) return 'No description provided.';
				if (typeof value === 'string') return value;
				return 'Description uses an unsupported format.';
			})();

			const mappedTicket: JiraTicket = {
				id: (raw as any).id ?? id,
				key: (raw as any).key ?? id,
				title: fields.summary ?? 'Untitled ticket',
				type: normalizeType(fields.issuetype?.name),
				priority: normalizePriority(fields.priority?.name),
				assignee: fields.assignee?.displayName ?? 'Unassigned',
				status: fields.status?.name ?? 'Unknown',
				created: fields.created ?? 'Unknown',
				description,
			};

			setTicket(mappedTicket);
		} catch (err) {
			console.error(err);
			setError(`Failed to fetch ticket ${id}`);
			setTicket(null);
		} finally {
			setIsLoading(false);
		}
	};

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

	const handleTicketIdSubmit = async () => {
		await fetchTicketDetails(ticketId);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleTicketIdSubmit();
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
					Jira Ticket
				</h2>

				<div className='flex gap-2 mb-4'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Enter ticket ID (e.g., APC-142)'
							value={ticketId}
							onChange={e => setTicketId(e.target.value)}
							onKeyPress={handleKeyPress}
							className='pl-10'
						/>
					</div>
					<Button
						onClick={handleTicketIdSubmit}
						disabled={
							isLoading || !ticketId.trim() || !jiraConfigured
						}
						className='px-4'>
						{isLoading ? 'Loading...' : 'Search'}
					</Button>
				</div>

				{!jiraConfigured && !error && (
					<div className='p-3 rounded-lg bg-muted/20 text-muted-foreground border border-border/50 mb-4'>
						Connect your Jira account from the Integrations view to
						fetch tickets.
					</div>
				)}

				{error && (
					<div className='p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 mb-4'>
						{error}
					</div>
				)}

				{ticket && (
					<div className='space-y-4'>
						<div className='p-4 rounded-lg border border-border bg-card'>
							<div className='flex items-start justify-between mb-3'>
								<div className='flex items-center gap-2'>
									<span className='font-mono text-lg text-primary font-semibold'>
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
							</div>

							<h3 className='font-semibold text-foreground mb-3 text-base'>
								{ticket.title}
							</h3>

							<p className='text-sm text-muted-foreground mb-4 leading-relaxed'>
								{ticket.description}
							</p>

							<div className='flex items-center gap-6 text-sm text-muted-foreground'>
								<div className='flex items-center gap-2'>
									<User className='h-4 w-4' />
									<span>Assignee: {ticket.assignee}</span>
								</div>
								<div className='flex items-center gap-2'>
									<Calendar className='h-4 w-4' />
									<span>
										Created:{' '}
										{dayjs(ticket.created).format(
											'YYYY-MM-DD'
										)}
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<span>Status: {ticket.status}</span>
								</div>
							</div>
						</div>

						<Button
							className='w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-smooth'
							onClick={handleTestPrompt}
							disabled={isPrompting}>
							{isPrompting
								? 'Requesting…'
								: `Start Planning for ${ticket.key}`}
						</Button>
					</div>
				)}
			</Card>

			{promptResult && (
				<Card className='p-4 space-y-2'>
					<h3 className='text-sm font-semibold text-foreground'>
						Claude Reply
					</h3>
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
