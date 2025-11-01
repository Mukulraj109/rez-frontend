// Notification Demo Component
// Demonstrates how notification settings are applied globally

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useGlobalNotificationService, NotificationData } from '@/services/globalNotificationService';

export default function NotificationDemo() {
  const notificationService = useGlobalNotificationService();

  const testNotifications: { label: string; data: NotificationData }[] = [
    {
      label: 'Order Update',
      data: {
        title: 'Order Status Update',
        body: 'Your order #12345 has been confirmed and is being prepared.',
        type: 'orderUpdate',
        priority: 'high',
      },
    },
    {
      label: 'Delivery Alert',
      data: {
        title: 'Delivery Update',
        body: 'Your order is out for delivery and will arrive within 30 minutes.',
        type: 'deliveryUpdate',
        priority: 'high',
      },
    },
    {
      label: 'Promotion',
      data: {
        title: 'Special Offer!',
        body: 'Get 20% off on your next order. Use code SAVE20.',
        type: 'promotion',
        priority: 'normal',
      },
    },
    {
      label: 'Security Alert',
      data: {
        title: 'Security Notice',
        body: 'New login detected from a different device.',
        type: 'securityAlert',
        priority: 'high',
      },
    },
    {
      label: 'OTP Message',
      data: {
        title: 'Verification Code',
        body: 'Your OTP is 123456. Valid for 5 minutes.',
        type: 'otpMessage',
        priority: 'high',
      },
    },
  ];

  const handleTestNotification = async (notificationData: NotificationData) => {
    try {
      const results = await notificationService.sendNotification(notificationData);
      
      const enabledChannels = Object.entries(results)
        .filter(([_, enabled]) => enabled)
        .map(([channel, _]) => channel)
        .join(', ');

      Alert.alert(
        'Notification Sent',
        `Notification sent through: ${enabledChannels || 'No channels'}\n\n` +
        `Title: ${notificationData.title}\n` +
        `Body: ${notificationData.body}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings Demo</Text>
      <Text style={styles.subtitle}>
        Test how notification settings are applied globally. 
        Toggle settings in Account Settings to see changes here.
      </Text>

      {testNotifications.map((test, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => handleTestNotification(test.data)}
        >
          <Text style={styles.buttonText}>{test.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>
          • Each notification type checks the user's settings{'\n'}
          • Only enabled channels will send notifications{'\n'}
          • Settings are synced with the backend{'\n'}
          • Changes apply immediately across the app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

