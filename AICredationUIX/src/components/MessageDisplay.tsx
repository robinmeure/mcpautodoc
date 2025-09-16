import React from 'react';
import { AgentMessage } from '../models/AccreditationModels';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const useStyles = makeStyles({
  content: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: 1.45,
    color: tokens.colorNeutralForeground1,
    ...shorthands.margin('0'),
    maxWidth: '100%',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    '& p': {
      ...shorthands.margin('0', '0', tokens.spacingVerticalS, '0'),
      '&:last-child': { marginBottom: 0 },
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      color: tokens.colorBrandForeground1,
      fontWeight: tokens.fontWeightSemibold,
      ...shorthands.margin(tokens.spacingVerticalM, '0', tokens.spacingVerticalXS, '0'),
      lineHeight: 1.2,
      '&:first-child': { marginTop: 0 },
    },
    '& pre': {
      backgroundColor: tokens.colorNeutralBackground3,
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
      ...shorthands.borderRadius(tokens.borderRadiusMedium),
      overflowX: 'auto',
      maxWidth: '100%',
      // Allow long code tokens to wrap gracefully if extremely long
      whiteSpace: 'pre-wrap',
      fontSize: tokens.fontSizeBase200,
    },
    '& code': {
      backgroundColor: tokens.colorNeutralBackground3,
      ...shorthands.padding('2px', '6px'),
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      fontFamily: tokens.fontFamilyMonospace,
      fontSize: tokens.fontSizeBase200,
      color: tokens.colorBrandForeground1,
    },
    '& blockquote': {
      ...shorthands.borderLeft('3px', 'solid', tokens.colorBrandForeground1),
      ...shorthands.margin(tokens.spacingVerticalM, '0'),
      ...shorthands.padding('0', '0', '0', tokens.spacingHorizontalM),
      fontStyle: 'italic',
      color: tokens.colorNeutralForeground2,
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      ...shorthands.margin(tokens.spacingVerticalS, '0'),
    },
    '& th, & td': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
      ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: tokens.colorNeutralBackground3,
      fontWeight: tokens.fontWeightSemibold,
      color: tokens.colorNeutralForeground1,
    },
    '& ul, & ol': {
      ...shorthands.padding('0', '0', '0', tokens.spacingHorizontalL),
      ...shorthands.margin(tokens.spacingVerticalS, '0'),
    },
    '& li': {
      ...shorthands.margin(tokens.spacingVerticalXS, '0'),
    },
  },
});

export const MessageDisplay: React.FC<{ message: AgentMessage }> = ({ message }) => {
  const styles = useStyles();

  return (
    <div className={styles.content}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const {className, children, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
};