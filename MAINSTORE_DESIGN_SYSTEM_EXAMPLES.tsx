/**
 * MainStorePage Design System Integration Examples
 *
 * This file demonstrates how to refactor MainStorePage.tsx
 * to use the new design system tokens and components.
 *
 * BEFORE: Magic numbers, inconsistent styling
 * AFTER: Design tokens, reusable components, maintainable code
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SPACING, TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import { Button, Card, Text, Badge, Chip } from '@/components/ui';

// ============================================================================
// EXAMPLE 1: Refactor Styles Using Design Tokens
// ============================================================================

// BEFORE - Magic numbers and scattered values
const oldStyles = StyleSheet.create({
  imageSection: {
    paddingHorizontal: 16, // Magic number
    paddingTop: 16,
    paddingBottom: 16,
  },
  imageCard: {
    backgroundColor: '#fff', // Hardcoded color
    borderRadius: 20, // Magic number
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    padding: 12, // Magic number
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)', // Hardcoded color
  },
  sectionCard: {
    marginHorizontal: 16, // Magic number
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 18, // Magic number
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#991B1B', // Hardcoded color
    fontSize: 14, // Magic number
    fontWeight: '600',
  },
});

// AFTER - Using design tokens
const newStyles = StyleSheet.create({
  imageSection: {
    paddingHorizontal: SPACING.md, // 16px from design tokens
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  imageCard: {
    backgroundColor: COLORS.background.primary, // Semantic color
    borderRadius: BORDER_RADIUS.xl, // 16px (closest to 20)
    overflow: 'hidden',
    ...SHADOWS.lg, // Predefined shadow
    padding: SPACING.sm, // 8px (closest to 12)
    borderWidth: 1,
    borderColor: COLORS.border.light, // Semantic color
  },
  sectionCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg, // 12px (closest to 18)
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall, // Includes fontSize: 14
    color: COLORS.error[700], // Semantic color from palette
  },
});

// ============================================================================
// EXAMPLE 2: Replace Custom Components with Design System Components
// ============================================================================

// BEFORE - Custom button with inline styles
const OldButton = () => (
  <View style={{
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  }}>
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
      Visit Store
    </Text>
  </View>
);

// AFTER - Using design system Button component
const NewButton = () => (
  <Button
    title="Visit Store"
    onPress={() => {}}
    variant="primary"
    size="large"
    fullWidth
  />
);

// ============================================================================
// EXAMPLE 3: Product Card with Design System
// ============================================================================

// BEFORE - Manual card styling
const OldProductCard = () => (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }}>
    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
      Product Title
    </Text>
    <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20 }}>
      Product description goes here
    </Text>
    <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
      <View style={{
        backgroundColor: '#10B981',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
          10% Cashback
        </Text>
      </View>
      <View style={{
        backgroundColor: '#EF4444',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
          Sale
        </Text>
      </View>
    </View>
  </View>
);

// AFTER - Using design system components
const NewProductCard = () => (
  <Card variant="elevated" padding="md" style={{ marginBottom: SPACING.sm }}>
    <Text variant="h4" color="primary" style={{ marginBottom: SPACING.sm }}>
      Product Title
    </Text>
    <Text variant="bodySmall" color="secondary">
      Product description goes here
    </Text>
    <View style={{ marginTop: SPACING.sm, flexDirection: 'row', gap: SPACING.sm }}>
      <Badge label="10% Cashback" variant="success" size="small" />
      <Badge label="Sale" variant="error" size="small" />
    </View>
  </Card>
);

// ============================================================================
// EXAMPLE 4: Tab Navigation with Design System Chips
// ============================================================================

// BEFORE - Custom tab styling
const OldTabNavigation = ({ activeTab, onTabChange }: any) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {['deals', 'about', 'reviews'].map((tab) => (
      <View
        key={tab}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: activeTab === tab ? '#7C3AED' : '#F3F4F6',
        }}
      >
        <Text style={{
          color: activeTab === tab ? '#fff' : '#6B7280',
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'capitalize',
        }}>
          {tab}
        </Text>
      </View>
    ))}
  </View>
);

// AFTER - Using design system Chip component
const NewTabNavigation = ({ activeTab, onTabChange }: any) => (
  <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
    {['deals', 'about', 'reviews'].map((tab) => (
      <Chip
        key={tab}
        label={tab.charAt(0).toUpperCase() + tab.slice(1)}
        onPress={() => onTabChange(tab)}
        variant="filled"
        size="medium"
        selected={activeTab === tab}
      />
    ))}
  </View>
);

// ============================================================================
// EXAMPLE 5: Typography System Usage
// ============================================================================

// BEFORE - Inconsistent text styling
const OldTypography = () => (
  <View>
    <Text style={{ fontSize: 24, fontWeight: '600', lineHeight: 32, color: '#111827' }}>
      Store Name
    </Text>
    <Text style={{ fontSize: 16, fontWeight: '400', lineHeight: 24, color: '#6B7280' }}>
      Store description text
    </Text>
    <Text style={{ fontSize: 12, fontWeight: '400', lineHeight: 16, color: '#9CA3AF' }}>
      Helper text or metadata
    </Text>
  </View>
);

// AFTER - Using design system Text component
const NewTypography = () => (
  <View>
    <Text variant="h2" color="primary">
      Store Name
    </Text>
    <Text variant="body" color="secondary">
      Store description text
    </Text>
    <Text variant="caption" color="tertiary">
      Helper text or metadata
    </Text>
  </View>
);

// ============================================================================
// EXAMPLE 6: Spacing System in Layout
// ============================================================================

// BEFORE - Magic numbers for spacing
const OldLayout = () => (
  <View style={{ padding: 16 }}>
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 8 }}>
        <Text>Item 1</Text>
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text>Item 2</Text>
      </View>
    </View>
  </View>
);

// AFTER - Using design tokens for spacing
const NewLayout = () => (
  <View style={{ padding: SPACING.md }}>
    <View style={{ marginBottom: SPACING.lg }}>
      <View style={{ marginBottom: SPACING.sm }}>
        <Text>Item 1</Text>
      </View>
      <View style={{ marginBottom: SPACING.sm }}>
        <Text>Item 2</Text>
      </View>
    </View>
  </View>
);

// ============================================================================
// EXAMPLE 7: Complete Section with Design System
// ============================================================================

const ProductDetailsSection = () => (
  <Card variant="elevated" padding="lg" style={{ margin: SPACING.md }}>
    {/* Header */}
    <View style={{ marginBottom: SPACING.md }}>
      <Text variant="h3" color="primary">
        Little Big Comfort Tee
      </Text>
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs }}>
        <Badge label="Fashion" variant="primary" size="small" />
        <Badge label="In Stock" variant="success" size="small" />
      </View>
    </View>

    {/* Price and Location */}
    <View style={{ marginBottom: SPACING.md }}>
      <Text variant="h2" color="primary">
        ₹2,199
      </Text>
      <Text variant="bodySmall" color="secondary" style={{ marginTop: SPACING.xs }}>
        BTM • 0.7 Km away
      </Text>
    </View>

    {/* Description */}
    <Text variant="body" color="secondary" style={{ marginBottom: SPACING.lg }}>
      Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric
      for all-day comfort and effortless style.
    </Text>

    {/* Actions */}
    <View style={{ gap: SPACING.sm }}>
      <Button
        title="Add to Cart"
        onPress={() => {}}
        variant="primary"
        size="large"
        fullWidth
      />
      <Button
        title="Visit Store"
        onPress={() => {}}
        variant="outline"
        size="large"
        fullWidth
      />
    </View>
  </Card>
);

