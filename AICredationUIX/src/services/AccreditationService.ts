// Accreditation Service - Dependency Inversion Principle

import { AccreditationRequest, StreamHandlers } from '../models/AccreditationModels';
import { IHttpClient } from './HttpClient';
import { IStreamingService } from './StreamingService';

/**
 * Interface for accreditation service
 */
export interface IAccreditationService {
  generateDocumentation(
    request: AccreditationRequest,
    handlers: StreamHandlers
  ): Promise<() => void>;
}

/**
 * Implementation of accreditation service
 */
export class AccreditationService implements IAccreditationService {
  private static readonly ENDPOINT = '/api/ServiceAccreditations';

  constructor(
    private readonly httpClient: IHttpClient,
    private readonly streamingService: IStreamingService
  ) {}

  async generateDocumentation(
    request: AccreditationRequest,
    handlers: StreamHandlers
  ): Promise<() => void> {
    this.validateRequest(request);

    const response = await this.httpClient.post(
      AccreditationService.ENDPOINT,
      request,
      { 'Accept': 'text/event-stream' }
    );

    return this.streamingService.processStream(
      response,
      handlers.onMessage,
      handlers.onError,
      handlers.onComplete
    );
  }

  private validateRequest(request: AccreditationRequest): void {
    if (!request.topic?.trim()) {
      throw new Error('Topic is required');
    }
  }
}