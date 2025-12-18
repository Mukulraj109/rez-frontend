import React, { useState, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WalletBalanceCardProps } from '@/types/wallet';

const WalletBalanceCardComponent: React.FC<WalletBalanceCardProps> = ({
  coin,
  onPress,
  isLoading = false,
  showChevron = true,
  testID,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [spinAnim] = useState(new Animated.Value(0));
  const [imageError, setImageError] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  // Loading animation
  React.useEffect(() => {
    if (isLoading) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }
  }, [isLoading, spinAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = useCallback(() => {
    if (onPress && !isLoading) {
      onPress(coin);
    }
  }, [onPress, coin, isLoading]);

  const renderIcon = () => {
    if (imageError) {
      // Icon based on coin type
      const iconName = coin.type === 'rez' ? 'diamond' : coin.type === 'promo' ? 'gift' : 'star';
      const iconColor = coin.color || '#00C06A';
      return (
        <View style={[styles.iconWrap, { backgroundColor: coin.backgroundColor }]}>
          <Ionicons
            name={iconName}
            size={26}
            color={iconColor}
          />
        </View>
      );
    }

    return (
      <View style={[styles.iconWrap, { backgroundColor: coin.backgroundColor }]}>
        <Image
          source={coin.iconPath}
          style={styles.icon}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
    );
  };

  const styles = createStyles(screenWidth);

  const cardContent = (
    <Animated.View
      style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}
      testID={testID}
    >
      <View style={styles.row}>
        {renderIcon()}

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{coin.name}</Text>
            {coin.isActive && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#1dac52ff" />
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>

          <Text style={[styles.amount, { color: coin.color || '#00C06A' }]}>{coin.formattedAmount}</Text>

          {coin.description && (
            <Text style={styles.desc} numberOfLines={2}>
              {coin.description}
            </Text>
          )}

          {coin.expiryDate && (
            <View style={styles.expiryContainer}>
              <Ionicons name="time-outline" size={14} color="#f0ede8ff" />
              <Text style={styles.expiryText}>
                Expires{' '}
                {coin.expiryDate.toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {showChevron && (
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Animated.View
            style={[
              styles.loadingIndicator,
              {
                transform: [
                  {
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isLoading}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

export const WalletBalanceCard = memo(WalletBalanceCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.coin.id === nextProps.coin.id &&
    prevProps.coin.amount === nextProps.coin.amount &&
    prevProps.coin.formattedAmount === nextProps.coin.formattedAmount &&
    prevProps.coin.isActive === nextProps.coin.isActive &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.showChevron === nextProps.showChevron &&
    prevProps.onPress === nextProps.onPress
  );
});

const createStyles = (screenWidth: number) => {
  const isTablet = screenWidth > 768;
  const isSmallScreen = screenWidth < 375;

  return StyleSheet.create({
    cardWrap: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: isTablet ? 22 : isSmallScreen ? 14 : 18,
      marginBottom: isTablet ? 18 : 14,
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(124, 58, 237, 0.08)',
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrap: {
      width: isTablet ? 50 : isSmallScreen ? 42 : 46,
      height: isTablet ? 50 : isSmallScreen ? 42 : 46,
      borderRadius: isTablet ? 18 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isTablet ? 18 : 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
      elevation: 3,
    },
    icon: {
      width: isTablet ? 30 : isSmallScreen ? 24 : 26,
      height: isTablet ? 30 : isSmallScreen ? 24 : 26,
    },
    contentContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      color: '#111827',
      fontWeight: '700',
      fontSize: isTablet ? 18 : isSmallScreen ? 15 : 16,
      letterSpacing: 0.3,
      flex: 1,
    },
    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E8FDEB',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    activeBadgeText: {
      color: '#16A34A',
      fontSize: 10,
      fontWeight: '600',
      marginLeft: 3,
    },
    amount: {
      color: '#7C3AED',
      fontWeight: '800',
      fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
      marginBottom: 6,
      letterSpacing: 0.4,
    },
    desc: {
      color: '#6B7280',
      fontSize: isTablet ? 15 : isSmallScreen ? 13 : 14,
      lineHeight: isTablet ? 20 : 18,
      fontWeight: '500',
    },
    expiryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    expiryText: {
      color: '#f4f2edff',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    chevronContainer: {
      marginLeft: 8,
      padding: 4,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderTopColor: '#7C3AED',
    },
  });
};
