import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentStatusProps {
	status: 'idle' | 'thinking' | 'processing' | 'completed' | 'error';
	message?: string;
	className?: string;
}

const statusConfig = {
	idle: {
		icon: Brain,
		color: 'text-muted-foreground',
		bgColor: 'bg-muted/20',
		label: 'Ready',
	},
	thinking: {
		icon: Brain,
		color: 'text-blue-500',
		bgColor: 'bg-blue-500/10',
		label: 'Thinking...',
	},
	processing: {
		icon: Zap,
		color: 'text-amber-500',
		bgColor: 'bg-amber-500/10',
		label: 'Processing...',
	},
	completed: {
		icon: CheckCircle,
		color: 'text-green-500',
		bgColor: 'bg-green-500/10',
		label: 'Completed',
	},
	error: {
		icon: AlertCircle,
		color: 'text-red-500',
		bgColor: 'bg-red-500/10',
		label: 'Error',
	},
};

export function AgentStatus({ status, message, className }: AgentStatusProps) {
	const config = statusConfig[status];
	const IconComponent = config.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				'relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm',
				config.bgColor,
				className
			)}>
			{/* Animated background pulse for thinking/processing states */}
			<AnimatePresence>
				{(status === 'thinking' || status === 'processing') && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: [0.3, 0.6, 0.3] }}
						exit={{ opacity: 0 }}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						className={cn(
							'absolute inset-0 rounded-lg',
							status === 'thinking'
								? 'bg-blue-500/5'
								: 'bg-amber-500/5'
						)}
					/>
				)}
			</AnimatePresence>

			<div className='relative flex items-center gap-3'>
				{/* Icon with animations */}
				<motion.div
					initial={false}
					animate={
						status === 'thinking'
							? { rotate: [0, 10, -10, 0] }
							: status === 'processing'
							? { scale: [1, 1.1, 1] }
							: status === 'completed'
							? { scale: [0.8, 1.2, 1] }
							: {}
					}
					transition={
						status === 'thinking'
							? {
									duration: 2,
									repeat: Infinity,
									ease: 'easeInOut',
							  }
							: status === 'processing'
							? {
									duration: 1.5,
									repeat: Infinity,
									ease: 'easeInOut',
							  }
							: status === 'completed'
							? { duration: 0.6, ease: 'backOut' }
							: {}
					}
					className={cn(
						'flex items-center justify-center',
						config.color
					)}>
					{status === 'processing' ? (
						<Loader2 className='size-5 animate-spin' />
					) : (
						<IconComponent className='size-5' />
					)}
				</motion.div>

				{/* Status text with typewriter effect for thinking */}
				<div className='flex-1 min-w-0'>
					<motion.div
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
						className='font-medium text-sm'>
						{status === 'thinking' ? (
							<TypewriterText text={config.label} />
						) : (
							config.label
						)}
					</motion.div>

					{/* Message with stagger animation */}
					<AnimatePresence mode='wait'>
						{message && (
							<motion.div
								key={message}
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
								className='text-xs text-muted-foreground mt-1 overflow-hidden'>
								<motion.div
									initial={{ y: 10 }}
									animate={{ y: 0 }}
									transition={{ delay: 0.1 }}>
									{message}
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Thinking dots animation */}
				<AnimatePresence>
					{status === 'thinking' && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='flex gap-1'>
							{[0, 1, 2].map(i => (
								<motion.div
									key={i}
									initial={{ scale: 0.6, opacity: 0.3 }}
									animate={{
										scale: [0.6, 1, 0.6],
										opacity: [0.3, 1, 0.3],
									}}
									transition={{
										duration: 1.4,
										repeat: Infinity,
										delay: i * 0.2,
										ease: 'easeInOut',
									}}
									className='w-1.5 h-1.5 rounded-full bg-blue-500'
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}

// Typewriter effect component
function TypewriterText({ text }: { text: string }) {
	const [displayText, setDisplayText] = React.useState('');
	const [currentIndex, setCurrentIndex] = React.useState(0);

	React.useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setDisplayText(text.slice(0, currentIndex + 1));
				setCurrentIndex(currentIndex + 1);
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [currentIndex, text]);

	React.useEffect(() => {
		setDisplayText('');
		setCurrentIndex(0);
	}, [text]);

	return (
		<span>
			{displayText}
			<motion.span
				animate={{ opacity: [1, 0] }}
				transition={{ duration: 0.8, repeat: Infinity }}
				className='inline-block w-0.5 h-4 bg-current ml-1'
			/>
		</span>
	);
}

export default AgentStatus;
