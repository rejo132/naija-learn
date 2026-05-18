/**
 * Sign up screen.
 * Parents create an account with email and password.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';
import {
  AuthLayout,
  AuthTextInput,
  AuthGradientButton,
  authFormStyles,
} from '@/components/AuthLayout';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const displayError = localError || error;

  function dismissError() {
    setLocalError(null);
    clearError();
  }

  async function handleSignUp() {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError(null);
    clearError();
    try {
      await signUp(email.trim(), password, name.trim(), phone.trim());
    } catch {
      // error is set in the store
    }
  }

  const canSubmit =
    name.trim() &&
    phone.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    !isLoading;

  return (
    <AuthLayout
      title="Create account 🌟"
      subtitle="Join thousands of Nigerian students"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%' }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {displayError && (
              <View style={authFormStyles.errorBox}>
                <Text style={authFormStyles.errorText}>{displayError}</Text>
                <TouchableOpacity onPress={dismissError}>
                  <Text style={authFormStyles.errorDismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={authFormStyles.label}>Full name</Text>
            <AuthTextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />

            <Text style={authFormStyles.label}>Phone number</Text>
            <AuthTextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="080XXXXXXXX"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!isLoading}
            />

            <Text style={authFormStyles.label}>Email</Text>
            <AuthTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="parent@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />

            <Text style={authFormStyles.label}>Password</Text>
            <AuthTextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              editable={!isLoading}
            />

            <Text style={authFormStyles.label}>Confirm password</Text>
            <AuthTextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              editable={!isLoading}
            />

            <AuthGradientButton
              label="Sign Up"
              loading={isLoading}
              disabled={!canSubmit}
              onPress={handleSignUp}
            />

            <TouchableOpacity
              style={authFormStyles.link}
              onPress={() => router.push('/auth/sign-in')}
            >
              <Text style={authFormStyles.linkText}>
                Already have an account?{' '}
                <Text style={authFormStyles.linkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
