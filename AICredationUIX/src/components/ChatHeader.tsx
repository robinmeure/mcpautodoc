import React from 'react';
import { Text, makeStyles, shorthands, tokens } from '@fluentui/react-components';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
}

const useStyles = makeStyles({
  header: {
    ...shorthands.margin('0', '0', tokens.spacingVerticalXL, '0'),
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: '880px',
    paddingTop: tokens.spacingVerticalL,
  },
  title: {
    // Use a fluid scale to adapt elegantly across breakpoints
    fontSize: `clamp(2.25rem, 3.2vw + 1rem, ${tokens.fontSizeHero700})`,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    lineHeight: 1.1,
    letterSpacing: '0.5px',
  maxWidth: '28ch',
    ...shorthands.margin('0', '0', tokens.spacingVerticalS, '0'),
    '@media (max-width: 480px)': {
      letterSpacing: '0.25px',
    },
  },
  subtitle: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground3,
    lineHeight: 1.4,
  maxWidth: '64ch',
    ...shorthands.margin('0'),
  },
});

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({ title, subtitle }) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <Text as="h1" block className={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text as="p" block className={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </header>
  );
});

ChatHeader.displayName = 'ChatHeader';