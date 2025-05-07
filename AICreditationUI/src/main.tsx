import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { initializeIcons } from '@fluentui/react';
import { FluentProvider } from '@fluentui/react-components';
import { Layout } from './components/Layout';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

initializeIcons();



const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Wrapper component to consume theme context
const ThemedApp: React.FC = () => {
  const { themeObject } = useTheme();
  return (
    <FluentProvider theme={themeObject} className="app-root">
      <Layout />
    </FluentProvider>
  );
};
  
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
  </React.StrictMode>
);
