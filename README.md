# Tracekey SDK

[![npm version](https://img.shields.io/npm/v/tracekey-sdk.svg)](https://www.npmjs.com/package/tracekey-sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official JavaScript/TypeScript SDK for Tracekey. Easily track user interactions, events, and device information across your web applications.

## Features

- 🔋 **Zero-config Device Tracking:** Automatically generates and persists device IDs using secure cookies.
- 📱 **Smart Device Profiling:** Extracts rich device, platform, and browser data via the modern `User-Agent Client Hints API`.
- 🔌 **Seamless Event Logging:** Pre-built methods for common events (landing, clicks, heartbeats, exits).
- 🛡️ **Fully Typed:** Written in TypeScript with complete type definitions included.
- ⚡ **Universal Compatibility:** Ships with both CommonJS and ES Modules support.

## Installation

Install the package via npm, yarn, or pnpm:

```bash
npm install tracekey-sdk
# or
yarn add tracekey-sdk
# or
pnpm add tracekey-sdk
```

## Updating This Package

This repository is an npm package, so updates usually mean changing the source, bumping the package version, rebuilding, and publishing a new release.

### 1. Make your code changes

Edit the SDK source files as needed.

### 2. Update dependencies if needed

If you add, remove, or upgrade dependencies, run:

```bash
npm install
```

This keeps `package-lock.json` in sync.

### 3. Bump the package version

Update the version in `package.json` before publishing. For example:

```bash
npm version patch
```

Use `minor` or `major` instead of `patch` when the change is larger.

### 4. Build and test

Run the project scripts to make sure the package is ready to publish:

```bash
npm run build
npm test
```

### 5. Publish to npm

After the build and tests pass, publish the package:

```bash
npm publish
```

If this is a public package and you need to publish a scoped or pre-release version, adjust the publish command accordingly.

## Initialization

Import and initialize the `TracekeyClient` in code that is only used from the browser. In Next.js, create the singleton in a shared module, but only call logging methods from client components, effects, or browser event handlers.

```typescript
import { TracekeyClient } from 'tracekey-sdk';

export const tracekey = new TracekeyClient({
  apiKey: 'YOUR_TRACEKEY_API_KEY', // Required
  // baseUrl: 'https://custom-api-url.com/v1', // Optional
});
```

The SDK resolves the current page route and device ID lazily when an event is logged, which keeps module imports safe in SSR frameworks like Next.js.

### Next.js Example

```typescript
// src/lib/tracekey.ts
import { TracekeyClient } from 'tracekey-sdk';

export const tracekey = new TracekeyClient({
  apiKey: process.env.NEXT_PUBLIC_TRACEKEY_API_KEY!,
});
```

```tsx
'use client';

import { useEffect } from 'react';
import { tracekey } from '@/lib/tracekey';

export function SignupContainer() {
  useEffect(() => {
    void tracekey.logLandingEvent();
  }, []);

  return null;
}
```

## Usage

### 1. Log a Landing Event
Track when a user lands on a specific page.

```typescript
// Usually called on component mount or page load
tracekey.logLandingEvent();
```

### 2. Log Button Clicks
Track specific user interactions. Pass a descriptive string to identify the button.

```typescript
document.getElementById('checkout-btn').addEventListener('click', () => {
  tracekey.logButtonClickEvent('checkout_main');
});
```

### 3. Log User Heartbeat
Track active time on site by sending periodic heartbeats.

```typescript
// Send a heartbeat every 30 seconds
setInterval(() => {
  tracekey.logUserHeartbeatEvent();
}, 30000);
```

### 4. Log User Quit
Track when a user leaves the application or closes the tab.

```typescript
window.addEventListener('beforeunload', () => {
  tracekey.logUserQuitEvent();
});
```

### 5. Custom Events
If you need to log a custom event that doesn't fit the helper methods, you can access the underlying resource directly:

```typescript
await tracekey.client.LogEvent('custom_video_played');
```

## Error Handling

The helper methods are fire-and-forget. They never block your application flow, and any network/API failures are contained inside the SDK and surfaced via `console.warn`.

If you need to await delivery or handle request failures directly, use the underlying resource method instead.

```typescript
import { TracekeyApiError, TracekeyNetworkError } from 'tracekey-sdk';

try {
  await tracekey.client.LogEvent('custom_video_played');
} catch (error) {
  if (error instanceof TracekeyApiError) {
    console.error(`API rejected request with status ${error.status}:`, error.data);
  } else if (error instanceof TracekeyNetworkError) {
    console.error('Network or CORS error occurred:', error.cause);
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

## Automatic Data Context

Whenever you call an event logging method, the SDK automatically attaches the following contextual context to the request payload:
- `api_key`: Your configured API key.
- `device_id`: A persistent UUID stored in a secure strict cookie.
- `page_route`: The current browser path (e.g., `/dashboard`).
- `event_name`: The name of the action performed.
- `additionalDeviceInfo`: Brand, model, OS, and platform version.

## Requirements

- A browser-like environment (depends on `window`, `document`, and `navigator` APIs).

## License

MIT
