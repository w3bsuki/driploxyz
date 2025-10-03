import { describe, expect, it, vi, beforeEach } from 'vitest';

const {
  infoMock,
  errorMock,
  warnMock,
  debugMock,
  withContextMock,
  childLogger,
  setupSentryMock,
  isSentryAvailableMock
} = vi.hoisted(() => {
  const infoMock = vi.fn();
  const errorMock = vi.fn();
  const warnMock = vi.fn();
  const debugMock = vi.fn();
  const withContextMock = vi.fn();
  const childLogger = {
    info: infoMock,
    error: errorMock,
    warn: warnMock,
    debug: debugMock,
    withContext: withContextMock
  };

  return {
    infoMock,
    errorMock,
    warnMock,
    debugMock,
    withContextMock,
    childLogger,
    setupSentryMock: vi.fn(async () => {}),
    isSentryAvailableMock: vi.fn(() => true)
  };
});

vi.mock('$app/environment', () => ({ dev: true }));
vi.mock('$lib/utils/log', () => ({
  createLogger: vi.fn(() => childLogger)
}));
vi.mock('../sentry.js', () => ({
  setupSentry: setupSentryMock,
  isSentryAvailable: isSentryAvailableMock
}));

withContextMock.mockReturnValue(childLogger);

import { createObservabilityHandle, resolveObservabilityConfig } from '../observability.js';

describe('observability handle', () => {
  beforeEach(() => {
    infoMock.mockClear();
    errorMock.mockClear();
    warnMock.mockClear();
    debugMock.mockClear();
    withContextMock.mockClear();
    withContextMock.mockReturnValue(childLogger);
    setupSentryMock.mockClear();
    isSentryAvailableMock.mockClear();
    isSentryAvailableMock.mockReturnValue(true);
  });

  it('resolves defaults with logging enabled and sentry disabled in dev by default', () => {
    const config = resolveObservabilityConfig({});
    expect(config.logging.requestLifecycle).toBe(true);
    expect(config.sentry.enabled).toBe(true);
    expect(config.sentry.allowInDev).toBe(false);
  });

  it('initializes sentry and logs request lifecycle', async () => {
    const handle = createObservabilityHandle({
      sentry: { enabled: true, allowInDev: true },
      logging: { requestLifecycle: true }
    });

    const event = {
      request: new Request('http://localhost/health', { method: 'GET' }),
      url: new URL('http://localhost/health'),
      locals: {},
      getClientAddress: () => '127.0.0.1'
    } as unknown as Parameters<typeof handle>[0]['event'];

    const response = await handle({
      event,
      resolve: async () => new Response('ok', { status: 200 })
    });

    expect(response.status).toBe(200);
    expect(setupSentryMock).toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalledWith('request.completed', expect.objectContaining({ status: 200 }));
    expect(errorMock).not.toHaveBeenCalled();
  });

  it('logs failures when resolver throws', async () => {
    const handle = createObservabilityHandle({
      sentry: { enabled: false, allowInDev: false },
      logging: { requestLifecycle: true }
    });

    const event = {
      request: new Request('http://localhost/error', { method: 'POST' }),
      url: new URL('http://localhost/error'),
      locals: {},
      getClientAddress: () => '127.0.0.1'
    } as unknown as Parameters<typeof handle>[0]['event'];

    await expect(
      handle({
        event,
        resolve: async () => {
          throw new Error('boom');
        }
      })
    ).rejects.toThrow('boom');

    expect(errorMock).toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
  });
});
