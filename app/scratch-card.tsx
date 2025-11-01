// Scratch Card Page
// Interactive scratch card game for profile completion rewards

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useProfile } from '@/hooks/useProfile';
import { useScratchCard } from '@/hooks/useScratchCard';

const { width, height } = Dimensions.get('window');

interface ScratchCardPrize {
  id: string;
  type: 'discount' | 'cashback' | 'coin' | 'voucher';
  value: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const SCRATCH_PRIZES: ScratchCardPrize[] = [
  {
    id: '1',
    type: 'discount',
    value: 10,
    title: '10% Discount',
    description: 'Get 10% off your next purchase',
    icon: 'pricetag',
    color: '#10B981',
  },
  {
    id: '2',
    type: 'cashback',
    value: 50,
    title: '₹50 Cashback',
    description: 'Earn ₹50 cashback on your next order',
    icon: 'cash',
    color: '#F59E0B',
  },
  {
    id: '3',
    type: 'coin',
    value: 100,
    title: '100 REZ Coins',
    description: 'Earn 100 REZ coins to your wallet',
    icon: 'diamond',
    color: '#8B5CF6',
  },
  {
    id: '4',
    type: 'voucher',
    value: 200,
    title: '₹200 Voucher',
    description: 'Free ₹200 voucher for your next purchase',
    icon: 'gift',
    color: '#EF4444',
  },
];

export default function ScratchCardPage() {
  const router = useRouter();
  const { profile, completionStatus, isLoading: profileLoading, refreshProfile } = useProfile();
  const { 
    eligibility, 
    isLoading, 
    error, 
    checkEligibility, 
    createScratchCard, 
    scratchCard, 
    claimPrize 
  } = useScratchCard();
  
  const [isScratched, setIsScratched] = useState(false);
  const [prize, setPrize] = useState<ScratchCardPrize | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [canScratch, setCanScratch] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const scratchAnim = new Animated.Value(1);

  useEffect(() => {
    // Refresh profile data and check eligibility
    refreshProfile();
    checkEligibility();
  }, [refreshProfile, checkEligibility]);

  // Add a focus listener to refresh data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  useEffect(() => {
    // Update canScratch based on profile completion (80% threshold)
    const completionPercentage = completionStatus?.completionPercentage || 0;
    const isEligible = completionPercentage >= 80;
    setCanScratch(isEligible);
    
    if (isEligible) {
      // Animate card entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [completionStatus, fadeAnim, scaleAnim, profile]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleScratch = useCallback(async () => {
    if (!canScratch || isScratched) return;

    try {
      // Create scratch card first
      const newCard = await createScratchCard();
      if (!newCard) return;

      setCurrentCardId(newCard.id);
      setPrize(newCard.prize);
      setIsScratched(true);

      // Animate scratch effect
      Animated.timing(scratchAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowPrize(true);
      });
    } catch (error) {
      console.error('Error creating scratch card:', error);
      Alert.alert('Error', 'Failed to create scratch card. Please try again.');
    }
  }, [canScratch, isScratched, scratchAnim, createScratchCard]);

  const handleClaimPrize = useCallback(async () => {
    if (!prize || !currentCardId) return;

    try {
      const claimResult = await claimPrize(currentCardId);
      if (claimResult) {
        Alert.alert(
          'Prize Claimed! 🎉',
          `${claimResult.claimResult.message}\n\n${prize.description}`,
          [
            { text: 'OK', onPress: () => router.back() },
            { 
              text: 'Use Now', 
              onPress: () => {
                // Navigate to relevant page based on prize type
                switch (prize.type) {
                  case 'discount':
                    router.push('/');
                    break;
                  case 'cashback':
                  case 'coin':
                    router.push('/WalletScreen');
                    break;
                  case 'voucher':
                    router.push('/my-vouchers');
                    break;
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      Alert.alert('Error', 'Failed to claim prize. Please try again.');
    }
  }, [prize, currentCardId, claimPrize, router]);

  const handleCompleteProfile = useCallback(() => {
    router.push('/profile/edit');
  }, [router]);

  if (!canScratch) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Scratch Card</ThemedText>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={80} color="#E5E7EB" />
          <ThemedText style={styles.lockedTitle}>Complete Your Profile</ThemedText>
          <ThemedText style={styles.lockedDescription}>
            Complete at least 80% of your profile to unlock the scratch card and win exciting prizes!
          </ThemedText>
          <ThemedText style={styles.progressText}>
            Current Progress: {completionStatus?.completionPercentage || 0}%
          </ThemedText>
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteProfile}>
            <ThemedText style={styles.completeButtonText}>Complete Profile</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: '#6B7280', marginTop: 10 }]} 
            onPress={() => {
              refreshProfile();
            }}
          >
            <ThemedText style={styles.completeButtonText}>Refresh Data</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Scratch & Win</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.scratchCard}>
            {/* Scratch Surface */}
            <Animated.View 
              style={[
                styles.scratchSurface,
                {
                  opacity: scratchAnim,
                },
              ]}
            >
              <LinearGradient
                colors={['#C0C0C0', '#A0A0A0']}
                style={styles.scratchGradient}
              >
                <Ionicons name="finger-print" size={60} color="#FFFFFF" />
                <ThemedText style={styles.scratchText}>SCRATCH HERE</ThemedText>
                <ThemedText style={styles.scratchSubtext}>Use your finger to reveal your prize!</ThemedText>
              </LinearGradient>
            </Animated.View>

            {/* Prize Content */}
            {showPrize && prize && (
              <Animated.View style={styles.prizeContent}>
                <View style={[styles.prizeIcon, { backgroundColor: prize.color }]}>
                  <Ionicons name={prize.icon as any} size={40} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.prizeTitle}>{prize.title}</ThemedText>
                <ThemedText style={styles.prizeDescription}>{prize.description}</ThemedText>
                <TouchableOpacity style={styles.claimButton} onPress={handleClaimPrize}>
                  <ThemedText style={styles.claimButtonText}>Claim Prize</ThemedText>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>How to Play</ThemedText>
          <ThemedText style={styles.instructionsText}>
            1. Use your finger to scratch the silver surface{'\n'}
            2. Reveal your hidden prize{'\n'}
            3. Claim your reward instantly!
          </ThemedText>
        </View>

        {/* Scratch Button (for testing) */}
        {!isScratched && (
          <TouchableOpacity style={styles.scratchButton} onPress={handleScratch}>
            <ThemedText style={styles.scratchButtonText}>Scratch Card</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBg: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scratchCard: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  scratchSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  scratchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scratchText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  scratchSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  prizeContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  prizeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  prizeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  prizeDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  claimButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  scratchButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  scratchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
