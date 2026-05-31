'use client';

/**
 * Simulator Theme Context
 * Provides dark/light mode state to all simulator pages
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface SimulatorThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

const SimulatorThemeContext = createContext<SimulatorThemeContextType | undefined>(undefined);

export function SimulatorThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <SimulatorThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </SimulatorThemeContext.Provider>
  );
}

export function useSimulatorTheme() {
  const context = useContext(SimulatorThemeContext);
  if (context === undefined) {
    throw new Error('useSimulatorTheme must be used within a SimulatorThemeProvider');
  }
  return context;
}
