import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthActions, useIsLoading, useError } from '@/stores/authStore';
import { FormField } from '@/components/form/FormField';
import { LoadingButton } from '@/components/buttons/LoadingButton';
import {
  signInSchema,
  signUpSchema,
  SignInFormData,
  SignUpFormData,
} from '@/validation/validationSchemas';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp, sendPasswordReset, clearError } = useAuthActions();
  const isLoading = useIsLoading();
  const error = useError();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignIn = async (data: SignInFormData) => {
    try {
      clearError();
      await signIn(data);
    } catch (error) {
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      clearError();
      await signUp(data);
      Alert.alert(
        'Account Created!',
        'Please check your email for verification before signing in.',
        [{ text: 'OK' }]
      );
      setIsSignUp(false);
      signInForm.setValue('email', data.email);
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
        [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    signInForm.reset();
    signUpForm.reset();
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E3D7F7', '#FDD6DF', '#E3D7F7']}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={{ flex: 1 }}
      >
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> 
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp 
              ? 'Sign up to get started' 
              : 'Sign in to your account'
            }
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isSignUp ? (
            <View>
              <FormField
                name="firstName"
                control={signUpForm.control}
                label="First Name"
                placeholder="Enter your first name"
                error={signUpForm.formState.errors.firstName?.message}
                autoCapitalize="words"
                textContentType="givenName"
              />

              <FormField
                name="email"
                control={signUpForm.control}
                label="Email"
                placeholder="Enter your email"
                error={signUpForm.formState.errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              <FormField
                name="password"
                control={signUpForm.control}
                label="Password"
                placeholder="Create a password"
                error={signUpForm.formState.errors.password?.message}
                secureTextEntry
                textContentType="newPassword"
              />

              <FormField
                name="confirmPassword"
                control={signUpForm.control}
                label="Confirm Password"
                placeholder="Confirm your password"
                error={signUpForm.formState.errors.confirmPassword?.message}
                secureTextEntry
                textContentType="newPassword"
              />

              <LoadingButton
                title="Create Account"
                onPress={signUpForm.handleSubmit(handleSignUp)}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>
          ) : (
            <View>
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

              <LoadingButton
                title="Sign In"
                onPress={signInForm.handleSubmit(handleSignIn)}
                loading={isLoading}
                style={styles.submitButton}
              />

              <LoadingButton
                title="Forgot Password?"
                onPress={handleForgotPassword}
                variant="secondary"
                style={styles.forgotButton}
              />
            </View>
          )}

          <LoadingButton
            title={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            onPress={toggleMode}
            variant="secondary"
            style={styles.toggleButton}
          />
        </View>
      </ScrollView> */}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 0,
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
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
    marginBottom: 16,
  },
  toggleButton: {
    marginTop: 8,
  },
});