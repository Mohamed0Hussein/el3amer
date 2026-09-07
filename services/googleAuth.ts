import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
});

export const useGoogleAuth = () => {
  const signInWithGoogle = async (): Promise<GoogleUserInfo | null> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      await GoogleSignin.signOut().catch(() => {});

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return null;
      }

      const { accessToken } = await GoogleSignin.getTokens();
      const { user } = response.data;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        picture: user.photo ?? undefined,
        accessToken,
      };
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return null;
      }
      console.error('Google auth error:', error);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    isReady: true,
  };
};
