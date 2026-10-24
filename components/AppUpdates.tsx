import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { env } from '@/config/env';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Updates from 'expo-updates';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Modal, Platform, StyleSheet, View } from 'react-native';

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

// The installed APK's version. runtimeVersion follows app.json "version" (the
// appVersion policy) and comes from the native build, so an instant update
// can't change it. (Constants.nativeAppVersion is always empty on this SDK.)
const installedVersion = () => Updates.runtimeVersion || null;
const FLAG_GRANT_READ_URI_PERMISSION = 1;

// Downloads the APK into the app's cache and opens Android's installer on it;
// the user only taps Install (and, the first time, allows installs from this
// app). Each version is downloaded once: the file is only given its final name
// when complete and stays until a newer version replaces it, so a cancelled or
// failed install doesn't cost another 100+ MB.
// A successful install replaces the app and ends this process, so returning
// 'opened' means the installer closed without installing it.
const installApk = async (url: string, version: string, onProgress: (share: number) => void): Promise<'opened' | 'browser'> => {
  try {
    if (Platform.OS !== 'android') throw new Error('Android only');
    const dir = FileSystem.cacheDirectory!;
    const target = `${dir}update-${version}.apk`;
    if (!(await FileSystem.getInfoAsync(target)).exists) {
      for (const name of await FileSystem.readDirectoryAsync(dir)) {
        if (/^update.*\.apk(\.part)?$/.test(name)) await FileSystem.deleteAsync(dir + name, { idempotent: true });
      }
      const download = FileSystem.createDownloadResumable(url, `${target}.part`, {}, ({ totalBytesWritten, totalBytesExpectedToWrite }) =>
        onProgress(totalBytesExpectedToWrite > 0 ? totalBytesWritten / totalBytesExpectedToWrite : 0),
      );
      const result = await download.downloadAsync();
      if (!result || result.status !== 200) throw new Error(`Download failed (${result?.status})`);
      await FileSystem.moveAsync({ from: `${target}.part`, to: target });
    }
    onProgress(1);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: await FileSystem.getContentUriAsync(target),
      type: 'application/vnd.android.package-archive',
      flags: FLAG_GRANT_READ_URI_PERMISSION,
    });
    return 'opened';
  } catch (error) {
    console.warn('In-app update failed, opening the browser:', error);
    await Linking.openURL(url);
    return 'browser';
  }
};

// Two kinds of update, checked on launch and whenever the app comes back to the front:
// - JS-only (EAS Update): downloaded in the background, then offered as a restart.
// - New APK (native change, new app version): the backend's /app-version says which
//   version is latest (offered once) and which is the oldest still allowed (blocking).
//   The APK is downloaded inside the app and handed to Android's installer.
export function AppUpdates({ app }: { app: 'customer' | 'store' }) {
  const { t } = useLocalization();
  const { theme } = useTheme();
  const { isUpdatePending } = Updates.useUpdates();
  const [required, setRequired] = useState<Release | null>(null);
  // Download progress 0–1 while an APK is downloading, null otherwise.
  const [progress, setProgress] = useState<number | null>(null);
  const lastCheck = useRef(0);
  const offered = useRef<string | null>(null);

  const install = async (release: Release) => {
    setProgress(0);
    const how = await installApk(release.url!, release.latest, setProgress);
    setProgress(null);
    // Still running, so it wasn't installed: say so instead of silently asking
    // (and downloading) again on the next launch.
    if (how === 'opened') {
      Alert.alert(t('installNotFinishedTitle'), t('installNotFinishedBody'), [
        { text: t('later'), style: 'cancel' },
        { text: t('tryAgain'), onPress: () => install(release) },
      ]);
    }
  };

  useEffect(() => {
    const check = async () => {
      if (__DEV__ || Date.now() - lastCheck.current < CHECK_EVERY_MS) return;
      lastCheck.current = Date.now();
      try {
        const release: Release = await fetch(`${env.apiOrigin}/api/v1/app-version/${app}?client=2`).then((r) => r.json());
        const current = installedVersion();
        // Unknown version: never block or nag.
        if (!current) return;
        if (release.url && isOlder(current, release.minimum)) {
          setRequired(release);
          return;
        }
        setRequired(null);
        if (release.url && isOlder(current, release.latest) && offered.current !== release.latest) {
          offered.current = release.latest;
          Alert.alert(t('newVersionTitle'), t('newVersionBody'), [
            { text: t('later'), style: 'cancel' },
            { text: t('download'), onPress: () => install(release) },
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
  }, [app, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Later" keeps the update downloaded; it starts by itself on the next launch.
  useEffect(() => {
    if (!isUpdatePending) return;
    Alert.alert(t('updateReadyTitle'), t('updateReadyBody'), [
      { text: t('later'), style: 'cancel' },
      { text: t('restartNow'), onPress: () => Updates.reloadAsync() },
    ]);
  }, [isUpdatePending]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloading = progress !== null && (
    <ThemedText variant="secondary" style={[styles.center, { marginTop: 16 }]}>
      {t('downloadingUpdate').replace('{n}', String(Math.round(progress * 100)))}
    </ThemedText>
  );

  if (required) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.blocker, { backgroundColor: theme.background.primary }]}>
        <ThemedText size="xl" weight="extrabold" style={styles.center}>
          {t('updateRequiredTitle')}
        </ThemedText>
        <ThemedText variant="secondary" style={[styles.center, { marginTop: 8 }]}>
          {t('updateRequiredBody')}
        </ThemedText>
        <ThemedButton size="lg" style={styles.button} loading={progress !== null} onPress={() => install(required)}>
          {t('download')}
        </ThemedButton>
        {downloading}
      </View>
    );
  }

  return (
    <Modal visible={progress !== null} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.background.card }]}>
          <ThemedText size="lg" weight="extrabold" style={styles.center}>{t('newVersionTitle')}</ThemedText>
          {downloading}
          <View style={[styles.track, { backgroundColor: theme.gray[100] }]}>
            <View style={[styles.fill, { width: `${Math.round((progress ?? 0) * 100)}%`, backgroundColor: theme.primary[500] }]} />
          </View>
        </View>
      </View>
    </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: 20,
    padding: 22,
  },
  track: {
    height: 6,
    borderRadius: 999,
    marginTop: 14,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
