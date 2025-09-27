import { CheckCircle, Clock, AlertCircle, Circle } from 'lucide-react';

interface StatusIndicatorProps {
	status: 'pending' | 'in-progress' | 'completed' | 'error';
	label: string;
	size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator = ({
	status,
	label,
	size = 'md',
}: StatusIndicatorProps) => {
	const getStatusIcon = () => {
		const iconSize =
			size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

		switch (status) {
			case 'completed':
				return <CheckCircle className={`${iconSize} text-success`} />;
			case 'in-progress':
				return (
					<Clock
						className={`${iconSize} text-accent animate-pulse`}
					/>
				);
			case 'error':
				return (
					<AlertCircle className={`${iconSize} text-destructive`} />
				);
			default:
				return (
					<Circle className={`${iconSize} text-muted-foreground`} />
				);
		}
	};

	const getStatusText = () => {
		switch (status) {
			case 'completed':
				return 'text-success';
			case 'in-progress':
				return 'text-accent';
			case 'error':
				return 'text-destructive';
			default:
				return 'text-muted-foreground';
		}
	};

	const textSize =
		size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

	return (
		<div className='flex items-center gap-2'>
			{getStatusIcon()}
			<span className={`${textSize} font-medium ${getStatusText()}`}>
				{label}
			</span>
		</div>
	);
};
