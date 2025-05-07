import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Title1,
} from '@fluentui/react-components';
import { ThemeToggle } from './ThemeToggle';
import { AccreditationGenerator } from './AccreditationGenerator';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    boxShadow: tokens.shadow4
  },
  title: {
    fontWeight: tokens.fontWeightSemibold
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%'
  },
  footer: {
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground3
  }
});

export const Layout: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Title1 className={styles.title}>AI Documentation Generator</Title1>
        <ThemeToggle />
      </header>
      <main className={styles.main}>
        <AccreditationGenerator />
      </main>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} - AI Documentation Generator</p>
      </footer>
    </div>
  );
};