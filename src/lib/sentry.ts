/**
 * Sentry error tracking setup.
 * Only initialises if EXPO_PUBLIC_SENTRY_DSN is set.
 * Safe to leave unset in development.
 */
import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initialiseSentry(): void {
  if (!DSN) {
    console.log('[Sentry] DSN not set — skipping initialisation');
    return;
  }
  Sentry.init({
    dsn: DSN,
    // Only send errors in production
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
  });
}

/**
 * Log an error to Sentry with optional context.
 * Safe to call even if Sentry is not initialised.
 */
export function captureError(
  error: unknown,
  context?: Record<string, string>
): void {
  if (!DSN) return;
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Log a message to Sentry (non-error events worth tracking).
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!DSN) return;
  Sentry.captureMessage(message, level);
}
