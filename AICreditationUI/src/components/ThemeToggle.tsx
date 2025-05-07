import React from 'react';
import { 
  Switch, 
  Label, 
  makeStyles, 
  tokens, 
  useId 
} from '@fluentui/react-components';
import { WeatherMoonRegular, WeatherSunnyRegular } from '@fluentui/react-icons';
import { useTheme } from '../theme/ThemeContext';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS
  },
  icon: {
    fontSize: tokens.fontSizeBase500
  }
});

export const ThemeToggle: React.FC = () => {
  const styles = useStyles();
  const { isDarkMode, toggleTheme } = useTheme();
  const switchId = useId('theme-switch');

  return (
    <div className={styles.container}>
      <WeatherSunnyRegular className={styles.icon} />
      <Switch 
        id={switchId}
        checked={isDarkMode}
        onChange={toggleTheme}
        label={{ children: 'Dark Mode' }}
      />
      <WeatherMoonRegular className={styles.icon} />
    </div>
  );
};