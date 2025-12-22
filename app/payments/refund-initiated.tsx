// Refund Initiated Page
// Refund status and tracking

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface RefundStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

interface RefundDetails {
  id: string;
  orderId: string;
  amount: number;
  refundMethod: string;
  reason: string;
  status: 'processing' | 'approved' | 'completed' | 'failed';
  expectedDate: string;
  createdAt: string;
  steps: RefundStep[];
}

const MOCK_REFUND: RefundDetails = {
  id: 'REF-2024-001234',
  orderId: 'ORD-2024-005678',
  amount: 1499,
  refundMethod: 'Original Payment Method (Credit Card)',
  reason: 'Product damaged during delivery',
  status: 'processing',
  expectedDate: '2024-12-28',
  createdAt: '2024-12-18T10:30:00',
  steps: [
    { id: '1', title: 'Refund Requested', description: 'Your refund request has been received', status: 'completed', timestamp: '2024-12-18T10:30:00' },
    { id: '2', title: 'Under Review', description: 'Our team is reviewing your request', status: 'completed', timestamp: '2024-12-19T14:00:00' },
    { id: '3', title: 'Approved', description: 'Refund has been approved', status: 'current', timestamp: '2024-12-20T09:00:00' },
    { id: '4', title: 'Processing', description: 'Refund is being processed', status: 'pending' },
    { id: '5', title: 'Completed', description: 'Refund credited to your account', status: 'pending' },
  ],
};

export default function RefundInitiatedPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [refund, setRefund] = useState<RefundDetails>(MOCK_REFUND);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'approved':
      case 'processing': return Colors.primary[600];
      case 'failed': return Colors.error;
      default: return Colors.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing': return 'In Progress';
      case 'approved': return 'Approved';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <ThemedText style={styles.headerTitle}>Refund Status</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor(refund.status) + '20' }]}>
            <Ionicons
              name={refund.status === 'completed' ? 'checkmark-circle' : 'time'}
              size={48}
              color={getStatusColor(refund.status)}
            />
          </View>
          <ThemedText style={styles.statusTitle}>
            {refund.status === 'completed' ? 'Refund Completed!' : 'Refund In Progress'}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) + '20' }]}>
            <ThemedText style={[styles.statusBadgeText, { color: getStatusColor(refund.status) }]}>
              {getStatusLabel(refund.status)}
            </ThemedText>
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <ThemedText style={styles.amountLabel}>Refund Amount</ThemedText>
            <ThemedText style={styles.amountValue}>₹{refund.amount.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <ThemedText style={styles.amountLabel}>Expected by</ThemedText>
            <ThemedText style={styles.amountDate}>{formatDate(refund.expectedDate)}</ThemedText>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <ThemedText style={styles.sectionTitle}>Refund Timeline</ThemedText>
          <View style={styles.timeline}>
            {refund.steps.map((step, index) => (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    step.status === 'completed' && styles.timelineDotCompleted,
                    step.status === 'current' && styles.timelineDotCurrent,
                  ]}>
                    {step.status === 'completed' && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                  {index < refund.steps.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      (step.status === 'completed' || step.status === 'current') && styles.timelineLineCompleted,
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <ThemedText style={[
                    styles.timelineTitle,
                    step.status === 'pending' && styles.timelineTitlePending,
                  ]}>
                    {step.title}
                  </ThemedText>
                  <ThemedText style={styles.timelineDescription}>
                    {step.description}
                  </ThemedText>
                  {step.timestamp && (
                    <ThemedText style={styles.timelineTime}>
                      {formatDate(step.timestamp)} at {formatTime(step.timestamp)}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <ThemedText style={styles.sectionTitle}>Refund Details</ThemedText>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Refund ID</ThemedText>
            <ThemedText style={styles.detailValue}>{refund.id}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Order ID</ThemedText>
            <TouchableOpacity onPress={() => router.push(`/orders/${refund.orderId}` as any)}>
              <ThemedText style={[styles.detailValue, styles.detailLink]}>
                {refund.orderId}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Refund To</ThemedText>
            <ThemedText style={styles.detailValue}>{refund.refundMethod}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Reason</ThemedText>
            <ThemedText style={styles.detailValue}>{refund.reason}</ThemedText>
          </View>
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.info} />
          <View style={styles.helpContent}>
            <ThemedText style={styles.helpTitle}>Need Help?</ThemedText>
            <ThemedText style={styles.helpText}>
              If your refund is delayed or you have questions, our support team is here to help.
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => router.push('/support' as any)}
          >
            <ThemedText style={styles.helpButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.text.tertiary} />
          <ThemedText style={styles.noteText}>
            Refunds typically take 5-7 business days to reflect in your account. Bank processing times may vary.
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
  statusCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusBadgeText: {
    ...Typography.label,
  },
  amountCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  amountLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  amountValue: {
    ...Typography.h2,
    color: Colors.success,
  },
  amountDate: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
  },
  timelineSection: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  timeline: {
    paddingLeft: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: Colors.primary[600],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.gray[200],
    marginTop: Spacing.xs,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  timelineTitlePending: {
    color: Colors.text.tertiary,
  },
  timelineDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  timelineTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  detailsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.text.tertiary,
    flex: 1,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  detailLink: {
    color: Colors.primary[600],
    textDecorationLine: 'underline',
  },
  helpCard: {
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.md,
    alignItems: 'center',
  },
  helpContent: {
    alignItems: 'center',
  },
  helpTitle: {
    ...Typography.label,
    color: Colors.info,
    marginBottom: Spacing.xs,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: Colors.info,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  helpButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  noteText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    flex: 1,
    lineHeight: 18,
  },
});
