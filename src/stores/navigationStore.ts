import { create } from 'zustand';

export type ViewId = 'workflow' | 'integrations' | 'settings';

interface NavigationState {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'workflow',
  setActiveView: (view) => set({ activeView: view }),
}));