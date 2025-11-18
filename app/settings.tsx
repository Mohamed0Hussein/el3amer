import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { SupportedLanguage } from '@/localization/translations';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { logoutUser, user, isLoggingOut } = useAuth();
  const { language, setLanguage, t } = useLocalization();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const navigation = useNavigation();

  const languages: { code: SupportedLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  const handleLanguageSelect = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <ThemedView variant="primary" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ThemedText size="2xl" weight="bold" style={{ marginBottom: 16 }}>
          {t('settings')}
        </ThemedText>

        <ThemedView variant="card" style={styles.card}>
          <ThemedText size="lg" weight="semibold" style={styles.sectionTitle}>{t('account')}</ThemedText>
          <ThemedText variant="tertiary" style={{ marginBottom: 12 }}>{user?.email}</ThemedText>
          <TouchableOpacity style={[styles.row, { backgroundColor: theme.gray[50] }]}> 
            <ThemedText>{t('editProfile')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.gray[50], marginTop: 10 }]} 
            onPress={async () => {
              await logoutUser();
              navigation.navigate(ROUTES.LOGIN as never);
            }}
            disabled={isLoggingOut}
          >
            <ThemedText variant="secondary" weight="semibold" style={{ color: theme.status.error }}>{t('logout')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView variant="card" style={styles.card}>
          <ThemedText size="lg" weight="semibold" style={styles.sectionTitle}>{t('preferences')}</ThemedText>
          <ThemedView variant="default" style={[styles.row, { backgroundColor: theme.gray[50] }]}
          >
            <ThemedText>{t('notifications')}</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.gray[300], true: theme.primary[300] }}
              thumbColor={notificationsEnabled ? theme.primary[500] : theme.gray[100]}
            />
          </ThemedView>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.gray[50], marginTop: 10 }]}
            onPress={() => setLanguageModalVisible(true)}
          >
            <ThemedText>{t('language')}</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemedText variant="tertiary">{currentLanguage?.nativeName}</ThemedText>
              <Ionicons name="chevron-down" size={20} color={theme.gray[400]} />
            </View>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView variant="card" style={styles.card}>
          <ThemedText size="lg" weight="semibold" style={styles.sectionTitle}>{t('about')}</ThemedText>
          <ThemedView variant="default" style={[styles.row, { backgroundColor: theme.gray[50] }]}>
            <ThemedText>{t('version')}</ThemedText>
            <ThemedText variant="tertiary">1.0.0</ThemedText>
          </ThemedView>
        </ThemedView>
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
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  row: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 8,
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
