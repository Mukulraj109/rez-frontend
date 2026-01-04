import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import programApi from '../../services/programApi';

const SocialImpactEventDetail = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : params.id?.toString() || '1';
  const [isRegistered, setIsRegistered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await programApi.getSocialImpactEventById(id);
        if (res.data) {
          setEventData(res.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      await programApi.registerForSocialImpact(id);
      setIsRegistered(true);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const events: { [key: string]: any } = {
    '1': {
      type: 'blood-donation',
      title: 'Blood Donation Drive',
      icon: '🩸',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      organizer: 'Apollo Hospitals',
      logo: '🏥',
      date: 'Dec 28, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Apollo Hospital, Sector 18',
      fullAddress: 'Apollo Hospitals, Sector 18, Noida, Uttar Pradesh 201301',
      distance: '2.3 km',
      rewards: { rezCoins: 200, brandedCoins: 150, brandName: 'Apollo' },
      enrolled: 234,
      goal: 500,
      impact: 'Save 3 lives per donation',
      status: 'upcoming',
      description: 'Join us for a life-saving blood donation drive. Every donation can save up to 3 lives. Registered donors will receive health checkup and refreshments.',
      requirements: [
        'Age between 18-65 years',
        'Weight above 50kg',
        'Valid ID proof required',
        'No recent illness or medication',
        'Fasting not required, eat normally'
      ],
      benefits: [
        'Free health checkup',
        'Refreshments provided',
        'Blood donor certificate',
        'ReZ Coins + Apollo branded coins',
        'Priority access to blood bank if needed'
      ],
      contact: {
        phone: '+91-9876543210',
        email: 'blooddrive@apollo.com'
      },
      schedule: [
        { time: '9:00 AM', activity: 'Registration & Check-in' },
        { time: '9:30 AM', activity: 'Health Screening' },
        { time: '10:00 AM', activity: 'Blood Donation' },
        { time: '4:30 PM', activity: 'Refreshments & Certificate' }
      ]
    },
    '2': {
      type: 'tree-plantation',
      title: 'Tree Plantation Drive',
      icon: '🌳',
      iconBg: 'rgba(34, 197, 94, 0.2)',
      iconColor: '#22C55E',
      organizer: 'Green Earth Foundation',
      logo: '🌍',
      date: 'Dec 30, 2024',
      time: '7:00 AM - 11:00 AM',
      location: 'City Park, Botanical Gardens',
      fullAddress: 'Botanical Gardens, Sector 38, Noida, Uttar Pradesh 201303',
      distance: '4.1 km',
      rewards: { rezCoins: 150, brandedCoins: 100, brandName: 'Green Earth' },
      enrolled: 156,
      goal: 200,
      impact: 'Plant 1000+ saplings',
      status: 'upcoming',
      description: 'Help us make the city greener! Join our tree plantation drive and contribute to a sustainable future. Each participant will plant at least 5 saplings.',
      requirements: [
        'Comfortable outdoor clothing',
        'Closed-toe shoes required',
        'Bring your own water bottle',
        'Sun protection (hat, sunscreen)',
        'Minimum age 12 years (with guardian)'
      ],
      benefits: [
        'Contribute to environmental conservation',
        'Learn about native tree species',
        'Breakfast and refreshments',
        'Tree adoption certificate',
        'ReZ + Branded coins'
      ],
      contact: {
        phone: '+91-9876543211',
        email: 'events@greenearth.org'
      },
      schedule: [
        { time: '7:00 AM', activity: 'Assembly & Breakfast' },
        { time: '7:30 AM', activity: 'Site allocation & Tools distribution' },
        { time: '8:00 AM', activity: 'Plantation begins' },
        { time: '10:30 AM', activity: 'Certificates & Photo session' }
      ]
    },
    '3': {
      type: 'cleanup',
      title: 'Beach Cleanup Drive',
      icon: '🏖️',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#3B82F6',
      organizer: 'Clean Beaches Initiative',
      logo: '🌊',
      date: 'Jan 2, 2025',
      time: '6:00 AM - 9:00 AM',
      location: 'Marina Beach',
      fullAddress: 'Marina Beach, Chennai, Tamil Nadu 600001',
      distance: '8.5 km',
      rewards: { rezCoins: 120, brandedCoins: 80, brandName: 'Clean Beaches' },
      enrolled: 89,
      goal: 150,
      impact: 'Clean 5 km of coastline',
      status: 'upcoming',
      description: 'Join us in keeping our beaches clean! Participate in this beach cleanup drive and help protect marine life. All equipment will be provided.',
      requirements: [
        'Comfortable clothes you can get dirty',
        'Closed-toe shoes (no flip-flops)',
        'Sun protection essential',
        'Bring reusable water bottle',
        'Gloves will be provided'
      ],
      benefits: [
        'Protect marine ecosystem',
        'Morning refreshments',
        'Cleanup completion certificate',
        'ReZ + Branded coins',
        'Photo with collected waste stats'
      ],
      contact: {
        phone: '+91-9876543212',
        email: 'cleanup@cleanbeaches.org'
      },
      schedule: [
        { time: '6:00 AM', activity: 'Registration & Equipment' },
        { time: '6:30 AM', activity: 'Beach Cleanup begins' },
        { time: '8:30 AM', activity: 'Waste sorting & counting' },
        { time: '9:00 AM', activity: 'Certificates & Group photo' }
      ]
    },
    '4': {
      type: 'ngo-volunteer',
      title: 'Community Kitchen Volunteering',
      icon: '🍲',
      iconBg: 'rgba(249, 115, 22, 0.2)',
      iconColor: '#F97316',
      organizer: 'Feed the Need NGO',
      logo: '🤝',
      date: 'Every Sunday',
      time: '11:00 AM - 2:00 PM',
      location: 'Community Center, MG Road',
      fullAddress: 'Community Center, MG Road, Bangalore, Karnataka 560001',
      distance: '3.7 km',
      rewards: { rezCoins: 100, brandedCoins: 0 },
      enrolled: 45,
      goal: 100,
      impact: 'Feed 200+ people',
      status: 'ongoing',
      description: 'Help us serve nutritious meals to those in need. Volunteers assist in cooking, serving, and cleanup. A fulfilling way to give back to the community.',
      requirements: [
        'Available for 3 hours every Sunday',
        'Basic hygiene (hair tied, clean hands)',
        'Comfortable closed shoes',
        'Food handlers training provided',
        'Age 16+ (or with guardian)'
      ],
      benefits: [
        'Make real impact in community',
        'Free lunch provided',
        'Volunteer certificate (monthly)',
        'ReZ Coins weekly',
        'Meet like-minded people'
      ],
      contact: {
        phone: '+91-9876543213',
        email: 'volunteer@feedtheneed.org'
      },
      schedule: [
        { time: '11:00 AM', activity: 'Arrival & Briefing' },
        { time: '11:30 AM', activity: 'Food preparation begins' },
        { time: '12:30 PM', activity: 'Serving meals' },
        { time: '1:30 PM', activity: 'Cleanup & Debrief' }
      ]
    }
  };

  const event = events[id] || events['1'];

  const handleCall = () => {
    Linking.openURL(`tel:${event.contact.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${event.contact.email}`);
  };

  const handleMaps = () => {
    // In a real app, you'd use a maps library like react-native-maps or Linking to open maps
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.fullAddress)}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#111827'} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>{event.title}</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{event.organizer}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={24} color={isDark ? '#FFF' : '#111827'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Hero Image */}
          <View style={[styles.heroImage, { backgroundColor: event.iconBg }]}>
            <Text style={styles.heroIcon}>{event.icon}</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
              <View style={styles.infoHeader}>
                <Ionicons name="calendar" size={16} color="#3B82F6" />
                <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Date</Text>
              </View>
              <Text style={[styles.infoValue, { color: isDark ? '#FFF' : '#111827' }]}>{event.date}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
              <View style={styles.infoHeader}>
                <Ionicons name="time" size={16} color="#F97316" />
                <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Time</Text>
              </View>
              <Text style={[styles.infoValue, { color: isDark ? '#FFF' : '#111827' }]}>{event.time}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color="#EF4444" />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationTitle, { color: isDark ? '#FFF' : '#111827' }]}>{event.location}</Text>
                <Text style={[styles.locationAddress, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{event.fullAddress}</Text>
                <Text style={[styles.locationDistance, { color: '#3B82F6' }]}>{event.distance} away</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleMaps} style={[styles.mapsButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
              <Text style={[styles.mapsButtonText, { color: '#3B82F6' }]}>Open in Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>About This Event</Text>
            <Text style={[styles.sectionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{event.description}</Text>
          </View>

          {/* Impact & Progress */}
          <LinearGradient
            colors={isDark ? ['rgba(16, 185, 129, 0.1)', 'rgba(20, 184, 166, 0.1)'] : ['#ECFDF5', '#F0FDFA']}
            style={[styles.impactCard, { borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' }]}
          >
            <View style={styles.impactHeader}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={[styles.impactTitle, { color: isDark ? '#FFF' : '#111827' }]}>Expected Impact</Text>
            </View>
            <Text style={[styles.impactText, { color: isDark ? '#6EE7B7' : '#047857' }]}>{event.impact}</Text>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Participants</Text>
              <Text style={[styles.progressValue, { color: '#10B981' }]}>
                {event.enrolled}/{event.goal}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
              <LinearGradient
                colors={['#10B981', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(event.enrolled / event.goal) * 100}%` }]}
              />
            </View>
          </LinearGradient>

          {/* Rewards */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Rewards</Text>
            </View>
            <View style={styles.rewardsList}>
              <View style={[styles.rewardCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardEmoji}>💰</Text>
                  <Text style={[styles.rewardLabel, { color: isDark ? '#FFF' : '#111827' }]}>ReZ Coins</Text>
                </View>
                <Text style={[styles.rewardAmount, { color: '#10B981' }]}>+{event.rewards.rezCoins}</Text>
              </View>
              {event.rewards.brandedCoins > 0 && (
                <View style={[styles.rewardCard, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#FAF5FF' }]}>
                  <View style={styles.rewardHeader}>
                    <Text style={styles.rewardEmoji}>🏪</Text>
                    <Text style={[styles.rewardLabel, { color: isDark ? '#FFF' : '#111827' }]}>{event.rewards.brandName} Coins</Text>
                  </View>
                  <Text style={[styles.rewardAmount, { color: '#A855F7' }]}>+{event.rewards.brandedCoins}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Requirements */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Requirements</Text>
            </View>
            <View style={styles.list}>
              {event.requirements.map((req: string, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.listText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{req}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Benefits */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>What You Get</Text>
            </View>
            <View style={styles.list}>
              {event.benefits.map((benefit: string, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <View style={[styles.benefitDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.listText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Event Schedule</Text>
            <View style={styles.scheduleList}>
              {event.schedule.map((item: any, idx: number) => (
                <View key={idx} style={styles.scheduleItem}>
                  <Text style={[styles.scheduleTime, { color: '#3B82F6' }]}>{item.time}</Text>
                  <Text style={[styles.scheduleActivity, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{item.activity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Contact Organizer</Text>
            <View style={styles.contactList}>
              <TouchableOpacity onPress={handleCall} style={styles.contactItem}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={[styles.contactText, { color: '#3B82F6' }]}>{event.contact.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEmail} style={styles.contactItem}>
                <Ionicons name="mail" size={20} color="#EF4444" />
                <Text style={[styles.contactText, { color: '#3B82F6' }]}>{event.contact.email}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Registration Button */}
      <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]}>
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isRegistered || event.status === 'completed'}
          style={[
            styles.registerButton,
            isRegistered && { backgroundColor: '#10B981' },
            event.status === 'completed' && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
          ]}
        >
          {!isRegistered && event.status !== 'completed' ? (
            <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.registerButtonGradient}>
              <Text style={styles.registerButtonText}>Register Now</Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.registerButtonText, { color: isRegistered ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }]}>
              {isRegistered ? '✓ Registered Successfully' : 'Event Completed'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : '#FFF' }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#111827' }]}>Processing...</Text>
            <Text style={[styles.modalText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Confirming your registration</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  heroImage: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    fontSize: 64,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    marginBottom: 8,
  },
  locationDistance: {
    fontSize: 12,
  },
  mapsButton: {
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  impactCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  impactText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardEmoji: {
    fontSize: 18,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listText: {
    fontSize: 14,
    flex: 1,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
  },
  scheduleActivity: {
    fontSize: 14,
    flex: 1,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.1)',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    margin: 16,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
  },
});

export default SocialImpactEventDetail;

