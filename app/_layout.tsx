import { NetworkBanner } from "@/components/NetworkBanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartContextProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LocalizationProvider, useLocalization } from "@/context/LocalizationContext";
import { useTheme } from "@/hooks/useTheme";
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useSegments } from 'expo-router';
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";

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
  const { isAuthenticated, isHydrating } = useAuth();
  
  useProtectedRoute(isAuthenticated, isHydrating);

  if (isHydrating) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="SettingsScreen" />
        <Stack.Screen name="EditProfileScreen" />
        <Stack.Screen name="FavoritesScreen" />
        <Stack.Screen name="OrdersScreen" />
        <Stack.Screen name="ProductDetailsScreen" />
        <Stack.Screen name="OrderDetailsScreen" />
        <Stack.Screen name="AddressScreen" />
        <Stack.Screen name="EditAddressScreen" />
        <Stack.Screen name="ChangePasswordScreen" />
        <Stack.Screen name="AboutScreen" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RtlWrapper>
        <RootNavigator />
      </RtlWrapper>
    </AppProviders>
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