import { useState } from 'react';
import { Folder, FolderOpen, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/worflowStore';
import { invoke } from '@tauri-apps/api/core';

export const WorkingDirectorySelector = () => {
	const { workingDirectory, setWorkingDirectory } = useWorkflowStore();
	const [isSelecting, setIsSelecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSelectDirectory = async () => {
		setIsSelecting(true);
		setError(null);

		try {
			const result = await invoke<string | null>('select_working_directory');
			if (result) {
				setWorkingDirectory(result);
			}
		} catch (err) {
			setError('Failed to select directory');
			console.error('Directory selection error:', err);
		} finally {
			setIsSelecting(false);
		}
	};

	const handleClearDirectory = () => {
		setWorkingDirectory(null);
		setError(null);
	};

	return (
		<Card className='p-4'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold text-foreground'>
					Working Directory
				</h2>
				{workingDirectory && (
					<Button
						variant='outline'
						size='sm'
						onClick={handleClearDirectory}
						className='text-muted-foreground hover:text-foreground'
					>
						Clear
					</Button>
				)}
			</div>

			{error && (
				<div className='flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4'>
					<AlertCircle className='h-4 w-4 text-destructive' />
					<span className='text-sm text-destructive'>{error}</span>
				</div>
			)}

			{workingDirectory ? (
				<div className='space-y-3'>
					<div className='flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20'>
						<FolderOpen className='h-5 w-5 text-success mt-0.5' />
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-medium text-foreground mb-1'>
								Current Directory
							</p>
							<p className='text-sm text-muted-foreground font-mono break-all'>
								{workingDirectory}
							</p>
						</div>
					</div>
					<Button
						variant='outline'
						onClick={handleSelectDirectory}
						disabled={isSelecting}
						className='w-full'
					>
						<Folder className='h-4 w-4' />
						{isSelecting ? 'Selecting...' : 'Change Directory'}
					</Button>
				</div>
			) : (
				<div className='space-y-3'>
					<div className='flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-muted/20'>
						<Folder className='h-5 w-5 text-muted-foreground' />
						<div>
							<p className='text-sm font-medium text-foreground'>
								No directory selected
							</p>
							<p className='text-xs text-muted-foreground'>
								Choose a working directory for your project
							</p>
						</div>
					</div>
					<Button
						onClick={handleSelectDirectory}
						disabled={isSelecting}
						className='w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-smooth'
					>
						<FolderOpen className='h-4 w-4' />
						{isSelecting ? 'Selecting...' : 'Select Working Directory'}
					</Button>
				</div>
			)}
		</Card>
	);
};