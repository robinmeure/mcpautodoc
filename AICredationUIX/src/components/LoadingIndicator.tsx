import React from 'react';
import {
  Spinner,
  Text,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'extra-tiny' | 'tiny' | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' | 'huge';
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalL),
    color: tokens.colorNeutralForeground2,
  },
  message: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
  },
});

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  size = 'small' 
}) => {
  const styles = useStyles();
  
  return (
    <div className={styles.container}>
      <Spinner size={size} />
      <Text className={styles.message}>{message}</Text>
    </div>
  );
};