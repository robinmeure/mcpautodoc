import React, { useState } from 'react';
import { makeStyles, shorthands, tokens, Button, Switch } from '@fluentui/react-components';
import { useAccreditationChat } from '../hooks/useAccreditationChat';
import { ChatHeader } from './ChatHeader';
import { ChatInputForm } from './ChatInputForm';
import { ErrorNotification } from './ErrorNotification';
import { MessagesContainer } from './MessagesContainer';
import { LoadingIndicator } from './LoadingIndicator';
import { useServices } from '../contexts/ServiceContext';
import { useTheme } from '../hooks/useTheme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '880px',
    margin: '0 auto',
    boxSizing: 'border-box',
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
    // Responsive horizontal breathing space
    '@media (max-width: 700px)': {
      ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalM),
    },
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    ...shorthands.margin('0', '0', tokens.spacingVerticalM, '0'),
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  sectionGap: {
    // Utility class to provide consistent vertical gaps between major sections
    ...shorthands.margin('0', '0', tokens.spacingVerticalXL, '0'),
  },
});

/**
 * Main chat component that orchestrates the accreditation documentation generation.
 * Follows the Composition pattern and delegates responsibilities to focused components.
 */
export const AccreditationChat: React.FC = () => {
  const styles = useStyles();
  const [topic, setTopic] = useState('');
  
  const { accreditationService } = useServices();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isActive, error, messages, startGeneration, cancelGeneration } = useAccreditationChat(accreditationService);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
  };

  const handleSubmit = async () => {
    if (!topic.trim() || isActive) return;
    await startGeneration(topic);
  };

  const handleCancel = () => {
    cancelGeneration();
  };

  return (
   
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Switch checked={isDarkMode} onChange={toggleTheme} label={isDarkMode ? 'Dark' : 'Light'} />
          {isActive && (
            <Button size="small" appearance="secondary" onClick={handleCancel}>Stop</Button>
          )}
        </div>
        <ChatHeader 
          title="AI Service Accreditation Documentation"
          subtitle="Generate comprehensive documentation about any service accreditation topic using AI agents"
        />
        
        <ChatInputForm
          topic={topic}
          onTopicChange={handleTopicChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isActive={isActive}
          placeholder="Enter a topic for documentation (e.g., ISO 27001, HIPAA Compliance, SOC 2)"
        />
        
        {error && (
          <ErrorNotification error={error} />
        )}
        <MessagesContainer messages={messages} />
        
        {isActive && (
          <LoadingIndicator 
            message="AI agents are generating comprehensive documentation..." 
            size="medium"
          />
        )}
      </div>
  
  );
};