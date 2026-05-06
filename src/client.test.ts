import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TracekeyClient } from './client';

describe('TracekeyClient in the browser', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/signup');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.cookie = 'tracekey_device_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('logs events with the current route and a generated device id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });
    await client.logLandingEvent();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBeTypeOf('string');

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init!.body as string);

    expect(payload.page_route).toBe('/signup');
    expect(payload.event_name).toBe('landing');
    expect(payload.device_id).toBeTypeOf('string');
  });

  it('reuses the generated device id between events', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });

    await client.logLandingEvent();
    await client.logButtonClickEvent('cta');

    const firstPayload = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    const secondPayload = JSON.parse(fetchMock.mock.calls[1]![1]!.body as string);

    expect(firstPayload.device_id).toBe(secondPayload.device_id);
  });
});
