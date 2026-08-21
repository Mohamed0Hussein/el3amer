import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

interface RouteErrorFallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Expo Router route-level error boundary. Export this (or a wrapper of it)
 * as `ErrorBoundary` from any route file — Expo Router renders it in place
 * of the screen when that route throws during render, and `retry` re-mounts
 * the route. Runs inside all app Providers, so theming/i18n are safe here.
 */
export function RouteErrorFallback({ error, retry }: RouteErrorFallbackProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ThemedView
        variant="default"
        style={[styles.iconContainer, { backgroundColor: theme.status.error + '1A' }]}
      >
        <Ionicons name="warning-outline" size={48} color={theme.status.error} />
      </ThemedView>
      <ThemedText variant="primary" size="xl" weight="semibold" style={styles.title}>
        {t('somethingWentWrong')}
      </ThemedText>
      <ThemedText variant="tertiary" size="base" style={styles.message}>
        {t('unexpectedErrorMessage')}
      </ThemedText>
      {__DEV__ && (
        <ThemedText variant="error" size="xs" style={styles.devError} numberOfLines={6}>
          {error.name}: {error.message}
        </ThemedText>
      )}
      <ThemedView style={styles.actions}>
        <ThemedButton variant="primary" onPress={retry} style={styles.button}>
          {t('tryAgain')}
        </ThemedButton>
        <ThemedButton
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
          style={styles.button}
        >
          {t('goHome')}
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  devError: {
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  button: {
    minWidth: 120,
  },
});
