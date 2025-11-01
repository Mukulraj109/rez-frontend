// Scratch Card Game Component
// Reusable scratch card component with scratch-to-reveal mechanic

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import gamificationAPI from '@/services/gamificationApi';
import type { ScratchCardPrize } from '@/types/gamification.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

interface ScratchCardGameProps {
  onReveal?: (prize: ScratchCardPrize) => void;
}

export default function ScratchCardGame({ onReveal }: ScratchCardGameProps) {
  const [isScratched, setIsScratched] = useState(false);
  const [prize, setPrize] = useState<ScratchCardPrize | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const scratchOpacity = useRef(new Animated.Value(1)).current;
  const prizeScale = useRef(new Animated.Value(0.5)).current;

  // Create new scratch card
  const createCard = async () => {
    try {
      const response = await gamificationAPI.createScratchCard();
      if (response.success && response.data) {
        setCardId(response.data.id);
        setPrize(response.data.prize);
        return true;
      }
      return false;
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create scratch card');
      return false;
    }
  };

  // Handle scratch action
  const handleScratch = async () => {
    if (isScratched || !cardId) {
      // If no card exists, create one
      if (!cardId) {
        const created = await createCard();
        if (!created) return;
      }
      return;
    }

    try {
      // Animate scratch effect
      Animated.parallel([
        Animated.timing(scratchOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(prizeScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      setIsScratched(true);

      // Scratch card on backend
      if (cardId) {
        const response = await gamificationAPI.scratchCard(cardId);
        if (response.success && response.data) {
          // Trigger callback
          if (prize && onReveal) {
            onReveal(prize);
          }

          // Show success alert
          setTimeout(() => {
            Alert.alert(
              'Prize Revealed! 🎉',
              `You won: ${prize?.description || 'A mystery prize!'}`,
              [
                {
                  text: 'Claim Prize',
                  onPress: () => {
                    // Reset for next card
                    resetCard();
                  },
                },
              ]
            );
          }, 600);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to scratch card');
    }
  };

  // Reset card
  const resetCard = () => {
    setIsScratched(false);
    setPrize(null);
    setCardId(null);
    scratchOpacity.setValue(1);
    prizeScale.setValue(0.5);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Prize Content (hidden behind scratch layer) */}
        {prize && (
          <Animated.View
            style={[
              styles.prizeContent,
              {
                transform: [{ scale: prizeScale }],
              },
            ]}
          >
            <View style={[styles.prizeIcon, { backgroundColor: prize.color }]}>
              <Ionicons name={prize.icon as any} size={48} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.prizeTitle}>{prize.title}</ThemedText>
            <ThemedText style={styles.prizeDescription}>{prize.description}</ThemedText>
            {prize.type !== 'nothing' && (
              <View style={styles.prizeValue}>
                <ThemedText style={styles.prizeValueText}>
                  {prize.type === 'coin' && `${prize.value} Coins`}
                  {prize.type === 'discount' && `${prize.value}% OFF`}
                  {prize.type === 'cashback' && `₹${prize.value} Cashback`}
                  {prize.type === 'voucher' && `₹${prize.value} Voucher`}
                </ThemedText>
              </View>
            )}
          </Animated.View>
        )}

        {/* Scratch Surface */}
        <Animated.View
          style={[
            styles.scratchSurface,
            {
              opacity: scratchOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.scratchTouchable}
            onPress={handleScratch}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#C0C0C0', '#A0A0A0', '#C0C0C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scratchGradient}
            >
              <Ionicons name="hand-left" size={60} color="#FFFFFF" style={styles.scratchIcon} />
              <ThemedText style={styles.scratchText}>SCRATCH HERE</ThemedText>
              <ThemedText style={styles.scratchSubtext}>
                Tap to reveal your prize!
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Instructions */}
      {!isScratched && !cardId && (
        <TouchableOpacity style={styles.createButton} onPress={createCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.createButtonGradient}
          >
            <ThemedText style={styles.createButtonText}>Create Scratch Card</ThemedText>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
  },
  prizeContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  prizeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  prizeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  prizeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  prizeValue: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  prizeValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scratchSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  scratchTouchable: {
    flex: 1,
  },
  scratchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scratchIcon: {
    marginBottom: 16,
  },
  scratchText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  scratchSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  createButton: {
    marginTop: 24,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
