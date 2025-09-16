// Domain Models - Single Responsibility Principle

/**
 * Represents a request for service accreditation documentation
 */
export interface AccreditationRequest {
  readonly topic: string;
}

/**
 * Represents a streaming message from an AI agent
 */
export interface AgentStreamMessage {
  readonly id: string;
  readonly type: 'agent_message';
  readonly role: 'assistant';
  readonly content: string;
  readonly agent: string;
  readonly final: boolean;
  readonly createdAt?: string; // ISO timestamp when chunk/message created
}

export interface FunctionCallStreamMessage {
  readonly type: 'function_call';
  readonly functionCall: {
    readonly name: string | null;
    readonly arguments: string; // incremental chunk
  };
  readonly final: boolean;
}

export type StreamMessage = AgentStreamMessage | FunctionCallStreamMessage;

/**
 * Represents a complete message from an agent
 */
export interface AgentMessage {
  readonly type?: 'agent_message';
  readonly id: string;
  readonly agent: string;
  readonly content: string;
  readonly isComplete: boolean;
  readonly timestamp: Date;
  readonly createdAt?: string;
}

export interface FunctionCallMessage {
  readonly id: string;
  readonly type: 'function_call';
  readonly name: string | null;
  readonly arguments: string; // full accumulated arguments
  readonly isComplete: boolean;
  readonly timestamp: Date;
}

export type ChatMessage = AgentMessage | FunctionCallMessage;

/**
 * Represents the state of a streaming session
 */
export interface StreamingState {
  readonly isActive: boolean;
  readonly error: string | null;
  readonly messages: ReadonlyArray<ChatMessage>;
}

/**
 * Agent types with their display properties
 */
export enum AgentType {
  PLANNER = 'Planner',
  RESEARCHER = 'Researcher',
  WRITER = 'Writer',
  REVIEWER = 'Reviewer',
  COMPLIANCE = 'Compliance'
}

/**
 * Agent configuration for UI display
 */
export interface AgentConfig {
  readonly name: string;
  readonly color: 'brand' | 'success' | 'warning' | 'danger' | 'important';
}

/**
 * Stream event handlers
 */
export interface StreamHandlers {
  readonly onMessage: (message: StreamMessage) => void;
  readonly onError: (error: Error) => void;
  readonly onComplete: () => void;
}