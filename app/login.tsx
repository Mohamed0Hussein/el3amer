import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useLocalization } from '@/context/LocalizationContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { loginWithGoogle, isGoogleLoading } = useAuth();
  const { t } = useLocalization();

  const handleLogin = async () => {
    if (!email || !password) {
      alert(t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to main app
      navigation.navigate(ROUTES.HOME as never);
    }, 1500);
  };

  const handleSignUp = () => {
    navigation.navigate(ROUTES.SIGN_UP as never);
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="primary" size="3xl" weight="bold" style={styles.title}>
              {t('welcomeBack')}
            </ThemedText>
            <ThemedText variant="tertiary" size="base" style={styles.subtitle}>
              {t('signInToAccount')}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedTextInput
                label={t('emailLabel')}
                icon='mail-outline'
                placeholder={t('emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
                rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.gray[400]} />
                </TouchableOpacity>}
            />
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText variant="success" size="sm" weight="medium">
                {t('forgotPassword')}
              </ThemedText>
            </TouchableOpacity>

            <ThemedButton
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            >
              {t('signIn')}
            </ThemedButton>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
              <ThemedText variant="tertiary" size="sm" style={styles.dividerText}>
                {t('orContinueWith')}
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: theme.background.card }]} 
                onPress={loginWithGoogle}
                disabled={isGoogleLoading}
              >
                <Ionicons name="logo-google" size={20} color={theme.gray[600]} />
                <ThemedText variant="secondary" size="sm" weight="medium" style={styles.socialText}>
                  {t('google')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.background.card }]}>
                <Ionicons name="logo-apple" size={20} color={theme.gray[600]} />
                <ThemedText variant="secondary" size="sm" weight="medium" style={styles.socialText}>
                  {t('apple')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <ThemedText variant="tertiary" size="base">
              {t('dontHaveAccount')}{' '}
            </ThemedText>
            <TouchableOpacity onPress={handleSignUp}>
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  socialText: {
    // Uses themed text props
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});