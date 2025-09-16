import React from 'react';
import { AgentMessage } from '../models/AccreditationModels';
import { MessageDisplay } from './MessageDisplay';
import { AgentUtils } from '../utils/AgentUtils';
import { makeStyles, shorthands, tokens, Text } from '@fluentui/react-components';
import { Person24Regular } from '@fluentui/react-icons';

interface MessageGroupProps {
  agent: string;
  messages: AgentMessage[];
  alignment?: 'left' | 'right';
}

const useStyles = makeStyles({
  group: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    ...shorthands.overflow('hidden'),
    maxWidth: '90%',
    boxShadow: tokens.shadow2,
  },
  leftAligned: {
    alignSelf: 'flex-start',
  },
  rightAligned: {
    alignSelf: 'flex-end',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.margin('0', '0', tokens.spacingVerticalS, '0'),
  },
  agentName: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    maxWidth: '100%',
    overflow: 'auto',
  },
});

type TokenLookup = { [k: string]: string };
const tokenLookup: TokenLookup = Object.keys(tokens).reduce((acc, key) => {
  const value = (tokens as unknown as Record<string, string | number>)[key];
  if (typeof value === 'string') acc[key] = value;
  return acc;
}, {} as TokenLookup);
const resolveToken = (name: string, fallback: string) => tokenLookup[name] || fallback;

export const MessageGroup: React.FC<MessageGroupProps> = ({ agent, messages, alignment = 'left' }) => {
  const styles = useStyles();
  const agentConfig = AgentUtils.getAgentConfig(agent);
  const visual = AgentUtils.getBubbleVisual(agent);
  const color = resolveToken(visual.fgToken, tokens.colorNeutralForeground1);
  const backgroundColor = resolveToken(visual.bgToken, tokens.colorNeutralBackground1);

  return (
    <div className={`${styles.group} ${alignment === 'left' ? styles.leftAligned : styles.rightAligned}`} style={{ backgroundColor }}>
      <div className={styles.header}>
        <Person24Regular primaryFill={color} />
        <Text weight="semibold" className={styles.agentName}>{agentConfig.name}</Text>
      </div>
      <div className={styles.messageContent}>
        {messages.map((message) => (
          <div key={message.id}>
            <MessageDisplay message={message} />
            <Text size={200} style={{ opacity: 0.6, display: 'block', marginTop: tokens.spacingVerticalXS }}>
              {message.timestamp.toLocaleTimeString()}
              {message.createdAt ? ` • created ${new Date(message.createdAt).toLocaleTimeString()}` : ''}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};
