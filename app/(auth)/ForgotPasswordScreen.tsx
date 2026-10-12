import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { forgotPassword, resetPassword } from '@/services/auth';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { t, language } = useLocalization();
  const { loginUser } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email.trim(), language);
      if (step === 'code') Alert.alert(t('codeSent'));
      setStep('code');
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert(t('error'), t('enterCode'));
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(t('error'), t('passwordMin'));
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert(t('error'), t('passwordsNoMatch'));
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPass);
      // Signed in straight away; the route guard takes them home.
      await loginUser(email.trim(), newPass);
    } catch (error: any) {
      Alert.alert(t('error'), error?.response?.status === 400 ? t('invalidCode') : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScreenHeader title={t('resetPassword')} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 'email' ? (
            <>
              <ThemedText variant="secondary" style={styles.hint}>{t('resetEmailHint')}</ThemedText>
              <ThemedTextInput
                label={t('emailLabel')}
                placeholder={t('emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                icon="mail-outline"
              />
              <ThemedButton variant="primary" onPress={sendCode} loading={isLoading} style={styles.btn}>
                {t('sendCode')}
              </ThemedButton>
            </>
          ) : (
            <>
              <ThemedText variant="secondary" style={styles.hint}>
                {t('resetCodeHint').replace('{email}', email.trim())}
              </ThemedText>
              <ThemedTextInput
                label={t('codeLabel')}
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                icon="keypad-outline"
              />
              <ThemedTextInput
                label={t('newPassword')}
                placeholder="••••••••"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
                icon="lock-closed-outline"
              />
              <ThemedTextInput
                label={t('confirmNewPassword')}
                placeholder="••••••••"
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
                icon="shield-checkmark-outline"
              />
              <ThemedButton variant="primary" onPress={reset} loading={isLoading} style={styles.btn}>
                {t('resetPassword')}
              </ThemedButton>
              <TouchableOpacity onPress={sendCode} disabled={isLoading} style={styles.resend}>
                <ThemedText size="sm" weight="bold" style={{ color: theme.primary[500] }}>{t('resendCode')}</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  hint: {
    marginBottom: 20,
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
  },
  resend: {
    alignSelf: 'center',
    marginTop: 18,
    padding: 6,
  },
});

export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
