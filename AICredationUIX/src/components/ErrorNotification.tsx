import React from 'react';
import {
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarActions,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

interface ErrorNotificationProps {
  error: string;
  onDismiss?: () => void;
}

const useStyles = makeStyles({
  errorMessage: {
    ...shorthands.margin('0', '0', tokens.spacingVerticalL, '0'),
  },
});

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onDismiss }) => {
  const styles = useStyles();
  
  return (
    <MessageBar intent="error" className={styles.errorMessage}>
      <MessageBarBody>
        <MessageBarTitle>Error</MessageBarTitle>
        {error}
      </MessageBarBody>
      {onDismiss && (
        <MessageBarActions
          containerAction={
            <Button
              aria-label="dismiss"
              appearance="transparent"
              icon={<DismissRegular />}
              onClick={onDismiss}
            />
          }
        />
      )}
    </MessageBar>
  );
};