import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EarningCard as EarningCardType, EarningCardTheme } from '@/types/earning';

interface EarningCardProps {
  card: EarningCardType;
}

const themeConfig: Record<EarningCardType['theme'], EarningCardTheme> = {
  purple: {
    gradientColors: ['#8B5FBF', '#6A4C93'],
    iconColor: '#FFD700',
    textColor: '#FFFFFF',
    buttonColor: 'rgba(255, 255, 255, 0.2)',
  },
  teal: {
    gradientColors: ['#20B2AA', '#008B8B'],
    iconColor: '#FFD700',
    textColor: '#FFFFFF',
    buttonColor: 'rgba(255, 255, 255, 0.2)',
  },
  pink: {
    gradientColors: ['#FF69B4', '#DA70D6'],
    iconColor: '#FFD700',
    textColor: '#FFFFFF',
    buttonColor: 'rgba(255, 255, 255, 0.2)',
  },
};

const EarningCard: React.FC<EarningCardProps> = ({ card }) => {
  const theme = themeConfig[card.theme];

  const renderIcon = () => {
    // Placeholder for icons - will be replaced with actual icons in Phase 3
    switch (card.iconType) {
      case 'review':
        return (
          <View style={[styles.iconPlaceholder, { backgroundColor: theme.iconColor }]}>
            <Text style={styles.iconText}>📝</Text>
          </View>
        );
      case 'social':
        return (
          <View style={[styles.iconPlaceholder, { backgroundColor: theme.iconColor }]}>
            <Text style={styles.iconText}>📱</Text>
          </View>
        );
      case 'ugc':
        return (
          <View style={[styles.iconPlaceholder, { backgroundColor: theme.iconColor }]}>
            <Text style={styles.iconText}>🎥</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={theme.gradientColors}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          {/* Header with title and icon */}
          <View style={styles.cardHeader}>
            <View style={styles.titleSection}>
              <Text style={[styles.cardTitle, { color: theme.textColor }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardDescription, { color: theme.textColor }]}>
                {card.description}
              </Text>
            </View>
            <View style={styles.iconSection}>
              {renderIcon()}
            </View>
          </View>

          {/* Earning indicator */}
          <View style={styles.earningSection}>
            <View style={styles.coinIndicator}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={[styles.earningText, { color: theme.iconColor }]}>
                = ₹{card.earning}
              </Text>
            </View>
          </View>

          {/* Get started button */}
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.buttonColor }]}
            onPress={card.onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.textColor }]}>
              Get started
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  earningSection: {
    marginBottom: 16,
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  earningText: {
    fontSize: 16,
    fontWeight: '700',
  },
  getStartedButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EarningCard;