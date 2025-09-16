import React, { useEffect, useRef, useCallback } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { ChatMessage, AgentMessage } from '../models/AccreditationModels';
function isAgentMessage(m: ChatMessage): m is AgentMessage {
  return !('type' in m && m.type === 'function_call');
}
import { FunctionCallDisplay } from './FunctionCallDisplay';
import { MessageGroup } from './MessageGroup';

interface MessagesContainerProps {
  messages: ReadonlyArray<ChatMessage>;
  autoScroll?: boolean;
}

const useStyles = makeStyles({
  container: {
    flexGrow: 1,
    overflowY: 'auto',
    ...shorthands.margin('0', '0', tokens.spacingVerticalXL, '0'),
    maxWidth: '880px',
    width: '100%',
    ...shorthands.padding('0', tokens.spacingHorizontalM),
    // Avoid horizontal overflow from code blocks / long lines
    overflowX: 'hidden',
  },
  messagesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
    minHeight: '100%',
    paddingBottom: tokens.spacingVerticalXL,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
    fontStyle: 'italic',
    opacity: 0.85,
  },
});

type MessageBlock = 
  | { type: 'agent'; agent: string; messages: AgentMessage[] }
  | { type: 'function_call'; message: ChatMessage };

export const MessagesContainer: React.FC<MessagesContainerProps> = ({ 
  messages, 
  autoScroll = true 
}) => {
  const styles = useStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [autoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const messageBlocks = messages.reduce((acc, message) => {
    if (isAgentMessage(message)) {
      const lastBlock = acc[acc.length - 1];
      // Start a new block if the agent is different from the last one
      if (lastBlock && lastBlock.type === 'agent' && lastBlock.agent === message.agent) {
        lastBlock.messages.push(message);
      } else {
        acc.push({ type: 'agent', agent: message.agent, messages: [message] });
      }
    } else {
      // Function calls always start a new block
      acc.push({ type: 'function_call', message });
    }
    return acc;
  }, [] as MessageBlock[]);

  if (messages.length === 0) {
    return (
      <div className={styles.container} ref={containerRef}>
        <div className={styles.emptyState}>
          Enter a topic to start generating documentation
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.messagesWrapper}>
        {messageBlocks.map((block, index) => {
          if (block.type === 'agent') {
            // Alternate alignment for conversational feel
            const alignment = index % 2 === 0 ? 'left' : 'right';
            return (
              <MessageGroup
                key={`${block.agent}-${index}`}
                agent={block.agent}
                messages={block.messages}
                alignment={alignment}
              />
            );
          }
          if (block.type === 'function_call' && 'type' in block.message && block.message.type === 'function_call') {
            return (
              <div key={block.message.id} style={{ maxWidth: '100%', borderRadius: tokens.borderRadiusMedium, overflow: 'hidden' }}>
                <FunctionCallDisplay message={block.message} />
              </div>
            );
          }
          return null;
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};