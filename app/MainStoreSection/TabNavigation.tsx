import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  InteractionManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
} from "@/constants/DesignSystem";

export type TabKey = "about" | "deals" | "reviews";

interface TabData {
  key: TabKey;
  title: string;
  icon: string;
}

const tabs: TabData[] = [
  { key: "about", title: "ABOUT", icon: "information-circle-outline" },
  { key: "deals", title: "Walk-In Deals", icon: "walk-outline" },
  { key: "reviews", title: "Reviews", icon: "star-outline" },
];

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
}

/**
 * Modern TabNavigation with animated underline.
 * - measures width to support responsive layouts
 * - animates translateX using native driver
 * - animates underline width (non-native) for smooth resizing
 */
export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get("window").width);
  const tabCount = tabs.length;
  const tabWidth = containerWidth / tabCount;

  // Animated values
  const translateX = useRef(new Animated.Value(0)).current; // native-driven transform
  const underlineWidth = useRef(new Animated.Value(tabWidth * 0.5)).current; // animate width (non-native)

  // update layout when screen rotates / container resizes
  useEffect(() => {
    const onChange = () => {
      const w = Dimensions.get("window").width;
      setContainerWidth(w);
      // reset underline width to half of new tab width
      underlineWidth.setValue((w / tabCount) * 0.5);
      // move underline to current active tab position
      const idx = tabs.findIndex((t) => t.key === activeTab);
      const targetX = computeUnderlineX(idx, w);
      translateX.setValue(targetX);
    };
    const sub = Dimensions.addEventListener ? Dimensions.addEventListener("change", onChange) : undefined;
    return () => {
      if (sub && typeof sub.remove === "function") sub.remove();
      else if (sub && "removeEventListener" in Dimensions) {
        // older RN
        (Dimensions as any).removeEventListener("change", onChange);
      }
    };
  }, [activeTab, tabCount, underlineWidth, translateX]);

  useEffect(() => {
    // when activeTab changes, animate underline
    const idx = tabs.findIndex((t) => t.key === activeTab);
    animateToIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, containerWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width || Dimensions.get("window").width;
    setContainerWidth(w);
  };

  const computeUnderlineWidth = (w: number) => {
    // underline takes ~50% of tab width (adjust if you want thicker/narrower)
    return w / tabCount * 0.5;
  };

  const computeUnderlineX = (index: number, w?: number) => {
    const cw = typeof w === "number" ? w : containerWidth;
    const tw = cw / tabCount;
    const underlineW = computeUnderlineWidth(cw);
    // center underline under tab: tabLeft + (tabWidth - underlineWidth)/2
    return index * tw + (tw - underlineW) / 2;
  };

  const animateToIndex = (index: number) => {
    const targetX = computeUnderlineX(index);
    const targetW = computeUnderlineWidth(containerWidth);

    // translateX animation (native driver for smoothness)
    const animX = Animated.timing(translateX, {
      toValue: targetX,
      duration: Timing.normal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    // Create width animation (all platforms)
    const animW = Animated.timing(underlineWidth, {
      toValue: targetW,
      duration: Timing.normal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Width animation cannot use native driver
    });

    // Use InteractionManager on iOS to defer animation start until interactions complete
    // This prevents conflicts with other ongoing animations without disabling the effect
    if (Platform.OS === 'ios') {
      InteractionManager.runAfterInteractions(() => {
        // Animate both position and width on iOS, but after interactions
        Animated.parallel([animX, animW]).start();
      });
    } else {
      // On other platforms, start animations immediately
      Animated.parallel([animX, animW]).start();
    }
  };

  const handlePress = (tabKey: TabKey) => {
    // Haptic feedback on tab press
    triggerImpact('Light');

    // Always trigger onTabChange for about and deals tabs to open modals
    // For other tabs, only trigger if different from active tab
    if (tabKey === "about" || tabKey === "deals" || tabKey !== activeTab) {
      onTabChange(tabKey);
    }
  };

  // underline style uses animated translateX (native) and width (non-native)
  const underlineAnimatedStyle = {
    transform: [
      {
        translateX: translateX, // this is native-driven
      },
    ],
    width: underlineWidth, // animated value (non-native)
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handlePress(tab.key)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.title}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={IconSize.sm}
                  color={isActive ? Colors.primary[700] : Colors.gray[400]}
                  style={styles.icon}
                />
                <ThemedText style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                  {tab.title}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.underlineContainer} pointerEvents="none">
        <Animated.View style={[styles.underline, underlineAnimatedStyle]} />
      </View>
    </View>
);
}

const styles = StyleSheet.create({
  // Modern Tab Container
  container: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    ...Shadows.subtle,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 6,
  },
  tab: {
    paddingVertical: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  icon: {
    marginBottom: 2,
  },

  // Modern Typography
  label: {
    ...Typography.caption,
    fontWeight: "600",
    letterSpacing: 0.4,
    textAlign: "center",
    lineHeight: 14,
  },
  labelActive: {
    color: Colors.text.primary,
    fontWeight: "700",
  },
  labelInactive: {
    color: Colors.gray[400],
    fontWeight: "600",
  },

  // Modern Animated Underline
  underlineContainer: {
    height: 4,
    position: "relative",
    backgroundColor: "transparent",
  },
  underline: {
    position: "absolute",
    left: 0,
    bottom: 6,
    height: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[700],
  },
});
