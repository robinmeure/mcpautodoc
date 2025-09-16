import React, { useMemo } from 'react';
import { makeStyles, tokens, shorthands, Text, Spinner, Badge, Divider } from '@fluentui/react-components';
import { FunctionCallMessage } from '../models/AccreditationModels';
import { AgentUtils } from '../utils/AgentUtils';

interface Props { message: FunctionCallMessage; }

const useStyles = makeStyles({
  root: {
    width: '100%',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    boxShadow: tokens.shadow2,
    position: 'relative',
    maxWidth: '100%',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.margin('0', '0', tokens.spacingVerticalS, '0')
  },
  functionName: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  paramsContainer: {
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    maxHeight: '300px',
    overflow: 'auto'
  },
  paramContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
  },
  callStatus: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    ...shorthands.margin(tokens.spacingVerticalS, '0', '0', '0'),
  }
});

type TokenLookup = { [k: string]: string };
// Convert tokens to a lookup (runtime iteration acceptable once)
const tokenLookup: TokenLookup = Object.keys(tokens).reduce((acc, key) => {
  const value = (tokens as unknown as Record<string, string | number>)[key];
  if (typeof value === 'string') acc[key] = value;
  return acc;
}, {} as TokenLookup);

function resolveToken(name: string, fallback: string): string {
  return tokenLookup[name] || fallback;
}

// Attempt to parse JSON arguments and format them for display
const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null; // Return null if not valid JSON
  }
};

export const FunctionCallDisplay: React.FC<Props> = ({ message }) => {
  const styles = useStyles();
  const visual = AgentUtils.getBubbleVisual('function_call');
  const bg = resolveToken(visual.bgToken, tokens.colorNeutralBackground2);
  const fg = resolveToken(visual.fgToken, tokens.colorNeutralForeground2);

  // Try to parse arguments as JSON for better formatting
  const parsedArguments = useMemo(() => {
    if (!message.arguments) return null;
    return tryParseJson(message.arguments);
  }, [message.arguments]);

  // Format the function name for better display
  const displayName = useMemo(() => {
    if (!message.name) return 'Anonymous Function';
    
    // Split function name parts if it follows a pattern like "ToolName-function_name"
    const parts = message.name.split('-');
    if (parts.length > 1) {
      return (
        <>
          <span style={{ color: tokens.colorNeutralForeground3 }}>{parts[0]}</span>
          <span style={{ color: tokens.colorBrandForeground1 }}>.{parts[1]}</span>
        </>
      );
    }
    
    return message.name;
  }, [message.name]);

  return (
    <div className={styles.root} style={{ backgroundColor: bg, color: fg }} aria-live={message.isComplete ? 'polite' : 'off'}>
      <div className={styles.header}>
        <Badge appearance="tint" color="brand">fn</Badge>
        <Text className={styles.functionName}>{displayName}</Text>
        {!message.isComplete && <Spinner size="extra-tiny" />}
      </div>
      
      <Divider style={{ margin: `${tokens.spacingVerticalS} 0` }} />
      
      <div className={styles.content}>
        {/* Display formatted arguments if possible, otherwise raw text */}
        <div className={styles.paramsContainer}>
          {parsedArguments ? (
            <pre className={styles.paramContent}>
              {JSON.stringify(parsedArguments, null, 2)}
            </pre>
          ) : (
            <div className={styles.paramContent}>
              {message.arguments || '(No arguments)'}
            </div>
          )}
        </div>
        
        <div className={styles.callStatus}>
          {message.isComplete ? 'Completed' : 'In progress...'}
          <Text style={{ marginLeft: 'auto', fontSize: tokens.fontSizeBase100 }}>
            {message.timestamp.toLocaleTimeString()}
          </Text>
        </div>
      </div>
    </div>
  );
};
