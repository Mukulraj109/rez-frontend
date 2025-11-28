import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface StoreInfo {
  name: string;
  description?: string;
  establishedYear: number;
  address: {
    doorNo: string;
    floor: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pinCode: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  deliveryInfo?: {
    deliveryTime?: string;
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryAbove?: number;
  };
  isOpen: boolean;
  categories: string[];
  hours: {
    day: string;
    time: string;
  }[];
}

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  storeData?: StoreInfo;
}

export default function AboutModal({ visible, onClose, storeData }: AboutModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const slideAnim = useRef(new Animated.Value(screenData.height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      slideAnim.setValue(window.height);
    });

    return () => subscription?.remove();
  }, [slideAnim]);

  const defaultStoreData: StoreInfo = {
    name: 'Reliance Trends',
    establishedYear: 2020,
    address: {
      doorNo: '40A',
      floor: '1st floor',
      street: '5th A Main Rd',
      area: 'H Block, HBR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560043',
    },
    isOpen: true,
    categories: ['Boys', 'Girls', 'Personal items', 'Gift cards', 'Loyalty program'],
    hours: [
      { day: 'Monday', time: '10:00 AM - 6:00 PM' },
      { day: 'Tuesday', time: '10:00 AM - 6:00 PM' },
      { day: 'Wednesday', time: '10:00 AM - 6:00 PM' },
      { day: 'Thursday', time: '10:00 AM - 6:00 PM' },
      { day: 'Friday', time: '10:00 AM - 6:00 PM' },
      { day: 'Saturday', time: '10:00 AM - 6:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ],
  };

  const store = storeData || defaultStoreData;
  const styles = createStyles(screenData);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenData.height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  const formatAddress = () => {
    const { doorNo, floor, street, area, city, state, pinCode } = store.address;
    
    // Build address parts, only including non-empty fields
    const addressParts: string[] = [];
    
    // Add door number and floor only if both are present
    if (doorNo && floor) {
      addressParts.push(`Door no. ${doorNo} - ${floor}`);
    } else if (doorNo) {
      addressParts.push(`Door no. ${doorNo}`);
    } else if (floor) {
      addressParts.push(floor);
    }
    
    // Add street address
    if (street) {
      addressParts.push(street);
    }
    
    // Add area/landmark
    if (area) {
      addressParts.push(area);
    }
    
    // Add city
    if (city) {
      addressParts.push(city);
    }
    
    // Add state and pincode
    const statePinParts: string[] = [];
    if (state) {
      statePinParts.push(state);
    }
    if (pinCode) {
      statePinParts.push(pinCode);
    }
    
    // Combine all parts
    let formattedAddress = addressParts.join(', ');
    if (statePinParts.length > 0) {
      formattedAddress += (addressParts.length > 0 ? ', ' : '') + statePinParts.join(' ');
    }
    
    // Fallback if nothing is available
    return formattedAddress || 'Address not available';
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="About store dialog"
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleModalPress}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.modal}>
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close about store"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to close this dialog"
                >
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                  {/* About Section */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                    <ThemedText style={styles.establishedText}>Est. Year - {store.establishedYear}</ThemedText>
                    
                    {/* Store Description */}
                    {store.description && (
                      <ThemedText style={styles.descriptionText}>{store.description}</ThemedText>
                    )}
                    
                    <ThemedText style={styles.addressText}>{formatAddress()}</ThemedText>
                    {(store.address.state || store.address.city || store.address.pinCode) && (
                      <ThemedText style={styles.stateText}>
                        {[
                          store.address.state && `State - ${store.address.state}`,
                          store.address.city && `City - ${store.address.city}`,
                          store.address.pinCode && `Pin Code - ${store.address.pinCode}`
                        ].filter(Boolean).join(', ')}
                      </ThemedText>
                    )}

                    <TouchableOpacity
                      style={styles.openNowButton}
                      accessibilityLabel="Store is currently open"
                      accessibilityRole="button"
                      accessibilityHint="Store operating status indicator"
                    >
                      <ThemedText style={styles.openNowText}>Open now</ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Contact Information Section */}
                  {store.contact && (store.contact.phone || store.contact.email || store.contact.website || store.contact.whatsapp) && (
                    <View style={styles.section}>
                      <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
                      {store.contact.phone && (
                        <View style={styles.contactRow}>
                          <Ionicons name="call-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.contactText}>{store.contact.phone}</ThemedText>
                        </View>
                      )}
                      {store.contact.email && (
                        <View style={styles.contactRow}>
                          <Ionicons name="mail-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.contactText}>{store.contact.email}</ThemedText>
                        </View>
                      )}
                      {store.contact.website && (
                        <View style={styles.contactRow}>
                          <Ionicons name="globe-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.contactText}>{store.contact.website}</ThemedText>
                        </View>
                      )}
                      {store.contact.whatsapp && (
                        <View style={styles.contactRow}>
                          <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                          <ThemedText style={styles.contactText}>{store.contact.whatsapp}</ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Delivery Information Section */}
                  {store.deliveryInfo && (store.deliveryInfo.deliveryTime || store.deliveryInfo.minimumOrder !== undefined || store.deliveryInfo.deliveryFee !== undefined || store.deliveryInfo.freeDeliveryAbove !== undefined) && (
                    <View style={styles.section}>
                      <ThemedText style={styles.sectionTitle}>Delivery</ThemedText>
                      {store.deliveryInfo.deliveryTime && (
                        <View style={styles.deliveryRow}>
                          <Ionicons name="time-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.deliveryText}>Delivery Time: {store.deliveryInfo.deliveryTime}</ThemedText>
                        </View>
                      )}
                      {store.deliveryInfo.minimumOrder !== undefined && (
                        <View style={styles.deliveryRow}>
                          <Ionicons name="cash-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.deliveryText}>Minimum Order: ₹{store.deliveryInfo.minimumOrder}</ThemedText>
                        </View>
                      )}
                      {store.deliveryInfo.deliveryFee !== undefined && (
                        <View style={styles.deliveryRow}>
                          <Ionicons name="bicycle-outline" size={16} color="#7C3AED" />
                          <ThemedText style={styles.deliveryText}>Delivery Fee: ₹{store.deliveryInfo.deliveryFee}</ThemedText>
                        </View>
                      )}
                      {store.deliveryInfo.freeDeliveryAbove !== undefined && (
                        <View style={styles.deliveryRow}>
                          <Ionicons name="gift-outline" size={16} color="#10B981" />
                          <ThemedText style={styles.deliveryText}>Free Delivery Above: ₹{store.deliveryInfo.freeDeliveryAbove}</ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Products Section */}
                  <View style={styles.section}>
                    <ThemedText style={styles.productsSectionTitle}>Products</ThemedText>
                    <View style={styles.tagsContainer}>
                      {store.categories.map((category, index) => (
                        <View key={index} style={styles.tag}>
                          <ThemedText style={styles.tagText}>{category}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Store Hours Section */}
                  <View style={styles.section}>
                    {store.hours.map((schedule, index) => (
                      <View key={index} style={styles.hourRow}>
                        <ThemedText style={styles.dayText}>{schedule.day}</ThemedText>
                        <ThemedText style={styles.timeText}>{schedule.time}</ThemedText>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
);
}

const createStyles = (screenData: { width: number; height: number }) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    blurContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    blur: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: 20,
      width: '100%',
      maxHeight: '90%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 6,
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    scrollView: {
      marginTop: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      color: '#111',
    },
  establishedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  stateText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
    openNowButton: {
      backgroundColor: '#50C2C9',
      borderRadius: 30,
      paddingVertical: 12,
      alignItems: 'center',
    },
    openNowText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    productsSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
      color: '#111',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    tagText: {
      fontSize: 13,
      color: '#333',
    },
    hourRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#ddd',
    },
    dayText: {
      fontSize: 14,
      color: '#111',
      fontWeight: '500',
    },
    timeText: {
      fontSize: 14,
      color: '#666',
    },
  });
};
