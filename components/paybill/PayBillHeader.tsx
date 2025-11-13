import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { PayBillHeaderProps } from '@/types/paybill.types';

export function PayBillHeader({ 
  currentBalance, 
  onBack, 
  loading = false 
}: PayBillHeaderProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      
      <LinearGradient 
        colors={['#10B981', '#059669']} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Top Row */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {

              onBack();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>PayBill Transactions</Text>
          
          <View style={styles.headerRight} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={20} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.balanceLabel}>Current PayBill Balance</Text>
          </View>
          {loading ? (
            <View style={styles.balanceLoading}>
              <View style={styles.balanceSkeleton} />
            </View>
          ) : (
            <Text style={styles.balanceAmount}>₹{currentBalance.toLocaleString()}</Text>
          )}
          <View style={styles.balanceFooter}>
            <View style={styles.balanceStat}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.balanceStatText}>20% Bonus on Topup</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10B981',
  },
  gradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Center the title by offsetting the back button
  },
  headerRight: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    // backdropFilter: 'blur(10px)', // Not supported in React Native
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 16,
  },
  balanceLoading: {
    height: 42,
    justifyContent: 'center',
    marginBottom: 16,
  },
  balanceSkeleton: {
    width: 140,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  balanceFooter: {
    width: '100%',
    alignItems: 'center',
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  balanceStatText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});
