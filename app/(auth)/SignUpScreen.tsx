import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { theme } = useTheme();
    const { signupUser, isLoading: isAuthLoading } = useAuth()
  const { t } = useLocalization();

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

    if (password.length < 6) {
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
            <ThemedText variant="primary" size="3xl" weight="bold" style={styles.title}>
              {t('createAccount')}
            </ThemedText>
            <ThemedText variant="tertiary" size="base" style={styles.subtitle}>
              {t('signUpSubtitle')}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedTextInput
              placeholder={t('fullNamePlaceholder')}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              style={styles.input}
              icon='person-outline'
              placeholderTextColor={theme.gray[400]}
            />

            <ThemedTextInput
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.input}
              icon='mail-outline'
              placeholderTextColor={theme.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedTextInput
              placeholder={t('createPasswordPlaceholder')}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              style={styles.input}
              icon='lock-closed-outline'
              placeholderTextColor={theme.gray[400]}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={theme.gray[400]} 
                  />
                </TouchableOpacity>
              }
            />

            <ThemedTextInput
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              icon='lock-closed-outline'
              placeholderTextColor={theme.gray[400]}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={theme.gray[400]} 
                  />
                </TouchableOpacity>
              }
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
                Or continue with
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
            </View>

            {/* Terms */}
            <ThemedText variant="tertiary" size="sm" style={styles.terms}>
              {t('termsPrefix')}{' '}
              <ThemedText variant="success" size="sm" weight="medium">
                {t('termsOfService')}
              </ThemedText>{' '}
              و{' '}
              <ThemedText variant="success" size="sm" weight="medium">
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
              <ThemedText variant="success" size="base" weight="semibold">
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