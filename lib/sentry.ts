import * as Sentry from '@sentry/react-native';

// Crash reports from release builds. The DSN comes from the build's
// environment; without it, and always in development, nothing is sent.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn && !__DEV__,
  initialScope: { tags: { app: 'customer' } },
});

export const reportError = (error: unknown) => Sentry.captureException(error);
