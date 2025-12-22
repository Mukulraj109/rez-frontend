// P2P Coin Transfer Page
// Send coins to other users

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface RecentRecipient {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const COIN_TYPES = [
  { id: 'rez', label: 'ReZ Coins', balance: 2450, icon: 'diamond' },
  { id: 'promo', label: 'Promo Coins', balance: 500, icon: 'gift' },
  { id: 'store', label: 'Store Coins', balance: 150, icon: 'storefront' },
];

const QUICK_AMOUNTS = [100, 250, 500, 1000];

const RECENT_RECIPIENTS: RecentRecipient[] = [
  { id: '1', name: 'Amit Sharma', phone: '+91 98765 43210' },
  { id: '2', name: 'Priya Singh', phone: '+91 87654 32109' },
  { id: '3', name: 'Rahul Verma', phone: '+91 76543 21098' },
];

export default function TransferPage() {
  const router = useRouter();

  const [step, setStep] = useState<'recipient' | 'amount' | 'success'>('recipient');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecentRecipient | null>(null);
  const [selectedCoinType, setSelectedCoinType] = useState(COIN_TYPES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleSelectRecipient = (recipient: RecentRecipient) => {
    setSelectedRecipient(recipient);
    setStep('amount');
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSend = async () => {
    if (!selectedRecipient || !amount || parseInt(amount) <= 0) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTransactionId('TXN' + Date.now());
      setStep('success');
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    router.back();
  };

  const renderRecipientStep = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by phone or name"
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="phone-pad"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Recipients */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recent</ThemedText>
        {RECENT_RECIPIENTS.map(recipient => (
          <TouchableOpacity
            key={recipient.id}
            style={styles.recipientCard}
            onPress={() => handleSelectRecipient(recipient)}
          >
            <View style={styles.recipientAvatar}>
              <ThemedText style={styles.avatarText}>
                {recipient.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.recipientInfo}>
              <ThemedText style={styles.recipientName}>{recipient.name}</ThemedText>
              <ThemedText style={styles.recipientPhone}>{recipient.phone}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Scan QR Code */}
      <TouchableOpacity style={styles.qrButton}>
        <Ionicons name="qr-code" size={24} color={Colors.primary[600]} />
        <ThemedText style={styles.qrButtonText}>Scan QR Code</ThemedText>
      </TouchableOpacity>
    </>
  );

  const renderAmountStep = () => (
    <>
      {/* Selected Recipient */}
      <View style={styles.selectedRecipient}>
        <View style={styles.recipientAvatar}>
          <ThemedText style={styles.avatarText}>
            {selectedRecipient?.name.charAt(0)}
          </ThemedText>
        </View>
        <ThemedText style={styles.selectedName}>{selectedRecipient?.name}</ThemedText>
      </View>

      {/* Coin Type Selector */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Select Coin Type</ThemedText>
        <View style={styles.coinTypeContainer}>
          {COIN_TYPES.map(coinType => (
            <TouchableOpacity
              key={coinType.id}
              style={[
                styles.coinTypeCard,
                selectedCoinType.id === coinType.id && styles.coinTypeCardSelected,
              ]}
              onPress={() => setSelectedCoinType(coinType)}
            >
              <Ionicons
                name={coinType.icon as any}
                size={24}
                color={selectedCoinType.id === coinType.id ? Colors.primary[600] : Colors.text.tertiary}
              />
              <ThemedText style={[
                styles.coinTypeLabel,
                selectedCoinType.id === coinType.id && styles.coinTypeLabelSelected,
              ]}>
                {coinType.label}
              </ThemedText>
              <ThemedText style={styles.coinBalance}>{coinType.balance} RC</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Available: {selectedCoinType.balance} RC
        </ThemedText>
        <View style={styles.amountInputContainer}>
          <ThemedText style={styles.currencySymbol}>RC</ThemedText>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
      </View>

      {/* Quick Amounts */}
      <View style={styles.quickAmounts}>
        {QUICK_AMOUNTS.map(quickAmount => (
          <TouchableOpacity
            key={quickAmount}
            style={[
              styles.quickAmountButton,
              amount === quickAmount.toString() && styles.quickAmountButtonSelected,
            ]}
            onPress={() => handleQuickAmount(quickAmount)}
          >
            <ThemedText style={[
              styles.quickAmountText,
              amount === quickAmount.toString() && styles.quickAmountTextSelected,
            ]}>
              {quickAmount}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Note Input */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Add a note (optional)</ThemedText>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Thanks for dinner!"
          placeholderTextColor={Colors.text.tertiary}
          multiline
        />
      </View>

      {/* Send Button */}
      <View style={styles.sendButtonContainer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!amount || parseInt(amount) <= 0) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!amount || parseInt(amount) <= 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
      </View>
      <ThemedText style={styles.successTitle}>{amount} RC Sent!</ThemedText>
      <ThemedText style={styles.successSubtitle}>
        To: {selectedRecipient?.name}
      </ThemedText>
      <ThemedText style={styles.successPhone}>{selectedRecipient?.phone}</ThemedText>

      <View style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <ThemedText style={styles.transactionLabel}>Transaction ID</ThemedText>
          <ThemedText style={styles.transactionValue}>{transactionId}</ThemedText>
        </View>
        <View style={styles.transactionRow}>
          <ThemedText style={styles.transactionLabel}>Amount</ThemedText>
          <ThemedText style={styles.transactionValue}>{amount} RC</ThemedText>
        </View>
        {note && (
          <View style={styles.transactionRow}>
            <ThemedText style={styles.transactionLabel}>Note</ThemedText>
            <ThemedText style={styles.transactionValue}>{note}</ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={20} color={Colors.primary[600]} />
        <ThemedText style={styles.shareButtonText}>Share Receipt</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <ThemedText style={styles.doneButtonText}>Done</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === 'amount' ? setStep('recipient') : router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {step === 'success' ? 'Transfer Complete' : 'Send Coins'}
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 'recipient' && renderRecipientStep()}
          {step === 'amount' && renderAmountStep()}
          {step === 'success' && renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.primary[600],
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  recipientPhone: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  qrButtonText: {
    ...Typography.button,
    color: Colors.primary[600],
  },
  selectedRecipient: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  selectedName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  coinTypeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  coinTypeCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.subtle,
  },
  coinTypeCardSelected: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  coinTypeLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  coinTypeLabelSelected: {
    color: Colors.primary[600],
  },
  coinBalance: {
    ...Typography.labelSmall,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  currencySymbol: {
    ...Typography.h2,
    color: Colors.text.tertiary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    ...Typography.priceLarge,
    color: Colors.text.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  quickAmountButtonSelected: {
    backgroundColor: Colors.primary[600],
  },
  quickAmountText: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  quickAmountTextSelected: {
    color: '#FFF',
  },
  noteInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  sendButtonContainer: {
    marginTop: Spacing.lg,
  },
  sendButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  sendButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  successPhone: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xl,
  },
  transactionCard: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  transactionLabel: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  transactionValue: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shareButtonText: {
    ...Typography.button,
    color: Colors.primary[600],
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
