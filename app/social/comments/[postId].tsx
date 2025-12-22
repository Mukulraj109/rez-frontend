// Comments Page
// Full comments view for a post

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  text: string;
  likes: number;
  time: string;
  replies?: Comment[];
  isLiked: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: { name: 'FashionLover', avatar: '👩', verified: false },
    text: 'This is absolutely stunning! Where did you get it? 😍',
    likes: 24,
    time: '2h',
    isLiked: false,
    replies: [
      {
        id: '1-1',
        user: { name: 'Creator', avatar: '🎨', verified: true },
        text: '@FashionLover Thanks! It\'s from Zara 🛍️',
        likes: 12,
        time: '1h',
        isLiked: true,
      },
    ],
  },
  {
    id: '2',
    user: { name: 'StyleGuru', avatar: '👔', verified: true },
    text: 'Great content as always! Keep it up 🔥',
    likes: 45,
    time: '3h',
    isLiked: true,
  },
  {
    id: '3',
    user: { name: 'ShopperQueen', avatar: '👸', verified: false },
    text: 'I need this in my life right now!',
    likes: 8,
    time: '4h',
    isLiked: false,
  },
  {
    id: '4',
    user: { name: 'TrendyTom', avatar: '🧔', verified: false },
    text: 'The quality looks amazing. Is it worth the price?',
    likes: 15,
    time: '5h',
    isLiked: false,
    replies: [
      {
        id: '4-1',
        user: { name: 'Creator', avatar: '🎨', verified: true },
        text: '@TrendyTom Absolutely! Best purchase I\'ve made 💯',
        likes: 7,
        time: '4h',
        isLiked: false,
      },
    ],
  },
  {
    id: '5',
    user: { name: 'BudgetBella', avatar: '👧', verified: false },
    text: 'Used the code from your bio and got 20% off! Thank you! 🙏',
    likes: 32,
    time: '6h',
    isLiked: true,
  },
];

export default function CommentsPage() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleLike = (commentId: string) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${userName} `);
    inputRef.current?.focus();
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: `new-${Date.now()}`,
      user: { name: 'You', avatar: '😊', verified: false },
      text: newComment,
      likes: 0,
      time: 'now',
      isLiked: false,
    };

    if (replyingTo) {
      setComments(prev =>
        prev.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentObj],
            };
          }
          return comment;
        })
      );
    } else {
      setComments([newCommentObj, ...comments]);
    }

    setNewComment('');
    setReplyingTo(null);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{comment.user.avatar}</ThemedText>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <ThemedText style={styles.userName}>
            {comment.user.name}
            {comment.user.verified && (
              <Ionicons name="checkmark-circle" size={12} color={Colors.info} />
            )}
          </ThemedText>
          <ThemedText style={styles.commentTime}>{comment.time}</ThemedText>
        </View>
        <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(comment.id)}
          >
            <Ionicons
              name={comment.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={comment.isLiked ? Colors.error : Colors.text.tertiary}
            />
            <ThemedText style={[
              styles.actionText,
              comment.isLiked && { color: Colors.error },
            ]}>
              {comment.likes}
            </ThemedText>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReply(comment.id, comment.user.name)}
            >
              <ThemedText style={styles.replyText}>Reply</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={16} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCommentWithReplies = ({ item }: { item: Comment }) => (
    <View>
      {renderComment(item)}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => renderComment(reply, true))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Comments</ThemedText>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderCommentWithReplies}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Reply Indicator */}
      {replyingTo && (
        <View style={styles.replyIndicator}>
          <ThemedText style={styles.replyIndicatorText}>
            Replying to {comments.find(c => c.id === replyingTo)?.user.name}
          </ThemedText>
          <TouchableOpacity onPress={() => {
            setReplyingTo(null);
            setNewComment('');
          }}>
            <Ionicons name="close" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputAvatar}>
          <ThemedText style={styles.inputAvatarText}>😊</ThemedText>
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleSendComment}
          disabled={!newComment.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={newComment.trim() ? Colors.primary[600] : Colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  sortButton: {
    padding: Spacing.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  separator: {
    height: Spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  replyItem: {
    marginLeft: Spacing.xl,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  userName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  commentTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  commentText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  replyText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  replyIndicatorText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  inputAvatarText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
