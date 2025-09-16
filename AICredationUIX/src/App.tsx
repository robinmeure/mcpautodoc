import React from 'react';
import { AccreditationChat } from './components/AccreditationChat';
import { AppThemeProvider } from './providers/ThemeProvider';
import { ServiceProvider } from './contexts/ServiceContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => (
  <AppThemeProvider>
    <ServiceProvider>
      <ErrorBoundary>
        <AccreditationChat />
      </ErrorBoundary>
    </ServiceProvider>
  </AppThemeProvider>
);

export default App;
