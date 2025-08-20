import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Project } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';
import ProjectCard from './ProjectCard';

interface RecentProjectsSectionProps {
  projects: Project[];
  onProjectPress: (project: Project) => void;
  onStartProject?: (project: Project) => void;
  onSeeAll: () => void;
  loading?: boolean;
}

export default function RecentProjectsSection({ 
  projects, 
  onProjectPress, 
  onStartProject,
  onSeeAll,
  loading = false
}: RecentProjectsSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          Recent Projects
        </ThemedText>
        
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>See all</ThemedText>
          <Ionicons name="arrow-forward" size={16} color={EARN_COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading projects...</ThemedText>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={48} color={EARN_COLORS.textTertiary} />
          <ThemedText style={styles.emptyTitle}>No projects available</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            New projects will appear here when they become available
          </ThemedText>
        </View>
      ) : (
        <ScrollView 
          style={styles.projectsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => onProjectPress(project)}
              onStart={onStartProject ? () => onStartProject(project) : undefined}
            />
          ))}
          
          {projects.length >= 5 && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={onSeeAll}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.loadMoreText}>Load More Projects</ThemedText>
              <Ionicons name="chevron-down" size={20} color={EARN_COLORS.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: EARN_COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: EARN_COLORS.primary,
  },
  projectsList: {
    maxHeight: 600, // Limit height to prevent infinite scroll issues
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: EARN_COLORS.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: EARN_COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: EARN_COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EARN_COLORS.backgroundCard,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: EARN_COLORS.primary,
    borderStyle: 'dashed',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: EARN_COLORS.primary,
  },
});