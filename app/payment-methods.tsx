import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useCheckout } from '@/hooks/useCheckout';

const { width } = Dimensions.get('window');

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { state, handlers } = useCheckout();
  const [showUPIInput, setShowUPIInput] = useState(false);
  const [upiId, setUpiId] = useState('');

  const recentMethods = [
    { id: 'paytm', name: 'Paytm', icon: '₹' },
    { id: 'phonepe', name: 'PhonePe', icon: '⚡' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: 'A' },
    { id: 'mobikwik', name: 'MobiKwik', icon: 'M' },
  ];

  const payLaterOptions = [
    { id: 'simplepay', name: 'Simple pay', icon: '⭕' },
    { id: 'amazonpaylater', name: 'Amazon pay later', icon: 'A' },
  ];

  const emiOptions = [
    { id: 'debit_emi', name: 'Debit card EMIs', icon: 'DC' },
    { id: 'credit_emi', name: 'Credit card EMIs', icon: 'CC' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <LinearGradient 
        colors={['#8B5CF6', '#7C3AED']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              console.log('🔴 Payment methods back arrow clicked!');
              handlers.handleBackNavigation();
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Other Payment</ThemedText>
          
          <View style={styles.paymentAmount}>
            <ThemedText style={styles.amountLabel}>To Pay</ThemedText>
            <ThemedText style={styles.amountValue}>₹2,199</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Methods */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Methods</ThemedText>
          <View style={styles.recentMethodsGrid}>
            {recentMethods.map((method) => (
              <TouchableOpacity key={method.id} style={styles.recentMethodCard}>
                <View style={styles.recentMethodIcon}>
                  <ThemedText style={styles.recentMethodIconText}>{method.icon}</ThemedText>
                </View>
                <ThemedText style={styles.recentMethodName}>{method.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* UPI Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>UPI</ThemedText>
          
          <TouchableOpacity 
            style={styles.paymentOption}
            onPress={() => setShowUPIInput(!showUPIInput)}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={styles.upiIcon}>
                <ThemedText style={styles.upiIconText}>UPI</ThemedText>
              </View>
              <ThemedText style={styles.paymentOptionTitle}>Add New UPI ID</ThemedText>
            </View>
            <Ionicons 
              name={showUPIInput ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </TouchableOpacity>
          
          {showUPIInput && (
            <View style={styles.upiInputContainer}>
              <TextInput
                style={styles.upiInput}
                placeholder="UPI ID"
                value={upiId}
                onChangeText={setUpiId}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        </View>

        {/* Credit & Debit Cards */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Credit & Debit cards</ThemedText>
          
          <TouchableOpacity style={styles.cardOption}>
            <View style={styles.cardLeft}>
              <View style={styles.visaIcon}>
                <ThemedText style={styles.visaText}>VISA</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.cardTitle}>SBI</ThemedText>
                <ThemedText style={styles.cardSubtitle}>••••••••• 4545</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.paymentOption}>
            <View style={styles.paymentOptionLeft}>
              <View style={styles.addCardIcon}>
                <Ionicons name="add" size={20} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.paymentOptionTitle}>Add new card</ThemedText>
            </View>
            <ThemedText style={styles.cardSubtitle}>••••••••• 4545</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Net Banking */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Net Banking</ThemedText>
          
          <TouchableOpacity style={styles.paymentOption}>
            <View style={styles.paymentOptionLeft}>
              <View style={styles.bankIcon}>
                <Ionicons name="business" size={16} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.paymentOptionTitle}>Select Net working</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Pay Later */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Pay later</ThemedText>
          
          {payLaterOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.paymentOption}>
              <View style={styles.paymentOptionLeft}>
                <View style={styles.payLaterIcon}>
                  <ThemedText style={styles.payLaterIconText}>{option.icon}</ThemedText>
                </View>
                <ThemedText style={styles.paymentOptionTitle}>{option.name}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
          
          <ThemedText style={styles.sectionSubtitle}>Pay later</ThemedText>
          
          {emiOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.paymentOption}>
              <View style={styles.paymentOptionLeft}>
                <View style={styles.emiIcon}>
                  <ThemedText style={styles.emiIconText}>{option.icon}</ThemedText>
                </View>
                <ThemedText style={styles.paymentOptionTitle}>{option.name}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
    padding: 0,
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Sections
  section: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  
  // Recent Methods Grid
  recentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentMethodCard: {
    width: (width - 64) / 4,
    alignItems: 'center',
    paddingVertical: 16,
  },
  recentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentMethodIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  recentMethodName: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  
  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  
  // UPI Styles
  upiIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  upiInputContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  upiInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  
  // Card Styles
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  visaIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1A365D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visaText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Bank Icon
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Pay Later Icons
  payLaterIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payLaterIconText: {
    fontSize: 16,
  },
  
  // EMI Icons
  emiIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emiIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});