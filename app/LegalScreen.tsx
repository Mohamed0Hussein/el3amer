import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LEGAL, LegalDocId } from '@/constants/legal';
import { useLocalization } from '@/context/LocalizationContext';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: LegalDocId }>();
  const { t, language } = useLocalization();
  const id: LegalDocId = doc === 'terms' ? 'terms' : 'privacy';
  const content = LEGAL[language][id];

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScreenHeader title={id === 'terms' ? t('termsOfService') : t('privacyPolicy')} subtitle={content.updated} />
      <ScrollView contentContainerStyle={styles.content}>
        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <ThemedText size="base" weight="extrabold">{section.heading}</ThemedText>
            <ThemedText variant="secondary" size="sm" style={styles.body}>{section.body}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 22,
  },
  body: {
    marginTop: 6,
    lineHeight: 22,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
