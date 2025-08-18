import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: '',
  environment: 'production',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});

export const handleError = handleErrorWithSentry();