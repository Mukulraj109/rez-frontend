// Employee Zone Page
// Corporate employee offers

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface EmployeeOffer {
  id: string;
  title: string;
  store: string;
  discount: string;
  category: string;
  image: string;
}

const MOCK_OFFERS: EmployeeOffer[] = [
  { id: '1', title: 'Corporate Gym Membership', store: 'Gold\'s Gym', discount: '40%', category: 'Fitness', image: '🏋️' },
  { id: '2', title: 'Office Lunch Deals', store: 'Swiggy Corporate', discount: '25%', category: 'Food', image: '🍱' },
  { id: '3', title: 'Business Attire Sale', store: 'Van Heusen', discount: '35%', category: 'Fashion', image: '👔' },
  { id: '4', title: 'Laptop Insurance', store: 'Digit', discount: '20%', category: 'Insurance', image: '💻' },
  { id: '5', title: 'Mental Wellness', store: 'Practo', discount: '30%', category: 'Health', image: '🧘' },
];

const PARTNER_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'HCL'
];

export default function EmployeeZonePage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [company, setCompany] = useState('');

  const handleVerifyEmail = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid corporate email');
      return;
    }

    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Extract company name from email domain
    const domain = email.split('@')[1]?.split('.')[0] || '';
    setCompany(domain.charAt(0).toUpperCase() + domain.slice(1));
    setVerifying(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setVerifying(false);
    setIsVerified(true);
  };

  const renderOffer = ({ item }: { item: EmployeeOffer }) => (
    <TouchableOpacity style={styles.offerCard}>
      <View style={styles.offerImage}>
        <ThemedText style={styles.offerEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.offerInfo}>
        <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.offerStore}>{item.store}</ThemedText>
        <View style={styles.offerMeta}>
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>{item.discount} OFF</ThemedText>
          </View>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  if (!isVerified) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Employee Zone</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.verifyContent}>
          <View style={styles.verifyIcon}>
            <ThemedText style={styles.verifyEmoji}>💼</ThemedText>
          </View>
          <ThemedText style={styles.verifyTitle}>Employee Verification</ThemedText>
          <ThemedText style={styles.verifySubtitle}>
            Verify your corporate email to unlock exclusive employee benefits
          </ThemedText>

          {step === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Corporate Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="yourname@company.com"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <ThemedText style={styles.inputHint}>
                  Use your official work email address
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, !email && styles.verifyButtonDisabled]}
                onPress={handleVerifyEmail}
                disabled={!email || verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.verifyButtonText}>Send Verification Code</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.partnersSection}>
                <ThemedText style={styles.partnersTitle}>Partner Companies</ThemedText>
                <View style={styles.partnersList}>
                  {PARTNER_COMPANIES.map(company => (
                    <View key={company} style={styles.partnerBadge}>
                      <ThemedText style={styles.partnerText}>{company}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Verification Code</ThemedText>
                <ThemedText style={styles.otpSentText}>
                  We've sent a code to {email}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, otp.length < 6 && styles.verifyButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={otp.length < 6 || verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('email')}>
                <ThemedText style={styles.changeEmailText}>Change email</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
      <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Employee Zone</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <ThemedText style={styles.verifiedText}>{company} Employee</ThemedText>
        </View>
      </LinearGradient>

      <FlatList
        data={MOCK_OFFERS}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.statsCard}>
            <ThemedText style={styles.statsTitle}>💼 Corporate Benefits</ThemedText>
            <ThemedText style={styles.statsValue}>Exclusive discounts for {company} employees</ThemedText>
          </View>
        }
      />
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
  content: {
    flex: 1,
  },
  verifyContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  verifyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0EA5E9' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  verifyEmoji: {
    fontSize: 48,
  },
  verifyTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  verifySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    ...Shadows.subtle,
  },
  inputHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  otpSentText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  verifyButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  changeEmailText: {
    ...Typography.body,
    color: '#0EA5E9',
  },
  partnersSection: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  partnersTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  partnersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  partnerBadge: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  partnerText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  verifiedText: {
    ...Typography.label,
    color: '#FFF',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  statsCard: {
    backgroundColor: '#0EA5E9' + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0EA5E9' + '30',
  },
  statsTitle: {
    ...Typography.label,
    color: '#0EA5E9',
    marginBottom: Spacing.xs,
  },
  statsValue: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  offerImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerEmoji: {
    fontSize: 28,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  offerStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  discountBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});
