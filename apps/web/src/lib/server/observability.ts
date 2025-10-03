import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { performance } from 'node:perf_hooks';

import { createLogger } from '$lib/utils/log';
import { isSentryAvailable, setupSentry } from './sentry';

const baseLogger = createLogger('observability');

export interface ObservabilityConfig {
  logging: {
    requestLifecycle: boolean;
  };
  sentry: {
    enabled: boolean;
    allowInDev: boolean;
  };
}

export function resolveObservabilityConfig(env: NodeJS.ProcessEnv = process.env): ObservabilityConfig {
  const loggingFlag = env.OBS_LOGGING_ENABLED;
  const sentryFlag = env.OBS_SENTRY_ENABLED;
  const sentryInDev = env.OBS_SENTRY_DEV === 'true';

  return {
    logging: {
      requestLifecycle: loggingFlag ? loggingFlag !== 'false' : true
    },
    sentry: {
      enabled: sentryFlag ? sentryFlag === 'true' : true,
      allowInDev: sentryInDev
    }
  };
}

function shouldInitSentry(config: ObservabilityConfig): boolean {
  if (!config.sentry.enabled) return false;
  if (dev && !config.sentry.allowInDev) return false;
  return isSentryAvailable();
}

function mergeConfig(defaults: ObservabilityConfig, overrides?: Partial<ObservabilityConfig>): ObservabilityConfig {
  if (!overrides) return defaults;

  return {
    logging: {
      requestLifecycle: overrides.logging?.requestLifecycle ?? defaults.logging.requestLifecycle
    },
    sentry: {
      enabled: overrides.sentry?.enabled ?? defaults.sentry.enabled,
      allowInDev: overrides.sentry?.allowInDev ?? defaults.sentry.allowInDev
    }
  };
}

export function createObservabilityHandle(overrides?: Partial<ObservabilityConfig>): Handle {
  const defaults = resolveObservabilityConfig();

  return async ({ event, resolve }) => {
    const config = mergeConfig(defaults, overrides);
    const requestLogger = baseLogger.withContext({ path: event.url.pathname, method: event.request.method });
    const start = performance.now();

    if (shouldInitSentry(config)) {
      try {
        await setupSentry();
        requestLogger.debug?.('Sentry initialized for request');
      } catch (error) {
        requestLogger.warn?.('Failed to initialize Sentry', {
          reason: error instanceof Error ? error.message : String(error)
        });
      }
    }

    try {
      const response = await resolve(event);

      if (config.logging.requestLifecycle) {
        const duration = Math.round(performance.now() - start);
        requestLogger.info('request.completed', {
          status: response.status,
          duration
        });
      }

      return response;
    } catch (error) {
      if (config.logging.requestLifecycle) {
        const duration = Math.round(performance.now() - start);
        requestLogger.error('request.failed', error instanceof Error ? error : new Error(String(error)), {
          duration
        });
      }

      throw error;
    }
  };
}
