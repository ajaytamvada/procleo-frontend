import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Global app state interfaces
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

export interface AppState {
  // Loading states
  loading: LoadingState;

  // Error states
  errors: ErrorState;

  // Notifications
  notifications: Notification[];

  // UI state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Network state
  isOnline: boolean;

  // App metadata
  lastSync: number | null;
  version: string;

  // Feature flags
  features: Record<string, boolean>;

  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    pageSize: number;
    autoSave: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
  };
}

export interface AppActions {
  // Loading actions
  setLoading: (key: string, isLoading: boolean) => void;
  clearLoading: () => void;

  // Error actions
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;

  // Notification actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Network actions
  setOnlineStatus: (isOnline: boolean) => void;

  // App metadata actions
  updateLastSync: () => void;
  setVersion: (version: string) => void;

  // Feature flag actions
  setFeature: (key: string, enabled: boolean) => void;

  // Preference actions
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  resetPreferences: () => void;
}

// Default state
const defaultState: AppState = {
  loading: {},
  errors: {},
  notifications: [],
  sidebarOpen: false,
  sidebarCollapsed: false,
  isOnline: navigator.onLine,
  lastSync: null,
  version: '1.0.0',
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
    betaFeatures: false,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
    pageSize: 25,
    autoSave: true,
    notifications: {
      email: true,
      push: true,
      desktop: false,
    },
  },
};

// Create the store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...defaultState,

        // Loading actions
        setLoading: (key: string, isLoading: boolean) =>
          set(state => {
            state.loading[key] = isLoading;
          }),

        clearLoading: () =>
          set(state => {
            state.loading = {};
          }),

        // Error actions
        setError: (key: string, error: string | null) =>
          set(state => {
            state.errors[key] = error;
          }),

        clearError: (key: string) =>
          set(state => {
            delete state.errors[key];
          }),

        clearAllErrors: () =>
          set(state => {
            state.errors = {};
          }),

        // Notification actions
        addNotification: notification =>
          set(state => {
            const newNotification: Notification = {
              ...notification,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              read: false,
            };
            state.notifications.unshift(newNotification);

            // Keep only the last 50 notifications
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50);
            }
          }),

        removeNotification: (id: string) =>
          set(state => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          }),

        markNotificationRead: (id: string) =>
          set(state => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification) {
              notification.read = true;
            }
          }),

        markAllNotificationsRead: () =>
          set(state => {
            state.notifications.forEach(notification => {
              notification.read = true;
            });
          }),

        clearNotifications: () =>
          set(state => {
            state.notifications = [];
          }),

        // UI actions
        setSidebarOpen: (open: boolean) =>
          set(state => {
            state.sidebarOpen = open;
          }),

        setSidebarCollapsed: (collapsed: boolean) =>
          set(state => {
            state.sidebarCollapsed = collapsed;
          }),

        toggleSidebar: () =>
          set(state => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        // Network actions
        setOnlineStatus: (isOnline: boolean) =>
          set(state => {
            state.isOnline = isOnline;

            // Add notification when coming back online
            if (isOnline && !get().isOnline) {
              const newNotification: Notification = {
                id: `online-${Date.now()}`,
                type: 'success',
                title: 'Connection Restored',
                message: 'You are back online. Syncing data...',
                timestamp: Date.now(),
                read: false,
              };
              state.notifications.unshift(newNotification);
            }
          }),

        // App metadata actions
        updateLastSync: () =>
          set(state => {
            state.lastSync = Date.now();
          }),

        setVersion: (version: string) =>
          set(state => {
            state.version = version;
          }),

        // Feature flag actions
        setFeature: (key: string, enabled: boolean) =>
          set(state => {
            state.features[key] = enabled;
          }),

        // Preference actions
        updatePreferences: newPreferences =>
          set(state => {
            state.preferences = { ...state.preferences, ...newPreferences };
          }),

        resetPreferences: () =>
          set(state => {
            state.preferences = defaultState.preferences;
          }),
      })),
      {
        name: 'autovitica-app-store',
        partialize: state => ({
          sidebarCollapsed: state.sidebarCollapsed,
          preferences: state.preferences,
          features: state.features,
        }),
      }
    ),
    { name: 'AutoviticaAppStore' }
  )
);

// Selectors for better performance
export const useLoadingState = () => useAppStore(state => state.loading);
export const useErrorState = () => useAppStore(state => state.errors);
export const useNotifications = () => useAppStore(state => state.notifications);
export const useUIState = () =>
  useAppStore(state => ({
    sidebarOpen: state.sidebarOpen,
    sidebarCollapsed: state.sidebarCollapsed,
  }));
export const useNetworkState = () => useAppStore(state => state.isOnline);
export const usePreferences = () => useAppStore(state => state.preferences);
export const useFeatures = () => useAppStore(state => state.features);

// Action selectors
export const useAppActions = () =>
  useAppStore(state => ({
    setLoading: state.setLoading,
    clearLoading: state.clearLoading,
    setError: state.setError,
    clearError: state.clearError,
    clearAllErrors: state.clearAllErrors,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    markNotificationRead: state.markNotificationRead,
    markAllNotificationsRead: state.markAllNotificationsRead,
    clearNotifications: state.clearNotifications,
    setSidebarOpen: state.setSidebarOpen,
    setSidebarCollapsed: state.setSidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
    setOnlineStatus: state.setOnlineStatus,
    updateLastSync: state.updateLastSync,
    setFeature: state.setFeature,
    updatePreferences: state.updatePreferences,
    resetPreferences: state.resetPreferences,
  }));

// Utility hooks
export const useIsLoading = (key?: string) => {
  return useAppStore(state => {
    if (key) {
      return state.loading[key] || false;
    }
    return Object.values(state.loading).some(Boolean);
  });
};

export const useHasError = (key?: string) => {
  return useAppStore(state => {
    if (key) {
      return !!state.errors[key];
    }
    return Object.values(state.errors).some(Boolean);
  });
};

export const useUnreadNotificationCount = () => {
  return useAppStore(state => state.notifications.filter(n => !n.read).length);
};
