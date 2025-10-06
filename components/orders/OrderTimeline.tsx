import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TimelineStep {
  status: string;
  title: string;
  message: string;
  timestamp?: Date | string;
  completed: boolean;
  active?: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  timeline?: Array<{
    status: string;
    message: string;
    timestamp: Date | string;
    updatedBy?: string;
    metadata?: any;
  }>;
  estimatedDeliveryTime?: Date | string;
}

export default function OrderTimeline({
  currentStatus,
  timeline,
  estimatedDeliveryTime,
}: OrderTimelineProps) {
  // Define the standard order flow
  const standardSteps: TimelineStep[] = [
    {
      status: 'placed',
      title: 'Order Placed',
      message: 'Your order has been placed successfully',
      completed: true,
      active: currentStatus === 'placed',
    },
    {
      status: 'confirmed',
      title: 'Order Confirmed',
      message: 'Store has confirmed your order',
      completed: ['confirmed', 'preparing', 'ready', 'dispatched', 'out_for_delivery', 'delivered'].includes(
        currentStatus
      ),
      active: currentStatus === 'confirmed',
    },
    {
      status: 'preparing',
      title: 'Preparing',
      message: 'Your order is being prepared',
      completed: ['preparing', 'ready', 'dispatched', 'out_for_delivery', 'delivered'].includes(currentStatus),
      active: currentStatus === 'preparing',
    },
    {
      status: 'ready',
      title: 'Ready for Dispatch',
      message: 'Order is ready for pickup',
      completed: ['ready', 'dispatched', 'out_for_delivery', 'delivered'].includes(currentStatus),
      active: currentStatus === 'ready',
    },
    {
      status: 'dispatched',
      title: 'Dispatched',
      message: 'Order has been dispatched',
      completed: ['dispatched', 'out_for_delivery', 'delivered'].includes(currentStatus),
      active: currentStatus === 'dispatched',
    },
    {
      status: 'out_for_delivery',
      title: 'Out for Delivery',
      message: 'Order is on the way',
      completed: ['out_for_delivery', 'delivered'].includes(currentStatus),
      active: currentStatus === 'out_for_delivery',
    },
    {
      status: 'delivered',
      title: 'Delivered',
      message: 'Order delivered successfully',
      completed: currentStatus === 'delivered',
      active: currentStatus === 'delivered',
    },
  ];

  // If order is cancelled, show cancelled status
  const steps: TimelineStep[] =
    currentStatus === 'cancelled'
      ? [
          standardSteps[0],
          {
            status: 'cancelled',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled',
            completed: true,
            active: true,
          },
        ]
      : standardSteps;

  // Get timestamp from timeline if available
  const getTimestamp = (status: string): string | null => {
    if (!timeline) return null;

    const timelineItem = timeline.find(item => item.status === status);
    if (!timelineItem) return null;

    const date = new Date(timelineItem.timestamp);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Timeline</Text>

      {estimatedDeliveryTime && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeLabel}>Estimated Delivery</Text>
          <Text style={styles.estimatedTime}>
            {new Date(estimatedDeliveryTime).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const timestamp = getTimestamp(step.status);

          return (
            <View key={step.status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    step.completed && styles.timelineDotCompleted,
                    step.active && styles.timelineDotActive,
                  ]}
                >
                  {step.completed && (
                    <View style={styles.timelineDotInner}>
                      <Text style={styles.timelineDotCheck}>✓</Text>
                    </View>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      step.completed && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineRight}>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      step.completed && styles.timelineTitleCompleted,
                      step.active && styles.timelineTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineMessage}>{step.message}</Text>
                  {timestamp && (
                    <Text style={styles.timelineTimestamp}>{timestamp}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {timeline && timeline.length > 0 && (
        <View style={styles.detailedTimeline}>
          <Text style={styles.detailedTimelineHeader}>Detailed Updates</Text>
          {timeline.slice().reverse().map((item, index) => (
            <View key={index} style={styles.detailedTimelineItem}>
              <View style={styles.detailedTimelineDot} />
              <View style={styles.detailedTimelineContent}>
                <Text style={styles.detailedTimelineMessage}>{item.message}</Text>
                <Text style={styles.detailedTimelineTimestamp}>
                  {new Date(item.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  estimatedTimeContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  estimatedTimeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  timelineDotActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineDotInner: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10b981',
  },
  timelineRight: {
    flex: 1,
    paddingTop: 2,
  },
  timelineContent: {
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineTitleCompleted: {
    color: '#111827',
  },
  timelineTitleActive: {
    color: '#3b82f6',
  },
  timelineMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  detailedTimeline: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailedTimelineHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailedTimelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailedTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 12,
    marginTop: 6,
  },
  detailedTimelineContent: {
    flex: 1,
  },
  detailedTimelineMessage: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  detailedTimelineTimestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
