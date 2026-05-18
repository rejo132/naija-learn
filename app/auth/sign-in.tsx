/**
 * Sign in screen.
 * Parents enter email and password to access their account.
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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useAuthStore();

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

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) return;
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch {
      // error is set in the store — stays on this screen
    }
  }

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Sign in to continue learning">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%' }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {error && (
              <View style={authFormStyles.errorBox}>
                <Text style={authFormStyles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Text style={authFormStyles.errorDismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

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
              placeholder="Your password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              editable={!isLoading}
            />

            <AuthGradientButton
              label="Sign In"
              loading={isLoading}
              disabled={!email.trim() || !password.trim()}
              onPress={handleSignIn}
            />

            <TouchableOpacity
              style={authFormStyles.link}
              onPress={() => router.push('/auth/sign-up')}
            >
              <Text style={authFormStyles.linkText}>
                No account yet?{' '}
                <Text style={authFormStyles.linkBold}>Sign up free</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
