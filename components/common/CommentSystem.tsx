// Comment System Component
// Reusable comment system for products, posts, and content

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likesCount: number;
  isLiked: boolean;
  parentId?: string; // For replies
  replies?: Comment[];
  canEdit: boolean;
  canDelete: boolean;
}

interface CommentSystemProps {
  entityId: string; // Product ID, Post ID, etc.
  entityType: 'product' | 'post' | 'ugc' | 'store';
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  allowReplies?: boolean;
  currentUserId?: string;
  isLoading?: boolean;
  style?: any;
}

export default function CommentSystem({
  entityId,
  entityType,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onRefresh,
  placeholder = "Add a comment...",
  maxLength = 500,
  allowReplies = true,
  currentUserId,
  isLoading = false,
  style,
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ commentId: string; content: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  
  const inputRef = useRef<TextInput>(null);

  const handleSubmitComment = async () => {
    const content = newComment.trim();
    if (!content) return;

    if (content.length > maxLength) {
      Alert.alert('Comment Too Long', `Comments cannot exceed ${maxLength} characters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingComment) {
        await onEditComment(editingComment.commentId, content);
        setEditingComment(null);
      } else {
        await onAddComment(content, replyTo?.commentId);
        setReplyTo(null);
      }
      setNewComment('');
      inputRef.current?.blur();
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment({ commentId: comment.id, content: comment.content });
    setNewComment(comment.content);
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleReplyToComment = (comment: Comment) => {
    if (!allowReplies) return;
    
    setReplyTo({ commentId: comment.id, userName: comment.userName });
    setEditingComment(null);
    setNewComment('');
    inputRef.current?.focus();
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => onDeleteComment(commentId) 
        },
      ]
    );
  };

  const handleLikeComment = (commentId: string) => {
    onLikeComment(commentId);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setReplyTo(null);
    setNewComment('');
    inputRef.current?.blur();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item: comment, index }: { item: Comment; index: number }) => (
    <View style={[styles.commentContainer, comment.parentId && styles.replyContainer]}>
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        {comment.userAvatar ? (
          <Image source={{ uri: comment.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>
              {comment.userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Comment Content */}
      <View style={styles.commentContent}>
        {/* Header */}
        <View style={styles.commentHeader}>
          <ThemedText style={styles.userName}>{comment.userName}</ThemedText>
          <ThemedText style={styles.timestamp}>{formatTimeAgo(comment.createdAt)}</ThemedText>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <ThemedText style={styles.editedLabel}>• edited</ThemedText>
          )}
        </View>

        {/* Comment Text */}
        <ThemedText style={styles.commentText}>{comment.content}</ThemedText>

        {/* Actions */}
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={[styles.actionButton, comment.isLiked && styles.likedButton]}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Ionicons 
              name={comment.isLiked ? 'heart' : 'heart-outline'} 
              size={14} 
              color={comment.isLiked ? '#EF4444' : '#666'} 
            />
            {comment.likesCount > 0 && (
              <ThemedText style={[styles.actionText, comment.isLiked && styles.likedText]}>
                {comment.likesCount}
              </ThemedText>
            )}
          </TouchableOpacity>

          {allowReplies && !comment.parentId && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReplyToComment(comment)}
            >
              <Ionicons name="chatbubble-outline" size={14} color="#666" />
              <ThemedText style={styles.actionText}>Reply</ThemedText>
            </TouchableOpacity>
          )}

          {comment.canEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditComment(comment)}
            >
              <Ionicons name="create-outline" size={14} color="#666" />
              <ThemedText style={styles.actionText}>Edit</ThemedText>
            </TouchableOpacity>
          )}

          {comment.canDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteComment(comment.id)}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <ThemedText style={[styles.actionText, styles.deleteText]}>Delete</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            <TouchableOpacity
              style={styles.showRepliesButton}
              onPress={() => toggleReplies(comment.id)}
            >
              <Ionicons
                name={expandedReplies.has(comment.id) ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#8B5CF6"
              />
              <ThemedText style={styles.showRepliesText}>
                {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} reply{comment.replies.length !== 1 ? 'ies' : ''}
              </ThemedText>
            </TouchableOpacity>

            {expandedReplies.has(comment.id) && (
              <View style={styles.repliesList}>
                {comment.replies.map((reply, replyIndex) => (
                  <View key={reply.id} style={styles.replyItem}>
                    {renderComment({ item: reply, index: replyIndex })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>
        Comments ({comments.length})
      </ThemedText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
      <ThemedText style={styles.emptyTitle}>No comments yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Be the first to share your thoughts!
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Comments List */}
      <FlatList
        data={comments.filter(c => !c.parentId)} // Only show top-level comments
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      {/* Input Section */}
      <View style={styles.inputContainer}>
        {(replyTo || editingComment) && (
          <View style={styles.inputContext}>
            <ThemedText style={styles.inputContextText}>
              {replyTo ? `Replying to ${replyTo.userName}` : 'Editing comment'}
            </ThemedText>
            <TouchableOpacity onPress={cancelEdit}>
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={maxLength}
            editable={!isSubmitting}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <Ionicons name="send" size={20} color="#8B5CF6" />
            )}
          </TouchableOpacity>
        </View>

        {newComment.length > 0 && (
          <ThemedText style={styles.characterCount}>
            {newComment.length}/{maxLength}
          </ThemedText>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  replyContainer: {
    marginLeft: 32,
    backgroundColor: '#F9FAFB',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  editedLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  likedButton: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  deleteText: {
    color: '#EF4444',
  },
  repliesContainer: {
    marginTop: 12,
  },
  showRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  showRepliesText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 4,
  },
  repliesList: {
    marginTop: 8,
  },
  replyItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  inputContextText: {
    fontSize: 13,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F9FAFB',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  characterCount: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
});