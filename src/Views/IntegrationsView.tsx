import { useMemo, useState } from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IntegrationStatus } from '@/components/IntegrationStatus';
import { useIntegrationsStore } from '@/stores/integrationsStore';
import { Eye, EyeOff } from 'lucide-react';

export function IntegrationsView() {
	const { jira, setJira, resetJira } = useIntegrationsStore();
	const [tokenVisible, setTokenVisible] = useState(false);
	const hasJiraConfig = useMemo(
		() => Boolean(jira.baseUrl || jira.email || jira.apiToken),
		[jira.baseUrl, jira.email, jira.apiToken]
	);

	const toggleTokenVisibility = () => setTokenVisible(prev => !prev);

	const handleChange = (field: 'baseUrl' | 'email' | 'apiToken') =>
		(event: React.ChangeEvent<HTMLInputElement>) =>
			setJira({ [field]: event.target.value });

	return (
		<div className='min-h-screen bg-background p-6'>
			<div className='max-w-4xl mx-auto space-y-6'>
				<IntegrationStatus />

				<Card>
					<CardHeader>
						<CardTitle>Jira</CardTitle>
						<CardDescription>
							Provide your Jira Cloud credentials so Claude can fetch and display
							ticket details.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-1.5'>
							<label
								htmlFor='jira-base-url'
								className='text-sm font-medium text-foreground'>
								Jira base URL
							</label>
							<Input
								id='jira-base-url'
								placeholder='https://your-domain.atlassian.net'
								value={jira.baseUrl}
								onChange={handleChange('baseUrl')}
								autoComplete='url'
							/>
						</div>

						<div className='space-y-1.5'>
							<label
								htmlFor='jira-email'
								className='text-sm font-medium text-foreground'>
								Account email
							</label>
							<Input
								id='jira-email'
								type='email'
								placeholder='you@example.com'
								value={jira.email}
								onChange={handleChange('email')}
								autoComplete='email'
							/>
						</div>

						<div className='space-y-1.5'>
							<label
								htmlFor='jira-api-token'
								className='text-sm font-medium text-foreground'>
								API token
							</label>
							<div className='flex gap-2'>
								<Input
									id='jira-api-token'
									type={tokenVisible ? 'text' : 'password'}
									value={jira.apiToken}
									onChange={handleChange('apiToken')}
									autoComplete='off'
									placeholder='Jira API token'
								/>
								<Button
									type='button'
									variant='outline'
									onClick={toggleTokenVisibility}
									className='px-3'>
									{tokenVisible ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</Button>
							</div>
							<p className='text-xs text-muted-foreground'>
								Generate a token from your Atlassian account settings.
							</p>
						</div>
					</CardContent>
					<CardFooter className='flex justify-between'>
						<p className='text-xs text-muted-foreground'>
							Credentials are stored locally and used only for API calls from this app.
						</p>
						<Button
							type='button'
							variant='outline'
							onClick={resetJira}
							disabled={!hasJiraConfig}>
							Clear
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
