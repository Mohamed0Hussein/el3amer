import { Logo } from '@/components/Logo';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { forgotPassword } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { theme } = useTheme();
    const { loginUser, loginUserWithGoogle, isLoading, isGoogleLoading } = useAuth();
  const { t } = useLocalization();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert(t('error'), t('passwordMin'));
      return;
    }

    try {
      await loginUser(email, password);
      // Navigation will happen automatically via RootNavigator when user is set
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        t('loginFailed'),
        error?.message || t('loginError')
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginUserWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }

    try {
      await forgotPassword(email);
      Alert.alert(t('success'), 'Password reset email sent!');
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to send reset email');
    }
  };

  const handleSignUp = () => {
    router.push(ROUTES.SIGN_UP as never);
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Logo size={56} />
            <ThemedText variant="primary" size="2xl" weight="extrabold" style={styles.title}>
              {t('welcomeBack')}
            </ThemedText>
            <ThemedText variant="tertiary" size="base" style={styles.subtitle}>
              {t('signInToAccount')}
            </ThemedText>
          </View>

          {/* Login / Signup tab switcher */}
          <View style={[styles.tabSwitcher, { backgroundColor: theme.background.secondary, borderColor: theme.gray[100] }]}>
            <View style={[styles.tabPill, { backgroundColor: theme.primary[500] }]}>
              <ThemedText variant="inverse" size="sm" weight="extrabold">{t('signIn')}</ThemedText>
            </View>
            <TouchableOpacity style={styles.tabPill} onPress={handleSignUp} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ThemedText variant="tertiary" size="sm" weight="extrabold">{t('signUp')}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <ThemedTextInput
                label={t('emailLabel')}
                icon='mail-outline'
                placeholder={t('emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                placeholderTextColor={theme.gray[400]}
              />

              <ThemedTextInput
                label={t('passwordLabel')}
                icon='lock-closed-outline'
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholderTextColor={theme.gray[400]}
                rightIcon={
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.eyeIcon}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={22} 
                      color={theme.gray[500]} 
                    />
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ThemedText variant="success" size="sm" weight="medium">
                  {t('forgotPassword')}
                </ThemedText>
              </TouchableOpacity>

              <ThemedButton
                variant="primary"
                size="lg"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              >
                {t('signIn')}
              </ThemedButton>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
                <ThemedText variant="tertiary" size="sm" style={styles.dividerText}>
                  {t('orContinueWith')}
                </ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity 
                style={[
                  styles.googleButton, 
                  { 
                    backgroundColor: theme.background.card,
                    borderColor: theme.gray[200],
                  },
                  isGoogleLoading && styles.googleButtonDisabled
                ]} 
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                activeOpacity={0.7}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color={theme.primary[500]} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={22} color={theme.gray[700]} />
                    <ThemedText variant="secondary" size="base" weight="semibold" style={styles.googleButtonText}>
                      {t('signInWithGoogle')}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <ThemedText variant="tertiary" size="base">
              {t('dontHaveAccount')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={handleSignUp} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ThemedText variant="success" size="base" weight="semibold">
                {t('signUp')}
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
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
    marginTop: 4,
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
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
    marginRight: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  loginButton: {
    marginBottom: 12,
    borderRadius: 999,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  dividerContainer: {
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
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
});
export { RouteErrorFallback as ErrorBoundary } from '@/components/RouteErrorFallback';
