import { Logo } from '@/components/Logo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AboutScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();

  return (
    <ThemedView variant="primary" style={styles.container}>

      <ScreenHeader title={t('about')} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size={72} />
          <ThemedText variant="primary" size="2xl" weight="extrabold" style={{ marginTop: 16 }}>
            {t('appTitle')}
          </ThemedText>
          <ThemedText variant="tertiary" size="base">
            Version 1.0.0
          </ThemedText>
        </View>

        <ThemedText variant="secondary" size="base" style={styles.description}>
          El3amer Fresh Supermarket is your one-stop shop for high-quality groceries, fresh produce, and daily essentials. 
          We are committed to delivering the freshest items directly to your home with speed and care.
        </ThemedText>

        <ThemedView variant="card" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={24} color={theme.primary[500]} />
            <ThemedView variant="default" style={styles.infoText}>
              <ThemedText weight="bold">Our Location</ThemedText>
              <ThemedText variant="tertiary" size="sm">Cairo, Egypt</ThemedText>
            </ThemedView>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[200] }]} />
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={theme.primary[500]} />
            <ThemedView variant="default" style={styles.infoText}>
              <ThemedText weight="bold">Support Email</ThemedText>
              <ThemedText variant="tertiary" size="sm">support@el3amer.com</ThemedText>
            </ThemedView>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.gray[200] }]} />
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={24} color={theme.primary[500]} />
            <ThemedView variant="default" style={styles.infoText}>
              <ThemedText weight="bold">Website</ThemedText>
              <ThemedText variant="tertiary" size="sm">www.el3amer.com</ThemedText>
            </ThemedView>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  infoCard: {
    padding: 20,
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
