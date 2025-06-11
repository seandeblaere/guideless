import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthActions, useUser, useIsLoading, useError } from '@/stores/authStore';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/buttons/Button';
import {
  profileUpdateSchema,
  ProfileUpdateFormData,
} from '@/validation/validationSchemas';

export default function ProfileScreen() {
  const user = useUser();
  const { updateUserProfile, resendEmailVerification, clearError, logout } = useAuthActions();
  const isLoading = useIsLoading();
  const error = useError();

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.displayName || '',
    },
  });

  const handleUpdateProfile = async (data: ProfileUpdateFormData) => {
    try {
      clearError();
      await updateUserProfile(data.firstName);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification();
      Alert.alert(
        'Verification Email Sent',
        'Please check your email for the verification link.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email Verified:</Text>
            <Text style={[styles.value, { color: user?.emailVerified ? '#10B981' : '#EF4444' }]}>
              {user?.emailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {!user?.emailVerified && (
            <Button
              title="Resend Verification Email"
              onPress={handleResendVerification}
              variant="secondary"
              style={styles.verificationButton}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Update Profile</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FormField
            name="firstName"
            control={form.control}
            label="First Name"
            placeholder="Enter your first name"
            error={form.formState.errors.firstName?.message}
            autoCapitalize="words"
          />

          <Button
            title="Update Profile"
            onPress={form.handleSubmit(handleUpdateProfile)}
            loading={isLoading}
            style={styles.updateButton}
          />
        </View>
        <Button
            title="Logout"
            onPress={logout}
            loading={isLoading}
            style={styles.updateButton}
          />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  verificationButton: {
    marginTop: 16,
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
  updateButton: {
    marginTop: 8,
  },
});