// PeopleEarningSection.tsx - People are earning here section
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
} from "@/constants/DesignSystem";
import { storesApi } from "@/services/storesApi";

export interface EarningUser {
  id: string;
  name: string;
  avatar?: string;
  amountEarned: number;
  coinsEarned: number;
  timeAgo: string;
}

export interface PeopleEarningSectionProps {
  storeId?: string;
  users?: EarningUser[];
}

const SAMPLE_USERS: EarningUser[] = [
  {
    id: "1",
    name: "Amit",
    amountEarned: 120,
    coinsEarned: 60,
    timeAgo: "2 hours ago",
  },
  {
    id: "2",
    name: "Priya",
    amountEarned: 95,
    coinsEarned: 48,
    timeAgo: "5 hours ago",
  },
  {
    id: "3",
    name: "Rahul",
    amountEarned: 150,
    coinsEarned: 75,
    timeAgo: "1 day ago",
  },
];

// Avatar colors for users without profile pictures
const AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

export default function PeopleEarningSection({
  storeId,
  users: propUsers,
}: PeopleEarningSectionProps) {
  const [users, setUsers] = useState<EarningUser[]>(propUsers || SAMPLE_USERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchRecentEarnings();
    }
  }, [storeId]);

  const fetchRecentEarnings = async () => {
    if (!storeId) {
      return;
    }

    try {
      setLoading(true);
      const response = await storesApi.getRecentEarnings(storeId);

      if (response.success && response.data && response.data.length > 0) {
        setUsers(response.data);
      }
    } catch (error: any) {
      // Use sample data on error
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (index: number) => {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.sectionTitle}>People are earning here</ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <ThemedText style={styles.sectionTitle}>People are earning here</ThemedText>

      {/* Users List */}
      <View style={styles.usersList}>
        {users.map((user, index) => (
          <View key={user.id} style={styles.userCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(index) }]}>
                  <ThemedText style={styles.avatarInitial}>
                    {user.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <ThemedText style={styles.earningText}>
                {user.name} earned ₹{user.amountEarned}
              </ThemedText>
              <ThemedText style={styles.timeText}>{user.timeAgo}</ThemedText>
            </View>

            {/* Coins Earned */}
            <View style={styles.coinsContainer}>
              <Image
                source={require("@/assets/images/rez-coin.png")}
                style={styles.coinIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.coinsText}>+{user.coinsEarned}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  usersList: {
    gap: Spacing.sm,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  avatarContainer: {
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  earningText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF9500",
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
