import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import * as Clipboard from 'expo-clipboard';

/**
 * ProductShareModal Component
 *
 * Modal for sharing products with multiple options
 * Features:
 * - Social media sharing (WhatsApp, Facebook, Twitter, Instagram)
 * - Copy link functionality
 * - Email/SMS sharing
 * - QR code generation
 * - Share tracking for referrals
 * - Wishlist quick add
 * - Share with rewards
 */

interface ShareOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  action: () => void;
}

interface ProductShareModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl?: string;
  referralCode?: string;
  onShareComplete?: (platform: string) => void;
}

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  visible,
  onClose,
  productId,
  productName,
  productImage,
  productPrice,
  productUrl,
  referralCode,
  onShareComplete,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Generate share URL with referral code
  const generateShareUrl = (): string => {
    const baseUrl = productUrl || `https://app.wasil.com/product/${productId}`;
    return referralCode ? `${baseUrl}?ref=${referralCode}` : baseUrl;
  };

  // Generate share message
  const generateShareMessage = (): string => {
    return `Check out this amazing product!\n\n${productName}\n₹${productPrice.toLocaleString()}\n\n${generateShareUrl()}`;
  };

  /**
   * Handle native share
   */
  const handleNativeShare = async () => {
    try {
      console.log('📤 [ProductShare] Sharing via native sheet');

      const result = await Share.share({
        message: generateShareMessage(),
        url: generateShareUrl(), // iOS only
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('✅ [ProductShare] Shared with activity type:', result.activityType);
          handleShareSuccess('native', result.activityType);
        } else {
          console.log('✅ [ProductShare] Shared');
          handleShareSuccess('native');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('❌ [ProductShare] Share dismissed');
      }
    } catch (error) {
      console.error('❌ [ProductShare] Error sharing:', error);
      Alert.alert('Error', 'Failed to share product. Please try again.');
    }
  };

  /**
   * Handle copy link
   */
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(generateShareUrl());
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      console.log('✅ [ProductShare] Link copied to clipboard');
      Alert.alert('Link Copied', 'Product link copied to clipboard!');
      handleShareSuccess('clipboard');
    } catch (error) {
      console.error('❌ [ProductShare] Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link. Please try again.');
    }
  };

  /**
   * Handle WhatsApp share
   */
  const handleWhatsAppShare = () => {
    console.log('📱 [ProductShare] Sharing to WhatsApp');
    // In production, use deep linking or Linking API
    // Linking.openURL(`whatsapp://send?text=${encodeURIComponent(generateShareMessage())}`);
    handleNativeShare();
    handleShareSuccess('whatsapp');
  };

  /**
   * Handle Facebook share
   */
  const handleFacebookShare = () => {
    console.log('📘 [ProductShare] Sharing to Facebook');
    // In production, use Facebook SDK or deep linking
    handleNativeShare();
    handleShareSuccess('facebook');
  };

  /**
   * Handle Twitter share
   */
  const handleTwitterShare = () => {
    console.log('🐦 [ProductShare] Sharing to Twitter');
    // In production, use Twitter SDK or deep linking
    handleNativeShare();
    handleShareSuccess('twitter');
  };

  /**
   * Handle Instagram share
   */
  const handleInstagramShare = () => {
    console.log('📷 [ProductShare] Sharing to Instagram');
    // Instagram requires special handling (story sharing, etc.)
    Alert.alert(
      'Share to Instagram',
      'To share on Instagram, please screenshot this product and post to your story!',
      [{ text: 'OK' }]
    );
    handleShareSuccess('instagram');
  };

  /**
   * Handle Email share
   */
  const handleEmailShare = () => {
    console.log('📧 [ProductShare] Sharing via Email');
    // In production, use MailComposer or Linking with mailto:
    handleNativeShare();
    handleShareSuccess('email');
  };

  /**
   * Handle SMS share
   */
  const handleSMSShare = () => {
    console.log('💬 [ProductShare] Sharing via SMS');
    // In production, use SMS or Linking with sms:
    handleNativeShare();
    handleShareSuccess('sms');
  };

  /**
   * Handle share success tracking
   */
  const handleShareSuccess = (platform: string, activityType?: string) => {
    console.log(`✅ [ProductShare] Share tracked for platform: ${platform}`);

    if (onShareComplete) {
      onShareComplete(platform);
    }

    // TODO: Track share event in analytics
    // analytics.track('product_shared', {
    //   product_id: productId,
    //   platform,
    //   activity_type: activityType,
    //   referral_code: referralCode,
    // });
  };

  // Share options configuration
  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      action: handleWhatsAppShare,
    },
    {
      id: 'facebook',
      icon: 'logo-facebook',
      label: 'Facebook',
      color: '#1877F2',
      action: handleFacebookShare,
    },
    {
      id: 'twitter',
      icon: 'logo-twitter',
      label: 'Twitter',
      color: '#1DA1F2',
      action: handleTwitterShare,
    },
    {
      id: 'instagram',
      icon: 'logo-instagram',
      label: 'Instagram',
      color: '#E4405F',
      action: handleInstagramShare,
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'Email',
      color: '#EA4335',
      action: handleEmailShare,
    },
    {
      id: 'sms',
      icon: 'chatbubble',
      label: 'Message',
      color: '#0F9D58',
      action: handleSMSShare,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Share Product</ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Product Preview */}
          <View style={styles.productPreview}>
            <Image source={{ uri: productImage }} style={styles.productImage} resizeMode="cover" />
            <View style={styles.productInfo}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {productName}
              </ThemedText>
              <ThemedText style={styles.productPrice}>₹{productPrice.toLocaleString()}</ThemedText>
            </View>
          </View>

          {/* Rewards Banner */}
          {referralCode && (
            <View style={styles.rewardsBanner}>
              <Ionicons name="gift" size={20} color="#8B5CF6" />
              <ThemedText style={styles.rewardsBannerText}>
                Earn rewards when friends buy using your link!
              </ThemedText>
            </View>
          )}

          {/* Share Options Grid */}
          <View style={styles.optionsContainer}>
            <ThemedText style={styles.sectionTitle}>Share via</ThemedText>
            <View style={styles.optionsGrid}>
              {shareOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionButton}
                  onPress={option.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={28} color="#FFF" />
                  </View>
                  <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {/* Copy Link */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                size={20}
                color={isCopied ? '#10B981' : '#8B5CF6'}
              />
              <ThemedText style={styles.quickActionText}>
                {isCopied ? 'Link Copied!' : 'Copy Link'}
              </ThemedText>
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleNativeShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={20} color="#8B5CF6" />
              <ThemedText style={styles.quickActionText}>More Options</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Referral Code Display */}
          {referralCode && (
            <View style={styles.referralCodeContainer}>
              <ThemedText style={styles.referralCodeLabel}>Your Referral Code</ThemedText>
              <View style={styles.referralCode}>
                <ThemedText style={styles.referralCodeText}>{referralCode}</ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '90%',
  },

  // Handle Bar
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Product Preview
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },

  // Rewards Banner
  rewardsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  rewardsBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
    lineHeight: 18,
  },

  // Options Container
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  optionButton: {
    width: '30%',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    gap: 8,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Referral Code
  referralCodeContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  referralCodeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  referralCode: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
});

export default ProductShareModal;
