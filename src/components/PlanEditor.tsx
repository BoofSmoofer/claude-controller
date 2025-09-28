import { useState } from 'react';
import {
	FileCode,
	GitBranch,
	Play,
	Save,
	MessageSquare,
	Code2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const mockPlan = `## Implementation Plan for ACP-123: User Authentication Flow

### Overview
Implement OAuth2 authentication with role-based access control for the admin panel.

### Technical Approach
1. **Authentication Service**
   - Set up OAuth2 provider integration (Google, GitHub)
   - Create JWT token management
   - Implement refresh token rotation

2. **Database Schema Changes**
   - Create users table with role field
   - Add sessions table for token management
   - Create roles and permissions tables

3. **API Endpoints**
   - POST /auth/login - Initiate OAuth flow
   - POST /auth/callback - Handle OAuth callback
   - POST /auth/refresh - Refresh access tokens
   - DELETE /auth/logout - Invalidate sessions

4. **Frontend Components**
   - Login page with OAuth buttons
   - Route guards for protected pages
   - User profile dropdown
   - Role-based UI rendering

### Repository Analysis
**Relevant Repos:**
- \`auth-service\` - Main authentication microservice
- \`frontend-admin\` - Admin panel React application
- \`shared-types\` - TypeScript interfaces and types
- \`database-migrations\` - Schema migration scripts

### Implementation Steps
1. Update database schema (database-migrations)
2. Implement OAuth handlers (auth-service)
3. Create JWT middleware (auth-service)
4. Build login components (frontend-admin)
5. Add route protection (frontend-admin)
6. Update shared types (shared-types)

### Testing Strategy
- Unit tests for authentication handlers
- Integration tests for OAuth flow
- E2E tests for login/logout flows
- Security testing for token validation

### Estimated Effort: 3-5 days`;

const repositories = [];

export const PlanEditor = () => {
	const [plan, setPlan] = useState();
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className='space-y-4'>
			<Card className='p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-lg font-semibold text-foreground'>
						Implementation Plan
					</h2>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setIsEditing(!isEditing)}>
							{isEditing ? (
								<Save className='h-4 w-4 mr-2' />
							) : (
								<FileCode className='h-4 w-4 mr-2' />
							)}
							{isEditing ? 'Save' : 'Edit'}
						</Button>
						<Button
							size='sm'
							className='bg-gradient-primary text-primary-foreground hover:shadow-glow transition-smooth'>
							<Play className='h-4 w-4 mr-2' />
							Execute Plan
						</Button>
					</div>
				</div>

				<Tabs defaultValue='plan' className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='plan'>
							<MessageSquare className='h-4 w-4 mr-2' />
							Plan
						</TabsTrigger>
						<TabsTrigger value='repos'>
							<GitBranch className='h-4 w-4 mr-2' />
							Repositories
						</TabsTrigger>
						<TabsTrigger value='implementation'>
							<Code2 className='h-4 w-4 mr-2' />
							Implementation
						</TabsTrigger>
					</TabsList>

					<TabsContent value='plan' className='mt-4'>
						{!plan ? (
							<div className='space-y-4'>
								<div className='text-center py-12 text-muted-foreground'>
									<MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' />
									<p>Start planning to see it here</p>
									<p className='text-sm mt-2'>
										Plan will populate once you select a
										jira ticket
									</p>
								</div>
							</div>
						) : (
							<Textarea
								disabled={!isEditing}
								value={plan}
								onChange={e => setPlan(e.target.value)}
								className='min-h-[500px] font-mono text-sm'
								placeholder='Enter implementation plan...'
							/>
						)}
					</TabsContent>

					<TabsContent value='repos' className='mt-4'>
						<div className='space-y-3'>
							{repositories.length === 0 && (
								<div className='space-y-4'>
									<div className='text-center py-12 text-muted-foreground'>
										<GitBranch className='h-12 w-12 mx-auto mb-4 opacity-50' />
										<p>
											Related repositories will show here
										</p>
										<p className='text-sm mt-2'>
											Add related repositories to see them
											here
										</p>
									</div>
								</div>
							)}
							{repositories.length > 0 &&
								repositories.map(repo => (
									<div
										key={repo.name}
										className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'>
										<div className='flex items-center gap-3'>
											<GitBranch className='h-4 w-4 text-muted-foreground' />
											<span className='font-mono text-sm text-foreground'>
												{repo.name}
											</span>
											<Badge
												variant='outline'
												className='text-xs'>
												{repo.files} files
											</Badge>
										</div>
										<Badge
											className={`text-xs ${
												repo.status === 'analyzed'
													? 'status-completed'
													: repo.status ===
													  'analyzing'
													? 'status-in-progress'
													: 'status-pending'
											}`}>
											{repo.status}
										</Badge>
									</div>
								))}
						</div>
					</TabsContent>

					<TabsContent value='implementation' className='mt-4'>
						<div className='space-y-4'>
							<div className='text-center py-12 text-muted-foreground'>
								<Code2 className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>
									Implementation will begin once plan is
									executed
								</p>
								<p className='text-sm mt-2'>
									Code changes will appear here during
									development
								</p>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
};
