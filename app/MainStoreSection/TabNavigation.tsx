import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
} from "@/constants/DesignSystem";

export type TabKey = "about" | "deals" | "reviews" | "photos";

interface TabData {
  key: TabKey;
  title: string;
  icon: string;
  activeIcon: string;
  badgeText?: string;
  showBadgeCount?: boolean;
}

const defaultTabs: TabData[] = [
  { key: "about", title: "Overview", icon: "information-circle-outline", activeIcon: "information-circle" },
  { key: "deals", title: "Offers", icon: "pricetag-outline", activeIcon: "pricetag", badgeText: "5% OFF" },
  { key: "reviews", title: "Reviews", icon: "star-outline", activeIcon: "star", showBadgeCount: true },
  { key: "photos", title: "Photos", icon: "images-outline", activeIcon: "images" },
];

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
  maxSavingsPercent?: number;
  reviewCount?: number;
  photoCount?: number;
  compact?: boolean; // For sticky header version
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  maxSavingsPercent,
  reviewCount,
  photoCount,
  compact = false,
}: TabNavigationProps) {
  const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get("window").width);

  // Build tabs with dynamic badges
  const tabs = React.useMemo(() => {
    return defaultTabs.map((tab) => {
      if (tab.key === "deals" && maxSavingsPercent) {
        return { ...tab, badgeText: `${maxSavingsPercent}% OFF` };
      }
      return tab;
    });
  }, [maxSavingsPercent]);

  const tabCount = tabs.length;
  const tabWidth = containerWidth / tabCount;

  // Animated values for each tab
  const scaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;
  const bgAnims = useRef(tabs.map(() => new Animated.Value(0))).current;


  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeTab);
    animateToIndex(idx);
  }, [activeTab, containerWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width || Dimensions.get("window").width;
    setContainerWidth(w);
  };

  const animateToIndex = (index: number) => {
    // Animate tab backgrounds
    tabs.forEach((_, i) => {
      Animated.timing(bgAnims[i], {
        toValue: i === index ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.92,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (tabKey: TabKey) => {
    triggerImpact('Light');
    onTabChange(tabKey);
  };

  const formatBadgeCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getBadgeContent = (tab: TabData): { text: string; type: 'savings' | 'count' } | null => {
    if (tab.key === "deals" && tab.badgeText) {
      return { text: tab.badgeText, type: 'savings' };
    }
    if (tab.key === "reviews" && tab.showBadgeCount && reviewCount && reviewCount > 0) {
      return { text: formatBadgeCount(reviewCount), type: 'count' };
    }
    if (tab.key === "photos" && photoCount && photoCount > 0) {
      return { text: formatBadgeCount(photoCount), type: 'count' };
    }
    return null;
  };

  // Compact mode styles
  const iconSize = compact ? 18 : 22;
  const iconWrapperSize = compact ? 28 : 36;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={[styles.container, compact && styles.containerCompact]} onLayout={onLayout}>
        <View style={[styles.tabsRow, compact && styles.tabsRowCompact]}>
          {tabs.map((tab, index) => {
            const isActive = tab.key === activeTab;
            const badge = compact ? null : getBadgeContent(tab); // Hide badges in compact mode

            const bgColor = bgAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', 'rgba(0, 192, 106, 0.08)'],
            });

            return (
              <Animated.View
                key={tab.key}
                style={[
                  styles.tabWrapper,
                  { width: tabWidth },
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <Animated.View style={[styles.tabBg, compact && styles.tabBgCompact, { backgroundColor: bgColor }]} />
                <TouchableOpacity
                  style={[styles.tab, compact && styles.tabCompact]}
                  onPress={() => handlePress(tab.key)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  activeOpacity={1}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={[styles.tabContent, compact && styles.tabContentCompact]}>
                    {/* Icon */}
                    <View style={[
                      styles.iconWrapper,
                      isActive && styles.iconWrapperActive,
                      compact && { width: iconWrapperSize, height: iconWrapperSize, borderRadius: iconWrapperSize / 2 }
                    ]}>
                      <Ionicons
                        name={(isActive ? tab.activeIcon : tab.icon) as any}
                        size={iconSize}
                        color={isActive ? "#00C06A" : "#9CA3AF"}
                      />
                    </View>

                    {/* Label */}
                    <ThemedText style={[
                      styles.label,
                      isActive && styles.labelActive,
                      compact && styles.labelCompact
                    ]}>
                      {tab.title}
                    </ThemedText>

                    {/* Badge - Hide in compact mode */}
                    {!compact && (
                      <View style={styles.badgeContainer}>
                        {badge ? (
                          <View style={[styles.badge, badge.type === 'savings' ? styles.savingsBadge : styles.countBadge]}>
                            <ThemedText style={[styles.badgeText, badge.type === 'savings' ? styles.savingsBadgeText : styles.countBadgeText]}>
                              {badge.text}
                            </ThemedText>
                          </View>
                        ) : (
                          <View style={styles.badgePlaceholder} />
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 0,
    // 3D Shadow effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 6,
  },
  tabWrapper: {
    position: 'relative',
  },
  tabBg: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: 4,
    borderRadius: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
    paddingTop: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(0, 192, 106, 0.12)',
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#1F2937",
    fontWeight: "700",
  },

  // Badge Styles
  badgeContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePlaceholder: {
    height: 14,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    minHeight: 14,
    justifyContent: 'center',
  },
  savingsBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 0.5,
    borderColor: "#FCD34D",
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 7,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 10,
  },
  savingsBadgeText: {
    color: "#D97706",
  },
  countBadgeText: {
    color: "#6B7280",
  },

  // Compact mode styles (for sticky header)
  wrapperCompact: {
    borderRadius: 0,
    marginHorizontal: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  containerCompact: {
    borderRadius: 0,
  },
  tabsRowCompact: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  tabBgCompact: {
    top: 2,
    bottom: 2,
    left: 4,
    right: 4,
    borderRadius: 8,
  },
  tabCompact: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tabContentCompact: {
    gap: 1,
    paddingTop: 0,
  },
  labelCompact: {
    fontSize: 9,
    letterSpacing: 0.2,
  },
});
