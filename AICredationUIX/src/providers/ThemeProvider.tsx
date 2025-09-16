import React, { useCallback, useState, useMemo } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { ThemeContext } from '../contexts/ThemeContext';

interface Props { children: React.ReactNode; }

export const AppThemeProvider: React.FC<Props> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = useCallback(() => setIsDarkMode(p => !p), []);
  const theme = isDarkMode ? webDarkTheme : webLightTheme;

  const value = useMemo(() => ({ isDarkMode, toggleTheme, theme }), [isDarkMode, toggleTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <FluentProvider theme={theme} style={{ minHeight: '100vh' }}>
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  );
};
