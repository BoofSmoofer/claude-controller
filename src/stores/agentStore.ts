import { create } from 'zustand';

type Status = 'idle' | 'thinking' | 'processing' | 'completed' | 'error';

interface AgentStore {
	agentStatus: Status;
	agentDetails: string;
	setAgentStatus: (newStatus: Status) => void;
	setAgentDetails: (newDetails: string) => void;
}

export const useAgentStore = create<AgentStore>(set => ({
	agentStatus: 'idle',
	agentDetails: 'Waiting for instructions',
	setAgentStatus: newStatus => set({ agentStatus: newStatus }),
	setAgentDetails: newDetails => set({ agentDetails: newDetails }),
}));
