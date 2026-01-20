/**
 * Share Experience Page
 * Allows users to share their experiences with stores/products
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Share } from 'react-native';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E5E7EB',
};

export default function SharePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const handleAddImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photos to add images');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error: any) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleShare = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      Alert.alert('Required', 'Please add a caption or at least one image');
      return;
    }

    setIsSharing(true);
    try {
      const shareText = `Check out my experience!${rating > 0 ? `\nRating: ${rating}/5` : ''}\n\n${caption || 'Great experience!'}`;
      
      if (Platform.OS === 'web') {
        // On web, use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: 'My Experience',
            text: shareText,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareText);
          Alert.alert('Copied!', 'Content copied to clipboard');
        }
      } else {
        // On native platforms, use React Native Share API
        const result = await Share.share({
          message: shareText,
          title: 'My Experience',
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Your experience has been shared!');
        }
      }
      
      // Navigate back after successful share
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.error('Error sharing:', error);
      // User cancelled or error occurred - don't show error for cancellation
      if (error.message !== 'User did not share' && !error.message.includes('cancel')) {
        Alert.alert('Error', 'Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Experience</Text>
        <TouchableOpacity 
          onPress={handleShare} 
          style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.shareButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rewards Banner */}
        <View style={styles.rewardsBanner}>
          <LinearGradient
            colors={['rgba(0, 192, 106, 0.15)', 'rgba(251, 191, 36, 0.15)']}
            style={styles.rewardsGradient}
          >
            <Ionicons name="gift" size={24} color={COLORS.primaryGold} />
            <View style={styles.rewardsText}>
              <Text style={styles.rewardsTitle}>Earn 50 ReZ Coins!</Text>
              <Text style={styles.rewardsSubtitle}>Share your experience and get rewarded</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={COLORS.primaryGold}
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write a caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Share your thoughts about this experience..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            value={caption}
            onChangeText={setCaption}
            textAlignVertical="top"
          />
        </View>

        {/* Add Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos</Text>
          <View style={styles.photosGrid}>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddImage}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: image }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share to</Text>
          <View style={styles.shareOptions}>
            {[
              { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
              { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
              { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
              { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
            ].map((platform) => (
              <TouchableOpacity key={platform.id} style={styles.shareOption}>
                <View style={[styles.shareOptionIcon, { backgroundColor: platform.color + '20' }]}>
                  <Ionicons name={platform.icon as any} size={24} color={platform.color} />
                </View>
                <Text style={styles.shareOptionText}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for a great post</Text>
          <View style={styles.tipsList}>
            {[
              'Add clear, well-lit photos',
              'Mention what you loved',
              'Be honest and helpful',
              'Tag the store for visibility',
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryGreen} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  shareButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  rewardsBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rewardsText: {
    flex: 1,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  star: {
    marginHorizontal: 4,
  },
  captionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareOption: {
    alignItems: 'center',
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tipsSection: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
