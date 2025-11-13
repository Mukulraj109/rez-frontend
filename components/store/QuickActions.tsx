// QuickActions.tsx
// Grid of quick action buttons for store pages (dynamic based on store type)

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { showAlert } from '@/components/common/CrossPlatformAlert';

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  visible?: boolean;
}

interface QuickActionsProps {
  storeId: string;
  storeName: string;
  bookingType?: 'RESTAURANT' | 'SERVICE' | 'CONSULTATION' | 'RETAIL' | 'HYBRID';
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location?: {
    coordinates?: [number, number];
    address?: string;
  };
  hasMenu?: boolean;
  variant?: 'default' | 'compact'; // Compact variant for cards
  maxActions?: number; // Limit number of actions displayed
  hideTitle?: boolean; // Option to hide "Quick Actions" title
}

const QuickActions: React.FC<QuickActionsProps> = ({
  storeId,
  storeName,
  bookingType = 'RETAIL',
  contact,
  location,
  hasMenu = false,
  variant = 'default',
  maxActions,
  hideTitle = false,
}) => {
  const router = useRouter();

  // Dynamic booking handlers based on booking type
  const handleBookTable = () => {
    router.push(`/booking/table?storeId=${storeId}`);
  };

  const handleBookAppointment = () => {
    router.push(`/booking/appointment?storeId=${storeId}`);
  };

  const handleBookConsultation = () => {
    router.push(`/booking/consultation?storeId=${storeId}`);
  };

  const handlePlanStoreVisit = () => {
    router.push(`/store-visit?storeId=${storeId}`);
  };

  const handleViewMenu = () => {
    router.push(`/menu?storeId=${storeId}`);
  };

  const handleCallStore = () => {
    if (!contact?.phone) {
      showAlert('No Phone Number', 'Phone number is not available for this store', undefined, 'warning');
      return;
    }

    const phoneNumber = contact.phone.replace(/[^0-9+]/g, '');
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          showAlert('Error', 'Phone dialer is not available', undefined, 'error');
        }
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        showAlert('Error', 'Failed to open phone dialer', undefined, 'error');
      });
  };

  const handleGetDirections = () => {
    if (!location?.coordinates) {
      showAlert('No Location', 'Location information is not available for this store', undefined, 'warning');
      return;
    }

    const [longitude, latitude] = location.coordinates;
    const label = encodeURIComponent(storeName);

    // Different map URLs for iOS and Android
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        showAlert('Error', 'Failed to open maps', undefined, 'error');
      });
  };

  const handleShareStore = async () => {
    try {
      const message = `Check out ${storeName}! ${location?.address || ''}`;
      const url = `https://app.example.com/store/${storeId}`;

      await Share.share({
        message: `${message}\n${url}`,
        url: url,
        title: storeName,
      });
    } catch (error) {
      console.error('Error sharing store:', error);
      showAlert('Error', 'Failed to share store', undefined, 'error');
    }
  };

  const handleViewReviews = () => {
    router.push(`/reviews/${storeId}`);
  };

  const handleMessaging = () => {
    router.push(`/messages?storeId=${storeId}&storeName=${encodeURIComponent(storeName)}`);
  };

  const handleViewOffers = () => {
    router.push(`/offers?storeId=${storeId}`);
  };

  // Build actions array based on booking type and available data
  const actions = useMemo<QuickAction[]>(() => {
    const allActions: QuickAction[] = [];

    // Add booking action based on bookingType
    if (bookingType === 'RESTAURANT') {
      allActions.push({
        id: 'book-table',
        label: 'Book a Table',
        icon: 'restaurant',
        onPress: handleBookTable,
        visible: true,
      });
    } else if (bookingType === 'SERVICE') {
      allActions.push({
        id: 'book-appointment',
        label: 'Book Appointment',
        icon: 'calendar',
        onPress: handleBookAppointment,
        visible: true,
      });
    } else if (bookingType === 'CONSULTATION') {
      allActions.push({
        id: 'book-consultation',
        label: 'Book Consultation',
        icon: 'medical',
        onPress: handleBookConsultation,
        visible: true,
      });
    } else if (bookingType === 'RETAIL') {
      allActions.push({
        id: 'plan-visit',
        label: 'Plan Store Visit',
        icon: 'time',
        onPress: handlePlanStoreVisit,
        visible: true,
      });
    } else if (bookingType === 'HYBRID') {
      // Hybrid stores can have multiple booking options
      allActions.push({
        id: 'book-table',
        label: 'Book a Table',
        icon: 'restaurant',
        onPress: handleBookTable,
        visible: true,
      });
      allActions.push({
        id: 'book-appointment',
        label: 'Book Appointment',
        icon: 'calendar',
        onPress: handleBookAppointment,
        visible: true,
      });
    }

    // Add other common actions
    if (hasMenu) {
      allActions.push({
        id: 'menu',
        label: 'View Menu',
        icon: 'list',
        onPress: handleViewMenu,
        visible: true,
      });
    }

    allActions.push(
      {
        id: 'call',
        label: 'Call Store',
        icon: 'call',
        onPress: handleCallStore,
        visible: !!contact?.phone,
      },
      {
        id: 'directions',
        label: 'Get Directions',
        icon: 'navigate',
        onPress: handleGetDirections,
        visible: !!location?.coordinates,
      },
      {
        id: 'share',
        label: 'Share Store',
        icon: 'share-social',
        onPress: handleShareStore,
        visible: true,
      },
      {
        id: 'reviews',
        label: 'View Reviews',
        icon: 'star',
        onPress: handleViewReviews,
        visible: true,
      },
      {
        id: 'message',
        label: 'Message',
        icon: 'chatbubble',
        onPress: handleMessaging,
        visible: true,
      },
      {
        id: 'offers',
        label: 'View Offers',
        icon: 'pricetag',
        onPress: handleViewOffers,
        visible: true,
      }
    );

    // Filter visible actions and limit based on maxActions or variant
    const filtered = allActions.filter(action => action.visible !== false);
    const limit = maxActions || (variant === 'compact' ? 4 : 6);
    return filtered.slice(0, limit);
  }, [bookingType, contact, location, hasMenu, variant, maxActions]);

  if (actions.length === 0) {
    return null;
  }

  const isCompact = variant === 'compact';
  const iconSize = isCompact ? 20 : 24;
  const iconContainerSize = isCompact ? 36 : 48;

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      {!hideTitle && <Text style={[styles.title, isCompact && styles.titleCompact]}>Quick Actions</Text>}
      <View style={[styles.grid, isCompact && styles.gridCompact]}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              isCompact && styles.iconContainerCompact,
              { width: iconContainerSize, height: iconContainerSize, borderRadius: iconContainerSize / 2 }
            ]}>
              <Ionicons name={action.icon} size={iconSize} color="#7C3AED" />
            </View>
            <Text style={[styles.actionLabel, isCompact && styles.actionLabelCompact]} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Compact variant styles
  containerCompact: {
    padding: 12,
    marginHorizontal: 0,
    marginVertical: 4,
  },
  titleCompact: {
    fontSize: 15,
    marginBottom: 10,
  },
  gridCompact: {
    gap: 8,
  },
  actionButtonCompact: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconContainerCompact: {
    marginBottom: 6,
  },
  actionLabelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default QuickActions;
