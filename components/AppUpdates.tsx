import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { env } from '@/config/env';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, StyleSheet, View } from 'react-native';

type Release = { latest: string; minimum: string; url: string | null };

// Compares part by part as numbers, so "1.2.0" is older than "1.10.0".
export const isOlder = (a: string, b: string) => {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
  }
  return false;
};

const CHECK_EVERY_MS = 15 * 60 * 1000;

// Two kinds of update, checked on launch and whenever the app comes back to the front:
// - JS-only (EAS Update): downloaded in the background, then offered as a restart.
// - New APK (native change, new app version): the backend's /app-version says which
//   version is latest (offered once) and which is the oldest still allowed (blocking).
export function AppUpdates({ app }: { app: 'customer' | 'store' }) {
  const { t } = useLocalization();
  const { theme } = useTheme();
  const { isUpdatePending } = Updates.useUpdates();
  const [required, setRequired] = useState<Release | null>(null);
  const lastCheck = useRef(0);
  const offered = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (__DEV__ || Date.now() - lastCheck.current < CHECK_EVERY_MS) return;
      lastCheck.current = Date.now();
      try {
        const release: Release = await fetch(`${env.apiOrigin}/api/v1/app-version/${app}`).then((r) => r.json());
        const current = Constants.nativeAppVersion ?? '0';
        if (release.url && isOlder(current, release.minimum)) {
          setRequired(release);
          return;
        }
        if (release.url && isOlder(current, release.latest) && offered.current !== release.latest) {
          offered.current = release.latest;
          Alert.alert(t('newVersionTitle'), t('newVersionBody'), [
            { text: t('later'), style: 'cancel' },
            { text: t('download'), onPress: () => Linking.openURL(release.url!) },
          ]);
        }
        if (Updates.isEnabled && (await Updates.checkForUpdateAsync()).isAvailable) await Updates.fetchUpdateAsync();
      } catch {
        // Offline or backend down: try again next time the app comes to the front.
      }
    };
    check();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && check());
    return () => sub.remove();
  }, [app, t]);

  // "Later" keeps the update downloaded; it starts by itself on the next launch.
  useEffect(() => {
    if (!isUpdatePending) return;
    Alert.alert(t('updateReadyTitle'), t('updateReadyBody'), [
      { text: t('later'), style: 'cancel' },
      { text: t('restartNow'), onPress: () => Updates.reloadAsync() },
    ]);
  }, [isUpdatePending]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!required) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.blocker, { backgroundColor: theme.background.primary }]}>
      <ThemedText size="xl" weight="extrabold" style={styles.center}>
        {t('updateRequiredTitle')}
      </ThemedText>
      <ThemedText variant="secondary" style={[styles.center, { marginTop: 8 }]}>
        {t('updateRequiredBody')}
      </ThemedText>
      <ThemedButton size="lg" style={styles.button} onPress={() => Linking.openURL(required.url!)}>
        {t('download')}
      </ThemedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  blocker: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
});
