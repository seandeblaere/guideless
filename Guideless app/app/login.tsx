import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthActions, useIsLoading, useError } from '@/stores/authStore';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/buttons/Button';
import {
  signInSchema,
  SignInFormData,
} from '@/validation/validationSchemas';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginFormScreen() {
  const router = useRouter();
  const { signIn, sendPasswordReset, clearError } = useAuthActions();
  const isLoading = useIsLoading();
  const error = useError();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (data: SignInFormData) => {
    try {
      clearError();
      await signIn(data);
    } catch (error) {
    }
  };

  const handleForgotPassword = async () => {
    const email = signInForm.getValues('email');
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      await sendPasswordReset(email);
      Alert.alert(
        'Password Reset Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E3D7F7', '#FDD6DF', '#E3D7F7']}
        start={{ x: 0, y: 0.75 }}
        end={{ x: 1, y: 0.1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={[
              { fontFamily: 'PlayfairDisplay-Bold' },
              styles.title,
              { color: '#2E3A59' }
            ]}>Welcome Back</Text>
            <Text style={[
              { fontFamily: 'DMSans-Regular' },
              styles.subtitle,
              { color: '#764D9D' }
            ]}>Sign in to your account</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={[
                  { fontFamily: 'DMSans-Regular' },
                  styles.errorText
                ]}>{error}</Text>
              </View>
            )}

            <FormField
              name="email"
              control={signInForm.control}
              label="Email"
              placeholder="Enter your email"
              error={signInForm.formState.errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />

            <FormField
              name="password"
              control={signInForm.control}
              label="Password"
              placeholder="Enter your password"
              error={signInForm.formState.errors.password?.message}
              secureTextEntry
              textContentType="password"
            />

            <Button
              title="Sign In"
              onPress={signInForm.handleSubmit(handleSignIn)}
              variant="primary"
              backgroundColor="#2E3A59"
              textColor="#FCFCFC"
              style={styles.submitButton}
              loading={isLoading}
            />

            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="secondary"
              backgroundColor="transparent"
              textColor="#2E3A59"
              style={styles.forgotButton}
            />
            <Button
              title="← Back"
              onPress={() => router.push('/auth')}
              variant="secondary"
              backgroundColor="transparent"
              textColor="#2E3A59"
              style={styles.backButton}
            />
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#FCFCFC',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#2E3A59',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotButton: {
    marginBottom: 8,
  },
  toggleButton: {
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
  },
});