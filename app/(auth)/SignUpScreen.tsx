import { AuthInput } from '@/components/AuthInput';
import { Logo } from '@/components/Logo';
import { PasswordStrength, passwordScore } from '@/components/PasswordStrength';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { openLegalPage } from '@/lib/legal';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const { theme } = useTheme();
  const { signupUser, isLoading: isAuthLoading } = useAuth();
  const { t, isRtl, language } = useLocalization();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsNoMatch'));
      return;
    }

    if (password.length < 8 || password.length > 72) {
      Alert.alert(t('error'), t('passwordMin'));
      return;
    }

    try {
      await signupUser(fullName, email, password);
      // Navigation will happen automatically via RootNavigator when user is set
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Signup failed';
      Alert.alert(
        t('error'),
        errorMessage
      );
    }
  };

  const handleLogin = () => {
    router.push(ROUTES.LOGIN as never);
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Logo size={56} />
            <ThemedText variant="primary" size="2xl" weight="extrabold" style={styles.title}>
              {t('createAccount')}
            </ThemedText>
            <ThemedText variant="tertiary" size="base" style={styles.subtitle}>
              {t('signUpSubtitle')}
            </ThemedText>
          </View>

          {/* Login / Signup tab switcher */}
          <View style={[styles.tabSwitcher, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100] }]}>
            <TouchableOpacity style={styles.tabPill} onPress={handleLogin}>
              <ThemedText variant="tertiary" size="sm" weight="extrabold">{t('signIn')}</ThemedText>
            </TouchableOpacity>
            <View style={[styles.tabPill, { backgroundColor: theme.primary[500] }]}>
              <ThemedText variant="inverse" size="sm" weight="extrabold">{t('signUp')}</ThemedText>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AuthInput
              label={t('fullNameLabel')}
              icon="person-outline"
              placeholder={t('fullNamePlaceholder')}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
            />

            <AuthInput
              label={t('emailLabel')}
              icon="mail-outline"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label={t('passwordLabel')}
              icon="lock-closed-outline"
              password
              success={passwordScore(formData.password) === 5}
              placeholder={t('createPasswordPlaceholder')}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
            />
            <PasswordStrength password={formData.password} />

            <AuthInput
              label={t('confirmPasswordLabel')}
              icon="lock-closed-outline"
              password
              success={!!formData.confirmPassword && formData.confirmPassword === formData.password}
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
            />

            <ThemedButton
              variant="primary"
              size="lg"
              onPress={handleSignUp}
              loading={isAuthLoading}
              style={styles.signUpButton}
            >
              {t('createAccountCta')}
            </ThemedButton>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
              <ThemedText variant="tertiary" size="sm" style={styles.dividerText}>
                {t('orContinueWith')}
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
            </View>

            {/* Terms */}
            <ThemedText variant="tertiary" size="sm" style={styles.terms}>
              {t('termsPrefix')}{' '}
              <ThemedText
                size="sm"
                weight="medium"
                style={{ color: theme.primary[500] }}
                onPress={() => openLegalPage('terms', language)}
              >
                {t('termsOfService')}
              </ThemedText>{' '}
              {isRtl ? 'و' : 'and'}{' '}
              <ThemedText
                size="sm"
                weight="medium"
                style={{ color: theme.primary[500] }}
                onPress={() => openLegalPage('privacy', language)}
              >
                {t('privacyPolicy')}
              </ThemedText>
            </ThemedText>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <ThemedText variant="tertiary" size="base">
              {t('alreadyHaveAccount')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={handleLogin}>
              <ThemedText size="base" weight="semibold" style={{ color: theme.primary[500] }}>
                {t('signIn')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    padding: 5,
    marginBottom: 24,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 999,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  signUpButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleButtonText: {
},
  terms: {
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
