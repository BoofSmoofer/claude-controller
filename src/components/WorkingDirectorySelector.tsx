import { useState } from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/worflowStore';
import { invoke } from '@tauri-apps/api/core';

export const WorkingDirectorySelector = () => {
	const { workingDirectory, setWorkingDirectory } = useWorkflowStore();
	const [isSelecting, setIsSelecting] = useState(false);

	const handleSelectDirectory = async () => {
		setIsSelecting(true);

		try {
			const result = await invoke<string | null>(
				'select_working_directory'
			);
			if (result) {
				setWorkingDirectory(result);
			}
		} catch (err) {
			console.error('Directory selection error:', err);
		} finally {
			setIsSelecting(false);
		}
	};

	if (!workingDirectory) {
		return (
			<Button
				onClick={handleSelectDirectory}
				disabled={isSelecting}
				className='w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-smooth text-sm'>
				<FolderOpen className='h-4 w-4' />
				{isSelecting ? 'Selecting...' : 'Select Working Directory'}
			</Button>
		);
	}

	return (
		<div
			className='flex items-center gap-2 text-sm text-muted-foreground cursor-pointer'
			onClick={handleSelectDirectory}>
			<Folder className='h-4 w-4' />
			<span className='font-mono'>{workingDirectory}</span>
		</div>
	);
};
