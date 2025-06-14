import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthActions, useUser, useIsLoading, useError } from '@/stores/authStore';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/buttons/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  profileUpdateSchema,
  ProfileUpdateFormData,
} from '@/validation/validationSchemas';

const { height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 100;

export default function ProfileScreen() {
  const user = useUser();
  const { updateUserProfile, resendEmailVerification, clearError, logout } = useAuthActions();
  const isLoading = useIsLoading();
  const error = useError();
  const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');

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

  const getInitials = () => {
    if (!user?.displayName) return '?';
    return user.displayName.charAt(0).toUpperCase();
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#E3D7F7', '#FDD6DF']}
            start={{ x: 0, y: 0.75 }}
            end={{ x: 1, y: 0.1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.profileImageContainer}>
                <LinearGradient
                  colors={['#A988CD', '#ED97AB']}
                  style={styles.profileImage}
                >
                  <Text style={styles.initials}>{getInitials()}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                
                {user?.emailVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.verifyButton} onPress={handleResendVerification}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.verifyText}>Verify Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeSection === 'profile' && styles.activeTab]} 
                onPress={() => setActiveSection('profile')}
              >
                <Text style={[styles.tabText, activeSection === 'profile' && styles.activeTabText]}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeSection === 'settings' && styles.activeTab]} 
                onPress={() => setActiveSection('settings')}
              >
                <Text style={[styles.tabText, activeSection === 'settings' && styles.activeTabText]}>Settings</Text>
              </TouchableOpacity>
            </View>

            {activeSection === 'profile' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <FormField
                  name="firstName"
                  control={form.control}
                  label="Display Name"
                  placeholder="Enter your name"
                  error={form.formState.errors.firstName?.message}
                  autoCapitalize="words"
                />

                <Button
                  title="Update Profile"
                  onPress={form.handleSubmit(handleUpdateProfile)}
                  loading={isLoading}
                  variant="primary"
                  backgroundColor="#2E3A59"
                  textColor="#FCFCFC"
                  style={styles.updateButton}
                />
                
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Feather name="info" size={20} color="#2F7EA1" />
                    <Text style={styles.infoCardTitle}>Account Details</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>
                      {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <Feather name="bell" size={20} color="#2F7EA1" />
                    <Text style={styles.settingsItemText}>Notifications</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#A0A3AD" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <Feather name="lock" size={20} color="#2F7EA1" />
                    <Text style={styles.settingsItemText}>Privacy</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#A0A3AD" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <Feather name="help-circle" size={20} color="#2F7EA1" />
                    <Text style={styles.settingsItemText}>Help & Support</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#A0A3AD" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <Feather name="info" size={20} color="#2F7EA1" />
                    <Text style={styles.settingsItemText}>About</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#A0A3AD" />
                </TouchableOpacity>
                
                <View style={styles.logoutContainer}>
                  <TouchableOpacity
                    style={styles.logoutButtonWrapper}
                    onPress={logout}
                    disabled={isLoading}
                  >
                    <Feather name="log-out" size={18} color="#EF4444" style={styles.logoutIcon} />
                    {isLoading ? (
                      <ActivityIndicator color="#2E3A59" size="small" />
                    ) : (
                      <Text style={styles.logoutButtonText}>Sign Out</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    height: height - TAB_BAR_HEIGHT,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  initials: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32,
    color: '#FCFCFC',
  },
  profileInfo: {
    flexDirection: 'column',
  },
  profileName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#2E3A59',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#5A6176',
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#A988CD',
  },
  tabText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#A0A3AD',
  },
  activeTabText: {
    color: '#2E3A59',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: '#2E3A59',
    marginBottom: 16,
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
    fontFamily: 'DMSans-Regular',
    color: '#DC2626',
    fontSize: 14,
  },
  updateButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  logoutContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FCFCFC',
    width: '80%',
  },
  logoutButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#2E3A59',
    marginLeft: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 70,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#2E3A59',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#2E3A59',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#2E3A59',
    marginLeft: 12,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
});