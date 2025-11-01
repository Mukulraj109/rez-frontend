import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useEarnFromSocialMedia } from '@/hooks/useEarnFromSocialMedia';
import EarnSocialData from '@/data/earnSocialData';

const { width } = Dimensions.get('window');

export default function EarnFromSocialMediaPage() {

  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract product context from params
  const productContext = {
    productId: params.productId as string | undefined,
    productName: params.productName as string | undefined,
    productPrice: params.productPrice ? parseFloat(params.productPrice as string) : undefined,
    productImage: params.productImage as string | undefined,
    storeId: params.storeId as string | undefined,
    storeName: params.storeName as string | undefined,
  };

  const { state, handlers } = useEarnFromSocialMedia(productContext.productId);
  const [urlInput, setUrlInput] = useState('');

  React.useEffect(() => {

    if (productContext.productId) {

    }
  }, []);

  const handleSubmitUrl = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter an Instagram post URL');
      return;
    }

    // Import validators
    try {
      const { validators } = await import('@/services/socialMediaApi');

      // Validate URL format before submitting
      const validation = validators.validatePostUrl('instagram', urlInput.trim());
      if (!validation.isValid) {

        Alert.alert('Invalid URL', validation.error || 'Please enter a valid Instagram post URL');
        return; // ✅ Stop execution here
      }

      handlers.handleUrlChange(urlInput);
      await handlers.handleSubmit();

    } catch (error) {
      console.error('❌ [EARN SOCIAL] Validation error:', error);
      Alert.alert('Error', 'Failed to validate URL. Please try again.');
      return; // ✅ Stop execution on error
    }
  };

  const renderStepIndicator = (stepNumber: number, isActive: boolean, isCompleted: boolean) => (
    <View style={[
      styles.stepIndicator,
      isActive && styles.stepIndicatorActive,
      isCompleted && styles.stepIndicatorCompleted
    ]}>
      {isCompleted ? (
        <Ionicons name="checkmark" size={16} color="white" />
      ) : (
        <ThemedText style={[
          styles.stepNumber,
          isActive && styles.stepNumberActive
        ]}>
          {stepNumber}
        </ThemedText>
      )}
    </View>
  );

  const renderOverviewStep = () => (
    <>
      {/* Product Context (if available) */}
      {productContext.productName && (
        <View style={styles.productContextCard}>
          <View style={styles.productContextHeader}>
            <Ionicons name="cube-outline" size={20} color="#8B5CF6" />
            <ThemedText style={styles.productContextTitle}>Earning for:</ThemedText>
          </View>
          <ThemedText style={styles.productName}>{productContext.productName}</ThemedText>
          {productContext.storeName && (
            <ThemedText style={styles.storeName}>from {productContext.storeName}</ThemedText>
          )}
          {productContext.productPrice && (
            <ThemedText style={styles.productPrice}>
              ₹{productContext.productPrice} • 5% cashback = ₹{(productContext.productPrice * 0.05).toFixed(2)}
            </ThemedText>
          )}
        </View>
      )}

      {/* Cashback Information Cards */}
      <View style={styles.cardsContainer}>
        {/* Main Cashback Card */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackBadge}>
            <ThemedText style={styles.cashbackText}>CASH BACK</ThemedText>
            <ThemedText style={styles.cashbackPercentage}>5%</ThemedText>
          </View>
          <View style={styles.coinIcons}>
            <Text style={styles.coin}>💰</Text>
            <Text style={styles.coin}>🪙</Text>
          </View>
          <ThemedText style={styles.cardDescription}>
            Buy anything and share it on Instagram. We'll give you 5% cash back in the form of coins.
          </ThemedText>
        </View>

        {/* Share to Get Coins Card */}
        <View style={styles.shareCard}>
          <View style={styles.shareIllustration}>
            <Text style={styles.phoneIcon}>📱</Text>
            <View style={styles.socialIcons}>
              <Text style={styles.heartIcon}>💜</Text>
              <Text style={styles.heartIcon}>💜</Text>
              <Text style={styles.heartIcon}>💜</Text>
            </View>
          </View>
          <ThemedText style={styles.shareTitle}>Share to get coins</ThemedText>
          <ThemedText style={styles.shareDescription}>
            We'll credit your account within 48 hours. Use your coins to buy more things.
          </ThemedText>
        </View>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handlers.handleStartUpload}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={EarnSocialData.ui.gradients.primary as any}
          style={styles.uploadButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ThemedText style={styles.uploadButtonText}>Upload</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderUrlInputStep = () => (
    <>
      {/* Step Process */}
      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            {renderStepIndicator(1, false, true)}
            <ThemedText style={styles.stepTitle}>Step 1: Share a post on Instagram</ThemedText>
          </View>
          <View style={styles.stepIllustration}>
            <View style={styles.phoneIllustration}>
              <View style={styles.phoneScreen}>
                <View style={styles.instagramPost}>
                  <Text style={styles.instagramIcon}>💜</Text>
                  <View style={styles.postContent}>
                    <Text style={styles.postImage}>📱</Text>
                    <ThemedText style={styles.percentageText}>%</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            {renderStepIndicator(2, true, false)}
            <ThemedText style={styles.stepTitle}>Step 2: Submit your post</ThemedText>
          </View>
          <ThemedText style={styles.stepSubtitle}>Instagram Post URL</ThemedText>
          
          {/* URL Input */}
          <View style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste Instagram post URL here..."
              value={urlInput}
              onChangeText={setUrlInput}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>
      </View>

      {/* Upload Button */}
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={handleSubmitUrl}
        activeOpacity={0.8}
        disabled={state.loading}
      >
        <LinearGradient
          colors={EarnSocialData.ui.gradients.primary as any}
          style={styles.uploadButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {state.loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.uploadButtonText}>Upload</ThemedText>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderUploadingStep = () => (
    <View style={styles.uploadingContainer}>
      <View style={styles.uploadProgress}>
        <ActivityIndicator size="large" color={EarnSocialData.ui.colors.primary} />
        <ThemedText style={styles.uploadingText}>Uploading your post...</ThemedText>
        <ThemedText style={styles.progressText}>{state.uploadProgress}%</ThemedText>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={EarnSocialData.ui.colors.success} />
      </View>
      <ThemedText style={styles.successTitle}>Post Submitted Successfully!</ThemedText>
      <ThemedText style={styles.successDescription}>
        Your post is under review. You'll receive cashback within 48 hours.
      </ThemedText>
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={handlers.handleGoBack}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.doneButtonText}>Done</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={80} color={EarnSocialData.ui.colors.error} />
      </View>
      <ThemedText style={styles.errorTitle}>Upload Failed</ThemedText>
      <ThemedText style={styles.errorDescription}>{state.error}</ThemedText>
      <View style={styles.errorActions}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handlers.handleRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handlers.handleGoBack}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.cancelButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (state.currentStep) {
      case 'url_input':
        return renderUrlInputStep();
      case 'uploading':
        return renderUploadingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderOverviewStep();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <LinearGradient 
        colors={EarnSocialData.ui.gradients.primary as any} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlers.handleGoBack}
            activeOpacity={0.8}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Earn from social media</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        
        {/* Bottom Cashback Text */}
        <View style={styles.bottomText}>
          <ThemedText style={styles.getCashbackText}>Get Cashback</ThemedText>
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  headerRight: {
    width: 40,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Cards Container
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  
  // Cashback Card
  cashbackCard: {
    backgroundColor: '#E6E6FA',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    minHeight: 150,
  },
  cashbackBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashbackText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  cashbackPercentage: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  coinIcons: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    gap: 8,
  },
  coin: {
    fontSize: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
    lineHeight: 20,
  },
  
  // Share Card
  shareCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 150,
  },
  shareIllustration: {
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  heartIcon: {
    fontSize: 16,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  shareDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Steps Container
  stepsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  
  // Step Card
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIndicatorActive: {
    backgroundColor: '#8B5CF6',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  
  // Step Illustration
  stepIllustration: {
    alignItems: 'center',
    marginVertical: 16,
  },
  phoneIllustration: {
    width: 120,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  phoneScreen: {
    width: 100,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  instagramPost: {
    alignItems: 'center',
    gap: 8,
  },
  instagramIcon: {
    fontSize: 24,
  },
  postContent: {
    alignItems: 'center',
    gap: 4,
  },
  postImage: {
    fontSize: 40,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  
  // URL Input
  urlInputContainer: {
    marginTop: 8,
  },
  urlInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  
  // Upload Button
  uploadButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Uploading State
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  uploadProgress: {
    alignItems: 'center',
    gap: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // Bottom Text
  bottomText: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  getCashbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },

  // Product Context Card
  productContextCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  productContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productContextTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
});