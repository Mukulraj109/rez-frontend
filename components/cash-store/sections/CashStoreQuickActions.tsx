/**
 * CashStoreQuickActions Component
 *
 * Quick action cards for Cash Store (Buy Coupons, Extra Coins)
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CashStoreQuickAction } from '../../../types/cash-store.types';

interface CashStoreQuickActionsProps {
  actions: CashStoreQuickAction[];
  onActionPress: (actionId: string) => void;
}

const CashStoreQuickActions: React.FC<CashStoreQuickActionsProps> = ({
  actions,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionCard}
          onPress={() => onActionPress(action.id)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={action.gradientColors || [action.backgroundColor, action.backgroundColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={action.icon as any}
                size={24}
                color="#FFFFFF"
              />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {action.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {action.subtitle}
              </Text>
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </View>

            {/* Badge if exists */}
            {action.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 90,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(CashStoreQuickActions);
