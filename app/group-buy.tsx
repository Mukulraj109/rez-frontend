// Group Buy Page
// Complete Group Buying Feature Implementation

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useGroupBuying } from '@/hooks/useGroupBuying';
import { useAuth } from '@/contexts/AuthContext';
import GroupCard from '@/components/group-buying/GroupCard';
import GroupCreationModal from '@/components/group-buying/GroupCreationModal';
import GroupShareModal from '@/components/group-buying/GroupShareModal';
import GroupMembersList from '@/components/group-buying/GroupMembersList';
import GroupDiscountCalculator from '@/components/group-buying/GroupDiscountCalculator';
import {
  GroupBuyingGroup,
  GroupBuyingProduct,
  CreateGroupRequest,
  JoinGroupRequest,
} from '@/types/groupBuying.types';

const { width } = Dimensions.get('window');

type TabType = 'available' | 'my-groups' | 'products';

const GroupBuyPage = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const groupBuying = useGroupBuying();

  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GroupBuyingProduct | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupBuyingGroup | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [authState.isAuthenticated]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'available') {
        await groupBuying.refreshAvailableGroups();
      } else if (activeTab === 'my-groups') {
        await groupBuying.refreshMyGroups();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Handle create group
  const handleCreateGroup = async (data: CreateGroupRequest) => {
    const group = await groupBuying.createGroup(data);
    if (group) {
      Alert.alert(
        'Group Created!',
        'Your group has been created. Share it with friends to unlock bigger discounts!',
        [
          {
            text: 'Share Now',
            onPress: () => {
              setSelectedGroup(group);
              setShowShareModal(true);
            },
          },
          { text: 'Later', style: 'cancel' },
        ]
      );
      setActiveTab('my-groups');
    } else if (groupBuying.error) {
      Alert.alert('Error', groupBuying.error);
    }
  };

  // Handle join group by code
  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a group code');
      return;
    }

    const group = await groupBuying.getGroupByCode(joinCode.trim().toUpperCase());
    if (group) {
      Alert.alert(
        'Join Group?',
        `Join ${group.product.name} group? Current discount: ${group.currentTier.discountPercentage}% OFF`,
        [
          {
            text: 'Join',
            onPress: async () => {
              const joinData: JoinGroupRequest = {
                groupCode: joinCode.trim().toUpperCase(),
                quantity: 1,
              };
              const joinedGroup = await groupBuying.joinGroup(joinData);
              if (joinedGroup) {
                setJoinCode('');
                setShowJoinInput(false);
                setActiveTab('my-groups');
                Alert.alert('Success!', 'You have joined the group');
              } else if (groupBuying.error) {
                Alert.alert('Error', groupBuying.error);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert('Error', groupBuying.error || 'Group not found');
    }
  };

  // Handle group card press
  const handleGroupPress = (group: GroupBuyingGroup) => {
    if (expandedGroupId === group.id) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(group.id);
      groupBuying.getGroupDetails(group.id);
    }
  };

  // Handle product select for group creation
  const handleProductSelect = (product: GroupBuyingProduct) => {
    setSelectedProduct(product);
    setShowCreateModal(true);
  };

  // Handle leave group
  const handleLeaveGroup = (groupId: string) => {
    Alert.alert(
      'Leave Group?',
      'Are you sure you want to leave this group?',
      [
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const success = await groupBuying.leaveGroup(groupId);
            if (success) {
              Alert.alert('Success', 'You have left the group');
              setExpandedGroupId(null);
            } else if (groupBuying.error) {
              Alert.alert('Error', groupBuying.error);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Render available groups tab
  const renderAvailableGroups = () => {
    if (groupBuying.loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      );
    }

    if (groupBuying.availableGroups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Active Groups</Text>
          <Text style={styles.emptyText}>
            Be the first to create a group and start saving!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.createButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {groupBuying.availableGroups.map((group) => (
          <View key={group.id}>
            <GroupCard
              group={group}
              onPress={() => handleGroupPress(group)}
              showJoinButton={!groupBuying.myGroups.find((g) => g.id === group.id)}
            />

            {/* Expanded Group Details */}
            {expandedGroupId === group.id && (
              <View style={styles.expandedSection}>
                <GroupDiscountCalculator group={group} />
                <GroupMembersList
                  members={group.members}
                  creatorId={group.creatorId}
                  currentUserId={authState.user?.id}
                />
              </View>
            )}
          </View>
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  // Render my groups tab
  const renderMyGroups = () => {
    if (groupBuying.loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      );
    }

    if (groupBuying.myGroups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptyText}>
            Join or create a group to start saving with friends!
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setActiveTab('products')}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => setShowJoinInput(true)}
            >
              <Ionicons name="enter-outline" size={20} color="#8B5CF6" />
              <Text style={styles.joinButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {groupBuying.myGroups.map((group) => (
          <View key={group.id}>
            <GroupCard group={group} onPress={() => handleGroupPress(group)} />

            {/* Expanded Group Details */}
            {expandedGroupId === group.id && (
              <View style={styles.expandedSection}>
                <GroupDiscountCalculator group={group} />
                <GroupMembersList
                  members={group.members}
                  creatorId={group.creatorId}
                  currentUserId={authState.user?.id}
                />

                {/* Group Actions */}
                <View style={styles.groupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedGroup(group);
                      setShowShareModal(true);
                    }}
                  >
                    <Ionicons name="share-social" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Share Group</Text>
                  </TouchableOpacity>

                  {group.creatorId !== authState.user?.id && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.leaveButton]}
                      onPress={() => handleLeaveGroup(group.id)}
                    >
                      <Ionicons name="exit-outline" size={20} color="#EF4444" />
                      <Text style={styles.leaveButtonText}>Leave Group</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  // Render products tab
  const renderProducts = () => {
    if (groupBuying.loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    if (groupBuying.availableProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Products Available</Text>
          <Text style={styles.emptyText}>
            Check back later for new group buying deals!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {groupBuying.availableProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductSelect(product)}
            activeOpacity={0.8}
          >
            <View style={styles.productContent}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productStore}>{product.storeName}</Text>
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>₹{product.basePrice}</Text>
                <View style={styles.productDiscount}>
                  <Text style={styles.productDiscountText}>
                    Up to {product.discountTiers[product.discountTiers.length - 1]?.discountPercentage}% OFF
                  </Text>
                </View>
              </View>
              <View style={styles.productMeta}>
                <View style={styles.productMetaItem}>
                  <Ionicons name="people" size={14} color="#6B7280" />
                  <Text style={styles.productMetaText}>
                    {product.minMembers}-{product.maxMembers} members
                  </Text>
                </View>
                <View style={styles.productMetaItem}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={styles.productMetaText}>
                    {product.expiryDuration}h duration
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.createGroupButton}>
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Group Buy</Text>
            <Text style={styles.headerSubtitle}>Save more together</Text>
          </View>
          <TouchableOpacity
            style={styles.codeButton}
            onPress={() => setShowJoinInput(!showJoinInput)}
          >
            <Ionicons name="enter-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Join by Code Input */}
        {showJoinInput && (
          <View style={styles.joinCodeContainer}>
            <TextInput
              style={styles.joinCodeInput}
              placeholder="Enter group code"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
            />
            <TouchableOpacity style={styles.joinCodeButton} onPress={handleJoinByCode}>
              <Text style={styles.joinCodeButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'available' ? '#8B5CF6' : '#6B7280'}
          />
          <Text
            style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}
          >
            Available ({groupBuying.availableGroups.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-groups' && styles.tabActive]}
          onPress={() => setActiveTab('my-groups')}
        >
          <Ionicons
            name="person-circle"
            size={20}
            color={activeTab === 'my-groups' ? '#8B5CF6' : '#6B7280'}
          />
          <Text
            style={[styles.tabText, activeTab === 'my-groups' && styles.tabTextActive]}
          >
            My Groups ({groupBuying.myGroups.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons
            name="cube"
            size={20}
            color={activeTab === 'products' ? '#8B5CF6' : '#6B7280'}
          />
          <Text
            style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}
          >
            Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'available' && renderAvailableGroups()}
        {activeTab === 'my-groups' && renderMyGroups()}
        {activeTab === 'products' && renderProducts()}
      </View>

      {/* Modals */}
      <GroupCreationModal
        visible={showCreateModal}
        product={selectedProduct}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleCreateGroup}
      />

      <GroupShareModal
        visible={showShareModal}
        group={selectedGroup}
        onClose={() => {
          setShowShareModal(false);
          setSelectedGroup(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  codeButton: {
    padding: 8,
  },
  joinCodeContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  joinCodeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 2,
  },
  joinCodeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  joinCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  expandedSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  leaveButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productStore: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  productDiscount: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productDiscountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  productMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  productMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  createGroupButton: {
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default GroupBuyPage;
