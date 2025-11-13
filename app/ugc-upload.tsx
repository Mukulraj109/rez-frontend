// UGC Video Upload Screen
// Main screen for uploading user-generated content videos

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import PurpleGradientBg from '@/components/onboarding/PurpleGradientBg';
import SourcePicker from '@/components/ugc/SourcePicker';
import UploadProgress from '@/components/ugc/UploadProgress';
import ProductSelector from '@/components/ugc/ProductSelector';
import ProductChip from '@/components/ugc/ProductChip';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { PRODUCT_TAGGING_RULES } from '@/types/ugc-upload.types';

const { width: screenWidth } = Dimensions.get('window');

export default function UGCUploadScreen() {
  const router = useRouter();
  const {
    state,
    permissions,
    selectFromCamera,
    selectFromGallery,
    setUrlVideo,
    updateTitle,
    updateDescription,
    updateHashtags,
    clearVideo,
    uploadToCloudinary,
    openProductSelector,
    closeProductSelector,
    addProducts,
    removeProduct,
    clearProducts,
    canUpload,
    isUploading,
  } = useVideoUpload();

  const [hashtagInput, setHashtagInput] = useState('');

  const handleBack = () => {
    if (isUploading) {
      Alert.alert(
        'Upload in Progress',
        'Are you sure you want to cancel the upload?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              clearVideo();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleClearVideo = () => {
    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove this video and start over?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: clearVideo,
        },
      ]
    );
  };

  const handleHashtagChange = (text: string) => {
    setHashtagInput(text);
    updateHashtags(text);
  };

  const handleUpload = async () => {
    if (!canUpload) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const success = await uploadToCloudinary();

    if (success) {
      Alert.alert(
        'Success',
        'Your video has been uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <PurpleGradientBg>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={isUploading}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityState={{ disabled: isUploading }}
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Video</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!state.video ? (
              /* Source Selection */
              <SourcePicker
                onSelectCamera={selectFromCamera}
                onSelectGallery={selectFromGallery}
                onSelectUrl={setUrlVideo}
                disabled={isUploading}
              />
            ) : (
              /* Video Selected - Show Form */
              <View style={styles.formContainer}>
                {/* Video Preview */}
                <View style={styles.videoPreviewContainer}>
                  <Text style={styles.sectionTitle}>Video Preview</Text>

                  {state.source !== 'url' ? (
                    <View style={styles.videoWrapper}>
                      <Video
                        source={{ uri: state.video.uri }}
                        style={styles.videoPreview}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isLooping
                        useNativeControls
                      />
                      <TouchableOpacity
                        style={styles.removeVideoButton}
                        onPress={handleClearVideo}
                        disabled={isUploading}
                        accessibilityLabel="Remove video"
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isUploading }}
                        accessibilityHint="Removes selected video and allows you to choose another"
                      >
                        <Ionicons name="close-circle" size={28} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.urlVideoInfo}>
                      <Ionicons name="link" size={32} color="#8B5CF6" />
                      <Text style={styles.urlVideoText} numberOfLines={2}>
                        {state.video.uri}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeUrlButton}
                        onPress={handleClearVideo}
                        disabled={isUploading}
                      >
                        <Text style={styles.removeUrlText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Video Info */}
                  <View style={styles.videoInfo}>
                    {state.video.duration > 0 && (
                      <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                          {formatDuration(state.video.duration)}
                        </Text>
                      </View>
                    )}
                    {state.video.fileSize > 0 && (
                      <View style={styles.infoItem}>
                        <Ionicons name="document-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                          {formatFileSize(state.video.fileSize)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Product Tagging Section */}
                <View style={styles.productTaggingContainer}>
                  <View style={styles.productTaggingHeader}>
                    <Text style={styles.productTaggingTitle}>
                      Tag Products (Optional)
                    </Text>
                    <Text style={styles.productCount}>
                      {state.selectedProducts.length}/{PRODUCT_TAGGING_RULES.maxProducts}
                    </Text>
                  </View>

                  {/* Tag Products Button */}
                  <TouchableOpacity
                    style={[
                      styles.tagProductsButton,
                      isUploading && styles.tagProductsButtonDisabled,
                    ]}
                    onPress={openProductSelector}
                    disabled={
                      isUploading ||
                      state.selectedProducts.length >= PRODUCT_TAGGING_RULES.maxProducts
                    }
                    accessibilityLabel={state.selectedProducts.length > 0 ? 'Add more products' : 'Tag products'}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: isUploading || state.selectedProducts.length >= PRODUCT_TAGGING_RULES.maxProducts
                    }}
                    accessibilityHint={`Tag products in your video. ${state.selectedProducts.length} of ${PRODUCT_TAGGING_RULES.maxProducts} products tagged`}
                  >
                    <Ionicons name="pricetag-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.tagProductsButtonText}>
                      {state.selectedProducts.length > 0 ? 'Add More Products' : 'Tag Products'}
                    </Text>
                  </TouchableOpacity>

                  {/* Selected Products Display */}
                  {state.selectedProducts.length > 0 && (
                    <View style={styles.selectedProductsContainer}>
                      <Text style={styles.selectedProductsTitle}>
                        Tagged Products ({state.selectedProducts.length})
                      </Text>
                      <View style={styles.productChipsContainer}>
                        {state.selectedProducts.map((product) => (
                          <ProductChip
                            key={product._id}
                            product={product}
                            onRemove={() => removeProduct(product._id)}
                            disabled={isUploading}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Upload Progress */}
                {isUploading && (
                  <View style={styles.uploadProgressContainer}>
                    <UploadProgress
                      status={state.status}
                      progress={state.progress}
                      showCancel={false}
                    />
                  </View>
                )}

                {/* Form Fields */}
                <View style={styles.formFields}>
                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Title <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        state.validationErrors.some(e => e.field === 'title') && styles.inputError,
                      ]}
                      placeholder="Give your video a catchy title"
                      placeholderTextColor="#9CA3AF"
                      value={state.title}
                      onChangeText={updateTitle}
                      maxLength={100}
                      editable={!isUploading}
                    />
                    <Text style={styles.charCount}>{state.title.length}/100</Text>
                  </View>

                  {/* Description */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        state.validationErrors.some(e => e.field === 'description') &&
                          styles.inputError,
                      ]}
                      placeholder="Tell us more about your video..."
                      placeholderTextColor="#9CA3AF"
                      value={state.description}
                      onChangeText={updateDescription}
                      maxLength={500}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      editable={!isUploading}
                    />
                    <Text style={styles.charCount}>{state.description.length}/500</Text>
                  </View>

                  {/* Hashtags */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Hashtags{' '}
                      <Text style={styles.helperText}>(comma-separated, max 10)</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        state.validationErrors.some(e => e.field === 'hashtags') &&
                          styles.inputError,
                      ]}
                      placeholder="fashion, style, trending"
                      placeholderTextColor="#9CA3AF"
                      value={hashtagInput}
                      onChangeText={handleHashtagChange}
                      editable={!isUploading}
                    />
                    {state.hashtags.length > 0 && (
                      <View style={styles.hashtagPreview}>
                        {state.hashtags.map((tag, index) => (
                          <View key={index} style={styles.hashtagChip}>
                            <Text style={styles.hashtagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Error Messages */}
                  {state.error && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>{state.error}</Text>
                    </View>
                  )}
                </View>

                {/* Upload Button */}
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    (!canUpload || isUploading) && styles.uploadButtonDisabled,
                  ]}
                  onPress={handleUpload}
                  disabled={!canUpload || isUploading}
                  activeOpacity={0.8}
                  accessibilityLabel={isUploading ? "Uploading video" : "Upload video"}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canUpload || isUploading, busy: isUploading }}
                  accessibilityHint="Uploads your video to the platform"
                >
                  {isUploading ? (
                    <>
                      <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Upload Video</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Product Selector Modal */}
        <ProductSelector
          visible={state.productSelectorVisible}
          onClose={closeProductSelector}
          selectedProducts={state.selectedProducts}
          onProductsChange={addProducts}
          maxProducts={PRODUCT_TAGGING_RULES.maxProducts}
          minProducts={PRODUCT_TAGGING_RULES.minProducts}
          title="Tag Products"
          confirmButtonText="Add Products"
          allowMultiple={true}
          requireSelection={false}
        />
      </SafeAreaView>
    </PurpleGradientBg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    gap: 24,
  },
  videoPreviewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  videoWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: screenWidth * 0.6,
  },
  removeVideoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
  },
  urlVideoInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  urlVideoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  removeUrlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  removeUrlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  videoInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  uploadProgressContainer: {
    marginVertical: 8,
  },
  formFields: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  required: {
    color: '#FCA5A5',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FCA5A5',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  hashtagPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  hashtagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hashtagText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  // Product Tagging Styles
  productTaggingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  productTaggingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productTaggingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tagProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  tagProductsButtonDisabled: {
    opacity: 0.5,
  },
  tagProductsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  selectedProductsContainer: {
    gap: 12,
  },
  selectedProductsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  productChipsContainer: {
    gap: 8,
  },
});