// ============================================================================
// EXAMPLE 8: Error/Success States with Design System
// ============================================================================

// BEFORE - Custom error toast
const OldErrorToast = ({ message }: { message: string }) => (
  <View style={{
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 6,
    borderLeftColor: '#EF4444',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  }}>
    <View style={{
      width: 12,
      height: 12,
      borderRadius: 8,
      backgroundColor: '#EF4444',
    }} />
    <Text style={{
      marginLeft: 10,
      color: '#991B1B',
      fontSize: 14,
      fontWeight: '600',
    }}>
      {message}
    </Text>
  </View>
);

// AFTER - Using design system
const NewErrorToast = ({ message }: { message: string }) => (
  <Card
    variant="outlined"
    padding="md"
    style={{
      backgroundColor: COLORS.error[50],
      borderLeftWidth: SPACING.xs + 2,
      borderLeftColor: COLORS.error[500],
      borderRadius: BORDER_RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <View style={{
      width: SPACING.sm + 4,
      height: SPACING.sm + 4,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: COLORS.error[500],
    }} />
    <Text
      variant="bodySmall"
      color="error"
      style={{ marginLeft: SPACING.sm, fontWeight: '600', flex: 1 }}
    >
      {message}
    </Text>
  </Card>
);

// ============================================================================
// EXPORT EXAMPLES
// ============================================================================

export {
  newStyles,
  NewButton,
  NewProductCard,
  NewTabNavigation,
  NewTypography,
  NewLayout,
  ProductDetailsSection,
  NewErrorToast,
};
