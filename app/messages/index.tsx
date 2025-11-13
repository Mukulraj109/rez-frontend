// Messages Index Page
// Shows all conversations with stores

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { PROFILE_COLORS } from '@/types/profile.types';
import ConversationList from '@/components/messages/ConversationList';
import storeMessagingService from '@/services/storeMessagingApi';
import { Conversation, ConversationFilter } from '@/types/messaging.types';
import { useSocket } from '@/contexts/SocketContext';
import { MessagingSocketEvents } from '@/types/messaging.types';

export default function MessagesIndexPage() {
  const router = useRouter();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    }
    setError(null);

    try {
      const filter: ConversationFilter = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        status: activeFilter === 'all' ? undefined : activeFilter as any,
      };

      const response = await storeMessagingService.getConversations(filter);

      if (response.success && response.data) {
        const newConversations = response.data.conversations;

        if (append) {
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }

        setHasMore(response.data.pagination.current < response.data.pagination.pages);
        setCurrentPage(page);
        setTotalUnread(response.data.summary.unreadCount);
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeFilter]);

  // Initial load
  useEffect(() => {
    loadConversations(1, false);
  }, [loadConversations]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (payload: any) => {
      // Update conversation with new message
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === payload.conversationId) {
            return {
              ...conv,
              lastMessage: payload.message,
              unreadCount: conv.unreadCount + 1,
              updatedAt: payload.message.createdAt,
            };
          }
          return conv;
        })
      );
      // Update unread count
      setTotalUnread(prev => prev + 1);
    };

    const handleConversationCreated = (payload: any) => {
      // Add new conversation to list
      setConversations(prev => [payload.conversation, ...prev]);
    };

    const handleConversationUpdated = (payload: any) => {
      // Update existing conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === payload.conversation.id ? payload.conversation : conv
        )
      );
    };

    socket.on(MessagingSocketEvents.MESSAGE_RECEIVED, handleMessageReceived);
    socket.on(MessagingSocketEvents.CONVERSATION_CREATED, handleConversationCreated);
    socket.on(MessagingSocketEvents.CONVERSATION_UPDATED, handleConversationUpdated);

    return () => {
      socket.off(MessagingSocketEvents.MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(MessagingSocketEvents.CONVERSATION_CREATED, handleConversationCreated);
      socket.off(MessagingSocketEvents.CONVERSATION_UPDATED, handleConversationUpdated);
    };
  }, [socket]);

  const handleBackPress = () => {
    router.back();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(1, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadConversations(currentPage + 1, true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    setConversations([]);
    loadConversations(1, false);
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={PROFILE_COLORS.primary} />
          <ThemedText style={styles.emptyText}>Loading conversations...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>Error Loading Messages</ThemedText>
          <ThemedText style={styles.emptySubtext}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadConversations(1, false)}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
        <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          {searchQuery
            ? 'No conversations match your search'
            : 'Your conversations with stores will appear here'}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PROFILE_COLORS.primary}
        translucent={false}
      />

      {/* Header */}
      <LinearGradient
        colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Messages</ThemedText>
            {totalUnread > 0 && (
              <View style={styles.headerBadge}>
                <ThemedText style={styles.headerBadgeText}>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.headerButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => handleFilterChange('all')}
        >
          <ThemedText
            style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}
          >
            All
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'active' && styles.filterTabActive]}
          onPress={() => handleFilterChange('active')}
        >
          <ThemedText
            style={[styles.filterTabText, activeFilter === 'active' && styles.filterTabTextActive]}
          >
            Active
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'archived' && styles.filterTabActive]}
          onPress={() => handleFilterChange('archived')}
        >
          <ThemedText
            style={[styles.filterTabText, activeFilter === 'archived' && styles.filterTabTextActive]}
          >
            Archived
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <ConversationList
        conversations={conversations}
        loading={loading}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onLoadMore={handleLoadMore}
        ListEmptyComponent={renderEmpty()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerBadge: {
    backgroundColor: PROFILE_COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: 'white',
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterTabActive: {
    backgroundColor: PROFILE_COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PROFILE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
