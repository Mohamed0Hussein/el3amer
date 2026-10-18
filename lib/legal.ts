import { env } from '@/config/env';
import * as WebBrowser from 'expo-web-browser';

// The privacy policy, terms and account-deletion page live on the backend as
// web pages (the Play Store needs them online anyway); the app opens them.
export const openLegalPage = (page: 'privacy' | 'terms' | 'delete-account', language: string) =>
  WebBrowser.openBrowserAsync(`${env.apiOrigin}/${page}?lang=${language}`);
