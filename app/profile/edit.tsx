// Profile Edit Page
// Edit user profile information with photo upload

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { PROFILE_COLORS } from '@/types/profile.types';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage } from '@/services/imageUploadService';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, updateUser } = useProfile();
  const { state: authState, actions: authActions } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: '',
    website: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if form has changes
    const originalData = {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: '',
      website: '',
    };
    
    const currentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
    };
    
    setHasChanges(JSON.stringify(originalData) !== JSON.stringify(currentData));
  }, [formData, user]);

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async () => {
    try {
      const token = authState.token;

      if (!token) {
        if (Platform.OS === 'web') {
          alert('Authentication required. Please log in again.');
        } else {
          Alert.alert('Error', 'Authentication required. Please log in again.');
        }
        return;
      }

      // Request permission (not needed on web)
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photo library to upload a profile picture.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);

        const uploadResult = await uploadProfileImage(result.assets[0].uri, token);

        if (uploadResult.success) {
          // Refresh user data to show new avatar
          await authActions.checkAuthStatus();

          if (Platform.OS === 'web') {
            alert('Profile picture updated successfully!');
          } else {
            Alert.alert('Success', 'Profile picture updated successfully!');
          }
        } else {
          if (Platform.OS === 'web') {
            alert(`Upload Failed: ${uploadResult.error || 'Failed to upload image'}`);
          } else {
            Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image');
          }
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error instanceof Error ? error.message : 'An error occurred while uploading the image'}`);
      } else {
        Alert.alert('Error', 'An error occurred while uploading the image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    
    try {
      // Use ProfileContext to update user with real backend API
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
      });
      
      // Automatically navigate back after successful save
      router.back();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFormField = (
    label: string,
    field: keyof ProfileFormData,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'url' = 'default',
    readonly: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        style={[
          styles.textInput, 
          multiline && styles.multilineInput,
          readonly && styles.readonlyInput
        ]}
        value={formData[field] as string}
        onChangeText={readonly ? undefined : (value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType === 'email-address' ? false : true}
        selectionColor={PROFILE_COLORS.primary}
        editable={!readonly}
        selectTextOnFocus={!readonly}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PROFILE_COLORS.primary}
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
          
          <TouchableOpacity
            style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <ThemedText style={[
              styles.saveButtonText,
              (!hasChanges || isSaving) && styles.saveButtonTextDisabled
            ]}>
              {isSaving ? 'Saving...' : 'Save'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Profile Photo Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>
          <View style={styles.photoContainer}>
            <TouchableOpacity
              style={styles.photoWrapper}
              onPress={handleImageUpload}
              disabled={uploadingImage}
              activeOpacity={0.7}
            >
              <View style={styles.photoCircle}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.photoImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <ThemedText style={styles.photoInitials}>
                      {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </ThemedText>
                  </View>
                )}
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="white" />
                  </View>
                )}
              </View>
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.photoTextContainer}>
              <ThemedText style={styles.photoText}>
                {uploadingImage ? 'Uploading...' : 'Tap to change photo'}
              </ThemedText>
              <ThemedText style={styles.photoSubtext}>
                JPG, PNG or GIF. Max size 5MB
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          
          {renderFormField('Full Name', 'name', 'Enter your full name')}
          {renderFormField('Email Address', 'email', 'Enter your email', false, 'email-address', true)}
          {renderFormField('Phone Number', 'phone', 'Enter your phone number', false, 'phone-pad', true)}
          {renderFormField('Bio', 'bio', 'Tell us about yourself...', true)}
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Information</ThemedText>
          
          {renderFormField('Location', 'location', 'Enter your city or location')}
          {renderFormField('Website', 'website', 'https://your-website.com', false, 'url')}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="key-outline" size={24} color={PROFILE_COLORS.primary} />
              <View style={styles.settingItemText}>
                <ThemedText style={styles.settingItemTitle}>Change Password</ThemedText>
                <ThemedText style={styles.settingItemDescription}>
                  Update your account password
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={PROFILE_COLORS.primary} />
              <View style={styles.settingItemText}>
                <ThemedText style={styles.settingItemTitle}>Notification Preferences</ThemedText>
                <ThemedText style={styles.settingItemDescription}>
                  Manage your notification settings
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="shield-outline" size={24} color={PROFILE_COLORS.primary} />
              <View style={styles.settingItemText}>
                <ThemedText style={styles.settingItemTitle}>Privacy Settings</ThemedText>
                <ThemedText style={styles.settingItemDescription}>
                  Control who can see your profile
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
          
          <TouchableOpacity 
            style={styles.dangerItem}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {
                    Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <View style={styles.dangerItemText}>
              <ThemedText style={styles.dangerItemTitle}>Delete Account</ThemedText>
              <ThemedText style={styles.dangerItemDescription}>
                Permanently delete your account and all data
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: PROFILE_COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: PROFILE_COLORS.text,
    backgroundColor: '#F9FAFB',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  readonlyInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_COLORS.border,
    minHeight: 70,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  settingItemDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 20,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    minHeight: 70,
  },
  dangerItemText: {
    marginLeft: 16,
    flex: 1,
  },
  dangerItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  dangerItemDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomSpace: {
    height: 40,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: PROFILE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PROFILE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoTextContainer: {
    flex: 1,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  photoSubtext: {
    fontSize: 13,
    color: PROFILE_COLORS.textSecondary,
  },
});