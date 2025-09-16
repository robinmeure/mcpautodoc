import { makeStyles, tokens } from '@fluentui/react-components';

// Common layout styles used across components
export const useLayoutStyles = makeStyles({
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  scrollContainer: {
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
  },
});

// Common card and container styles
export const useContainerStyles = makeStyles({
  card: {
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalM,
    boxShadow: tokens.shadow2,
  },
  section: {
    marginBottom: tokens.spacingVerticalL,
  },
  dialog: {
    width: '90%',
    maxWidth: '600px',
  },
});

// Common text styles
export const useTextStyles = makeStyles({
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  body: {
    fontSize: tokens.fontSizeBase200,
  },
  caption: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

// Common button variations and states
export const useButtonStyles = makeStyles({
  iconButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: tokens.shadow4,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  dangerButton: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    '&:hover': {
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
});

// Form and input styles
export const useFormStyles = makeStyles({
  formGroup: {
    marginBottom: tokens.spacingVerticalM,
  },
  formLabel: {
    display: 'block',
    marginBottom: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
  },
  formError: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteRedForeground1,
  },
  formHelp: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

// Status indicators and badges
export const useStatusStyles = makeStyles({
  statusBadge: {
    padding: '2px 8px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightMedium,
    textTransform: 'uppercase',
  },
  statusSuccess: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  statusWarning: {
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorPaletteYellowForeground1,
  },
  statusError: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
  },
  statusInfo: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  statusNeutral: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
});

// Loading and skeleton styles
export const useLoadingStyles = makeStyles({
  skeleton: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    position: 'relative',
    overflow: 'hidden',
  },
  spinner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

// Chat-specific styles (commonly used across chat components)
export const useChatStyles = makeStyles({
  messageContainer: {
    display: 'flex',
    marginBottom: tokens.spacingVerticalM,
    maxWidth: '90%',
    '@media (max-width: 599px)': {
      maxWidth: '95%',
    },
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
    marginRight: 'auto',
  },
  messageContent: {
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingHorizontalL,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    boxShadow: tokens.shadow4,
    transition: 'box-shadow 200ms ease',
    '&:hover': {
      boxShadow: tokens.shadow8,
    },
  },
  userMessageContent: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  assistantMessageContent: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
});

// Common spacing values
export const spacing = {
  xs: tokens.spacingHorizontalXS,
  s: tokens.spacingHorizontalS,
  m: tokens.spacingHorizontalM,
  l: tokens.spacingHorizontalL,
  xl: tokens.spacingHorizontalXL,
};

// Common responsive breakpoints
export const breakpoints = {
  mobile: '@media (max-width: 599px)',
  tablet: '@media (min-width: 600px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
};

// Animation utilities following Fluent 2 motion guidelines
export const motion = {
  // Duration values
  duration: {
    fast: '100ms',
    normal: '200ms',
    moderate: '300ms',
    slow: '400ms',
    slower: '500ms',
  },
  // Easing functions
  easing: {
    accelerate: 'cubic-bezier(0.9, 0.1, 1, 0.2)',
    decelerate: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
    standard: 'cubic-bezier(0.8, 0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
  },
  // Common transitions
  createTransition: (properties: string[], 
                     duration = '200ms', 
                     easing = 'cubic-bezier(0.8, 0, 0.2, 1)') => {
    return properties.map(prop => `${prop} ${duration} ${easing}`).join(', ');
  },
};

// Accessibility helper styles
export const useA11yStyles = makeStyles({
  focusVisible: {
    '&:focus-visible': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
});
