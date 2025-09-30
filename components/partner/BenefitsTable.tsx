import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PartnerLevel, PartnerBenefit } from '@/types/partner.types';

interface BenefitsTableProps {
  levels: PartnerLevel[];
  currentLevel: number;
  onUpgradePress?: (targetLevel: PartnerLevel) => void;
}

export default function BenefitsTable({ 
  levels, 
  currentLevel = 1,
  onUpgradePress 
}: BenefitsTableProps) {
  // Create a comprehensive benefits matrix
  const allBenefitTypes = [
    { key: 'cashback', name: 'We come as cashback', icon: 'cash-outline' },
    { key: 'birthday', name: 'Birthday Flat Off on your referring', icon: 'gift-outline' },
    { key: 'freeDelivery', name: 'Free MASSAGE TB MERCHANDISE', icon: 'bicycle-outline' },
    { key: 'priority', name: 'After every 11 transactions', icon: 'time-outline' },
  ];

  const getBenefitValue = (level: PartnerLevel, benefitKey: string): string => {
    switch (benefitKey) {
      case 'cashback':
        return level.level === 1 ? '10%' : level.level === 2 ? '15%' : '20%';
      case 'birthday':
        return level.level === 1 ? '15%' : level.level === 2 ? '20%' : '25%';
      case 'freeDelivery':
        return level.level >= 2 ? '15%' : '15%';
      case 'priority':
        return level.level >= 3 ? '15%' : '15%';
      default:
        return '15%';
    }
  };

  const isBenefitActive = (level: PartnerLevel, benefitKey: string): boolean => {
    switch (benefitKey) {
      case 'cashback':
      case 'birthday':
      case 'freeDelivery':
      case 'priority':
        return true; // All levels have all benefits in the design
      default:
        return false;
    }
  };

  const getLevelColor = (level: number): string[] => {
    switch (level) {
      case 1:
        return ['#8B5CF6', '#A78BFA'];
      case 2:
        return ['#10B981', '#34D399'];
      case 3:
        return ['#F59E0B', '#FBBF24'];
      default:
        return ['#6B7280', '#9CA3AF'];
    }
  };

  const getLevelIcon = (level: number): string => {
    switch (level) {
      case 1:
        return 'star-outline';
      case 2:
        return 'trophy-outline';
      case 3:
        return 'medal-outline';
      default:
        return 'ribbon-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.headerIconGradient}
          >
            <Ionicons name="grid" size={20} color="white" />
          </LinearGradient>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Benefits</Text>
          <Text style={styles.headerSubtitle}>Compare all partner levels and their benefits</Text>
        </View>
      </View>

      {/* Current Level Indicator */}
      <View style={styles.currentLevelContainer}>
        <Text style={styles.currentLevelText}>
          Current: <Text style={styles.currentLevelName}>
            Level {currentLevel} - {levels.find(l => l.level === currentLevel)?.name}
          </Text>
        </Text>
      </View>

      {/* Benefits Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableContainer}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.benefitNameColumn}>
              <Text style={styles.tableHeaderText}>Benefits</Text>
            </View>
            {levels.map((level) => (
              <View key={level.id} style={styles.levelColumn}>
                <LinearGradient
                  colors={getLevelColor(level.level)}
                  style={[
                    styles.levelHeader,
                    level.level === currentLevel && styles.currentLevelHeader
                  ]}
                >
                  <View style={styles.levelIconContainer}>
                    <Ionicons 
                      name={getLevelIcon(level.level)} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <Text style={styles.levelHeaderText}>Level {level.level}</Text>
                  <Text style={styles.levelHeaderName}>{level.name}</Text>
                  {level.level === currentLevel && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Benefit Rows */}
          {allBenefitTypes.map((benefitType, index) => (
            <View key={benefitType.key} style={[
              styles.benefitRow,
              index % 2 === 1 && styles.alternateRow
            ]}>
              {/* Benefit Name */}
              <View style={styles.benefitNameCell}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name={benefitType.icon as any} size={16} color="#8B5CF6" />
                </View>
                <Text style={styles.benefitNameText}>{benefitType.name}</Text>
              </View>

              {/* Benefit Values for each level */}
              {levels.map((level) => {
                const isActive = isBenefitActive(level, benefitType.key);
                const value = getBenefitValue(level, benefitType.key);
                const isCurrentLevel = level.level === currentLevel;

                return (
                  <View key={level.id} style={[
                    styles.benefitCell,
                    isCurrentLevel && styles.currentLevelCell
                  ]}>
                    <View style={[
                      styles.benefitValueContainer,
                      isActive && styles.activeBenefitContainer,
                      isCurrentLevel && isActive && styles.currentActiveBenefitContainer
                    ]}>
                      {isActive ? (
                        <>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={16} 
                            color={isCurrentLevel ? '#8B5CF6' : '#10B981'} 
                          />
                          <Text style={[
                            styles.benefitValue,
                            isCurrentLevel && styles.currentBenefitValue
                          ]}>
                            {value}
                          </Text>
                        </>
                      ) : (
                        <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={styles.benefitNameCell}>
              <Text style={styles.actionRowLabel}>Actions</Text>
            </View>
            {levels.map((level) => (
              <View key={level.id} style={styles.actionCell}>
                {level.level === currentLevel ? (
                  <View style={styles.currentLevelAction}>
                    <Text style={styles.currentLevelActionText}>Active</Text>
                  </View>
                ) : level.level < currentLevel ? (
                  <View style={styles.completedLevelAction}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.completedLevelActionText}>Completed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => onUpgradePress?.(level)}
                  >
                    <LinearGradient
                      colors={getLevelColor(level.level)}
                      style={styles.upgradeButtonGradient}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade</Text>
                      <Ionicons name="arrow-forward" size={12} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Level Requirements */}
      <View style={styles.requirementsSection}>
        <Text style={styles.requirementsSectionTitle}>Level Requirements</Text>
        <View style={styles.requirementsGrid}>
          {levels.map((level) => (
            <View key={level.id} style={[
              styles.requirementCard,
              level.level === currentLevel && styles.currentRequirementCard
            ]}>
              <LinearGradient
                colors={level.level === currentLevel ? getLevelColor(level.level) : ['#F9FAFB', '#F3F4F6']}
                style={styles.requirementCardGradient}
              >
                <View style={styles.requirementHeader}>
                  <Ionicons 
                    name={getLevelIcon(level.level)} 
                    size={16} 
                    color={level.level === currentLevel ? 'white' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.requirementLevelText,
                    level.level === currentLevel && styles.currentRequirementLevelText
                  ]}>
                    {level.name}
                  </Text>
                </View>
                <Text style={[
                  styles.requirementText,
                  level.level === currentLevel && styles.currentRequirementText
                ]}>
                  {level.requirements.orders} orders in {level.requirements.timeframe} days
                </Text>
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  currentLevelContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  currentLevelText: {
    fontSize: 14,
    color: '#4B5563',
  },
  currentLevelName: {
    fontWeight: '700',
    color: '#059669',
  },
  tableContainer: {
    marginBottom: 20,
  },
  table: {
    minWidth: 600,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  benefitNameColumn: {
    width: 180,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 8,
  },
  levelColumn: {
    width: 120,
  },
  levelHeader: {
    padding: 12,
    alignItems: 'center',
    borderTopRightRadius: 8,
  },
  currentLevelHeader: {
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  levelIconContainer: {
    marginBottom: 4,
  },
  levelHeaderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelHeaderName: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  currentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  alternateRow: {
    backgroundColor: '#F9FAFB',
  },
  benefitNameCell: {
    width: 180,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  benefitIconContainer: {
    marginRight: 8,
  },
  benefitNameText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  benefitCell: {
    width: 120,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  currentLevelCell: {
    backgroundColor: '#FEF3C7',
  },
  benefitValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    minWidth: 60,
  },
  activeBenefitContainer: {
    backgroundColor: '#D1FAE5',
  },
  currentActiveBenefitContainer: {
    backgroundColor: '#8B5CF620',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  benefitValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  currentBenefitValue: {
    color: '#8B5CF6',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  actionRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionCell: {
    width: 120,
    padding: 8,
    alignItems: 'center',
  },
  currentLevelAction: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  currentLevelActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  completedLevelAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  completedLevelActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  upgradeButton: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  requirementsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  requirementsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  requirementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  requirementCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currentRequirementCard: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  requirementCardGradient: {
    padding: 12,
    alignItems: 'center',
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  currentRequirementLevelText: {
    color: 'white',
  },
  requirementText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  currentRequirementText: {
    color: 'white',
  },
});