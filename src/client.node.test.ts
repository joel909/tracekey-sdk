// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { TracekeyClient } from './client';

describe('TracekeyClient in non-browser environments', () => {
  it('can be constructed without window access', () => {
    expect(() => new TracekeyClient({ apiKey: 'test-key' })).not.toThrow();
  });

  it('resolves browser-derived fields lazily', () => {
    const client = new TracekeyClient({ apiKey: 'test-key' });

    expect(client.deviceID).toBeNull();
    expect(client.pageRoute).toBe('');
  });
});
