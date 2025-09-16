// Agent Utilities - Single Responsibility Principle

import { AgentType, AgentConfig, AgentMessage, FunctionCallMessage } from '../models/AccreditationModels';

/**
 * Utility class for agent-related operations
 */
export class AgentUtils {
  private static readonly AGENT_CONFIGS: Record<string, AgentConfig> = {
    [AgentType.PLANNER]: { name: AgentType.PLANNER, color: 'brand' },
    [AgentType.RESEARCHER]: { name: AgentType.RESEARCHER, color: 'success' },
    [AgentType.WRITER]: { name: AgentType.WRITER, color: 'warning' },
    [AgentType.REVIEWER]: { name: AgentType.REVIEWER, color: 'danger' },
    [AgentType.COMPLIANCE]: { name: AgentType.COMPLIANCE, color: 'important' },
  };

  static getAgentConfig(agentName: string): AgentConfig {
    return this.AGENT_CONFIGS[agentName] || {
      name: agentName,
      color: 'important'
    };
  }

  static createAgentMessage(
    agentName: string,
    content: string,
    isComplete: boolean,
    existingId?: string,
    createdAt?: string
  ): AgentMessage {
    return {
      type: 'agent_message',
      id: existingId || `${agentName}-${Date.now()}-${Math.random()}`,
      agent: agentName,
      content,
      isComplete,
      timestamp: new Date(),
      createdAt
    };
  }

  static updateMessageContent(
    message: AgentMessage,
    additionalContent: string,
    isComplete: boolean
  ): AgentMessage {
    return {
      ...message,
      content: message.content + additionalContent,
      isComplete
    };
  }

  static markAllMessagesComplete(messages: AgentMessage[]): AgentMessage[] {
    return messages.map(msg => ({ ...msg, isComplete: true }));
  }

  static createFunctionCallMessage(name: string | null, argsChunk: string, isComplete: boolean): FunctionCallMessage {
    return {
      id: `fn-${Date.now()}-${Math.random()}`,
      type: 'function_call',
      name,
      arguments: argsChunk,
      isComplete,
      timestamp: new Date()
    };
  }

  static updateFunctionCallMessage(message: FunctionCallMessage, argsChunk: string, isComplete: boolean): FunctionCallMessage {
    return { ...message, arguments: message.arguments + argsChunk, isComplete };
  }

  static getBubbleVisual(agentOrType: string) {
    switch (agentOrType) {
      case AgentType.PLANNER: return { bgToken: 'colorPaletteCornflowerBackground2', fgToken: 'colorPaletteCornflowerForeground2' };
      case AgentType.RESEARCHER: return { bgToken: 'colorPaletteGreenBackground2', fgToken: 'colorPaletteGreenForeground2' };
      case AgentType.WRITER: return { bgToken: 'colorPaletteYellowBackground2', fgToken: 'colorPaletteYellowForeground2' };
      case AgentType.REVIEWER: return { bgToken: 'colorPaletteRedBackground2', fgToken: 'colorPaletteRedForeground2' };
      case AgentType.COMPLIANCE: return { bgToken: 'colorPaletteLavenderBackground2', fgToken: 'colorPaletteLavenderForeground2' };
      case 'function_call': return { bgToken: 'colorNeutralBackground3', fgToken: 'colorNeutralForeground2' };
      default: return { bgToken: 'colorNeutralBackground2', fgToken: 'colorNeutralForeground2' };
    }
  }
}