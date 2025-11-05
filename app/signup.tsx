import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-textinput';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
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

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { loginWithGoogle } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to main app
      navigation.navigate(ROUTES.HOME as never);
    }, 1500);
  };

  const handleGoogleSignUp = async () => {
    try{
      setIsGoogleLoading(true);
      const user = await loginWithGoogle()
      console.log(user)
      setIsGoogleLoading(false)
      
    }
    catch(e : any){
      console.error(e)
    }
  };

  const handleLogin = () => {
    navigation.navigate(ROUTES.LOGIN as never);
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
              Create Account
            </ThemedText>
            <ThemedText variant="tertiary" size="base" style={styles.subtitle}>
              Sign up to get started
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedTextInput
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              style={styles.input}
              icon='person-outline'
              placeholderTextColor={theme.gray[400]}
            />

            <ThemedTextInput
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.input}
              icon='mail-outline'
              placeholderTextColor={theme.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedTextInput
              placeholder="Create a password"
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
              placeholder="Confirm your password"
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
              loading={isLoading}
              style={styles.signUpButton}
            >
              Create Account
            </ThemedButton>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
              <ThemedText variant="tertiary" size="sm" style={styles.dividerText}>
                Or continue with
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.gray[200] }]} />
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: theme.background.card }]}
              onPress={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ThemedText variant="secondary" size="base" weight="medium">
                  Signing up...
                </ThemedText>
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={theme.primary[500]} />
                  <ThemedText variant="secondary" size="base" weight="medium" style={styles.googleButtonText}>
                    Sign up with Google
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <ThemedText variant="tertiary" size="sm" style={styles.terms}>
              By creating an account, you agree to our{' '}
              <ThemedText variant="success" size="sm" weight="medium">
                Terms of Service
              </ThemedText>{' '}
              and{' '}
              <ThemedText variant="success" size="sm" weight="medium">
                Privacy Policy
              </ThemedText>
            </ThemedText>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <ThemedText variant="tertiary" size="base">
              Already have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={handleLogin}>
              <ThemedText variant="success" size="base" weight="semibold">
                Sign In
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