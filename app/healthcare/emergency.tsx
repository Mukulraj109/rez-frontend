/**
 * Emergency 24x7 Page
 * Provides emergency contacts and ambulance booking functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import emergencyApi, { EmergencyContact, EmergencyBooking } from '@/services/emergencyApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  gray800: '#1F2937',
  red500: '#EF4444',
  red600: '#DC2626',
  green500: '#22C55E',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
};

// Emergency contact type icons mapping
const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  ambulance: { icon: '🚑', color: '#EF4444', label: 'Ambulance' },
  hospital: { icon: '🏥', color: '#3B82F6', label: 'Hospital' },
  blood_bank: { icon: '🩸', color: '#DC2626', label: 'Blood Bank' },
  fire: { icon: '🚒', color: '#F97316', label: 'Fire' },
  police: { icon: '👮', color: '#1D4ED8', label: 'Police' },
  poison_control: { icon: '☠️', color: '#7C3AED', label: 'Poison Control' },
  mental_health: { icon: '🧠', color: '#10B981', label: 'Mental Health' },
  women_helpline: { icon: '👩', color: '#EC4899', label: 'Women Helpline' },
  child_helpline: { icon: '👶', color: '#F59E0B', label: 'Child Helpline' },
  disaster: { icon: '🆘', color: '#EF4444', label: 'Disaster' },
  covid: { icon: '🦠', color: '#22C55E', label: 'COVID-19' },
  other: { icon: '📞', color: '#6B7280', label: 'Other' },
};

// Quick call numbers
const quickCallNumbers = [
  { number: '112', label: 'Emergency', icon: '🚨', color: '#EF4444' },
  { number: '102', label: 'Ambulance', icon: '🚑', color: '#EF4444' },
  { number: '100', label: 'Police', icon: '👮', color: '#1D4ED8' },
  { number: '101', label: 'Fire', icon: '🚒', color: '#F97316' },
];

const EmergencyPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [groupedContacts, setGroupedContacts] = useState<Record<string, EmergencyContact[]>>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState<EmergencyBooking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientPhone: '',
    patientCondition: '',
    pickupAddress: '',
    emergencyType: 'other' as EmergencyBooking['emergencyType'],
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchEmergencyContacts();
    checkActiveBooking();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      const response = await emergencyApi.getContacts();
      if (response.success && response.data) {
        setContacts(response.data.contacts);
        setGroupedContacts(response.data.groupedContacts);
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveBooking = async () => {
    try {
      const response = await emergencyApi.getActiveBooking();
      if (response.success && response.data?.activeBooking) {
        setActiveBooking(response.data.activeBooking);
      }
    } catch (error) {
      console.error('Error checking active booking:', error);
    }
  };

  const makePhoneCall = (number: string) => {
    const phoneNumber = `tel:${number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Phone call is not supported on this device');
        }
      })
      .catch((err) => console.error('Error making call:', err));
  };

  const handleBookAmbulance = async () => {
    if (!bookingForm.patientName || !bookingForm.patientPhone || !bookingForm.pickupAddress) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);
      const response = await emergencyApi.bookEmergency({
        serviceType: 'ambulance',
        emergencyType: bookingForm.emergencyType,
        patientName: bookingForm.patientName,
        patientPhone: bookingForm.patientPhone,
        patientCondition: bookingForm.patientCondition,
        pickupAddress: {
          address: bookingForm.pickupAddress,
        },
      });

      if (response.success && response.data) {
        setActiveBooking(response.data);
        setShowBookingModal(false);
        Alert.alert(
          'Ambulance Booked!',
          `Booking Number: ${response.data.bookingNumber}\n\nHelp is on the way. You will receive a call shortly.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to book ambulance. Please call 102 directly.');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderQuickCallSection = () => (
    <View style={styles.quickCallSection}>
      <Text style={styles.quickCallTitle}>Quick Emergency Call</Text>
      <View style={styles.quickCallGrid}>
        {quickCallNumbers.map((item) => (
          <TouchableOpacity
            key={item.number}
            style={[styles.quickCallCard, { borderColor: item.color }]}
            onPress={() => makePhoneCall(item.number)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickCallIcon}>{item.icon}</Text>
            <Text style={styles.quickCallNumber}>{item.number}</Text>
            <Text style={styles.quickCallLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActiveBooking = () => {
    if (!activeBooking) return null;

    return (
      <View style={styles.activeBookingCard}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeBookingGradient}
        >
          <View style={styles.activeBookingHeader}>
            <Text style={styles.activeBookingIcon}>🚑</Text>
            <View style={styles.activeBookingInfo}>
              <Text style={styles.activeBookingTitle}>Ambulance En Route</Text>
              <Text style={styles.activeBookingNumber}>#{activeBooking.bookingNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.statusText}>{activeBooking.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          {activeBooking.assignedUnit && (
            <View style={styles.assignedUnitInfo}>
              <Text style={styles.assignedUnitText}>
                Vehicle: {activeBooking.assignedUnit.vehicleNumber || 'Assigning...'}
              </Text>
              <TouchableOpacity
                style={styles.callDriverButton}
                onPress={() => makePhoneCall(activeBooking.assignedUnit?.phone || '102')}
              >
                <Ionicons name="call" size={16} color={COLORS.white} />
                <Text style={styles.callDriverText}>Call Driver</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderContactsByType = (type: string) => {
    const typeContacts = groupedContacts[type] || [];
    const typeInfo = typeIcons[type] || typeIcons.other;

    return (
      <View key={type} style={styles.contactTypeSection}>
        <TouchableOpacity
          style={styles.contactTypeHeader}
          onPress={() => setSelectedType(selectedType === type ? null : type)}
        >
          <View style={[styles.contactTypeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
            <Text style={styles.contactTypeEmoji}>{typeInfo.icon}</Text>
          </View>
          <Text style={styles.contactTypeTitle}>{typeInfo.label}</Text>
          <Text style={styles.contactTypeCount}>{typeContacts.length}</Text>
          <Ionicons
            name={selectedType === type ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray600}
          />
        </TouchableOpacity>

        {selectedType === type && (
          <View style={styles.contactsList}>
            {typeContacts.map((contact) => (
              <TouchableOpacity
                key={contact._id}
                style={styles.contactCard}
                onPress={() => makePhoneCall(contact.phoneNumbers[0])}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.description && (
                    <Text style={styles.contactDescription} numberOfLines={1}>
                      {contact.description}
                    </Text>
                  )}
                  <View style={styles.contactMeta}>
                    <Ionicons name="time-outline" size={12} color={COLORS.gray600} />
                    <Text style={styles.contactHours}>{contact.operatingHours}</Text>
                    {contact.isNational && (
                      <View style={styles.nationalBadge}>
                        <Text style={styles.nationalText}>National</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.phoneButtons}>
                  {contact.phoneNumbers.slice(0, 2).map((phone, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.phoneButton, { backgroundColor: typeInfo.color }]}
                      onPress={() => makePhoneCall(phone)}
                    >
                      <Ionicons name="call" size={14} color={COLORS.white} />
                      <Text style={styles.phoneButtonText}>{phone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderBookingModal = () => (
    <Modal visible={showBookingModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Ambulance</Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Patient Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter patient name"
                value={bookingForm.patientName}
                onChangeText={(text) => setBookingForm({ ...bookingForm, patientName: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={bookingForm.patientPhone}
                onChangeText={(text) => setBookingForm({ ...bookingForm, patientPhone: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pickup Address *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Enter complete address with landmark"
                multiline
                numberOfLines={3}
                value={bookingForm.pickupAddress}
                onChangeText={(text) => setBookingForm({ ...bookingForm, pickupAddress: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Emergency Type</Text>
              <View style={styles.emergencyTypeGrid}>
                {(['accident', 'cardiac', 'respiratory', 'pregnancy', 'injury', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.emergencyTypeButton,
                      bookingForm.emergencyType === type && styles.emergencyTypeButtonActive,
                    ]}
                    onPress={() => setBookingForm({ ...bookingForm, emergencyType: type })}
                  >
                    <Text
                      style={[
                        styles.emergencyTypeText,
                        bookingForm.emergencyType === type && styles.emergencyTypeTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Patient Condition (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe the condition"
                multiline
                numberOfLines={2}
                value={bookingForm.patientCondition}
                onChangeText={(text) => setBookingForm({ ...bookingForm, patientCondition: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookAmbulance}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="medical" size={20} color={COLORS.white} />
                  <Text style={styles.bookButtonText}>Book Ambulance Now</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.emergencyNote}>
              For immediate help, call 102 directly
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.red500} />
        <Text style={styles.loadingText}>Loading emergency contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Emergency 24x7</Text>
            <Text style={styles.headerSubtitle}>Help is just a tap away</Text>
          </View>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => makePhoneCall('112')}
          >
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderActiveBooking()}
        {renderQuickCallSection()}

        <TouchableOpacity
          style={styles.bookAmbulanceButton}
          onPress={() => setShowBookingModal(true)}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookAmbulanceGradient}
          >
            <Text style={styles.bookAmbulanceIcon}>🚑</Text>
            <View style={styles.bookAmbulanceText}>
              <Text style={styles.bookAmbulanceTitle}>Book Ambulance</Text>
              <Text style={styles.bookAmbulanceSubtitle}>Request emergency medical transport</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {Object.keys(groupedContacts).map((type) => renderContactsByType(type))}
        </View>

        <View style={styles.firstAidSection}>
          <Text style={styles.sectionTitle}>Quick First Aid Tips</Text>
          <View style={styles.tipsGrid}>
            <TouchableOpacity style={styles.tipCard}>
              <Text style={styles.tipIcon}>💓</Text>
              <Text style={styles.tipTitle}>CPR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipCard}>
              <Text style={styles.tipIcon}>🩹</Text>
              <Text style={styles.tipTitle}>Wounds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipCard}>
              <Text style={styles.tipIcon}>🔥</Text>
              <Text style={styles.tipTitle}>Burns</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipCard}>
              <Text style={styles.tipIcon}>😵</Text>
              <Text style={styles.tipTitle}>Choking</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderBookingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  sosButton: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sosText: { fontSize: 14, fontWeight: '800', color: COLORS.red500 },

  quickCallSection: { padding: 16 },
  quickCallTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  quickCallGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickCallCard: { width: (SCREEN_WIDTH - 48) / 4, alignItems: 'center', padding: 12, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 2 },
  quickCallIcon: { fontSize: 24, marginBottom: 4 },
  quickCallNumber: { fontSize: 16, fontWeight: '800', color: COLORS.navy },
  quickCallLabel: { fontSize: 10, color: COLORS.gray600, marginTop: 2 },

  activeBookingCard: { margin: 16, borderRadius: 16, overflow: 'hidden' },
  activeBookingGradient: { padding: 16 },
  activeBookingHeader: { flexDirection: 'row', alignItems: 'center' },
  activeBookingIcon: { fontSize: 32 },
  activeBookingInfo: { flex: 1, marginLeft: 12 },
  activeBookingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  activeBookingNumber: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  assignedUnitInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  assignedUnitText: { fontSize: 13, color: COLORS.white },
  callDriverButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  callDriverText: { fontSize: 12, fontWeight: '600', color: COLORS.white, marginLeft: 4 },

  bookAmbulanceButton: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  bookAmbulanceGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  bookAmbulanceIcon: { fontSize: 32 },
  bookAmbulanceText: { flex: 1, marginLeft: 12 },
  bookAmbulanceTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  bookAmbulanceSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  contactsSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  contactTypeSection: { marginBottom: 8 },
  contactTypeHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, padding: 12, borderRadius: 12 },
  contactTypeIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  contactTypeEmoji: { fontSize: 20 },
  contactTypeTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.navy, marginLeft: 12 },
  contactTypeCount: { fontSize: 13, color: COLORS.gray600, marginRight: 8 },
  contactsList: { marginTop: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.gray200 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  contactDescription: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  contactMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  contactHours: { fontSize: 11, color: COLORS.gray600, marginLeft: 4 },
  nationalBadge: { backgroundColor: COLORS.green500, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  nationalText: { fontSize: 9, fontWeight: '600', color: COLORS.white },
  phoneButtons: { flexDirection: 'column', gap: 4 },
  phoneButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  phoneButtonText: { fontSize: 11, fontWeight: '600', color: COLORS.white, marginLeft: 4 },

  firstAidSection: { padding: 16 },
  tipsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  tipCard: { width: (SCREEN_WIDTH - 48) / 4, alignItems: 'center', padding: 16, backgroundColor: COLORS.gray50, borderRadius: 12 },
  tipIcon: { fontSize: 28, marginBottom: 8 },
  tipTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  modalBody: { padding: 16 },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 8 },
  formInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.navy },
  formTextArea: { height: 80, textAlignVertical: 'top' },
  emergencyTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emergencyTypeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100 },
  emergencyTypeButtonActive: { backgroundColor: COLORS.red500 },
  emergencyTypeText: { fontSize: 13, fontWeight: '500', color: COLORS.gray600 },
  emergencyTypeTextActive: { color: COLORS.white },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.red500, padding: 16, borderRadius: 12 },
  bookButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginLeft: 8 },
  emergencyNote: { fontSize: 12, color: COLORS.gray600, textAlign: 'center', marginTop: 12 },
});

export default EmergencyPage;
