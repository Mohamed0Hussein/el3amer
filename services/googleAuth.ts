import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const config = {
  clientId: Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  }),
  scopes: ['openid', 'profile', 'email'],
  redirectUri: AuthSession.makeRedirectUri(),
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.clientId!,
      scopes: config.scopes,
      redirectUri: config.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, 
    },
    discovery
  );


  const signInWithGoogle = async (): Promise<GoogleUserInfo | null> => {
    try {
      if (!request) {
        console.warn('Auth request not ready');
        return null;
      }

      const result = await promptAsync();

      if (result.type !== 'success') {
        return null;
      }

      const { code } = result.params;

      if (!code) {
        console.error('No authorization code received');
        return null;
      }


      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
          code_verifier: request.codeVerifier!, 
        }).toString(),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('Failed to exchange token:', tokenData);
        return null;
      }

      // Get user info from Google API
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error('Failed to fetch user info:', await userInfoResponse.text());
        return null;
      }

      const userInfo: GoogleUserInfo = await userInfoResponse.json();

      return userInfo;
    } catch (error) {
      console.error('Google auth error:', error);
      return null;
    }
  };

  return {
    signInWithGoogle,
    request,
    response,
    isReady: !!request,
  };
};
