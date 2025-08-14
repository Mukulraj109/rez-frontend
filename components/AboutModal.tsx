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
    return `Door no. ${doorNo} - ${floor}, ${street}, ${area}, ${city}, ${state} ${pinCode}`;
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
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
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                  {/* About Section */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                    <ThemedText style={styles.establishedText}>Est. Year - {store.establishedYear}</ThemedText>
                    <ThemedText style={styles.addressText}>{formatAddress()}</ThemedText>
                    <ThemedText style={styles.stateText}>
                      India State - {store.address.state}, Area/City - {store.address.city}, Pin/Zip Code -{' '}
                      {store.address.pinCode}
                    </ThemedText>

                    <TouchableOpacity style={styles.openNowButton}>
                      <ThemedText style={styles.openNowText}>Open now</ThemedText>
                    </TouchableOpacity>
                  </View>

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
