// Student Zone Page
// Student-exclusive offers with verification

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

interface StudentOffer {
  id: string;
  title: string;
  store: string;
  discount: string;
  category: string;
  image: string;
}

const MOCK_OFFERS: StudentOffer[] = [
  { id: '1', title: '50% Off on Courses', store: 'Udemy', discount: '50%', category: 'Education', image: '📚' },
  { id: '2', title: 'Student Meal Deal', store: 'McDonalds', discount: '30%', category: 'Food', image: '🍔' },
  { id: '3', title: 'Free Premium 6 Months', store: 'Spotify', discount: 'FREE', category: 'Entertainment', image: '🎵' },
  { id: '4', title: '₹200 Off First Order', store: 'Amazon', discount: '₹200', category: 'Shopping', image: '📦' },
  { id: '5', title: 'Cinema Tickets 40% Off', store: 'PVR', discount: '40%', category: 'Entertainment', image: '🎬' },
];

export default function StudentZonePage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');

  const handleVerifyEmail = async () => {
    if (!email.endsWith('.edu') && !email.endsWith('.edu.in')) {
      alert('Please enter a valid educational email');
      return;
    }

    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setVerifying(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setVerifying(false);
    setIsVerified(true);
  };

  const renderOffer = ({ item }: { item: StudentOffer }) => (
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
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Student Zone</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.verifyContent}>
          <View style={styles.verifyIcon}>
            <ThemedText style={styles.verifyEmoji}>🎓</ThemedText>
          </View>
          <ThemedText style={styles.verifyTitle}>Student Verification</ThemedText>
          <ThemedText style={styles.verifySubtitle}>
            Verify your student status to unlock exclusive discounts
          </ThemedText>

          {step === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Educational Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="yourname@university.edu"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <ThemedText style={styles.inputHint}>
                  Use your .edu or .edu.in email address
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

              <View style={styles.altVerify}>
                <ThemedText style={styles.altVerifyText}>Don't have an .edu email?</ThemedText>
                <TouchableOpacity>
                  <ThemedText style={styles.altVerifyLink}>Verify with Student ID</ThemedText>
                </TouchableOpacity>
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
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Student Zone</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <ThemedText style={styles.verifiedText}>Student Verified</ThemedText>
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
            <ThemedText style={styles.statsTitle}>🎓 Student Exclusive Savings</ThemedText>
            <ThemedText style={styles.statsValue}>Save up to ₹5,000/month</ThemedText>
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
    backgroundColor: '#6366F1' + '15',
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
    backgroundColor: '#6366F1',
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
  altVerify: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  altVerifyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  altVerifyLink: {
    ...Typography.label,
    color: '#6366F1',
  },
  changeEmailText: {
    ...Typography.body,
    color: '#6366F1',
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
    backgroundColor: '#6366F1' + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366F1' + '30',
  },
  statsTitle: {
    ...Typography.label,
    color: '#6366F1',
    marginBottom: Spacing.xs,
  },
  statsValue: {
    ...Typography.h3,
    color: Colors.text.primary,
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
