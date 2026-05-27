import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TracekeyClient } from './client';

describe('TracekeyClient in the browser', () => {
  const originalFetch = globalThis.fetch;
  const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/signup');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    document.cookie = 'tracekey_device_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('logs events with the current route and a generated device id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });
    const result = client.logLandingEvent();
    await flushPromises();

    expect(result).toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBeTypeOf('string');

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init!.body as string);

    expect(payload.page_route).toBe('/signup');
    expect(payload.event_name).toBe('landing');
    expect(payload.device_id).toBeTypeOf('string');
    expect(payload.additionalInfo).toBeUndefined();
  });

  it('reuses the generated device id between events', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });

    client.logLandingEvent();
    client.logButtonClickEvent('cta');
    await flushPromises();

    const firstPayload = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    const secondPayload = JSON.parse(fetchMock.mock.calls[1]![1]!.body as string);

    expect(firstPayload.device_id).toBe(secondPayload.device_id);
  });

  it('logs join queue with the join_queue action name and member count', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });

    client.logJoinQueue(10);
    await flushPromises();

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init!.body as string);

    expect(payload.event_name).toBe('join_queue');
    expect(payload.additionalInfo).toEqual({ memberCount: 10 });
  });

  it('logs boarded ride with the boardedRide action name and member count', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });

    client.markedAsBoarded(10);
    await flushPromises();

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init!.body as string);

    expect(payload.event_name).toBe('boardedRide');
    expect(payload.additionalInfo).toEqual({ memberCount: 10 });
  });

  it('swallows logging failures so they do not affect the host app', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new TracekeyClient({ apiKey: 'test-key' });

    expect(() => client.logLandingEvent()).not.toThrow();
    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to log landing event:',
        expect.any(Error)
      );
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
