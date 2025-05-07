import React, { createContext, useContext, useState, ReactNode } from 'react';
import { webDarkTheme, webLightTheme } from '@fluentui/react-components';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeObject: typeof webLightTheme | typeof webDarkTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  themeObject: webLightTheme
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get user preference from localStorage, default to light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  const themeObject = isDarkMode ? webDarkTheme : webLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeObject }}>
      {children}
    </ThemeContext.Provider>
  );
};