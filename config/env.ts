import Constants from 'expo-constants';

type Extra = { apiUrl?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const fromExtra = typeof extra.apiUrl === 'string' ? extra.apiUrl.trim() : '';

/**
 * API origin without trailing slash — axios appends `/api/v1`.
 * Set `EXPO_PUBLIC_API_URL` or `expo.extra.apiUrl` in app.json.
 */
export const env = {
  apiOrigin: stripTrailingSlash(
    fromEnv || fromExtra || 'https://primacy-backend.vercel.app',
  ),
} as const;
