// Report Fraud Page
// Report fraudulent activity

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

const FRAUD_TYPES = [
  { id: 'fake_offer', label: 'Fake Offer/Discount', icon: 'pricetag-outline' },
  { id: 'unauthorized_transaction', label: 'Unauthorized Transaction', icon: 'card-outline' },
  { id: 'phishing', label: 'Phishing Attempt', icon: 'fish-outline' },
  { id: 'fake_store', label: 'Fake Store/Merchant', icon: 'storefront-outline' },
  { id: 'account_compromise', label: 'Account Compromised', icon: 'shield-outline' },
  { id: 'other', label: 'Other Fraud', icon: 'alert-circle-outline' },
];

export default function ReportFraudPage() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState('');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(a => a.uri);
      setEvidence(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedType || !description) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReportId('FRD-' + Date.now());
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            <ThemedText style={styles.headerTitle}>Report Fraud</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={80} color={Colors.success} />
          </View>
          <ThemedText style={styles.successTitle}>Report Submitted</ThemedText>
          <ThemedText style={styles.successText}>
            Thank you for reporting this incident.{'\n'}
            Our fraud team will investigate and take appropriate action.
          </ThemedText>
          <View style={styles.reportIdCard}>
            <ThemedText style={styles.reportIdLabel}>Report ID</ThemedText>
            <ThemedText style={styles.reportIdValue}>{reportId}</ThemedText>
            <ThemedText style={styles.reportIdNote}>
              Save this for future reference
            </ThemedText>
          </View>
          <View style={styles.nextSteps}>
            <ThemedText style={styles.nextStepsTitle}>What happens next?</ThemedText>
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>1</ThemedText></View>
              <ThemedText style={styles.stepText}>Our team reviews your report within 24 hours</ThemedText>
            </View>
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>2</ThemedText></View>
              <ThemedText style={styles.stepText}>We may contact you for additional information</ThemedText>
            </View>
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>3</ThemedText></View>
              <ThemedText style={styles.stepText}>You'll receive an email with the investigation outcome</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
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
          <ThemedText style={styles.headerTitle}>Report Fraud</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="shield-outline" size={24} color={Colors.warning} />
          <ThemedText style={styles.warningText}>
            If you suspect your account is compromised, change your password immediately.
          </ThemedText>
        </View>

        {/* Fraud Type */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Type of Incident *</ThemedText>
          <View style={styles.typesGrid}>
            {FRAUD_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={selectedType === type.id ? Colors.error : Colors.text.tertiary}
                />
                <ThemedText style={[
                  styles.typeLabel,
                  selectedType === type.id && styles.typeLabelSelected,
                ]}>
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction Reference */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Transaction/Order ID (if applicable)</ThemedText>
          <TextInput
            style={styles.textInput}
            value={transactionId}
            onChangeText={setTransactionId}
            placeholder="e.g., ORD-2024-001234"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Describe what happened *</ThemedText>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Please provide details about the fraudulent activity..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={1000}
          />
          <ThemedText style={styles.charCount}>{description.length}/1000</ThemedText>
        </View>

        {/* Evidence Upload */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upload Evidence (Optional)</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Screenshots, messages, or any relevant images
          </ThemedText>
          <View style={styles.evidenceContainer}>
            {evidence.map((uri, index) => (
              <View key={index} style={styles.evidenceItem}>
                <Image source={{ uri }} style={styles.evidenceImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {evidence.length < 5 && (
              <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
                <Ionicons name="add" size={32} color={Colors.text.tertiary} />
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact Email */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Email *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="your@email.com"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedType || !description || !contactEmail) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedType || !description || !contactEmail || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="#FFF" />
              <ThemedText style={styles.submitButtonText}>Submit Report</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerText}>
            By submitting this report, you confirm that the information provided is true
            and accurate to the best of your knowledge. False reports may result in account suspension.
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  warningText: {
    ...Typography.body,
    color: Colors.warning,
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
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
  typeCardSelected: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  typeLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: Colors.error,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    ...Shadows.subtle,
  },
  textArea: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  evidenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  evidenceItem: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray[300],
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  submitButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  disclaimer: {
    padding: Spacing.md,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
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
  reportIdCard: {
    width: '100%',
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  reportIdLabel: {
    ...Typography.caption,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  reportIdValue: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  reportIdNote: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  nextSteps: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  nextStepsTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...Typography.labelSmall,
    color: Colors.primary[600],
  },
  stepText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
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
