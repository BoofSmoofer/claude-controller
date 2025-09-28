import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JiraIntegrationConfig {
	baseUrl: string;
	email: string;
	apiToken: string;
}

interface IntegrationsState {
	jira: JiraIntegrationConfig;
	setJira: (update: Partial<JiraIntegrationConfig>) => void;
	resetJira: () => void;
}

const defaultJiraConfig: JiraIntegrationConfig = {
	baseUrl: '',
	email: '',
	apiToken: '',
};

export const useIntegrationsStore = create<IntegrationsState>()(
	persist(
		set => ({
			jira: { ...defaultJiraConfig },
			setJira: update =>
				set(state => ({ jira: { ...state.jira, ...update } })),
			resetJira: () => set({ jira: { ...defaultJiraConfig } }),
		}),
		{ name: 'integrations-store' }
	)
);
