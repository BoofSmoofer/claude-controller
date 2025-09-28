import { create } from 'zustand';

interface AppState {
	hasInitiliased: boolean;
	setHasInitiliased: (newValue: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
	hasInitiliased: false,
	setHasInitiliased: newValue => set({ hasInitiliased: newValue }),
}));
