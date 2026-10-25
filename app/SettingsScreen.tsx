import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { openLegalPage } from '@/lib/legal';
import { useTheme } from '@/hooks/useTheme';
import { SupportedLanguage } from '@/localization/translations';
import { deleteUser } from '@/services/user';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { logoutUser, user, isLoggingOut } = useAuth();
  const { language, setLanguage, t, isRtl } = useLocalization();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages: { code: SupportedLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  const handleLanguageSelect = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const currentLanguage = languages.find(l => l.code === language);

  const confirmDeleteAccount = () => {
    if (!user) return;
    Alert.alert(t('deleteAccountQ'), t('deleteAccountBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(String(user.id));
            await logoutUser();
          } catch (e: any) {
            Alert.alert(t('error'), e?.response?.status === 409 ? t('deleteAccountActive') : e.message);
          }
        },
      },
    ]);
  };

  const googleUser = user?.authProvider === 'google';

  // One grouped list per section; rows match the Profile menu.
  const Row = ({ icon, label, value, onPress, danger, disabled, last }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
    disabled?: boolean;
    last?: boolean;
  }) => {
    const ink = danger ? theme.status.error : theme.primary[500];
    return (
      <TouchableOpacity
        style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.gray[200] }, disabled && { opacity: 0.45 }]}
        onPress={onPress}
        disabled={disabled || !onPress}
        activeOpacity={0.6}
      >
        <View style={[styles.rowIcon, { backgroundColor: danger ? theme.tint.error.bg : theme.primary[50] }]}>
          <Ionicons name={icon} size={18} color={ink} />
        </View>
        <ThemedText size="sm" weight="bold" style={[styles.rowLabel, danger && { color: theme.status.error }]}>{label}</ThemedText>
        {value ? <ThemedText variant="tertiary" size="sm">{value}</ThemedText> : null}
        {onPress && !danger ? <Ionicons name="chevron-forward" size={18} color={theme.gray[300]} style={isRtl && { transform: [{ scaleX: -1 }] }} /> : null}
      </TouchableOpacity>
    );
  };

  const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      {title ? <ThemedText variant="tertiary" size="xs" weight="extrabold" style={styles.sectionTitle}>{title}</ThemedText> : null}
      <View style={[styles.group, { backgroundColor: theme.background.card, borderColor: theme.gray[100] }]}>{children}</View>
    </View>
  );

  return (
    <ThemedView variant="primary" style={{ flex: 1 }}>
      <ScreenHeader title={t('settings')} subtitle={user?.email} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Section title={t('account')}>
          <Row icon="person-outline" label={t('editProfile')} onPress={() => router.push(ROUTES.EDIT_PROFILE as any)} />
          <Row icon="lock-closed-outline" label={t('changePassword')} onPress={() => router.push(ROUTES.CHANGE_PASSWORD as any)} disabled={googleUser} last />
        </Section>

        <Section title={t('preferences')}>
          <Row icon="language-outline" label={t('language')} value={currentLanguage?.nativeName} onPress={() => setLanguageModalVisible(true)} last />
        </Section>

        <Section title={t('about')}>
          <Row icon="information-circle-outline" label={t('version')} value={Updates.runtimeVersion || Constants.expoConfig?.version} />
          <Row icon="shield-checkmark-outline" label={t('privacyPolicy')} onPress={() => openLegalPage('privacy', language)} />
          <Row icon="document-text-outline" label={t('termsOfService')} onPress={() => openLegalPage('terms', language)} last />
        </Section>

        <Section>
          <Row icon="log-out-outline" label={t('logout')} onPress={() => logoutUser()} disabled={isLoggingOut} danger />
          <Row icon="trash-outline" label={t('deleteAccount')} onPress={confirmDeleteAccount} disabled={isLoggingOut} danger last />
        </Section>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.background.card }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedText size="lg" weight="bold" style={styles.modalTitle}>
              {t('language')}
            </ThemedText>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  { backgroundColor: theme.gray[50] },
                  language === lang.code && { backgroundColor: theme.primary[100] },
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <View style={styles.languageOptionContent}>
                  <ThemedText
                    weight={language === lang.code ? 'semibold' : 'normal'}
                    style={language === lang.code && { color: theme.primary[600] }}
                  >
                    {lang.nativeName}
                  </ThemedText>
                  <ThemedText variant="tertiary" size="sm">
                    {lang.name}
                  </ThemedText>
                </View>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={theme.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Loading Modal */}
      <Modal
        visible={isLoggingOut}
        transparent
        animationType="fade"
      >
        <View style={styles.logoutModalOverlay}>
          <View style={[styles.logoutModalContent, { backgroundColor: theme.background.card }]}>
            <ActivityIndicator size="large" color={theme.primary[500]} />
            <ThemedText variant="secondary" size="base" weight="medium" style={styles.logoutModalText}>
              {t('loggingOut')}
            </ThemedText>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 22,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  group: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    marginBottom: 8,
  },
  languageOption: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  languageOptionContent: {
    flex: 1,
    gap: 4,
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    gap: 16,
  },
  logoutModalText: {
    marginTop: 8,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
