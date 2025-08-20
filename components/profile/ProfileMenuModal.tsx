// ProfileMenuModal Component
// Modern half-slider modal with improved UI and logout functionality

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileMenuModalProps, ProfileMenuItem } from '@/types/profile.types';
import { PROFILE_COLORS, PROFILE_SPACING, PROFILE_RADIUS } from '@/types/profile.types';
import MenuItemCard from './MenuItemCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.88; // Slightly wider for modern look

export default function ProfileMenuModal({
  visible,
  onClose,
  user,
  menuSections,
  onMenuItemPress,
}: ProfileMenuModalProps) {
  const slideAnim = useRef(new Animated.Value(MODAL_WIDTH)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { actions } = useAuth();

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: MODAL_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              onClose(); // Close modal first
              await actions.logout(); // Logout from AuthContext
              router.replace('/sign-in'); // Navigate to sign-in page
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderModalHeader = () => (
    <LinearGradient
      colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
      style={[styles.headerContainer, { paddingTop: insets.top }]}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonBackground}>
            <Ionicons name="close" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.avatarPlaceholder}
            >
              <ThemedText style={styles.avatarText}>
                {user?.initials || 'U'}
              </ThemedText>
            </LinearGradient>
          </View>
          
          <View style={styles.userDetails}>
            <ThemedText style={styles.userName}>{user?.name || 'User Name'}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email || 'user@example.com'}</ThemedText>
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <ThemedText style={styles.verifiedText}>Verified Account</ThemedText>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="white" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
    </LinearGradient>
  );

  const renderMenuItem = (item: ProfileMenuItem) => (
    <MenuItemCard
      key={item.id}
      item={item}
      onPress={onMenuItemPress}
      style={styles.menuItemStyle}
    />
  );

  const renderMenuSection = (section: any, index: number) => (
    <View key={`section_${index}`} style={styles.menuSection}>
      {section.items.map(renderMenuItem)}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateX: slideAnim }],
              height: SCREEN_HEIGHT,
              paddingBottom: insets.bottom
            }
          ]}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {renderModalHeader()}
            
            <ScrollView
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.menuContent, { paddingBottom: Math.max(30, insets.bottom) }]}
              bounces={false}
            >
              <View style={styles.menuTitleSection}>
                <ThemedText style={styles.menuTitle}>Quick Actions</ThemedText>
                <View style={styles.titleUnderline} />
              </View>
              
              {menuSections?.map(renderMenuSection)}
              
              <View style={styles.footerSpace} />
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  
  // Header Styles
  headerContainer: {
    paddingBottom: 30,
    borderTopLeftRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  closeButton: {
    zIndex: 10,
  },
  closeButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  
  // Menu Styles
  menuContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  menuContent: {
    paddingTop: 10,
    flexGrow: 1,
  },
  menuTitleSection: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: PROFILE_COLORS.primary,
    borderRadius: 2,
  },
  menuSection: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  menuItemStyle: {
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: PROFILE_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  footerSpace: {
    height: 30,
  },
});