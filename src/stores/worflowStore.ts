import { create } from 'zustand';

interface WorkflowState {
	workflowInitialised: boolean;
	jiraTicketSelected: boolean;
	workingDirectory: string | null;

	setJiraTicketSelected: (isSelected: boolean) => void;
	setWorkingDirectory: (path: string | null) => void;
	setWorkflowInitialised: (newValue: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>(set => ({
	workflowInitialised: false,
	jiraTicketSelected: false,
	workingDirectory: null,

	setJiraTicketSelected: isSelected =>
		set({ jiraTicketSelected: isSelected }),
	setWorkingDirectory: path => set({
		workingDirectory: path,
		workflowInitialised: false,
		jiraTicketSelected: false
	}),
	setWorkflowInitialised: newValue => set({ workflowInitialised: newValue }),
}));
