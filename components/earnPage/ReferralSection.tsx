import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ReferralSectionProps } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';

export default function ReferralSection({ 
  referralData, 
  onShare, 
  onLearnMore 
}: ReferralSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          Refer to different apps and services
        </ThemedText>
      </View>
      
      <View style={styles.card}>
        <LinearGradient
          colors={['#F8FAFC', '#E2E8F0']}
          style={styles.cardBackground}
        >
          {/* Illustration Area */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              {/* Coins */}
              <View style={[styles.coin, styles.coin1]}>
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
              <View style={[styles.coin, styles.coin2]}>
                <Ionicons name="star" size={10} color="#FFD700" />
              </View>
              <View style={[styles.coin, styles.coin3]}>
                <Ionicons name="star" size={14} color="#FFD700" />
              </View>
              <View style={[styles.coin, styles.coin4]}>
                <Ionicons name="star" size={11} color="#FFD700" />
              </View>
              <View style={[styles.coin, styles.coin5]}>
                <Ionicons name="star" size={13} color="#FFD700" />
              </View>
              
              {/* Central Elements */}
              <View style={styles.centralElements}>
                {/* Left Phone */}
                <View style={[styles.phone, styles.phoneLeft]}>
                  <Ionicons name="phone-portrait" size={32} color="#6366F1" />
                  <View style={styles.phoneScreen}>
                    <View style={styles.screenLine} />
                    <View style={styles.screenLine} />
                    <View style={styles.screenLine} />
                  </View>
                </View>
                
                {/* Right Phone/Download */}
                <View style={[styles.phone, styles.phoneRight]}>
                  <Ionicons name="download" size={32} color="#10B981" />
                  <View style={styles.phoneScreen}>
                    <Ionicons name="arrow-down" size={16} color="#10B981" />
                  </View>
                </View>
              </View>
              
              {/* People */}
              <View style={[styles.person, styles.personLeft]}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={16} color="#EC4899" />
                </View>
              </View>
              
              <View style={[styles.person, styles.personRight]}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={16} color="#8B5CF6" />
                </View>
              </View>
            </View>
          </View>
          
          {/* Stats */}
    <View style={styles.stats}>
  <View style={styles.statItem}>
    <View style={styles.statNumberWrapper}>
      <ThemedText style={styles.statNumber}>
        {referralData.totalReferrals}
      </ThemedText>
    </View>
    <ThemedText style={styles.statLabel}>Total Referrals</ThemedText>
  </View>

  <View style={styles.statItem}>
    <View style={styles.statNumberWrapper}>
      <ThemedText style={styles.statNumber}>
        ₹{referralData.totalEarningsFromReferrals}
      </ThemedText>
    </View>
    <ThemedText style={styles.statLabel}>Earned</ThemedText>
  </View>

  <View style={styles.statItem}>
    <View style={styles.statNumberWrapper}>
      <ThemedText style={styles.statNumber}>
        ₹{referralData.referralBonus}
      </ThemedText>
    </View>
    <ThemedText style={styles.statLabel}>Per Referral</ThemedText>
  </View>
</View>


          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={onShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={16} color="#FFFFFF" />
              <ThemedText style={styles.shareButtonText}>Share Link</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.learnButton]}
              onPress={onLearnMore}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.learnButtonText}>Learn More</ThemedText>
              <Ionicons name="arrow-forward" size={16} color={EARN_COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: EARN_COLORS.textPrimary,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBackground: {
    padding: 24,
  },
  illustrationContainer: {
    height: 120,
    marginBottom: 20,
    position: 'relative',
  },
  illustration: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin1: { top: 10, left: 30 },
  coin2: { top: 20, right: 40 },
  coin3: { bottom: 30, left: 20 },
  coin4: { bottom: 20, right: 30 },
  coin5: { top: 30, left: '50%', marginLeft: -10 },
  
  centralElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  phone: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneLeft: {},
  phoneRight: {},
  phoneScreen: {
    marginTop: 4,
    alignItems: 'center',
  },
  screenLine: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 1,
    borderRadius: 1,
  },
  
  person: {
    position: 'absolute',
  },
  personLeft: { left: 60, bottom: 10 },
  personRight: { right: 60, bottom: 10 },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
 stats: {
  flexDirection: 'row',
  justifyContent: 'space-between', // or 'space-around'
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 16,
  marginBottom: 20,
},
statItem: {
  alignItems: 'center',
  flex: 1,
},
statNumberWrapper: {
  width: 80, // fixed width for all numbers
  alignItems: 'center',
},
statNumber: {
  fontSize: 18,
  fontWeight: 'bold',
  color: EARN_COLORS.primary,
  marginBottom: 4,
},
statLabel: {
  fontSize: 10,
  color: EARN_COLORS.textSecondary,
  fontWeight: '500',
  textAlign: 'center',
},

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: EARN_COLORS.border,
    marginHorizontal: 16,
  },
  
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  shareButton: {
    backgroundColor: EARN_COLORS.primary,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  learnButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: EARN_COLORS.primary,
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: EARN_COLORS.primary,
  },
});