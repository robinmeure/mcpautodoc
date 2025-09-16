import React, { ErrorInfo } from 'react';
import { makeStyles, tokens, Button, Text } from '@fluentui/react-components';
import { ErrorCircle24Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';

const useClasses = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    minHeight: '200px',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorPaletteRedForeground1,
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1,
  },
  description: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalL,
    maxWidth: '400px',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
  details: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'left',
    maxWidth: '600px',
    overflow: 'auto',
  },
  errorText: {
    fontSize: tokens.fontSizeBase200,
    fontFamily: 'monospace',
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'pre-wrap',
  }
});

interface ErrorBoundaryUIProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReload: () => void;
  onRetry: () => void;
}

export const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({ 
  error, 
  errorInfo, 
  onReload, 
  onRetry 
}) => {
  const classes = useClasses();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className={classes.container}>
      <ErrorCircle24Regular className={classes.icon} />
      
      <Text className={classes.title}>
        Something went wrong
      </Text>
      
      <Text className={classes.description}>
        We're sorry, but something unexpected happened. You can try refreshing the page or contact support if the problem persists.
      </Text>
      
      <div className={classes.actions}>
        <Button 
          appearance="primary" 
          icon={<ArrowClockwise24Regular />}
          onClick={onRetry}
        >
          Try Again
        </Button>
        
        <Button 
          appearance="secondary"
          onClick={onReload}
        >
          Reload Page
        </Button>
        
        <Button 
          appearance="subtle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      {showDetails && (error || errorInfo) && (
        <div className={classes.details}>
          <Text className={classes.errorText}>
            {error && `Error: ${error.message}\n\n`}
            {error && error.stack && `Stack Trace:\n${error.stack}\n\n`}
            {errorInfo && errorInfo.componentStack && `Component Stack:${errorInfo.componentStack}`}
          </Text>
        </div>
      )}
    </div>
  );
};
