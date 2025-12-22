// Share to Earn Page
// Earn coins by sharing content

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Share,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface ShareableContent {
  id: string;
  type: 'offer' | 'product' | 'store' | 'referral';
  title: string;
  description: string;
  coins: number;
  shares: number;
  image: string;
}

const SHAREABLE_CONTENT: ShareableContent[] = [
  { id: '1', type: 'referral', title: 'Invite Friends', description: 'Get 100 RC for each friend who joins', coins: 100, shares: 0, image: '👥' },
  { id: '2', type: 'offer', title: '50% Off at Dominos', description: 'Share this amazing deal', coins: 10, shares: 45, image: '🍕' },
  { id: '3', type: 'product', title: 'iPhone 15 Pro Max', description: 'Check out this product', coins: 5, shares: 120, image: '📱' },
  { id: '4', type: 'store', title: 'New Store: Nike', description: 'Discover the latest arrivals', coins: 15, shares: 30, image: '👟' },
  { id: '5', type: 'offer', title: 'BOGO at Starbucks', description: 'Buy 1 Get 1 Free', coins: 10, shares: 80, image: '☕' },
];

const SHARE_PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
  { id: 'copy', name: 'Copy Link', icon: 'copy-outline', color: Colors.gray[600] },
  { id: 'more', name: 'More', icon: 'share-outline', color: Colors.gray[600] },
];

export default function ShareToEarnPage() {
  const router = useRouter();
  const [selectedContent, setSelectedContent] = useState<ShareableContent | null>(null);
  const [totalEarned, setTotalEarned] = useState(250);
  const [totalShares, setTotalShares] = useState(15);

  const handleShare = async (content: ShareableContent, platform: string) => {
    try {
      const message = `Check out ${content.title} on ReZ! ${content.description}`;

      if (platform === 'copy') {
        // Copy to clipboard logic
        alert('Link copied to clipboard!');
      } else if (platform === 'more') {
        await Share.share({
          message,
          title: content.title,
        });
      } else {
        // Platform-specific sharing
        await Share.share({
          message,
          title: content.title,
        });
      }

      // Track the share
      setTotalEarned(prev => prev + content.coins);
      setTotalShares(prev => prev + 1);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderContent = ({ item }: { item: ShareableContent }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => setSelectedContent(item)}
    >
      <View style={styles.contentImage}>
        <ThemedText style={styles.contentEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.contentInfo}>
        <View style={styles.contentHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <ThemedText style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </ThemedText>
          </View>
          {item.shares > 0 && (
            <ThemedText style={styles.sharesText}>{item.shares} shares</ThemedText>
          )}
        </View>
        <ThemedText style={styles.contentTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.contentDesc}>{item.description}</ThemedText>
        <View style={styles.coinsBadge}>
          <Ionicons name="diamond" size={14} color={Colors.gold} />
          <ThemedText style={styles.coinsText}>Earn {item.coins} RC</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-social" size={20} color={Colors.primary[600]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'referral': return Colors.gold;
      case 'offer': return Colors.success;
      case 'product': return Colors.primary[600];
      case 'store': return Colors.info;
      default: return Colors.gray[500];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Share & Earn</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{totalEarned} RC</ThemedText>
            <ThemedText style={styles.statLabel}>Total Earned</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{totalShares}</ThemedText>
            <ThemedText style={styles.statLabel}>Shares</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={SHAREABLE_CONTENT}
        renderItem={renderContent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.howItWorks}>
            <ThemedText style={styles.sectionTitle}>How it works</ThemedText>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>1</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Choose content to share</ThemedText>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>2</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Share on social media</ThemedText>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>3</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Earn ReZ Coins instantly</ThemedText>
              </View>
            </View>
          </View>
        }
      />

      {/* Share Modal */}
      {selectedContent && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setSelectedContent(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Share & Earn {selectedContent.coins} RC</ThemedText>
              <TouchableOpacity onPress={() => setSelectedContent(null)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sharePreview}>
              <View style={styles.previewImage}>
                <ThemedText style={styles.previewEmoji}>{selectedContent.image}</ThemedText>
              </View>
              <ThemedText style={styles.previewTitle}>{selectedContent.title}</ThemedText>
              <ThemedText style={styles.previewDesc}>{selectedContent.description}</ThemedText>
            </View>

            <View style={styles.platformsGrid}>
              {SHARE_PLATFORMS.map(platform => (
                <TouchableOpacity
                  key={platform.id}
                  style={styles.platformButton}
                  onPress={() => handleShare(selectedContent, platform.id)}
                >
                  <View style={[styles.platformIcon, { backgroundColor: platform.color + '20' }]}>
                    <Ionicons name={platform.icon as any} size={24} color={platform.color} />
                  </View>
                  <ThemedText style={styles.platformName}>{platform.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
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
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: '#FFF',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  howItWorks: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumberText: {
    ...Typography.label,
    color: '#FFF',
  },
  stepText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.primary[200],
    marginBottom: 20,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  contentImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentEmoji: {
    fontSize: 28,
  },
  contentInfo: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  sharesText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  contentTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  contentDesc: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coinsText: {
    ...Typography.labelSmall,
    color: Colors.gold,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['3xl'] : Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  sharePreview: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  previewDesc: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  platformButton: {
    width: '30%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
});
