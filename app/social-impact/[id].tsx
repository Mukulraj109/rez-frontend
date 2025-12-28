import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
};

interface EventData {
  type: string;
  title: string;
  icon: string;
  iconBg: string;
  organizer: string;
  sponsor: string | null;
  csrActivity: boolean;
  logo: string;
  date: string;
  time: string;
  location: string;
  fullAddress: string;
  distance: string;
  rewards: { rezCoins: number; brandCoins: number; brandName: string | null };
  enrolled: number;
  goal: number;
  impact: string;
  status: string;
  description: string;
  requirements: string[];
  benefits: string[];
  contact: { phone: string; email: string };
  schedule: { time: string; activity: string }[];
}

const eventsData: Record<string, EventData> = {
  '1': {
    type: 'blood-donation',
    title: 'Blood Donation Drive',
    icon: '🩸',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    organizer: 'Apollo Hospitals',
    sponsor: 'Tata Group',
    csrActivity: true,
    logo: '🏥',
    date: 'Dec 28, 2024',
    time: '9:00 AM - 5:00 PM',
    location: 'Apollo Hospital, Sector 18',
    fullAddress: 'Apollo Hospitals, Sector 18, Noida, Uttar Pradesh 201301',
    distance: '2.3 km',
    rewards: { rezCoins: 200, brandCoins: 300, brandName: 'Tata Coins' },
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
      'Fasting not required, eat normally',
    ],
    benefits: [
      'Free health checkup',
      'Refreshments provided',
      'Blood donor certificate',
      'ReZ Coins + Tata brand coins',
      'Priority access to blood bank if needed',
    ],
    contact: { phone: '+91-9876543210', email: 'blooddrive@apollo.com' },
    schedule: [
      { time: '9:00 AM', activity: 'Registration & Check-in' },
      { time: '9:30 AM', activity: 'Health Screening' },
      { time: '10:00 AM', activity: 'Blood Donation' },
      { time: '4:30 PM', activity: 'Refreshments & Certificate' },
    ],
  },
  '2': {
    type: 'tree-plantation',
    title: 'Green India Mission',
    icon: '🌳',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    organizer: 'Green Earth Foundation',
    sponsor: 'Reliance Industries',
    csrActivity: true,
    logo: '🌍',
    date: 'Dec 30, 2024',
    time: '7:00 AM - 11:00 AM',
    location: 'City Park, Botanical Gardens',
    fullAddress: 'Botanical Gardens, Sector 38, Noida, Uttar Pradesh 201303',
    distance: '4.1 km',
    rewards: { rezCoins: 150, brandCoins: 250, brandName: 'Reliance Coins' },
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
      'Minimum age 12 years (with guardian)',
    ],
    benefits: [
      'Contribute to environmental conservation',
      'Learn about native tree species',
      'Breakfast and refreshments',
      'Tree adoption certificate',
      'ReZ + Branded coins',
    ],
    contact: { phone: '+91-9876543211', email: 'events@greenearth.org' },
    schedule: [
      { time: '7:00 AM', activity: 'Assembly & Breakfast' },
      { time: '7:30 AM', activity: 'Site allocation & Tools distribution' },
      { time: '8:00 AM', activity: 'Plantation begins' },
      { time: '10:30 AM', activity: 'Certificates & Photo session' },
    ],
  },
  '3': {
    type: 'cleanup',
    title: 'Beach Cleanup Drive',
    icon: '🏖️',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    organizer: 'Clean Beaches Initiative',
    sponsor: 'Infosys Foundation',
    csrActivity: true,
    logo: '🌊',
    date: 'Jan 2, 2025',
    time: '6:00 AM - 9:00 AM',
    location: 'Marina Beach',
    fullAddress: 'Marina Beach, Chennai, Tamil Nadu 600001',
    distance: '8.5 km',
    rewards: { rezCoins: 120, brandCoins: 180, brandName: 'Infosys Coins' },
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
      'Gloves will be provided',
    ],
    benefits: [
      'Protect marine ecosystem',
      'Morning refreshments',
      'Cleanup completion certificate',
      'ReZ + Branded coins',
      'Photo with collected waste stats',
    ],
    contact: { phone: '+91-9876543212', email: 'cleanup@cleanbeaches.org' },
    schedule: [
      { time: '6:00 AM', activity: 'Registration & Equipment' },
      { time: '6:30 AM', activity: 'Beach Cleanup begins' },
      { time: '8:30 AM', activity: 'Waste sorting & counting' },
      { time: '9:00 AM', activity: 'Certificates & Group photo' },
    ],
  },
  '4': {
    type: 'education',
    title: 'Digital Literacy Program',
    icon: '📚',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    organizer: 'Teach India Initiative',
    sponsor: 'Wipro',
    csrActivity: true,
    logo: '✏️',
    date: 'Jan 5, 2025',
    time: '2:00 PM - 5:00 PM',
    location: 'Government School, Whitefield',
    fullAddress: 'Government School, Whitefield, Bangalore, Karnataka 560066',
    distance: '5.2 km',
    rewards: { rezCoins: 180, brandCoins: 220, brandName: 'Wipro Coins' },
    enrolled: 67,
    goal: 100,
    impact: 'Teach 50+ students',
    status: 'upcoming',
    description: 'Volunteer to teach basic computer and smartphone skills to students. Help bridge the digital divide and empower young minds with essential tech knowledge.',
    requirements: [
      'Basic computer/smartphone knowledge',
      'Patient and friendly demeanor',
      'Available for 3 hours',
      'Teaching materials provided',
      'Age 16+ (or with guardian)',
    ],
    benefits: [
      'Make real impact in digital inclusion',
      'Teaching experience certificate',
      'Volunteer certificate',
      'ReZ Coins + Wipro brand coins',
      'Meet like-minded people',
    ],
    contact: { phone: '+91-9876543213', email: 'volunteer@teachindia.org' },
    schedule: [
      { time: '2:00 PM', activity: 'Arrival & Briefing' },
      { time: '2:30 PM', activity: 'Session 1: Basic smartphone usage' },
      { time: '3:30 PM', activity: 'Session 2: Online safety & apps' },
      { time: '4:30 PM', activity: 'Q&A & Certificates' },
    ],
  },
  '5': {
    type: 'food-drive',
    title: 'Hunger-Free India Campaign',
    icon: '🍲',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    organizer: 'Feed the Need NGO',
    sponsor: 'ITC Limited',
    csrActivity: true,
    logo: '🤝',
    date: 'Every Sunday',
    time: '11:00 AM - 2:00 PM',
    location: 'Community Center, MG Road',
    fullAddress: 'Community Center, MG Road, Bangalore, Karnataka 560001',
    distance: '3.7 km',
    rewards: { rezCoins: 100, brandCoins: 150, brandName: 'ITC Coins' },
    enrolled: 145,
    goal: 200,
    impact: 'Feed 200+ people',
    status: 'ongoing',
    description: 'Help distribute meals to underprivileged families. Every Sunday, join us in serving food and spreading smiles to those in need.',
    requirements: [
      'Willingness to serve',
      'Comfortable clothes',
      'Be punctual',
      'Follow hygiene protocols',
      'Minimum age 14 years',
    ],
    benefits: [
      'Direct impact on hunger relief',
      'Volunteer certificate',
      'ReZ + ITC branded coins',
      'Lunch provided',
      'Community service hours',
    ],
    contact: { phone: '+91-9876543214', email: 'volunteer@feedtheneed.org' },
    schedule: [
      { time: '11:00 AM', activity: 'Arrival & Briefing' },
      { time: '11:30 AM', activity: 'Food preparation assistance' },
      { time: '12:00 PM', activity: 'Meal distribution' },
      { time: '1:30 PM', activity: 'Cleanup & Certificates' },
    ],
  },
  '6': {
    type: 'skill-training',
    title: 'Women Empowerment Workshop',
    icon: '💪',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    organizer: 'Skill India Mission',
    sponsor: 'HDFC Bank',
    csrActivity: true,
    logo: '👩',
    date: 'Jan 8, 2025',
    time: '10:00 AM - 4:00 PM',
    location: 'HDFC Training Center, HSR Layout',
    fullAddress: 'HDFC Training Center, HSR Layout, Bangalore, Karnataka 560102',
    distance: '6.4 km',
    rewards: { rezCoins: 200, brandCoins: 300, brandName: 'HDFC Coins' },
    enrolled: 78,
    goal: 120,
    impact: 'Empower 60+ women',
    status: 'upcoming',
    description: 'Volunteer to help conduct skill development workshops for women. Assist in teaching financial literacy, digital skills, and entrepreneurship basics.',
    requirements: [
      'Good communication skills',
      'Knowledge of basic finance/digital tools',
      'Available for full day',
      'Training materials provided',
      'Age 18+',
    ],
    benefits: [
      'Help empower women economically',
      'Professional development',
      'Volunteer certificate from HDFC',
      'ReZ + HDFC branded coins',
      'Networking opportunities',
    ],
    contact: { phone: '+91-9876543215', email: 'volunteer@skillindia.org' },
    schedule: [
      { time: '10:00 AM', activity: 'Welcome & Introduction' },
      { time: '10:30 AM', activity: 'Session 1: Financial Literacy' },
      { time: '1:00 PM', activity: 'Lunch Break' },
      { time: '2:00 PM', activity: 'Session 2: Digital Skills' },
      { time: '3:30 PM', activity: 'Certificates & Closing' },
    ],
  },
  '7': {
    type: 'health-camp',
    title: 'Free Health Checkup Camp',
    icon: '⚕️',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    organizer: 'Healthcare for All',
    sponsor: 'Sun Pharma',
    csrActivity: true,
    logo: '🏥',
    date: 'Jan 12, 2025',
    time: '8:00 AM - 12:00 PM',
    location: 'Community Hall, JP Nagar',
    fullAddress: 'Community Hall, JP Nagar, Bangalore, Karnataka 560078',
    distance: '7.1 km',
    rewards: { rezCoins: 170, brandCoins: 230, brandName: 'Sun Pharma Coins' },
    enrolled: 112,
    goal: 180,
    impact: 'Serve 300+ patients',
    status: 'upcoming',
    description: 'Volunteer at a free health checkup camp. Help with registration, crowd management, and assist medical professionals in serving the community.',
    requirements: [
      'Basic first aid knowledge (preferred)',
      'Good communication skills',
      'Comfortable standing for long hours',
      'Training provided on-site',
      'Age 18+',
    ],
    benefits: [
      'Healthcare volunteering experience',
      'Learn basic health screening',
      'Volunteer certificate',
      'ReZ + Sun Pharma branded coins',
      'Free health checkup for volunteers',
    ],
    contact: { phone: '+91-9876543216', email: 'volunteer@healthcareforall.org' },
    schedule: [
      { time: '8:00 AM', activity: 'Volunteer briefing' },
      { time: '8:30 AM', activity: 'Registration desk setup' },
      { time: '9:00 AM', activity: 'Health camp begins' },
      { time: '11:30 AM', activity: 'Wrap up & Certificates' },
    ],
  },
  '8': {
    type: 'blood-donation',
    title: 'Emergency Blood Camp',
    icon: '🩸',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    organizer: 'Red Cross Society',
    sponsor: null,
    csrActivity: false,
    logo: '❤️',
    date: 'Dec 26, 2024',
    time: 'Completed',
    location: 'City Hospital',
    fullAddress: 'City Hospital, Central Road, Delhi 110001',
    distance: '1.8 km',
    rewards: { rezCoins: 200, brandCoins: 0, brandName: null },
    enrolled: 312,
    goal: 300,
    impact: 'Saved 900+ lives',
    status: 'completed',
    description: 'Emergency blood donation camp organized to meet critical blood shortage. Thanks to all donors who participated!',
    requirements: [
      'Age between 18-65 years',
      'Weight above 50kg',
      'Valid ID proof required',
      'No recent illness or medication',
      'Fasting not required',
    ],
    benefits: [
      'Free health checkup',
      'Refreshments provided',
      'Blood donor certificate',
      'ReZ Coins reward',
      'Priority blood access',
    ],
    contact: { phone: '+91-9876543217', email: 'bloodcamp@redcross.org' },
    schedule: [
      { time: '8:00 AM', activity: 'Registration' },
      { time: '8:30 AM', activity: 'Health Screening' },
      { time: '9:00 AM', activity: 'Blood Donation' },
      { time: '12:00 PM', activity: 'Certificates' },
    ],
  },
};

