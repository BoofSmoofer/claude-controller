import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StartupProcess {
	id: string;
	name: string;
	status: 'pending' | 'running' | 'completed' | 'error';
	message?: string;
}

export function Startup() {
	const { setHasInitiliased } = useAppStore();
	const [processes, setProcesses] = useState<StartupProcess[]>([
		{ id: 'init', name: 'Initializing application', status: 'pending' },
		{ id: 'config', name: 'Loading configuration', status: 'pending' },
		{ id: 'services', name: 'Starting services', status: 'pending' },
		{ id: 'ready', name: 'Finalizing setup', status: 'pending' }
	]);

	const updateProcessStatus = (id: string, status: StartupProcess['status'], message?: string) => {
		setProcesses(prev => prev.map(process =>
			process.id === id ? { ...process, status, message } : process
		));
	};

	useEffect(() => {
		const runStartupProcesses = async () => {
			// Simulate startup processes
			for (const process of processes) {
				updateProcessStatus(process.id, 'running');

				// Simulate async work with random delay
				await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

				updateProcessStatus(process.id, 'completed');
			}

			// Small delay before transitioning to main app
			setTimeout(() => {
				setHasInitiliased(true);
			}, 500);
		};

		runStartupProcesses();
	}, [setHasInitiliased]);

	const getStatusIcon = (status: StartupProcess['status']) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4 text-muted-foreground" />;
			case 'running':
				return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'error':
				return <AlertCircle className="h-4 w-4 text-destructive" />;
		}
	};

	const getStatusText = (status: StartupProcess['status']) => {
		switch (status) {
			case 'pending':
				return 'Pending';
			case 'running':
				return 'Running...';
			case 'completed':
				return 'Completed';
			case 'error':
				return 'Error';
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-6">
			<div className="max-w-md w-full space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<Loader2 className="h-8 w-8 text-primary animate-spin" />
					</div>
					<h1 className="text-2xl font-bold">Starting Claude Controller</h1>
					<p className="text-muted-foreground">
						Please wait while we prepare your workspace...
					</p>
				</div>

				{/* Startup Processes */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Startup Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{processes.map((process) => (
								<div key={process.id} className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										{getStatusIcon(process.status)}
										<div>
											<div className="text-sm font-medium">{process.name}</div>
											{process.message && (
												<div className="text-xs text-muted-foreground">{process.message}</div>
											)}
										</div>
									</div>
									<div className="text-xs text-muted-foreground">
										{getStatusText(process.status)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Progress</span>
						<span className="text-muted-foreground">
							{processes.filter(p => p.status === 'completed').length} / {processes.length}
						</span>
					</div>
					<div className="w-full bg-secondary rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{
								width: `${(processes.filter(p => p.status === 'completed').length / processes.length) * 100}%`
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
