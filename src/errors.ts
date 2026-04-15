/**
 * Base class for all exceptions thrown by the Tracekey SDK.
 */
export class TracekeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TracekeyError';
    // restore prototype chain (required for correct prototype chain in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Throw this when an API request fails (4xx or 5xx response).
 * You can inspect the status and raw JSON body returned by the API.
 */
export class TracekeyApiError extends TracekeyError {
  public readonly status: number;
  public readonly data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'TracekeyApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Thrown when the fetch request fails before completing, due to network issues like CORS or DNS failures.
 */
export class TracekeyNetworkError extends TracekeyError {
  public readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'TracekeyNetworkError';
    this.cause = cause;
  }
}