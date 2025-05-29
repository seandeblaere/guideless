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
  signUpSchema,
  SignUpFormData,
} from '@/validation/validationSchemas';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterFormScreen() {
  const router = useRouter();
  const { signUp, clearError } = useAuthActions();
  const isLoading = useIsLoading();
  const error = useError();

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      clearError();
      await signUp(data);
      Alert.alert(
        'Account Created!',
        'Please check your email for verification before signing in.',
        [{ 
          text: 'OK', 
          onPress: () => router.push('/login')
        }]
      );
    } catch (error) {
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
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={[
              { fontFamily: 'PlayfairDisplay_700Bold' },
              styles.title,
              { color: '#2E3A59' }
            ]}>Create Account</Text>
            <Text style={[
              { fontFamily: 'DMSans_400Regular' },
              styles.subtitle,
              { color: '#764D9D' }
            ]}>Sign up to get started</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={[
                  { fontFamily: 'DMSans_400Regular' },
                  styles.errorText
                ]}>{error}</Text>
              </View>
            )}

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

            <Button
              title="Create Account"
              onPress={signUpForm.handleSubmit(handleSignUp)}
              variant="primary"
              backgroundColor="#2E3A59"
              textColor="#FCFCFC"
              style={styles.submitButton}
              loading={isLoading}
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
        </SafeAreaView>
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
    shadowColor: '#000',
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
  toggleButton: {
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
  },
});