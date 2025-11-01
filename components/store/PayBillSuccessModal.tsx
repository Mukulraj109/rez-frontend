// Modern PayBill Success Modal with Auto-Add to Cart
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PayBillSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onViewCart?: () => void;
  paidAmount: number;
  productData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    price?: number;
    pricing?: {
      selling?: number;
    };
    image?: string;
    images?: string[];
    productType?: 'product' | 'service';
  } | null;
  discountReceived: number;
  totalAdded: number;
}

export default function PayBillSuccessModal({
  visible,
  onClose,
  onViewCart,
  paidAmount,
  productData,
  discountReceived,
  totalAdded,
}: PayBillSuccessModalProps) {
  useEffect(() => {

  }, [visible]);

  const handleClose = () => {

    onClose();
  };

  const handleViewCart = () => {

    onViewCart?.();
  };

  const productPrice = productData?.price || productData?.pricing?.selling || 0;
  const remainingAmount = Math.max(0, productPrice - paidAmount);
  const productName = productData?.title || productData?.name || 'Item';
  const productImage = productData?.image || productData?.images?.[0] || '';
  const isService = productData?.productType === 'service';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {

        handleClose();
      }}
    >
      <View style={styles.modalContainer}>
        {/* Modal content - SIMPLIFIED */}
        <View style={styles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Success Animation */}
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark" size={48} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.successPulse} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Money Added to Wallet!</Text>
            <Text style={styles.subtitle}>
              Use this balance at checkout to buy products or services
            </Text>

            {/* Payment Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Transaction Summary</Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Amount Paid</Text>
                <Text style={styles.breakdownValue}>₹{paidAmount.toFixed(0)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Bonus Received (20%)</Text>
                <Text style={styles.bonusValue}>+₹{discountReceived.toFixed(0)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Wallet Balance</Text>
                <Text style={styles.totalValue}>₹{totalAdded.toFixed(0)}</Text>
              </View>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <Text style={styles.infoText}>
                Your PayBill balance can be used to buy any product or service. At checkout, select "PayBill Balance" as payment method!
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButtonWrapper}
                onPress={handleViewCart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="cart" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>View Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </ScrollView>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        </View>
      </View>
    </Modal>
);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
  },
  successIconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successPulse: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    opacity: 0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 6,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  breakdownCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  bonusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 12,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  paidFull: {
    color: '#10B981',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B21A8',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  primaryButtonWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
