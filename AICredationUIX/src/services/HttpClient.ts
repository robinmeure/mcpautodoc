// HTTP Client - Interface Segregation Principle

/**
 * Generic HTTP client interface
 */
export interface IHttpClient {
  post<TRequest>(
    url: string,
    data: TRequest,
    headers?: Record<string, string>
  ): Promise<Response>;
}

/**
 * Default fetch-based HTTP client implementation
 */
export class HttpClient implements IHttpClient {
  constructor(private readonly baseUrl: string) {}

  async post<TRequest>(
    url: string,
    data: TRequest,
    headers: Record<string, string> = {}
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}