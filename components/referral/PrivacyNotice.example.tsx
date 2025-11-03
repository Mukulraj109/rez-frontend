/**
 * PrivacyNotice Component Usage Examples
 *
 * This file demonstrates how to integrate the GDPR-compliant
 * PrivacyNotice component in various contexts.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PrivacyNotice } from './PrivacyNotice';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

/**
 * Example 1: Basic Usage on Referral Page
 */
export const ReferralPageExample = () => {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Refer a Friend</ThemedText>
        <ThemedText style={styles.description}>
          Share your referral code and earn rewards when your friends join!
        </ThemedText>

        {/* Your referral form/content here */}

        {/* Privacy Notice - Place at bottom of referral form */}
        <PrivacyNotice
          defaultExpanded={false}
          privacyPolicyUrl="https://rezapp.com/privacy"
        />
      </ThemedView>
    </ScrollView>
  );
};

/**
 * Example 2: Expanded by Default (for compliance emphasis)
 */
export const ExpandedPrivacyExample = () => {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Before You Refer</ThemedText>
      <ThemedText style={styles.description}>
        Please review our privacy practices:
      </ThemedText>

      <PrivacyNotice
        defaultExpanded={true}
        privacyPolicyUrl="/privacy-policy"
      />
    </View>
  );
};

/**
 * Example 3: With Custom Styling
 */
export const CustomStyledExample = () => {
  return (
    <View style={styles.container}>
      <PrivacyNotice
        defaultExpanded={false}
        privacyPolicyUrl="https://rezapp.com/privacy"
        containerStyle={{
          marginVertical: 16,
          marginHorizontal: 20,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      />
    </View>
  );
};

/**
 * Example 4: In a Modal/Popup Context
 */
export const ModalPrivacyExample = () => {
  return (
    <View style={styles.modalContent}>
      <ThemedText type="title">Data Privacy Notice</ThemedText>
      <ThemedText style={styles.description}>
        We take your privacy seriously. Here's what you need to know:
      </ThemedText>

      <PrivacyNotice
        defaultExpanded={true}
        privacyPolicyUrl="https://rezapp.com/privacy"
        containerStyle={styles.modalPrivacyNotice}
      />

      {/* Modal action buttons would go here */}
    </View>
  );
};

/**
 * Example 5: Multiple Instances (Different Contexts)
 */
export const MultipleContextExample = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Referral Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Referral Program</ThemedText>
        <PrivacyNotice
          defaultExpanded={false}
          privacyPolicyUrl="/privacy/referral"
        />
      </ThemedView>

      {/* Newsletter Signup Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Newsletter</ThemedText>
        <PrivacyNotice
          defaultExpanded={false}
          privacyPolicyUrl="/privacy/newsletter"
          containerStyle={{ backgroundColor: '#f9fafb' }}
        />
      </ThemedView>
    </ScrollView>
  );
};

/**
 * Example 6: Integration with Form Validation
 */
export const FormIntegrationExample = () => {
  const [hasReadPrivacy, setHasReadPrivacy] = React.useState(false);
  const [formValid, setFormValid] = React.useState(false);

  const handlePrivacyExpand = () => {
    setHasReadPrivacy(true);
    validateForm();
  };

  const validateForm = () => {
    // Your validation logic here
    // For example, check if user has expanded privacy notice
    setFormValid(hasReadPrivacy);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Complete Your Referral</ThemedText>

      {/* Your form fields here */}

      <PrivacyNotice
        defaultExpanded={false}
        privacyPolicyUrl="/privacy"
      />

      {hasReadPrivacy && (
        <ThemedText style={styles.validationText}>
          ✓ Privacy notice acknowledged
        </ThemedText>
      )}

      {/* Submit button would be here */}
    </View>
  );
};

/**
 * Example 7: With Analytics Tracking
 */
export const AnalyticsTrackingExample = () => {
  const handleExpand = () => {
    // Track privacy notice expansion
    console.log('Privacy notice expanded');
    // analytics.track('privacy_notice_expanded', { context: 'referral' });
  };

  const handleCollapse = () => {
    // Track privacy notice collapse
    console.log('Privacy notice collapsed');
    // analytics.track('privacy_notice_collapsed', { context: 'referral' });
  };

  return (
    <View style={styles.container}>
      <PrivacyNotice
        defaultExpanded={false}
        privacyPolicyUrl="/privacy"
      />
    </View>
  );
};

/**
 * Example 8: Accessibility-Enhanced Version
 */
export const AccessibleExample = () => {
  return (
    <View style={styles.container}>
      <View
        accessible={true}
        accessibilityLabel="Data Privacy Information"
        accessibilityHint="Expand to read about how we protect your data"
      >
        <PrivacyNotice
          defaultExpanded={false}
          privacyPolicyUrl="/privacy"
        />
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    marginVertical: 12,
    lineHeight: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalPrivacyNotice: {
    marginVertical: 16,
    maxHeight: 400,
  },
  validationText: {
    fontSize: 13,
    color: '#10b981',
    marginTop: 8,
  },
});

/**
 * Best Practices:
 *
 * 1. PLACEMENT: Place the PrivacyNotice component near data collection forms
 *    (referral forms, sign-up forms, data sharing features)
 *
 * 2. VISIBILITY: Make it easily accessible but not intrusive
 *    - Use defaultExpanded={false} for most cases
 *    - Use defaultExpanded={true} when GDPR compliance requires explicit notice
 *
 * 3. CONTEXT: Provide clear context about what data is being collected
 *    and why the privacy notice is shown
 *
 * 4. ACCESSIBILITY: Ensure screen readers can access the content
 *    - Use proper accessibility labels
 *    - Maintain good contrast ratios
 *
 * 5. UPDATES: Keep the lastUpdated timestamp current in the component
 *    - Update whenever privacy policy changes
 *    - Notify users of material changes
 *
 * 6. LINKS: Ensure privacy policy URL is correct and accessible
 *    - Test both internal and external links
 *    - Provide fallback if link fails
 *
 * 7. MOBILE: Test on various screen sizes
 *    - Ensure text is readable
 *    - Check touch targets are adequate (min 44x44 points)
 *
 * 8. COMPLIANCE: Review with legal team periodically
 *    - Ensure GDPR Article 13 compliance
 *    - Update for new regulations (CCPA, etc.)
 */

export default {
  ReferralPageExample,
  ExpandedPrivacyExample,
  CustomStyledExample,
  ModalPrivacyExample,
  MultipleContextExample,
  FormIntegrationExample,
  AnalyticsTrackingExample,
  AccessibleExample,
};
