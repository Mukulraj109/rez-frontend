import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.successContainer}
      >
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="white" />
          </View>
          
          <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
          <ThemedText style={styles.successMessage}>
            Your payment has been processed successfully. You will receive a confirmation shortly.
          </ThemedText>
          
          <View style={styles.orderInfo}>
            <ThemedText style={styles.orderNumber}>Order #REZ123456</ThemedText>
            <ThemedText style={styles.estimatedDelivery}>
              Estimated Delivery: 30-45 minutes
            </ThemedText>
          </View>
          
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.trackOrderButton}
              onPress={() => router.replace('/tracking')}
            >
              <ThemedText style={styles.trackOrderText}>Track Order</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => router.replace('/(tabs)/')}
            >
              <ThemedText style={styles.continueShoppingText}>Continue Shopping</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  successActions: {
    width: '100%',
  },
  trackOrderButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackOrderText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '700',
  },
  continueShoppingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});