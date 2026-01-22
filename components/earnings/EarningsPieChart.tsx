// Earnings Pie Chart Component
// Visualizes earnings breakdown by category

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { EarningsBreakdown } from '@/services/earningsCalculationService';
import { useRegion } from '@/contexts/RegionContext';

interface EarningsPieChartProps {
  breakdown: EarningsBreakdown;
  size?: number;
}

interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

const EarningsPieChart: React.FC<EarningsPieChartProps> = ({
  breakdown,
  size = 200,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const radius = size / 2;
  const strokeWidth = 30;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  // Define colors for each category
  const categoryColors: Record<string, string> = {
    videos: '#EC4899',
    projects: '#8B5CF6',
    referrals: '#10B981',
    cashback: '#F59E0B',
    socialMedia: '#3B82F6',
    bonus: '#EF4444',
  };

  // Create chart segments
  const segments: ChartSegment[] = [
    {
      label: 'Videos',
      value: breakdown.videos,
      color: categoryColors.videos,
      percentage: breakdown.total > 0 ? (breakdown.videos / breakdown.total) * 100 : 0,
    },
    {
      label: 'Projects',
      value: breakdown.projects,
      color: categoryColors.projects,
      percentage: breakdown.total > 0 ? (breakdown.projects / breakdown.total) * 100 : 0,
    },
    {
      label: 'Referrals',
      value: breakdown.referrals,
      color: categoryColors.referrals,
      percentage: breakdown.total > 0 ? (breakdown.referrals / breakdown.total) * 100 : 0,
    },
    {
      label: 'Cashback',
      value: breakdown.cashback,
      color: categoryColors.cashback,
      percentage: breakdown.total > 0 ? (breakdown.cashback / breakdown.total) * 100 : 0,
    },
    {
      label: 'Social Media',
      value: breakdown.socialMedia,
      color: categoryColors.socialMedia,
      percentage: breakdown.total > 0 ? (breakdown.socialMedia / breakdown.total) * 100 : 0,
    },
    {
      label: 'Bonus',
      value: breakdown.bonus,
      color: categoryColors.bonus,
      percentage: breakdown.total > 0 ? (breakdown.bonus / breakdown.total) * 100 : 0,
    },
  ].filter((segment) => segment.value > 0); // Only show segments with values

  // Calculate stroke dash offsets for each segment
  let currentOffset = 0;
  const segmentsWithOffsets = segments.map((segment) => {
    const segmentLength = (segment.percentage / 100) * circumference;
    const offset = currentOffset;
    currentOffset += segmentLength;

    return {
      ...segment,
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -offset,
    };
  });

  if (breakdown.total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No earnings data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${radius}, ${radius}`}>
            {segmentsWithOffsets.map((segment, index) => (
              <Circle
                key={`segment-${index}`}
                cx={radius}
                cy={radius}
                r={innerRadius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
              />
            ))}
          </G>
        </Svg>

        {/* Center label */}
        <View style={styles.centerLabel}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{currencySymbol}{breakdown.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>
              {segment.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default EarningsPieChart;
