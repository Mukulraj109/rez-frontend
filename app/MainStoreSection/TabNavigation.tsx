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
import { ThemedText } from "@/components/ThemedText";

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
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    // Use InteractionManager on iOS to prevent animation conflicts
    if (Platform.OS === 'ios') {
      InteractionManager.runAfterInteractions(() => {
        // On iOS, just set the width directly without animation to prevent conflicts
        underlineWidth.setValue(targetW);
        animX.start();
      });
    } else {
      // On other platforms, animate both
      const animW = Animated.timing(underlineWidth, {
        toValue: targetW,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
      Animated.parallel([animX, animW]).start();
    }
  };

  const handlePress = (tabKey: TabKey) => {
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
                  size={18}
                  color={isActive ? "#7C3AED" : "#9CA3AF"}
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
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    // subtle elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 6,
  },
  tab: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textAlign: "center",
    lineHeight: 14,
  },
  labelActive: {
    color: "#111827",
    fontWeight: "700",
  },
  labelInactive: {
    color: "#9CA3AF",
    fontWeight: "600",
  },

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
    borderRadius: 6,
    backgroundColor: "#7C3AED",
  },
});
