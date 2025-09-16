// Service Factory - Dependency Inversion Principle

import { IAccreditationService, AccreditationService } from './AccreditationService';
import { IHttpClient, HttpClient } from './HttpClient';
import { IStreamingService, SseStreamingService } from './StreamingService';

/**
 * Factory for creating service instances with proper dependency injection
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private httpClient: IHttpClient;
  private streamingService: IStreamingService;
  private accreditationService: IAccreditationService;

  private constructor(baseUrl: string) {
    this.httpClient = new HttpClient(baseUrl);
    this.streamingService = new SseStreamingService();
    this.accreditationService = new AccreditationService(
      this.httpClient,
      this.streamingService
    );
  }

  static getInstance(baseUrl?: string): ServiceFactory {
    if (!ServiceFactory.instance) {
      const url = baseUrl || import.meta.env.VITE_BACKEND_URL || '';
      ServiceFactory.instance = new ServiceFactory(url);
    }
    return ServiceFactory.instance;
  }

  getAccreditationService(): IAccreditationService {
    return this.accreditationService;
  }

  // For testing purposes - allows dependency injection
  static createWithDependencies(
    httpClient: IHttpClient,
    streamingService: IStreamingService
  ): IAccreditationService {
    return new AccreditationService(httpClient, streamingService);
  }
}