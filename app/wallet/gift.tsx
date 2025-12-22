// Coin Gift Page
// Gift coins with personalized message

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
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

const GIFT_THEMES = [
  { id: 'birthday', emoji: '🎂', label: 'Birthday', colors: ['#FF6B6B', '#FF8E8E'] },
  { id: 'christmas', emoji: '🎄', label: 'Christmas', colors: ['#2ECC71', '#27AE60'] },
  { id: 'gift', emoji: '🎁', label: 'Gift', colors: ['#9B59B6', '#8E44AD'] },
  { id: 'love', emoji: '💝', label: 'Love', colors: ['#E91E63', '#C2185B'] },
  { id: 'thanks', emoji: '🙏', label: 'Thanks', colors: ['#00BCD4', '#0097A7'] },
  { id: 'congrats', emoji: '🎉', label: 'Congrats', colors: ['#FFC107', '#FFA000'] },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function GiftPage() {
  const router = useRouter();

  const [selectedTheme, setSelectedTheme] = useState(GIFT_THEMES[0]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryType, setDeliveryType] = useState<'now' | 'scheduled'>('now');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSendGift = async () => {
    if (!recipient || !amount) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.back();
    } catch (error) {
      console.error('Gift sending failed:', error);
    } finally {
      setLoading(false);
    }
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
          <ThemedText style={styles.headerTitle}>Gift Coins</ThemedText>
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
          {/* Theme Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Choose a gift card design</ThemedText>
            <View style={styles.themesGrid}>
              {GIFT_THEMES.map(theme => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    selectedTheme.id === theme.id && styles.themeCardSelected,
                  ]}
                  onPress={() => setSelectedTheme(theme)}
                >
                  <LinearGradient
                    colors={theme.colors as any}
                    style={styles.themeGradient}
                  >
                    <ThemedText style={styles.themeEmoji}>{theme.emoji}</ThemedText>
                  </LinearGradient>
                  <ThemedText style={styles.themeLabel}>{theme.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipient */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recipient</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="search" size={20} color={Colors.text.tertiary} />
              <TextInput
                style={styles.input}
                placeholder="Search contact"
                placeholderTextColor={Colors.text.tertiary}
                value={recipient}
                onChangeText={setRecipient}
              />
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Amount</ThemedText>
            <View style={styles.amountContainer}>
              <ThemedText style={styles.currencyLabel}>RC</ThemedText>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
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
          </View>

          {/* Personal Message */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personal Message</ThemedText>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Happy Birthday! 🎉"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              maxLength={150}
            />
            <ThemedText style={styles.charCount}>{message.length}/150</ThemedText>
          </View>

          {/* Delivery Options */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Delivery</ThemedText>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryType === 'now' && styles.deliveryOptionSelected,
                ]}
                onPress={() => setDeliveryType('now')}
              >
                <Ionicons
                  name={deliveryType === 'now' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={deliveryType === 'now' ? Colors.primary[600] : Colors.text.tertiary}
                />
                <ThemedText style={styles.deliveryOptionText}>Send Now</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryType === 'scheduled' && styles.deliveryOptionSelected,
                ]}
                onPress={() => setDeliveryType('scheduled')}
              >
                <Ionicons
                  name={deliveryType === 'scheduled' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={deliveryType === 'scheduled' ? Colors.primary[600] : Colors.text.tertiary}
                />
                <ThemedText style={styles.deliveryOptionText}>Schedule</ThemedText>
                <Ionicons name="calendar" size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview Card */}
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Ionicons name="eye-outline" size={20} color={Colors.primary[600]} />
            <ThemedText style={styles.previewButtonText}>Preview Gift Card</ThemedText>
          </TouchableOpacity>

          {showPreview && (
            <View style={styles.previewCard}>
              <LinearGradient
                colors={selectedTheme.colors as any}
                style={styles.previewGradient}
              >
                <ThemedText style={styles.previewEmoji}>{selectedTheme.emoji}</ThemedText>
                <ThemedText style={styles.previewAmount}>
                  {amount || '0'} ReZ Coins
                </ThemedText>
                <ThemedText style={styles.previewMessage}>
                  {message || 'Your gift message here...'}
                </ThemedText>
                <ThemedText style={styles.previewFrom}>From ReZ App</ThemedText>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Send Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!recipient || !amount) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendGift}
            disabled={!recipient || !amount || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="gift" size={20} color="#FFF" />
                <ThemedText style={styles.sendButtonText}>Send Gift</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  themeCard: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.subtle,
  },
  themeCardSelected: {
    borderColor: Colors.primary[600],
  },
  themeGradient: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  themeEmoji: {
    fontSize: 28,
  },
  themeLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  currencyLabel: {
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
  messageInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  deliveryOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  deliveryOptionText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewButtonText: {
    ...Typography.button,
    color: Colors.primary[600],
  },
  previewCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  previewGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  previewAmount: {
    ...Typography.h2,
    color: '#FFF',
    marginBottom: Spacing.sm,
  },
  previewMessage: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  previewFrom: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.base,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  sendButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
});
