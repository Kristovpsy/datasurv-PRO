/**
 * UI Store — Zustand
 * --------------------------
 * Global UI state: sidebar, theme, notifications.
 */

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((s) => ({
      notifications: [...s.notifications, { ...notification, id }],
    }));
    // Auto-remove after duration
    const duration = notification.duration || 4000;
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      }));
    }, duration);
  },

  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));
