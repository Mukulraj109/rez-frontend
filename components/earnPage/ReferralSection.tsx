import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>
            Refer to different apps and services
          </ThemedText>
          <View style={styles.titleUnderline} />
        </View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']}
          style={styles.cardBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative background elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          {/* Illustration Area */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              {/* Animated Stars/Coins */}
              {[1, 2, 3, 4, 5].map((idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.coin,
                    styles[`coin${idx}` as keyof typeof styles],
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          scale: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.coinGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="star" size={idx === 3 ? 14 : idx === 1 ? 12 : idx === 5 ? 13 : 10} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              ))}
              
              {/* Central Elements */}
              <View style={styles.centralElements}>
                {/* Left Phone */}
                <Animated.View 
                  style={[
                    styles.phone,
                    styles.phoneLeft,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.phoneGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="phone-portrait" size={28} color="#FFFFFF" />
                    <View style={styles.phoneScreen}>
                      <View style={styles.screenLine} />
                      <View style={styles.screenLine} />
                      <View style={styles.screenLine} />
                    </View>
                  </LinearGradient>
                </Animated.View>
                
                {/* Right Phone/Download */}
                <Animated.View 
                  style={[
                    styles.phone,
                    styles.phoneRight,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.phoneGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="download" size={28} color="#FFFFFF" />
                    <View style={styles.phoneScreen}>
                      <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
              
              {/* People */}
              <Animated.View 
                style={[
                  styles.person,
                  styles.personLeft,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  style={styles.personAvatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.person,
                  styles.personRight,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.personAvatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
            </View>
          </View>
          
          {/* Stats */}
          <Animated.View 
            style={[
              styles.stats,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {[
              { value: referralData.totalReferrals, label: 'Total Referrals', icon: 'people', gradient: ['#8B5CF6', '#7C3AED'] },
              { value: `₹${referralData.totalEarningsFromReferrals}`, label: 'Earned', icon: 'wallet', gradient: ['#10B981', '#059669'] },
              { value: `₹${referralData.referralBonus}`, label: 'Per Referral', icon: 'gift', gradient: ['#F59E0B', '#D97706'] },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statItem}>
                <LinearGradient
                  colors={stat.gradient as any}
                  style={styles.statIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={stat.icon as any} size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.statNumberWrapper}>
                  <ThemedText style={styles.statNumber}>
                    {stat.value}
                  </ThemedText>
                </View>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              </View>
            ))}
          </Animated.View>

          
          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actions,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onShare}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                style={styles.shareButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="share-social" size={18} color="#FFFFFF" />
                <ThemedText style={styles.shareButtonText}>Share Link</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.learnButton}
              onPress={onLearnMore}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.learnButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.learnButtonText}>Learn More</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={EARN_COLORS.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: EARN_COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardBackground: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    bottom: -20,
    left: -20,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  coinGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin1: { top: 10, left: 30 },
  coin2: { top: 20, right: 40 },
  coin3: { bottom: 30, left: 20 },
  coin4: { bottom: 20, right: 30 },
  coin5: { top: 30, left: '50%', marginLeft: -12 },
  
  centralElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  phone: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  phoneGradient: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneLeft: {},
  phoneRight: {},
  phoneScreen: {
    marginTop: 6,
    alignItems: 'center',
  },
  screenLine: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 2,
    borderRadius: 1,
  },
  
  person: {
    position: 'absolute',
  },
  personLeft: { left: 60, bottom: 10 },
  personRight: { right: 60, bottom: 10 },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
 stats: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 18,
  paddingVertical: 18,
  paddingHorizontal: 12,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.05)',
},
statItem: {
  alignItems: 'center',
  flex: 1,
  gap: 8,
},
statIconGradient: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},
statNumberWrapper: {
  width: '100%',
  alignItems: 'center',
},
statNumber: {
  fontSize: 20,
  fontWeight: '800',
  color: '#1F2937',
  marginBottom: 2,
  letterSpacing: -0.3,
  textAlign: 'center',
},
statLabel: {
  fontSize: 11,
  color: '#6B7280',
  fontWeight: '600',
  textAlign: 'center',
  letterSpacing: 0.2,
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
    zIndex: 5,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  learnButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: EARN_COLORS.primary,
  },
  learnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  learnButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: EARN_COLORS.primary,
    letterSpacing: 0.2,
  },
});