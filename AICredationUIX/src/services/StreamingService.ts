// Streaming Service - Single Responsibility Principle

import { StreamMessage } from '../models/AccreditationModels';

/**
 * Interface for streaming service
 */
export interface IStreamingService {
  processStream(
    response: Response,
    onMessage: (message: StreamMessage) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<() => void>;
}

/**
 * Server-Sent Events streaming service
 */
export class SseStreamingService implements IStreamingService {
  async processStream(
    response: Response,
    onMessage: (message: StreamMessage) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<() => void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let isActive = true;

    const processChunk = async (): Promise<void> => {
      try {
        while (isActive && reader) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (this.isValidStreamMessage(data)) {
                  onMessage(data);
                }
              } catch (error) {
                console.warn('Failed to parse SSE message:', error);
              }
            }
          }
        }
      } catch (error) {
        if (isActive) {
          onError(error as Error);
        }
      }
    };

    processChunk();

    // Return cleanup function
    return () => {
      isActive = false;
      reader.cancel();
    };
  }

  private isValidStreamMessage(data: any): data is StreamMessage {
    if (!data || typeof data.type !== 'string') return false;
    if (data.type === 'agent_message') {
      return (
        typeof data.role === 'string' &&
        typeof data.content === 'string' &&
        typeof data.agent === 'string' &&
        typeof data.final === 'boolean'
      );
    }
    if (data.type === 'function_call') {
      return (
        data.functionCall &&
        typeof data.functionCall.arguments === 'string' &&
        'name' in data.functionCall &&
        typeof data.final === 'boolean'
      );
    }
    return false;
  }
}