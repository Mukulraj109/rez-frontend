// UGC Upload Screen
// Create and upload user-generated content (videos/images)

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

interface UploadForm {
  mediaUri: string | null;
  mediaType: 'image' | 'video' | null;
  caption: string;
  tags: string[];
  location: string;
}

export default function UGCUploadScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<UploadForm>({
    mediaUri: null,
    mediaType: null,
    caption: '',
    tags: [],
    location: '',
  });

  const [tagInput, setTagInput] = useState('');

  // Request permissions on mount
  React.useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to upload content.'
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setForm({
          ...form,
          mediaUri: asset.uri,
          mediaType: asset.type === 'video' ? 'video' : 'image',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setForm({
          ...form,
          mediaUri: asset.uri,
          mediaType: 'image',
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!form.mediaUri) {
      Alert.alert('Missing Media', 'Please select an image or video to upload.');
      return;
    }

    if (!form.caption.trim()) {
      Alert.alert('Missing Caption', 'Please add a caption to your post.');
      return;
    }

    try {
      setUploading(true);

      // TODO: Implement actual upload to backend
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Your content has been uploaded successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload content. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    if (form.mediaUri || form.caption) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this upload?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Close"
          accessibilityRole="button"
          accessibilityHint="Closes create post screen"
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>Create Post</ThemedText>

        <TouchableOpacity
          style={[styles.postButton, (!form.mediaUri || !form.caption.trim()) && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={!form.mediaUri || !form.caption.trim() || uploading}
          accessibilityLabel={uploading ? "Posting" : "Post"}
          accessibilityRole="button"
          accessibilityState={{ disabled: !form.mediaUri || !form.caption.trim() || uploading, busy: uploading }}
          accessibilityHint="Posts your content to the platform"
        >
          <ThemedText style={styles.postButtonText}>
            {uploading ? 'Posting...' : 'Post'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Media Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Media</ThemedText>

          {form.mediaUri ? (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: form.mediaUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => setForm({ ...form, mediaUri: null, mediaType: null })}
                accessibilityLabel="Remove media"
                accessibilityRole="button"
                accessibilityHint="Removes selected photo or video"
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handlePickImage}
                accessibilityLabel="Choose from gallery"
                accessibilityRole="button"
                accessibilityHint="Opens gallery to select photo or video"
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.mediaButtonGradient}
                >
                  <Ionicons name="images" size={32} color="white" />
                  <ThemedText style={styles.mediaButtonText}>Gallery</ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handleTakePhoto}
                accessibilityLabel="Take photo"
                accessibilityRole="button"
                accessibilityHint="Opens camera to take a photo"
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.mediaButtonGradient}
                >
                  <Ionicons name="camera" size={32} color="white" />
                  <ThemedText style={styles.mediaButtonText}>Camera</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Caption Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Caption</ThemedText>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            value={form.caption}
            onChangeText={(text) => setForm({ ...form, caption: text })}
            multiline
            maxLength={500}
          />
          <ThemedText style={styles.charCount}>
            {form.caption.length}/500
          </ThemedText>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tags</ThemedText>

          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add tags (e.g., fashion, tech)"
              placeholderTextColor="#9CA3AF"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              accessibilityLabel="Add tag"
              accessibilityRole="button"
              accessibilityHint="Adds entered tag to your post"
            >
              <Ionicons name="add-circle" size={28} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {form.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {form.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    accessibilityLabel={`Remove tag ${tag}`}
                    accessibilityRole="button"
                    accessibilityHint="Removes this tag from your post"
                  >
                    <Ionicons name="close-circle" size={18} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Location (Optional)</ThemedText>
          <TextInput
            style={styles.locationInput}
            placeholder="Add location"
            placeholderTextColor="#9CA3AF"
            value={form.location}
            onChangeText={(text) => setForm({ ...form, location: text })}
          />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatarPlaceholder}>
            <ThemedText style={styles.userAvatarText}>
              {authState.user?.profile?.fullName?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <ThemedText style={styles.userName}>
            {authState.user?.profile?.fullName || 'User'}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
  },
  postButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaButtonGradient: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  mediaButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  addTagButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  tagText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 16,
    gap: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
