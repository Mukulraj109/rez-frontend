import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

interface CourierPreferences {
  preferredCourier: 'any' | 'delhivery' | 'bluedart' | 'ekart' | 'dtdc' | 'fedex';
  deliveryTimePreference: {
    weekdays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
    preferredTimeSlot: {
      start: string;
      end: string;
    };
    avoidWeekends: boolean;
  };
  deliveryInstructions: {
    contactlessDelivery: boolean;
    leaveAtDoor: boolean;
    signatureRequired: boolean;
    callBeforeDelivery: boolean;
    specificInstructions?: string;
  };
  alternateContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  courierNotifications: {
    smsUpdates: boolean;
    emailUpdates: boolean;
    whatsappUpdates: boolean;
    callUpdates: boolean;
  };
}

const COURIERS = [
  { value: 'any', label: 'Any Courier' },
  { value: 'delhivery', label: 'Delhivery' },
  { value: 'bluedart', label: 'Blue Dart' },
  { value: 'ekart', label: 'Ekart' },
  { value: 'dtdc', label: 'DTDC' },
  { value: 'fedex', label: 'FedEx' },
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function CourierPreferencesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<CourierPreferences | null>(null);
  const [showAlternateContact, setShowAlternateContact] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user-settings/courier');

      if (response.success && response.data) {
        setPreferences(response.data as CourierPreferences);
        setShowAlternateContact(!!(response.data as CourierPreferences).alternateContact?.name);
      } else {
        console.warn('Failed to load courier preferences:', response.error);
        // Set default preferences if none exist
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error('Error loading courier preferences:', error);
      // Set default preferences on error
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPreferences = (): CourierPreferences => ({
    preferredCourier: 'any',
    deliveryTimePreference: {
      weekdays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      preferredTimeSlot: {
        start: '09:00',
        end: '18:00',
      },
      avoidWeekends: false,
    },
    deliveryInstructions: {
      contactlessDelivery: false,
      leaveAtDoor: false,
      signatureRequired: true,
      callBeforeDelivery: false,
      specificInstructions: '',
    },
    courierNotifications: {
      smsUpdates: true,
      emailUpdates: true,
      whatsappUpdates: false,
      callUpdates: false,
    },
  });

  const savePreferences = async (updates: Partial<CourierPreferences>) => {
    if (!preferences) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      const response = await apiClient.put('/user-settings/courier', newPreferences);

      if (!response.success) {
        console.warn('Failed to save courier preferences:', response.error);
        Alert.alert('Error', 'Failed to update courier preferences. Please try again.');
        // Revert to previous state
        setPreferences(preferences);
      } else {
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating courier preferences:', error);
      Alert.alert('Error', 'Failed to update courier preferences. Please check your connection and try again.');
      // Revert to previous state
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const toggleWeekday = (day: string) => {
    if (!preferences) return;

    const weekdays = [...preferences.deliveryTimePreference.weekdays];
    const index = weekdays.indexOf(day as any);

    if (index > -1) {
      weekdays.splice(index, 1);
    } else {
      weekdays.push(day as any);
    }

    savePreferences({
      deliveryTimePreference: {
        ...preferences.deliveryTimePreference,
        weekdays,
      },
    });
  };

  const handleAvoidWeekendsToggle = (value: boolean) => {
    if (!preferences) return;

    let weekdays = [...preferences.deliveryTimePreference.weekdays];
    
    if (value) {
      // Remove weekends when "Avoid Weekends" is enabled
      weekdays = weekdays.filter(day => day !== 'SAT' && day !== 'SUN');
    } else {
      // Add weekends back when "Avoid Weekends" is disabled
      if (!weekdays.includes('SAT')) weekdays.push('SAT');
      if (!weekdays.includes('SUN')) weekdays.push('SUN');
    }

    savePreferences({
      deliveryTimePreference: {
        ...preferences.deliveryTimePreference,
        weekdays,
        avoidWeekends: value,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load preferences</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPreferences}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courier Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Preferred Courier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Courier</Text>
          {COURIERS.map((courier) => (
            <TouchableOpacity
              key={courier.value}
              style={styles.radioItem}
              onPress={() =>
                savePreferences({ preferredCourier: courier.value as any })
              }
            >
              <View
                style={[
                  styles.radio,
                  preferences.preferredCourier === courier.value && styles.radioSelected,
                ]}
              >
                {preferences.preferredCourier === courier.value && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <Text style={styles.radioLabel}>{courier.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Time Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Days</Text>
          <View style={styles.weekdaysContainer}>
            {WEEKDAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.weekdayButton,
                  preferences.deliveryTimePreference.weekdays.includes(day as any) &&
                    styles.weekdayButtonSelected,
                ]}
                onPress={() => toggleWeekday(day)}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    preferences.deliveryTimePreference.weekdays.includes(day as any) &&
                      styles.weekdayTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Avoid Weekends</Text>
            <Switch
              value={preferences.deliveryTimePreference.avoidWeekends}
              onValueChange={handleAvoidWeekendsToggle}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={preferences.deliveryTimePreference.avoidWeekends ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Contactless Delivery</Text>
            <Switch
              value={preferences.deliveryInstructions.contactlessDelivery}
              onValueChange={(value) =>
                savePreferences({
                  deliveryInstructions: {
                    ...preferences.deliveryInstructions,
                    contactlessDelivery: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Leave at Door</Text>
            <Switch
              value={preferences.deliveryInstructions.leaveAtDoor}
              onValueChange={(value) =>
                savePreferences({
                  deliveryInstructions: {
                    ...preferences.deliveryInstructions,
                    leaveAtDoor: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Signature Required</Text>
            <Switch
              value={preferences.deliveryInstructions.signatureRequired}
              onValueChange={(value) =>
                savePreferences({
                  deliveryInstructions: {
                    ...preferences.deliveryInstructions,
                    signatureRequired: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Call Before Delivery</Text>
            <Switch
              value={preferences.deliveryInstructions.callBeforeDelivery}
              onValueChange={(value) =>
                savePreferences({
                  deliveryInstructions: {
                    ...preferences.deliveryInstructions,
                    callBeforeDelivery: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <Text style={styles.inputLabel}>Special Instructions</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={preferences.deliveryInstructions.specificInstructions}
            onChangeText={(text) =>
              savePreferences({
                deliveryInstructions: {
                  ...preferences.deliveryInstructions,
                  specificInstructions: text,
                },
              })
            }
            placeholder="Add any special delivery instructions..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Courier Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Notifications</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>SMS Updates</Text>
            <Switch
              value={preferences.courierNotifications.smsUpdates}
              onValueChange={(value) =>
                savePreferences({
                  courierNotifications: {
                    ...preferences.courierNotifications,
                    smsUpdates: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Email Updates</Text>
            <Switch
              value={preferences.courierNotifications.emailUpdates}
              onValueChange={(value) =>
                savePreferences({
                  courierNotifications: {
                    ...preferences.courierNotifications,
                    emailUpdates: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>WhatsApp Updates</Text>
            <Switch
              value={preferences.courierNotifications.whatsappUpdates}
              onValueChange={(value) =>
                savePreferences({
                  courierNotifications: {
                    ...preferences.courierNotifications,
                    whatsappUpdates: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Call Updates</Text>
            <Switch
              value={preferences.courierNotifications.callUpdates}
              onValueChange={(value) =>
                savePreferences({
                  courierNotifications: {
                    ...preferences.courierNotifications,
                    callUpdates: value,
                  },
                })
              }
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.successText}>Preferences saved!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  weekdayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  weekdayButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  weekdayTextSelected: {
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savingIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  successIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
