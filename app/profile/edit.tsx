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
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { HeaderBackButton } from '@/components/navigation/SafeBackButton';
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
  dateOfBirth: string;
  gender: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { goBack } = useSafeNavigation();
  const { user, updateUser } = useProfile();
  const { state: authState, actions: authActions } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  useEffect(() => {
    // Check if form has changes
    const originalData = {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
    };

    const currentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
    };

    const hasChangesDetected = JSON.stringify(originalData) !== JSON.stringify(currentData);

    // Debug logging
    console.log('🔍 [PROFILE_EDIT] Change Detection:');
    console.log('  Original:', originalData);
    console.log('  Current:', currentData);
    console.log('  Has Changes:', hasChangesDetected);

    setHasChanges(hasChangesDetected);
  }, [formData, user]);

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              goBack('/profile' as any);
            }
          },
        ]
      );
    } else {
      goBack('/profile' as any);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
    setShowGenderModal(false);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateString;
    }
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

      // Pick image with EXTREME compression for fastest Cloudinary upload
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Extreme compression (20% quality) for slow Cloudinary connection
        base64: false,
        allowsMultipleSelection: false,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);

        // Try upload with retry logic (Cloudinary is slow from your location)
        let uploadResult;
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          console.log(`🔄 [UPLOAD] Attempt ${retryCount + 1} of ${maxRetries + 1}`);
          uploadResult = await uploadProfileImage(result.assets[0].uri, token);

          if (uploadResult.success) {
            break; // Success, exit retry loop
          }

          retryCount++;
          if (retryCount <= maxRetries) {
            console.log('⏳ [UPLOAD] Retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        if (uploadResult?.success) {
          // Refresh user data to show new avatar
          await authActions.checkAuthStatus();
          
          // Force re-render by updating a state (triggers ProfileContext refresh)
          console.log('✅ [PROFILE] Avatar updated, refreshing UI...');

          if (Platform.OS === 'web') {
            alert('Profile picture updated successfully! The new image should appear immediately.');
          } else {
            Alert.alert('Success', 'Profile picture updated successfully!');
          }
        } else {
          if (Platform.OS === 'web') {
            alert(`Upload Failed after ${retryCount} attempts: ${uploadResult?.error || 'Failed to upload image'}\n\nYour Cloudinary connection is very slow. Try:\n1. Using a different network\n2. Uploading a smaller image\n3. Using a VPN`);
          } else {
            Alert.alert('Upload Failed', `After ${retryCount} attempts: ${uploadResult?.error || 'Failed to upload image'}\n\nCloudinary connection is slow. Try different network or smaller image.`);
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
    console.log('💾 [PROFILE_EDIT] Save button clicked!');
    console.log('📝 [PROFILE_EDIT] Form Data:', formData);

    if (!formData.name.trim()) {
      console.log('❌ [PROFILE_EDIT] Validation failed: Name is required');
      if (Platform.OS === 'web') {
        alert('Name is required');
      } else {
        Alert.alert('Validation Error', 'Name is required');
      }
      return;
    }

    // Email validation - only validate if email is provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.log('❌ [PROFILE_EDIT] Validation failed: Invalid email format');
        if (Platform.OS === 'web') {
          alert('Please enter a valid email address');
        } else {
          Alert.alert('Validation Error', 'Please enter a valid email address');
        }
        return;
      }
    }

    console.log('✅ [PROFILE_EDIT] Validation passed, starting save...');
    setIsSaving(true);

    try {
      // Use ProfileContext to update user with real backend API
      console.log('🔄 [PROFILE_EDIT] Calling updateUser...');
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      console.log('✅ [PROFILE_EDIT] Profile updated successfully!');
      // Automatically navigate back after successful save
      goBack('/profile' as any);
    } catch (error) {
      console.error('❌ [PROFILE_EDIT] Profile update error:', error);
      if (Platform.OS === 'web') {
        alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
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
        accessibilityLabel={`${label} input field`}
        accessibilityHint={readonly ? 'This field cannot be edited' : `Enter your ${label.toLowerCase()}`}
        accessibilityValue={{ text: formData[field] as string }}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to profile page"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
          
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityLabel={isSaving ? 'Saving profile changes' : hasChanges ? 'Save profile changes' : 'Save profile'}
            accessibilityRole="button"
            accessibilityHint="Double tap to save your profile changes"
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
          >
            <ThemedText style={[
              styles.saveButtonText,
              isSaving && styles.saveButtonTextDisabled
            ]}>
              {isSaving ? 'Saving...' : hasChanges ? 'Save' : 'Save'}
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
              accessibilityLabel={uploadingImage ? 'Uploading profile photo' : 'Change profile photo'}
              accessibilityRole="button"
              accessibilityHint="Double tap to select a new profile picture from your gallery"
              accessibilityState={{ disabled: uploadingImage, busy: uploadingImage }}
            >
              <View style={styles.photoCircle}>
                {user?.avatar ? (
                  <Image
                    source={{ 
                      uri: user.avatar,
                      cache: 'reload' // Force reload image (web)
                    }}
                    style={styles.photoImage}
                    key={user.avatar} // Force re-render when URL changes
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
          {renderFormField('Email Address', 'email', 'Enter your email', false, 'email-address', false)}
          {renderFormField('Phone Number', 'phone', 'Enter your phone number', false, 'phone-pad', true)}
          {renderFormField('Date of Birth', 'dateOfBirth', 'YYYY-MM-DD', false, 'default')}
          
          {/* Gender Selection */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel}>Gender</ThemedText>
            <TouchableOpacity
              style={styles.genderSelector}
              onPress={() => setShowGenderModal(true)}
              accessibilityLabel={`Gender: ${formData.gender ? genderOptions.find(opt => opt.value === formData.gender)?.label : 'Not selected'}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to select your gender"
            >
              <ThemedText style={[
                styles.genderText,
                !formData.gender && styles.placeholderText
              ]}>
                {formData.gender ? genderOptions.find(opt => opt.value === formData.gender)?.label : 'Select gender'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
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
          
          <TouchableOpacity
            style={styles.settingItem}
            accessibilityLabel="Change Password"
            accessibilityRole="button"
            accessibilityHint="Double tap to update your account password"
          >
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

          <TouchableOpacity
            style={styles.settingItem}
            accessibilityLabel="Notification Preferences"
            accessibilityRole="button"
            accessibilityHint="Double tap to manage your notification settings"
          >
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

          <TouchableOpacity
            style={styles.settingItem}
            accessibilityLabel="Privacy Settings"
            accessibilityRole="button"
            accessibilityHint="Double tap to control who can see your profile"
          >
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
            accessibilityLabel="Delete Account"
            accessibilityRole="button"
            accessibilityHint="Double tap to permanently delete your account and all data. This action cannot be undone"
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

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Gender</ThemedText>
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                accessibilityLabel="Close gender selection"
                accessibilityRole="button"
                accessibilityHint="Double tap to close the gender selection modal"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === item.value && styles.selectedGenderOption
                  ]}
                  onPress={() => handleGenderSelect(item.value)}
                  accessibilityLabel={`Select ${item.label} as your gender`}
                  accessibilityRole="button"
                  accessibilityHint={`Double tap to set your gender to ${item.label}`}
                  accessibilityState={{ selected: formData.gender === item.value }}
                >
                  <ThemedText style={[
                    styles.genderOptionText,
                    formData.gender === item.value && styles.selectedGenderOptionText
                  ]}>
                    {item.label}
                  </ThemedText>
                  {formData.gender === item.value && (
                    <Ionicons name="checkmark" size={20} color={PROFILE_COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  // Gender selector styles
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  genderText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedGenderOption: {
    backgroundColor: '#F3F4F6',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedGenderOptionText: {
    color: PROFILE_COLORS.primary,
    fontWeight: '600',
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