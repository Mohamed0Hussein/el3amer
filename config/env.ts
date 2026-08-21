import Constants from 'expo-constants';

type Extra = { apiUrl?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

// Same var on every platform. (Previously Android built its own URL from
// EXPO_PUBLIC_BACKEND_URL + ':' + EXPO_PUBLIC_BACKEND_PORT, which blindly
// appended the LAN-dev port to whatever host was configured — once that
// host became the deployed HTTPS backend, it produced
// "https://el3amer-backend.vercel.app:3000", which doesn't exist.)
const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const fromExtra = typeof extra.apiUrl === 'string' ? extra.apiUrl.trim() : '';

/**
 * API origin without trailing slash — axios appends `/api/v1`.
 * Set `EXPO_PUBLIC_API_URL` or `expo.extra.apiUrl` in app.json.
 */
export const env = {
  apiOrigin: stripTrailingSlash(
    fromEnv || fromExtra || 'https://el3amer-backend.vercel.app',
  ),
} as const;
