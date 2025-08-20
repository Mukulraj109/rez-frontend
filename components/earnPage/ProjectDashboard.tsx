import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProjectStatus } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';
import ProjectStatusCard from './ProjectStatusCard';

interface ProjectDashboardProps {
  projectStatus: ProjectStatus;
  onStatusPress: (status: string) => void;
}

export default function ProjectDashboard({ 
  projectStatus, 
  onStatusPress 
}: ProjectDashboardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          Project completion
        </ThemedText>
      </View>
      
      {/* Status Cards */}
      <View style={styles.statusCards}>
        <ProjectStatusCard
          label="Complete now"
          count={projectStatus.completeNow}
          color="#8B5CF6"
          onPress={() => onStatusPress('complete-now')}
        />
        
        <ProjectStatusCard
          label="In review"
          count={projectStatus.inReview}
          color="#F59E0B"
          onPress={() => onStatusPress('in-review')}
        />
        
        <ProjectStatusCard
          label="Completed"
          count={projectStatus.completed}
          color="#10B981"
          onPress={() => onStatusPress('completed')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    marginHorizontal: 10,
    backgroundColor: EARN_COLORS.backgroundCard,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: EARN_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  statusCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