export default function SocialImpactEventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isRegistered, setIsRegistered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const event = eventsData[id || '1'] || eventsData['1'];

  const handleRegister = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setIsRegistered(true);
      setShowConfirmation(false);
    }, 1500);
  };

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(event.fullAddress)}`,
      android: `geo:0,0?q=${encodeURIComponent(event.fullAddress)}`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = () => {
    Linking.openURL(`tel:${event.contact.phone}`);
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${event.contact.email}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>{event.title}</Text>
              {event.csrActivity && (
                <View style={styles.csrBadge}>
                  <Text style={styles.csrBadgeText}>CSR</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSubtitle}>{event.organizer}</Text>
            {event.sponsor && (
              <View style={styles.sponsorRow}>
                <Ionicons name="business" size={11} color="#8B5CF6" />
                <Text style={styles.sponsorText}>Sponsored by {event.sponsor}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Icon */}
          <View style={[styles.heroSection, { backgroundColor: event.iconBg }]}>
            <Text style={styles.heroEmoji}>{event.icon}</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoHeader}>
                <Ionicons name="calendar" size={16} color="#3B82F6" />
                <Text style={styles.quickInfoLabel}>Date</Text>
              </View>
              <Text style={styles.quickInfoValue}>{event.date}</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoHeader}>
                <Ionicons name="time" size={16} color="#F97316" />
                <Text style={styles.quickInfoLabel}>Time</Text>
              </View>
              <Text style={styles.quickInfoValue}>{event.time}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.sectionCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={18} color="#EF4444" />
              <View style={styles.locationContent}>
                <Text style={styles.locationTitle}>{event.location}</Text>
                <Text style={styles.locationAddress}>{event.fullAddress}</Text>
                <Text style={styles.locationDistance}>{event.distance} away</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
              <Text style={styles.mapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          {/* Impact & Progress */}
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Ionicons name="trending-up" size={18} color={COLORS.primary} />
              <Text style={styles.impactTitle}>Expected Impact</Text>
            </View>
            <Text style={styles.impactText}>{event.impact}</Text>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Participants</Text>
                <Text style={styles.progressValue}>{event.enrolled}/{event.goal}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${(event.enrolled / event.goal) * 100}%` }]}
                />
              </View>
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.rewardsCard}>
            <View style={styles.rewardsHeader}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text style={styles.rewardsTitle}>Participation Rewards</Text>
            </View>
            {event.sponsor && (
              <Text style={styles.rewardsSubtitle}>
                Double rewards: ReZ Coins + Brand Coins from CSR sponsor
              </Text>
            )}
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardItem}>
                <View style={styles.rewardIconRow}>
                  <Ionicons name="wallet" size={18} color={COLORS.primary} />
                  <Text style={styles.rewardLabel}>ReZ Coins</Text>
                </View>
                <Text style={styles.rewardValue}>+{event.rewards.rezCoins}</Text>
              </View>
              {event.rewards.brandCoins > 0 && (
                <View style={[styles.rewardItem, styles.rewardItemPurple]}>
                  <View style={styles.rewardIconRow}>
                    <Ionicons name="sparkles" size={18} color="#8B5CF6" />
                    <Text style={styles.rewardLabel}>Brand Coins</Text>
                  </View>
                  <Text style={[styles.rewardValue, { color: '#8B5CF6' }]}>+{event.rewards.brandCoins}</Text>
                  <Text style={styles.brandName}>{event.rewards.brandName}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="information-circle" size={18} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Requirements</Text>
            </View>
            {event.requirements.map((req, idx) => (
              <View key={idx} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.listText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Benefits */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="heart" size={18} color="#EF4444" />
              <Text style={styles.sectionTitle}>What You Get</Text>
            </View>
            {event.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Schedule */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Event Schedule</Text>
            {event.schedule.map((item, idx) => (
              <View key={idx} style={styles.scheduleItem}>
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <Text style={styles.scheduleActivity}>{item.activity}</Text>
              </View>
            ))}
          </View>

          {/* Contact */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Organizer</Text>
            <TouchableOpacity style={styles.contactItem} onPress={callPhone}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
              <Text style={styles.contactText}>{event.contact.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={sendEmail}>
              <Ionicons name="mail" size={18} color="#EF4444" />
              <Text style={styles.contactText}>{event.contact.email}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Register Button */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[
              styles.registerButton,
              isRegistered && styles.registeredButton,
              event.status === 'completed' && styles.completedButton,
            ]}
            onPress={handleRegister}
            disabled={isRegistered || event.status === 'completed'}
          >
            {isRegistered ? (
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary]}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.buttonText}>Registered Successfully</Text>
              </LinearGradient>
            ) : event.status === 'completed' ? (
              <View style={styles.disabledButtonInner}>
                <Text style={styles.disabledButtonText}>Event Completed</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[COLORS.primary, '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Register Now</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* Confirmation Modal */}
        <Modal visible={showConfirmation} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>Processing...</Text>
              <Text style={styles.modalSubtitle}>Confirming your registration</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  csrBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  csrBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sponsorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  shareButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 72,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  quickInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  locationDistance: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 6,
  },
  mapsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  impactCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  impactText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  rewardsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  rewardsSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  rewardItemPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  rewardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rewardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rewardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandName: {
    fontSize: 10,
    color: '#8B5CF6',
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  scheduleTime: {
    width: 70,
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scheduleActivity: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  registeredButton: {},
  completedButton: {},
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  disabledButtonInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  disabledButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
