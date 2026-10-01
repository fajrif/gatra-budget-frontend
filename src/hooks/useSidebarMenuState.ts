import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gatra_budget_sidebar_menu_state';

export type SidebarMenuState = Record<string, boolean>;

export interface UseSidebarMenuStateResult {
  menuState: SidebarMenuState;
  toggleMenu: (menuKey: string) => void;
  isMenuOpen: (menuKey: string) => boolean;
}

export const useSidebarMenuState = (
  initialState: SidebarMenuState = { addressReference: true },
): UseSidebarMenuStateResult => {
  const [menuState, setMenuState] = useState<SidebarMenuState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SidebarMenuState) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menuState));
    } catch (error) {
      console.error('Failed to persist sidebar menu state:', error);
    }
  }, [menuState]);

  const toggleMenu = useCallback((menuKey: string) => {
    setMenuState((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  }, []);

  const isMenuOpen = useCallback(
    (menuKey: string) => {
      return menuState[menuKey] ?? true;
    },
    [menuState],
  );

  return { menuState, toggleMenu, isMenuOpen };
};