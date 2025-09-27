import { create } from 'zustand';

interface WorkflowState {
	jiraTicketSelected: boolean;
	setJiraTicketSelected: (isSelected: boolean) => void;
	workingDirectory: string | null;
	setWorkingDirectory: (path: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>(set => ({
	jiraTicketSelected: false,
	setJiraTicketSelected: isSelected =>
		set({ jiraTicketSelected: isSelected }),
	workingDirectory: null,
	setWorkingDirectory: path => set({ workingDirectory: path }),
}));
