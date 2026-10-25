import '@/lib/sentry';
import { AppUpdates } from "@/components/AppUpdates";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkBanner } from "@/components/NetworkBanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartContextProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LocalizationProvider, useLocalization } from "@/context/LocalizationContext";
import { useTheme } from "@/hooks/useTheme";
import { setupGlobalErrorHandler } from "@/lib/globalErrorHandler";
import { useOrderNotifications } from "@/lib/notifications";
import { queryClient } from '@/lib/queryClient';
import { getUserInfo } from '@/services/user';
import {
  Almarai_300Light,
  Almarai_400Regular,
  Almarai_700Bold,
  Almarai_800ExtraBold,
} from '@expo-google-fonts/almarai';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

setupGlobalErrorHandler();

function useProtectedRoute(isAuthenticated: boolean, isHydrating: boolean) {
  const segments = useSegments();

  useEffect(() => {
    if (isHydrating) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/LoginScreen');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrating, segments]);
}

function RootNavigator() {
  const { user, isAuthenticated, isHydrating } = useAuth();
  const { theme, isDark } = useTheme();
  // Android only picks the bottom bar's look at launch; follow live theme switches too.
  useEffect(() => {
    if (Platform.OS === 'android') NavigationBar.setStyle(isDark ? 'light' : 'dark');
  }, [isDark]);
  const { language } = useLocalization();
  const insets = useSafeAreaInsets();

  useOrderNotifications(user?.id, language);

  useProtectedRoute(isAuthenticated, isHydrating);

  // Warm the profile cache as soon as someone signs in, so Edit Profile,
  // Checkout and the Home address bar open with data already loaded.
  useEffect(() => {
    if (!user) return;
    queryClient.prefetchQuery({
      queryKey: ['me', user.id],
      queryFn: () => getUserInfo(String(user.id)),
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isHydrating) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="SettingsScreen" />
        <Stack.Screen name="EditProfileScreen" />
        <Stack.Screen name="FavoritesScreen" />
        <Stack.Screen name="OrdersScreen" />
        <Stack.Screen name="CheckoutScreen" />
        <Stack.Screen name="CategoryScreen" />
        <Stack.Screen name="ProductDetailsScreen" />
        <Stack.Screen name="OrderDetailsScreen" />
        <Stack.Screen name="PaymentScreen" />
        <Stack.Screen name="AddressScreen" />
        <Stack.Screen name="ChangePasswordScreen" />
        <Stack.Screen name="AboutScreen" />
      </Stack>
      <AppUpdates app="customer" />
      {/* The app draws edge-to-edge, so the status bar has no background of its
          own (StatusBar backgroundColor is ignored); paint one over the top inset. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: insets.top,
          backgroundColor: theme.background.primary,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Almarai_300Light,
    Almarai_400Regular,
    Almarai_700Bold,
    Almarai_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <RtlWrapper>
          <RootNavigator />
        </RtlWrapper>
      </AppProviders>
    </ErrorBoundary>
  );
}

// Wrapper component that remounts when RTL changes
function RtlWrapper({ children }: { children: React.ReactNode }) {
  const { isRtl } = useLocalization();
  
  // Force remount by using key based on RTL direction
  return (
    <ThemedView key={isRtl ? 'rtl' : 'ltr'} style={{ flex: 1 }}>
      {children}
    </ThemedView>
  );
}

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartContextProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </CartContextProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

const LoadingScreen = () => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  return (
    <ThemedView
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background.primary }}
    >
      <ActivityIndicator size="large" color={theme.primary[500]} />
      <ThemedText style={{ marginTop: 12 }} variant="secondary">{t('loading')}</ThemedText>
    </ThemedView>
  );
};