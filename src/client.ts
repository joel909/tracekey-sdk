import { TracekeyApiError, TracekeyNetworkError } from './errors';
import { UserResource } from './resources/users';
import type { EventAdditionalInfo, RequestOptions, SdkConfig } from './types';
import { createDeviceID, getDeviceIDFromCookie, setDeviceIDInCookie } from './resources/cookies';

/**
 * The core client for the Tracekey API.
 */
export class TracekeyClient {
  public readonly apiKey: string;
  public readonly baseUrl: string;
  public readonly client: UserResource;
  private cachedDeviceID: string | null = null;

  /**
   * Initialize a new Tracekey SDK Client
   * @param config - Configuration options including the API key
   */
  constructor(config: SdkConfig) {
    if (!config.apiKey) {
      throw new Error('An API key is required to initialize TracekeyClient');
    }
    this.apiKey = config.apiKey;
    // Allow users to override the base URL (useful for staging, local testing, etc.)
    this.baseUrl = config.baseUrl || 'https://tracekey.joeljoby.com/';
    // Initialize endpoint resources
    this.client = new UserResource(this);
  }

  public get deviceID(): string | null {
    if (this.cachedDeviceID) {
      return this.cachedDeviceID;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    let deviceID = getDeviceIDFromCookie();
    if (!deviceID) {
      deviceID = createDeviceID();
      setDeviceIDInCookie(deviceID);
    }

    this.cachedDeviceID = deviceID;
    return deviceID;
  }

  public get pageRoute(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.pathname;
  }

  async getClientAdditionalInfo() {
    const deviceInfo = await this.client.getClientAdditionalInfo();
    console.log('Device Info:', deviceInfo);
    return deviceInfo;
  }

  private dispatchEvent(actionName: string, additionalInfo?: EventAdditionalInfo): void {
    void this.client.LogEvent(actionName, additionalInfo).catch((error) => {
      console.warn(`Failed to log ${actionName} event:`, error);
    });
  }

  logLandingEvent(): void {
    this.dispatchEvent('landing');
  }

  logButtonClickEvent(buttonName: string): void {
    this.dispatchEvent(`button_click_${buttonName}`);
  }

  logUserQuitEvent(): void {
    this.dispatchEvent('user_quit');
  }

  logUserHeartbeatEvent(): void {
    this.dispatchEvent('user_heartbeat');
  }

  logJoinQueue(memberCount: number): void {
    this.dispatchEvent('join_queue', { memberCount });
  }

  /**
   * Internal fetch wrapper that automatically adds headers and handles errors.
   */
  public async request<TResponse>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Default headers, augmented with any specific ones passed in
    const headers = new Headers({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    });

    const init: RequestInit = {
      method: options.method || 'GET',
      headers,
      signal: options.signal, // Useful for aborting requests
    };

    if (options.body) {
      init.body = JSON.stringify(options.body);
    }

    // append query params to url if they exist
    let finalUrl = url;
    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }

    try {
      const response = await fetch(finalUrl, init);

      if (!response.ok) {
        // Read response body as text just in case it's not JSON
        const rawBody = await response.text();
        let parsedBody;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = rawBody;
        }

        throw new TracekeyApiError(
          `Request failed with status ${response.status}`,
          response.status,
          parsedBody
        );
      }

      // Check if there is an empty response
      if (response.status === 204) {
        return null as any; 
      }

      return await response.json() as TResponse;
      
    } catch (error) {
      if (error instanceof TracekeyApiError) {
        throw error;
      }
      
      // Catch network-level errors (like DNS failures, CORS issues, etc.)
      throw new TracekeyNetworkError(
        error instanceof Error ? error.message : 'Unknown network error occurred',
        error
      );
    }
  }
}
