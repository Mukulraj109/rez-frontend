// Transactions Page
// Dedicated page for viewing and managing transaction history

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import { Transaction } from '@/types/wallet.types';
import { useWallet } from '@/hooks/useWallet';

export default function TransactionsPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { refreshWallet } = useWallet({
    userId: 'user-12345',
    autoFetch: true,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshWallet(true);
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh transaction data');
    } finally {
      setRefreshing(false);
    }
  }, [refreshWallet]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    const isOrderTransaction = transaction.category === 'ORDER' || 
                              transaction.type === 'PAYMENT' || 
                              transaction.title.toLowerCase().includes('order');
    
    const buttons = [
      { text: 'OK' },
      { 
        text: 'View Details', 
        onPress: () => console.log('Navigate to transaction details:', transaction.id) 
      },
    ];

    // Add Track Order option for order-related transactions
    if (isOrderTransaction) {
      buttons.splice(1, 0, {
        text: 'Track Order',
        onPress: () => router.push('/tracking')
      });
    }

    Alert.alert(
      transaction.title,
      `Amount: ${transaction.amount} ${transaction.currency}\nStatus: ${transaction.status}\nDate: ${new Date(transaction.date).toLocaleDateString()}`,
      buttons
    );
  }, [router]);

  const handleFilterPress = () => {
    Alert.alert('Filter', 'Filter options coming soon!');
  };

  const handleExportPress = () => {
    Alert.alert('Export', 'Export functionality coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#8B5CF6"
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Transactions</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              View all your transaction history
            </ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleFilterPress}>
              <Ionicons name="filter" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleExportPress}>
              <Ionicons name="download-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction History */}
      <View style={styles.transactionContainer}>
        <TransactionHistory 
          onTransactionPress={handleTransactionPress}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Export PDF', 'PDF export coming soon!')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="document-text" size={18} color="#8B5CF6" />
          </View>
          <ThemedText style={styles.quickActionText}>Export PDF</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="share-outline" size={18} color="#8B5CF6" />
          </View>
          <ThemedText style={styles.quickActionText}>Share</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Search', 'Search functionality coming soon!')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="search" size={18} color="#8B5CF6" />
          </View>
          <ThemedText style={styles.quickActionText}>Search</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 30 : 0,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionContainer: {
    flex: 1,
    paddingTop: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    minWidth: 70,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});