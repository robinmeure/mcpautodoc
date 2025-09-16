import { createContext } from 'react';
import { Theme } from '@fluentui/react-components';

export interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);