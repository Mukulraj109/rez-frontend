import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const prizes = [
  { id: 1, label: '₹10', value: 10, color: '#10B981', probability: 0.3 },
  { id: 2, label: '₹25', value: 25, color: '#3B82F6', probability: 0.25 },
  { id: 3, label: '₹50', value: 50, color: '#8B5CF6', probability: 0.2 },
  { id: 4, label: '₹5', value: 5, color: '#F59E0B', probability: 0.15 },
  { id: 5, label: '₹100', value: 100, color: '#EC4899', probability: 0.05 },
  { id: 6, label: '₹15', value: 15, color: '#F97316', probability: 0.05 },
];

export default function SpinWinPage() {
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;

  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<typeof prizes[0] | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [totalWon, setTotalWon] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  const handleSpin = () => {
    if (spinsLeft <= 0 || spinning) return;

    setSpinning(true);
    setWonPrize(null);

    // Random prize selection weighted by probability
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // Calculate rotation
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const degreesPerSlice = 360 / prizes.length;
    const prizeAngle = prizeIndex * degreesPerSlice;
    const fullSpins = 5;
    const newRotation = currentRotation + (fullSpins * 360) + (360 - prizeAngle);

    setCurrentRotation(newRotation);

    // Animate the spin
    Animated.timing(spinAnim, {
      toValue: newRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setWonPrize(selectedPrize);
      setSpinsLeft(prev => prev - 1);
      setTotalWon(prev => prev + selectedPrize.value);
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="flash" size={20} color="#F59E0B" />
          <Text style={styles.headerTitle}>Spin & Win</Text>
        </View>
        <View style={styles.coinsBadge}>
          <Ionicons name="cash" size={16} color="#F59E0B" />
          <Text style={styles.coinsText}>₹{totalWon}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Ionicons name="flash" size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{spinsLeft}</Text>
            <Text style={styles.statLabel}>Spins left</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text style={styles.statValue}>₹{totalWon}</Text>
            <Text style={styles.statLabel}>Won today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
            <Ionicons name="time" size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>24h</Text>
            <Text style={styles.statLabel}>Resets in</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#F59E0B', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <Ionicons name="gift" size={20} color="#FFFFFF" />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Daily Free Spins</Text>
              <Text style={styles.bannerSubtitle}>Get 3 free spins every day! Win up to ₹100 in ReZ Coins instantly.</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Spin Wheel */}
        <View style={styles.wheelContainer}>
          <View style={styles.wheelOuter}>
            {/* Wheel */}
            <Animated.View
              style={[
                styles.wheel,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              {prizes.map((prize, index) => {
                const rotation = (360 / prizes.length) * index;
                return (
                  <View
                    key={prize.id}
                    style={[
                      styles.wheelSegment,
                      {
                        backgroundColor: prize.color,
                        transform: [
                          { rotate: `${rotation}deg` },
                        ],
                      },
                    ]}
                  >
                    <Text style={[styles.prizeLabel, { transform: [{ rotate: '60deg' }] }]}>
                      {prize.label}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>

            {/* Center Button */}
            <TouchableOpacity
              onPress={handleSpin}
              disabled={spinning || spinsLeft <= 0}
              style={[
                styles.spinButton,
                (spinning || spinsLeft <= 0) && styles.spinButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={spinning || spinsLeft <= 0 ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#16A34A']}
                style={styles.spinButtonGradient}
              >
                {spinning ? (
                  <Ionicons name="flash" size={24} color="#FFFFFF" />
                ) : spinsLeft > 0 ? (
                  <Text style={styles.spinButtonText}>SPIN</Text>
                ) : (
                  <Text style={styles.spinButtonText}>Done</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Pointer */}
          <View style={styles.pointer} />
        </View>

        {/* Result */}
        {wonPrize && (
          <View style={styles.resultContainer}>
            <LinearGradient
              colors={['#10B981', '#14B8A6']}
              style={styles.resultCard}
            >
              <Ionicons name="star" size={48} color="#FFFFFF" />
              <Text style={styles.resultTitle}>You Won {wonPrize.label}!</Text>
              <Text style={styles.resultSubtitle}>ReZ Coins added to your wallet</Text>
            </LinearGradient>
          </View>
        )}

        {/* Prize Table */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Prize Distribution</Text>
          {prizes.map((prize) => (
            <View key={prize.id} style={styles.prizeRow}>
              <View style={styles.prizeRowLeft}>
                <View style={[styles.prizeColor, { backgroundColor: prize.color }]} />
                <Text style={styles.prizeRowLabel}>{prize.label}</Text>
              </View>
              <Text style={styles.prizeRowChance}>{(prize.probability * 100).toFixed(0)}% chance</Text>
            </View>
          ))}
        </View>

        {/* How to Get More Spins */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Get More Spins</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Make a purchase to earn 1 bonus spin</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Invite a friend to get 5 spins instantly</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Complete daily check-in for extra spins</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const WHEEL_SIZE = width * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  wheelOuter: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#F3F4F6',
    borderWidth: 8,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  wheel: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  wheelSegment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: 0,
    left: '25%',
    transformOrigin: 'bottom center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  prizeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spinButton: {
    position: 'absolute',
    zIndex: 10,
  },
  spinButtonDisabled: {
    opacity: 0.8,
  },
  spinButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointer: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
    zIndex: 20,
  },
  resultContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
  },
  prizeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prizeColor: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  prizeRowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  prizeRowChance: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginTop: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
});
