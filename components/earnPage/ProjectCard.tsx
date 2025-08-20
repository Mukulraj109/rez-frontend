import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ProjectCardProps } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';

export default function ProjectCard({ 
  project, 
  onPress, 
  onStart 
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return EARN_COLORS.success;
      case 'in_progress':
        return EARN_COLORS.warning;
      case 'completed':
        return EARN_COLORS.success;
      case 'in_review':
        return EARN_COLORS.info;
      default:
        return EARN_COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'in_review':
        return 'In Review';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {project.title}
            </ThemedText>
            <View style={styles.metadata}>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={EARN_COLORS.textSecondary} />
                <ThemedText style={styles.duration}>{project.duration}</ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}20` }]}>
                <ThemedText style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                  {getStatusText(project.status)}
                </ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.paymentContainer}>
            <ThemedText style={styles.payment}>
              ₹{project.payment}
            </ThemedText>
            <Ionicons name="arrow-forward" size={16} color={EARN_COLORS.primary} />
          </View>
        </View>
        
        {project.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {project.description}
          </ThemedText>
        )}
        
        {project.requirements && project.requirements.length > 0 && (
          <View style={styles.requirements}>
            <ThemedText style={styles.requirementsTitle}>Requirements:</ThemedText>
            <ThemedText style={styles.requirementsText} numberOfLines={1}>
              {project.requirements.join(', ')}
            </ThemedText>
          </View>
        )}
        
        {onStart && project.status === 'available' && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={(e) => {
              e.stopPropagation();
              onStart();
            }}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.startButtonText}>Start Project</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: EARN_COLORS.backgroundCard,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: EARN_COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: EARN_COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  payment: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EARN_COLORS.primary,
  },
  description: {
    fontSize: 13,
    color: EARN_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  requirements: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: EARN_COLORS.textPrimary,
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 11,
    color: EARN_COLORS.textSecondary,
    lineHeight: 14,
  },
  startButton: {
    backgroundColor: EARN_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});