import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'boilerplates_sidebar_menu_state';

export const useSidebarMenuState = (initialState = { addressReference: true }) => {
  const [menuState, setMenuState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialState;
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

  const toggleMenu = useCallback((menuKey) => {
    setMenuState((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  }, []);

  const isMenuOpen = useCallback((menuKey) => {
    return menuState[menuKey] ?? true;
  }, [menuState]);

  return { menuState, toggleMenu, isMenuOpen };
};
