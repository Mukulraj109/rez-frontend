// Upload Post/Content Page
// Create UGC content

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

type ContentType = 'post' | 'reel' | 'story';

interface TaggedProduct {
  id: string;
  name: string;
  price: string;
}

interface TaggedStore {
  id: string;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>('post');
  const [media, setMedia] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [taggedProducts, setTaggedProducts] = useState<TaggedProduct[]>([]);
  const [taggedStores, setTaggedStores] = useState<TaggedStore[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: contentType === 'reel'
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: contentType === 'post',
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map(a => a.uri);
      setMedia(prev => [...prev, ...newMedia].slice(0, contentType === 'reel' ? 1 : 10));
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = () => {
    // Mock adding a product
    const mockProduct: TaggedProduct = {
      id: `p${taggedProducts.length + 1}`,
      name: 'Sample Product',
      price: '₹999',
    };
    setTaggedProducts([...taggedProducts, mockProduct]);
  };

  const handleAddStore = () => {
    // Mock adding a store
    const mockStore: TaggedStore = {
      id: `s${taggedStores.length + 1}`,
      name: 'Sample Store',
    };
    setTaggedStores([...taggedStores, mockStore]);
  };

  const handlePost = async () => {
    if (media.length === 0) {
      alert('Please add at least one photo or video');
      return;
    }

    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Create</ThemedText>
          <TouchableOpacity
            style={[styles.postButton, media.length === 0 && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={media.length === 0 || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <ThemedText style={styles.postButtonText}>Post</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Type Selector */}
        <View style={styles.typeSelector}>
          {(['post', 'reel', 'story'] as ContentType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                contentType === type && styles.typeButtonActive,
              ]}
              onPress={() => {
                setContentType(type);
                setMedia([]);
              }}
            >
              <Ionicons
                name={
                  type === 'post' ? 'images' :
                  type === 'reel' ? 'videocam' : 'timer'
                }
                size={20}
                color={contentType === type ? Colors.primary[600] : Colors.text.tertiary}
              />
              <ThemedText style={[
                styles.typeText,
                contentType === type && styles.typeTextActive,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Media Upload Area */}
        <View style={styles.mediaSection}>
          {media.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.mediaGrid}>
                {media.map((uri, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image source={{ uri }} style={styles.mediaImage} />
                    <TouchableOpacity
                      style={styles.removeMedia}
                      onPress={() => handleRemoveMedia(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {((contentType === 'post' && media.length < 10) ||
                  (contentType !== 'post' && media.length === 0)) && (
                  <TouchableOpacity style={styles.addMediaButton} onPress={handlePickMedia}>
                    <Ionicons name="add" size={32} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickMedia}>
              <Ionicons
                name={contentType === 'reel' ? 'videocam-outline' : 'camera-outline'}
                size={48}
                color={Colors.text.tertiary}
              />
              <ThemedText style={styles.uploadText}>
                {contentType === 'reel'
                  ? 'Add a video (up to 60 seconds)'
                  : contentType === 'story'
                  ? 'Add a photo or video'
                  : 'Add photos or videos (up to 10)'}
              </ThemedText>
              <ThemedText style={styles.uploadHint}>Tap to select from gallery</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>Caption</ThemedText>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={2200}
          />
          <ThemedText style={styles.charCount}>{caption.length}/2200</ThemedText>
        </View>

        {/* Tag Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionLabel}>Tag Products</ThemedText>
            <TouchableOpacity onPress={handleAddProduct}>
              <Ionicons name="add-circle" size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
          {taggedProducts.length > 0 ? (
            <View style={styles.tagsContainer}>
              {taggedProducts.map(product => (
                <View key={product.id} style={styles.tagChip}>
                  <Ionicons name="pricetag" size={14} color={Colors.primary[600]} />
                  <ThemedText style={styles.tagText}>{product.name}</ThemedText>
                  <ThemedText style={styles.tagPrice}>{product.price}</ThemedText>
                  <TouchableOpacity
                    onPress={() => setTaggedProducts(prev => prev.filter(p => p.id !== product.id))}
                  >
                    <Ionicons name="close" size={16} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={styles.emptyTagText}>
              Tag products to help your followers shop
            </ThemedText>
          )}
        </View>

        {/* Tag Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionLabel}>Tag Stores</ThemedText>
            <TouchableOpacity onPress={handleAddStore}>
              <Ionicons name="add-circle" size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
          {taggedStores.length > 0 ? (
            <View style={styles.tagsContainer}>
              {taggedStores.map(store => (
                <View key={store.id} style={styles.tagChip}>
                  <Ionicons name="storefront" size={14} color={Colors.primary[600]} />
                  <ThemedText style={styles.tagText}>{store.name}</ThemedText>
                  <TouchableOpacity
                    onPress={() => setTaggedStores(prev => prev.filter(s => s.id !== store.id))}
                  >
                    <Ionicons name="close" size={16} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={styles.emptyTagText}>
              Tag stores to give them credit
            </ThemedText>
          )}
        </View>

        {/* Location */}
        <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="location-outline" size={24} color={Colors.text.secondary} />
            <ThemedText style={styles.optionLabel}>Add Location</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Earn Coins Info */}
        <View style={styles.earnCard}>
          <Ionicons name="diamond" size={24} color={Colors.gold} />
          <View style={styles.earnContent}>
            <ThemedText style={styles.earnTitle}>Earn ReZ Coins</ThemedText>
            <ThemedText style={styles.earnText}>
              Get 10 RC for every post and bonus coins for engagement!
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFF',
  },
  postButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    ...Typography.label,
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    ...Shadows.subtle,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  typeText: {
    ...Typography.label,
    color: Colors.text.tertiary,
  },
  typeTextActive: {
    color: Colors.primary[600],
  },
  mediaSection: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  uploadArea: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray[300],
    ...Shadows.subtle,
  },
  uploadText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  uploadHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mediaItem: {
    width: 150,
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMedia: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
  },
  addMediaButton: {
    width: 150,
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray[300],
  },
  section: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  captionInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primary[600],
  },
  tagPrice: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  emptyTagText: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  earnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.gold + '15',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing['3xl'],
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  earnContent: {
    flex: 1,
  },
  earnTitle: {
    ...Typography.label,
    color: Colors.gold,
  },
  earnText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
});
