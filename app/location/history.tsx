import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocationHistory } from '@/hooks/useLocation';
import { LocationHistoryEntry } from '@/types/location.types';

export default function LocationHistoryScreen() {
  const router = useRouter();
  const { locationHistory, isLoading, error, loadHistory, clearHistory } = useLocationHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadHistory();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Location History',
      'Are you sure you want to clear all location history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear location history');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'gps':
        return 'location';
      case 'manual':
        return 'hand-left';
      case 'ip':
        return 'globe';
      default:
        return 'location-outline';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'gps':
        return '#34C759';
      case 'manual':
        return '#007AFF';
      case 'ip':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const renderHistoryItem = ({ item }: { item: LocationHistoryEntry }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <View style={styles.sourceContainer}>
            <Ionicons
              name={getSourceIcon(item.source) as any}
              size={16}
              color={getSourceColor(item.source)}
            />
            <Text style={[styles.sourceText, { color: getSourceColor(item.source) }]}>
              {item.source.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>

        <Text style={styles.addressText} numberOfLines={2}>
          {item.address}
        </Text>

        {item.city && (
          <Text style={styles.cityText}>{item.city}</Text>
        )}

        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
          </Text>
        </View>

        <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="location-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No location history</Text>
      <Text style={styles.emptySubtitle}>
        Your location history will appear here as you use the app
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
      <Text style={styles.errorTitle}>Unable to load history</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location History</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
          disabled={locationHistory.length === 0}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={locationHistory.length === 0 ? '#C7C7CC' : '#FF3B30'}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={locationHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item.timestamp.getTime()}-${index}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
                colors={['#007AFF']}
              />
            }
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              locationHistory.length === 0 ? styles.emptyContainer : styles.listContainer
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 22,
  },
  cityText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  coordinatesContainer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
