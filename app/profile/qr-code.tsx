// Profile QR Code Page
// Display QR code for profile sharing and wallet payments

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

const QRCodePage = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const user = authState.user;
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');

  // Generate profile link
  const profileLink = `https://rezapp.com/user/${user?.id || 'user123'}`;
  const walletId = `REZW${user?.phoneNumber?.slice(-6) || '123456'}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(activeTab === 'profile' ? profileLink : walletId);
    Alert.alert('Copied!', `${activeTab === 'profile' ? 'Profile link' : 'Wallet ID'} copied to clipboard`);
  };

  const handleShare = async () => {
    try {
      const message =
        activeTab === 'profile'
          ? `Check out my profile on REZ App!\n${profileLink}`
          : `Send payment to my REZ Wallet:\nID: ${walletId}`;

      await Share.share({
        message,
        title: activeTab === 'profile' ? 'My Profile' : 'My Wallet',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleScan = () => {
    // TODO: Implement QR scanner
    Alert.alert('Scan QR Code', 'QR code scanner will open camera to scan codes');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      {/* Header */}
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/profile');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>QR Code</ThemedText>
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Ionicons name="scan" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons
              name="person"
              size={20}
              color={activeTab === 'profile' ? '#00C06A' : 'rgba(255,255,255,0.7)'}
            />
            <ThemedText style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
              Profile
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'wallet' && styles.tabActive]}
            onPress={() => setActiveTab('wallet')}
          >
            <Ionicons
              name="wallet"
              size={20}
              color={activeTab === 'wallet' ? '#00C06A' : 'rgba(255,255,255,0.7)'}
            />
            <ThemedText style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
              Wallet
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            <QRCode
              value={activeTab === 'profile' ? profileLink : walletId}
              size={220}
              color="#111827"
              backgroundColor="white"
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {activeTab === 'profile' ? (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.avatarSmall}>
                    <ThemedText style={styles.avatarText}>
                      {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </ThemedText>
                  </View>
                  <View style={styles.infoText}>
                    <ThemedText style={styles.infoName}>
                      {user?.profile?.firstName && user?.profile?.lastName 
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user?.profile?.firstName || user?.email || 'User Name'}
                    </ThemedText>
                    <ThemedText style={styles.infoEmail}>{user?.email || 'user@email.com'}</ThemedText>
                  </View>
                </View>
                <View style={styles.linkBox}>
                  <ThemedText style={styles.linkLabel}>Profile Link</ThemedText>
                  <ThemedText style={styles.linkText} numberOfLines={1}>
                    {profileLink}
                  </ThemedText>
                </View>
              </>
            ) : (
              <>
                <View style={styles.walletInfo}>
                  <Ionicons name="wallet" size={32} color="#00C06A" />
                  <ThemedText style={styles.walletId}>{walletId}</ThemedText>
                  <ThemedText style={styles.walletBalance}>
                    Balance: ₹{user?.wallet?.balance || 0}
                  </ThemedText>
                </View>
                <View style={styles.instructionBox}>
                  <Ionicons name="information-circle" size={20} color="#6B7280" />
                  <ThemedText style={styles.instructionText}>
                    Share this QR code to receive payments directly to your REZ wallet
                  </ThemedText>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <LinearGradient colors={['#00C06A', '#00796B']} style={styles.actionButtonGradient}>
              <Ionicons name="share-social" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Share</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <View style={styles.actionButtonOutline}>
              <Ionicons name="copy" size={20} color="#00C06A" />
              <ThemedText style={styles.actionButtonTextOutline}>Copy Link</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <ThemedText style={styles.featuresTitle}>
            {activeTab === 'profile' ? 'Share Your Profile' : 'Receive Payments'}
          </ThemedText>

          {activeTab === 'profile' ? (
            <>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="people" size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.featureText}>
                  Share your profile with friends and family
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="star" size={20} color="#F59E0B" />
                </View>
                <ThemedText style={styles.featureText}>
                  Show your reviews and ratings
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="gift" size={20} color="#EC4899" />
                </View>
                <ThemedText style={styles.featureText}>
                  Earn referral bonus when they sign up
                </ThemedText>
              </View>
            </>
          ) : (
            <>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="flash" size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.featureText}>
                  Instant payment to your wallet
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                </View>
                <ThemedText style={styles.featureText}>
                  Secure and encrypted transactions
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="cash" size={20} color="#F59E0B" />
                </View>
                <ThemedText style={styles.featureText}>
                  No transaction fees for REZ users
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  scanButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: '#00C06A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrPattern: {
    width: 180,
    height: 180,
  },
  qrRow: {
    flexDirection: 'row',
    flex: 1,
  },
  qrDot: {
    flex: 1,
    backgroundColor: 'transparent',
    margin: 1,
  },
  qrDotFilled: {
    backgroundColor: '#111827',
  },
  qrNote: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  infoText: {
    flex: 1,
  },
  infoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  linkLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  walletInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  walletId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 16,
    color: '#6B7280',
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00C06A',
    gap: 8,
  },
  actionButtonTextOutline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00C06A',
  },
  featuresSection: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default QRCodePage;
