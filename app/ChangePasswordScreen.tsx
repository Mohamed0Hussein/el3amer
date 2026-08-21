import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedButton } from '@/components/themed-button';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { changePassword } from '@/services/auth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';

export default function ChangePasswordScreen() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const { t } = useLocalization();
  const { user } = useAuth();

  const handleUpdate = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert(t('error'), t('passwordsNoMatch'));
      return;
    }

    if (newPass.length < 6) {
      Alert.alert(t('error'), t('passwordMin'));
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPass, newPass, user?.token || '');
      Alert.alert(t('success'), t('passwordChangedMessage'), [
        { text: t('ok'), onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background.primary} />

      <ScreenHeader title={t('changePassword')} />

      <View style={styles.content}>
        <ThemedTextInput
          label={t('currentPassword')}
          placeholder="••••••••"
          secureTextEntry
          value={currentPass}
          onChangeText={setCurrentPass}
          icon="lock-closed-outline"
        />
        
        <ThemedTextInput
          label={t('newPassword')}
          placeholder="••••••••"
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
          icon="shield-checkmark-outline"
        />

        <ThemedTextInput
          label={t('confirmNewPassword')}
          placeholder="••••••••"
          secureTextEntry
          value={confirmPass}
          onChangeText={setConfirmPass}
          icon="shield-checkmark-outline"
        />

        <ThemedButton
          variant="primary"
          onPress={handleUpdate}
          loading={isLoading}
          style={styles.btn}
          
        >
          {t('save')}
        </ThemedButton>
      </View>
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
  btn: {
    marginTop: 24,
  },
});


export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
