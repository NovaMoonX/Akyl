import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type SidebarPosition = 'left' | 'right';

interface SidebarStore {
  isCollapsed: boolean;
  position: SidebarPosition;
  setIsCollapsed: (collapsed: boolean) => void;
  setPosition: (position: SidebarPosition) => void;
  toggleCollapsed: () => void;
  togglePosition: () => void;
}

// Sidebar preferences are stored device-wide, not per space
export const useSidebarStore = create<SidebarStore>()(
  devtools(
    persist(
      (set) => ({
        isCollapsed: false,
        position: 'right',
        setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
        setPosition: (position) => set({ position }),
        toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        togglePosition: () =>
          set((state) => ({
            position: state.position === 'left' ? 'right' : 'left',
          })),
      }),
      {
        name: 'akyl-sidebar-preferences',
      },
    ),
  ),
);
