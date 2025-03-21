import { browser } from '$app/environment';

// Constants
const STORAGE_KEY = 'sidebar-state';

// Types
export type SidebarState = {
    isOpen: boolean;
    isCollapsed: boolean;
};

// Default state
const DEFAULT_STATE: SidebarState = {
    isOpen: true, // Default to open on desktop
    isCollapsed: false // Default to expanded view
};

/**
 * Load sidebar state from localStorage
 */
function loadState(): SidebarState {
    if (!browser) return DEFAULT_STATE;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as SidebarState;
        }
    } catch (err) {
        console.error('Failed to load sidebar state:', err);
    }

    return DEFAULT_STATE;
}

/**
 * Save sidebar state to localStorage
 */
export function saveState(state: SidebarState): void {
    if (!browser) return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.error('Failed to save sidebar state:', err);
    }
}

export const savedState = loadState();
