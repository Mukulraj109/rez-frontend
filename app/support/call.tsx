// Call Support Page
// Phone support options with callback request

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

const SUPPORT_HOURS = {
  weekdays: '9:00 AM - 9:00 PM',
  weekends: '10:00 AM - 6:00 PM',
  holidays: 'Closed',
};

const ISSUE_CATEGORIES = [
  { id: 'orders', label: 'Orders & Delivery', icon: 'cube-outline' },
  { id: 'payments', label: 'Payments & Refunds', icon: 'wallet-outline' },
  { id: 'wallet', label: 'Wallet & Coins', icon: 'diamond-outline' },
  { id: 'account', label: 'Account Issues', icon: 'person-outline' },
  { id: 'offers', label: 'Offers & Promotions', icon: 'pricetag-outline' },
  { id: 'other', label: 'Other', icon: 'help-circle-outline' },
];

export default function CallSupportPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCallNow = async () => {
    await Linking.openURL('tel:18001234567');
  };

  const handleRequestCallback = async () => {
    if (!selectedCategory || !phoneNumber) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCallbackRequested(true);
    } finally {
      setLoading(false);
    }
  };

  const isWithinSupportHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    if (day === 0 || day === 6) {
      return hour >= 10 && hour < 18;
    }
    return hour >= 9 && hour < 21;
  };

  const isOpen = isWithinSupportHours();

  if (callbackRequested) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        <LinearGradient
          colors={[Colors.primary[600], Colors.secondary[700]]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Call Support</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <ThemedText style={styles.successTitle}>Callback Requested!</ThemedText>
          <ThemedText style={styles.successText}>
            Our support team will call you at{'\n'}{phoneNumber}{'\n'}within the next 30 minutes
          </ThemedText>
          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <ThemedText style={styles.successLabel}>Category</ThemedText>
              <ThemedText style={styles.successValue}>
                {ISSUE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </ThemedText>
            </View>
            {notes && (
              <View style={styles.successRow}>
                <ThemedText style={styles.successLabel}>Notes</ThemedText>
                <ThemedText style={styles.successValue}>{notes}</ThemedText>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Call Support</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, isOpen ? styles.statusOpen : styles.statusClosed]}>
          <View style={[styles.statusDot, isOpen && styles.statusDotOpen]} />
          <ThemedText style={styles.statusText}>
            {isOpen ? 'Support is available now' : 'Support is currently closed'}
          </ThemedText>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursCard}>
          <ThemedText style={styles.hoursTitle}>Support Hours</ThemedText>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.hoursLabel}>Monday - Friday</ThemedText>
            <ThemedText style={styles.hoursValue}>{SUPPORT_HOURS.weekdays}</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.hoursLabel}>Saturday - Sunday</ThemedText>
            <ThemedText style={styles.hoursValue}>{SUPPORT_HOURS.weekends}</ThemedText>
          </View>
        </View>

        {/* Call Now Option */}
        {isOpen && (
          <TouchableOpacity style={styles.callNowCard} onPress={handleCallNow}>
            <View style={styles.callNowIcon}>
              <Ionicons name="call" size={32} color={Colors.success} />
            </View>
            <View style={styles.callNowContent}>
              <ThemedText style={styles.callNowTitle}>Call Now</ThemedText>
              <ThemedText style={styles.callNowNumber}>1800-123-4567</ThemedText>
              <ThemedText style={styles.callNowSubtext}>Toll Free</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}

        {/* Callback Request Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Request a Callback</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            We'll call you back within 30 minutes
          </ThemedText>

          {/* Category Selection */}
          <ThemedText style={styles.inputLabel}>What do you need help with?</ThemedText>
          <View style={styles.categoriesGrid}>
            {ISSUE_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={selectedCategory === category.id ? Colors.primary[600] : Colors.text.tertiary}
                />
                <ThemedText style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelSelected,
                ]}>
                  {category.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone Number */}
          <ThemedText style={styles.inputLabel}>Your Phone Number</ThemedText>
          <View style={styles.phoneInput}>
            <ThemedText style={styles.phonePrefix}>+91</ThemedText>
            <TextInput
              style={styles.phoneTextInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter 10-digit number"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Notes */}
          <ThemedText style={styles.inputLabel}>Additional Notes (Optional)</ThemedText>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe your issue briefly..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={200}
          />
        </View>

        {/* Request Button */}
        <TouchableOpacity
          style={[
            styles.requestButton,
            (!selectedCategory || phoneNumber.length < 10) && styles.requestButtonDisabled,
          ]}
          onPress={handleRequestCallback}
          disabled={!selectedCategory || phoneNumber.length < 10 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="call-outline" size={20} color="#FFF" />
              <ThemedText style={styles.requestButtonText}>Request Callback</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <ThemedText style={styles.infoText}>
            Callbacks are available during support hours. If you request outside hours,
            we'll call you when we open.
          </ThemedText>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  statusOpen: {
    backgroundColor: Colors.success + '15',
  },
  statusClosed: {
    backgroundColor: Colors.gray[200],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray[400],
  },
  statusDotOpen: {
    backgroundColor: Colors.success,
  },
  statusText: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  hoursCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  hoursTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  hoursLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  hoursValue: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  callNowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  callNowIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callNowContent: {
    flex: 1,
  },
  callNowTitle: {
    ...Typography.label,
    color: Colors.success,
  },
  callNowNumber: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  callNowSubtext: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.subtle,
  },
  categoryCardSelected: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  categoryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
    overflow: 'hidden',
  },
  phonePrefix: {
    ...Typography.label,
    color: Colors.text.primary,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  phoneTextInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  notesInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  requestButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  requestButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successCard: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  successLabel: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  successValue: {
    ...Typography.label,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  doneButton: {
    width: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  doneButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
});
