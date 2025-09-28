import { create } from 'zustand';

type Status =
	| 'idle'
	| 'thinking'
	| 'processing'
	| 'completed'
	| 'error'
	| 'waiting';

interface AgentStore {
	acpStatus: boolean | null;

	agentStatus: Status;
	agentDetails: string;

	setAcpStatus: (newAcpStatus: boolean | null) => void;
	setAgentStatus: (newStatus: Status) => void;
	setAgentDetails: (newDetails: string) => void;
}

export const useAgentStore = create<AgentStore>(set => ({
	acpStatus: null,

	agentStatus: 'idle',
	agentDetails: 'Waiting for instructions',

	setAcpStatus: newAcpStatus => set({ acpStatus: newAcpStatus }),
	setAgentStatus: newStatus => set({ agentStatus: newStatus }),
	setAgentDetails: newDetails => set({ agentDetails: newDetails }),
}));
