import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';

export default function RewardsIntroScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/transactions-preview');
  };

  return (
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop, Share, and{'\n'}Earn Rewards!</Text>
          <View style={styles.underline} />
          
          <Text style={styles.subtitle}>
            Share your purchase on social media and earn{'\n'}
            Rez Coins as cashback!
          </Text>
        </View>

        <View style={styles.illustrationContainer}>
          {/* Social Media Mockup */}
          <View style={styles.socialMediaContainer}>
            {/* Main Post Card */}
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.profilePic} />
                <View style={styles.postInfo}>
                  <Text style={styles.username}>Sarah M.</Text>
                  <Text style={styles.timestamp}>2 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.postContent}>
                <View style={styles.foodImage}>
                  <View style={styles.foodItem1} />
                  <View style={styles.foodItem2} />
                  <View style={styles.foodItem3} />
                </View>
                
                <View style={styles.postActions}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionIcon}>♡</Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionIcon}>📤</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Floating Coins */}
            <View style={[styles.coin, styles.coin1]}>
              <Text style={styles.coinText}>₹</Text>
            </View>
            <View style={[styles.coin, styles.coin2]}>
              <Text style={styles.coinText}>₹</Text>
            </View>
            <View style={[styles.coin, styles.coin3]}>
              <Text style={styles.coinText}>₹</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  socialMediaContainer: {
    position: 'relative',
    width: 260,
    height: 300,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: 220,
    height: 260,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F0FF',
    marginRight: 8,
  },
  postInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    flex: 1,
  },
  foodImage: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    marginBottom: 12,
  },
  foodItem1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: '#FDE68A',
    borderRadius: 20,
  },
  foodItem2: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 35,
    height: 35,
    backgroundColor: '#FCA5A5',
    borderRadius: 18,
  },
  foodItem3: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    width: 45,
    height: 30,
    backgroundColor: '#A7F3D0',
    borderRadius: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  coin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coin1: {
    top: 40,
    right: 20,
  },
  coin2: {
    bottom: 80,
    left: 10,
  },
  coin3: {
    bottom: 40,
    right: 50,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});