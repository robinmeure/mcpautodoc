// Custom Hook - KISS Principle

import { useState, useRef, useCallback } from 'react';
import { AccreditationRequest, AgentMessage, StreamMessage, StreamingState, FunctionCallMessage, ChatMessage } from '../models/AccreditationModels';
import { IAccreditationService } from '../services/AccreditationService';
import { AgentUtils } from '../utils/AgentUtils';

/**
 * Custom hook for managing accreditation chat state and operations
 */
export const useAccreditationChat = (accreditationService: IAccreditationService) => {
  const [state, setState] = useState<StreamingState>({
    isActive: false,
    error: null,
    messages: []
  });
  
  const cancelStreamRef = useRef<(() => void) | null>(null);
  // Use the message ID as the key to store and update agent messages.
  const agentBuffers = useRef<Map<string, AgentMessage>>(new Map());
  const functionCallBuffer = useRef<FunctionCallMessage | null>(null);
  const orderRef = useRef<string[]>([]); // preserves first-seen order of message ids

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isActive: false }));
  }, []);

  const setIsStreaming = useCallback((isActive: boolean) => {
    setState(prev => ({ ...prev, isActive, error: isActive ? null : prev.error }));
  }, []);

  const updateMessages = useCallback(() => {
    const messages: ChatMessage[] = [];
    for (const id of orderRef.current) {
      // Find the message by its ID from either agent or function call buffers.
      const agentMessage = agentBuffers.current.get(id);
      if (agentMessage) {
        messages.push(agentMessage);
      } else if (functionCallBuffer.current && functionCallBuffer.current.id === id) {
        messages.push(functionCallBuffer.current);
      }
    }
    setState(prev => ({ ...prev, messages }));
  }, []);

  const handleStreamMessage = useCallback((streamMessage: StreamMessage) => {
    if (streamMessage.type === 'agent_message') {
      const { id, agent, content, final, createdAt } = streamMessage;
      const existingMessage = agentBuffers.current.get(id);

      if (existingMessage) {
        // If message exists, update its content and completion status.
        const updatedMessage = AgentUtils.updateMessageContent(existingMessage, content, final);
        agentBuffers.current.set(id, updatedMessage);
      } else {
        // If it's a new message ID, create a new message and add it to our buffers.
        const newMessage = AgentUtils.createAgentMessage(agent, content, final, id, createdAt);
        agentBuffers.current.set(id, newMessage);
        orderRef.current.push(id);
      }
    } else if (streamMessage.type === 'function_call') {
      // This logic remains the same as it handles a single function call at a time.
      if (!functionCallBuffer.current) {
        functionCallBuffer.current = AgentUtils.createFunctionCallMessage(streamMessage.functionCall.name, streamMessage.functionCall.arguments, streamMessage.final);
        orderRef.current.push(functionCallBuffer.current.id);
      } else {
        functionCallBuffer.current = AgentUtils.updateFunctionCallMessage(functionCallBuffer.current, streamMessage.functionCall.arguments, streamMessage.final);
      }
      if (streamMessage.final && functionCallBuffer.current) {
        functionCallBuffer.current = { ...functionCallBuffer.current, isComplete: true };
      }
    }
    updateMessages();
  }, [updateMessages]);

  const handleStreamError = useCallback((error: Error) => {
    setError(error.message);
  }, [setError]);

  const handleStreamComplete = useCallback(() => {
    // Mark all buffered messages as complete.
    agentBuffers.current.forEach((message, id) => {
      agentBuffers.current.set(id, { ...message, isComplete: true });
    });
    if (functionCallBuffer.current) {
      functionCallBuffer.current = { ...functionCallBuffer.current, isComplete: true };
    }
    updateMessages();
    setIsStreaming(false);
  }, [updateMessages, setIsStreaming]);

  const startGeneration = useCallback(async (topic: string) => {
    if (!topic.trim() || state.isActive) return;

    try {
      // Reset state
  agentBuffers.current.clear();
  functionCallBuffer.current = null;
  orderRef.current = [];
      setState({ isActive: true, error: null, messages: [] });

      const request: AccreditationRequest = { topic: topic.trim() };
      
      cancelStreamRef.current = await accreditationService.generateDocumentation(
        request,
        {
          onMessage: handleStreamMessage,
          onError: handleStreamError,
          onComplete: handleStreamComplete
        }
      );
    } catch (error) {
      setError((error as Error).message);
    }
  }, [state.isActive, accreditationService, handleStreamMessage, handleStreamError, handleStreamComplete, setError]);

  const cancelGeneration = useCallback(() => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsStreaming(false);
  }, [setIsStreaming]);

  return {
    ...state,
    startGeneration,
    cancelGeneration
  };
};