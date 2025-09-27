import { ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PipelineStepProps {
	title: string;
	status: 'pending' | 'in-progress' | 'completed' | 'error';
	description: string;
	isLast?: boolean;
}

const PipelineStep = ({
	title,
	status,
	description,
	isLast,
}: PipelineStepProps) => {
	const getStatusIcon = () => {
		switch (status) {
			case 'completed':
				return <CheckCircle className='h-5 w-5 text-success' />;
			case 'in-progress':
				return <Clock className='h-5 w-5 text-accent animate-pulse' />;
			case 'error':
				return <AlertCircle className='h-5 w-5 text-destructive' />;
			default:
				return (
					<div className='h-5 w-5 rounded-full border-2 border-muted' />
				);
		}
	};

	const getStatusStyles = () => {
		switch (status) {
			case 'completed':
				return 'bg-success/10 border-success/20';
			case 'in-progress':
				return 'bg-accent/10 border-accent/20';
			case 'error':
				return 'bg-destructive/10 border-destructive/20';
			default:
				return 'bg-muted/10 border-muted/20';
		}
	};

	return (
		<div className='flex items-center'>
			<Card className={`p-4 transition-smooth ${getStatusStyles()}`}>
				<div className='flex items-center gap-3'>
					{getStatusIcon()}
					<div>
						<h3 className='font-semibold text-sm text-foreground'>
							{title}
						</h3>
						<p className='text-xs text-muted-foreground'>
							{description}
						</p>
					</div>
				</div>
			</Card>
			{!isLast && (
				<ArrowRight className='h-5 w-5 text-muted-foreground mx-3 flex-shrink-0' />
			)}
		</div>
	);
};

export const WorkflowPipeline = () => {
	const steps = [
		{
			title: 'Select Ticket',
			status: 'completed' as const,
			description: 'Jira ticket selected',
		},
		{
			title: 'Plan',
			status: 'in-progress' as const,
			description: 'Claude planning implementation',
		},
		{
			title: 'Develop',
			status: 'pending' as const,
			description: 'Code implementation',
		},
		{
			title: 'QA Test',
			status: 'pending' as const,
			description: 'Quality assurance testing',
		},
	];

	return (
		<Card className='p-6 bg-gradient-surface border-border/50'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-semibold text-foreground'>
					Workflow Pipeline
				</h2>
				<div className='text-sm text-muted-foreground'>Step 2 of 4</div>
			</div>

			<div className='flex items-center overflow-x-auto pb-2'>
				{steps.map((step, index) => (
					<PipelineStep
						key={step.title}
						{...step}
						isLast={index === steps.length - 1}
					/>
				))}
			</div>
		</Card>
	);
};
