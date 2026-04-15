export interface SdkConfig {
  /**
   * The API key for authentication against the Tracekey API.
   */
  apiKey: string;
  /**
   * Optional custom base URL. Helpful for testing or if the API version changes.
   */
  baseUrl?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

// An example model for a User
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// An example parameter type
export interface ListUsersParams {
  limit?: number;
  page?: number;
}

export interface UaHighEntropyValues {
  brands: { brand: string, version: string }[];
  mobile: boolean;
  platform: string;
  model: string;
  platformVersion: string;
}

export interface DeviceInfo {
  brand?: string;
  model?: string;
  platform?: string;
  platformVersion?: string;
}