/**
 * Design System Component Showcase
 *
 * Visual showcase of all design system components with all variants.
 * Use this file as a reference or copy-paste starting point.
 *
 * To use: Import this component in a screen to see all components in action.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, Badge, Input, Chip, Divider } from '@/components/ui';
import { SPACING, COLORS } from '@/constants/DesignTokens';

export default function DesignSystemShowcase() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* =============================================== */}
      {/* TYPOGRAPHY SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Typography
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h1">Heading 1 - 32px Bold</Text>
          <Text variant="h2">Heading 2 - 24px Semibold</Text>
          <Text variant="h3">Heading 3 - 20px Semibold</Text>
          <Text variant="h4">Heading 4 - 18px Semibold</Text>
          <Text variant="body">Body Text - 16px Regular</Text>
          <Text variant="bodySmall">Body Small - 14px Regular</Text>
          <Text variant="caption">Caption - 12px Regular</Text>
          <Text variant="overline">Overline - 10px Bold Uppercase</Text>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="body" color="primary">Primary Color Text</Text>
          <Text variant="body" color="secondary">Secondary Color Text</Text>
          <Text variant="body" color="tertiary">Tertiary Color Text</Text>
          <Text variant="body" color="error">Error Color Text</Text>
          <Text variant="body" color="success">Success Color Text</Text>
          <Text variant="body" color="warning">Warning Color Text</Text>
          <Text variant="body" color="info">Info Color Text</Text>
        </View>
      </Card>

      {/* =============================================== */}
      {/* BUTTON SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Buttons
        </Text>
        <Divider spacing="md" />

        {/* Button Variants */}
        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Variants</Text>
          <Button
            title="Primary Button"
            onPress={() => console.log('Primary')}
            variant="primary"
          />
          <Button
            title="Secondary Button"
            onPress={() => console.log('Secondary')}
            variant="secondary"
          />
          <Button
            title="Outline Button"
            onPress={() => console.log('Outline')}
            variant="outline"
          />
          <Button
            title="Ghost Button"
            onPress={() => console.log('Ghost')}
            variant="ghost"
          />
          <Button
            title="Danger Button"
            onPress={() => console.log('Danger')}
            variant="danger"
          />
        </View>

        <Divider spacing="md" />

        {/* Button Sizes */}
        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Sizes</Text>
          <Button
            title="Small Button"
            onPress={() => {}}
            size="small"
          />
          <Button
            title="Medium Button"
            onPress={() => {}}
            size="medium"
          />
          <Button
            title="Large Button"
            onPress={() => {}}
            size="large"
          />
        </View>

        <Divider spacing="md" />

        {/* Button States */}
        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>States</Text>
          <Button
            title="Normal Button"
            onPress={() => {}}
          />
          <Button
            title="Loading Button"
            onPress={() => {}}
            loading={true}
          />
          <Button
            title="Disabled Button"
            onPress={() => {}}
            disabled={true}
          />
          <Button
            title="Full Width Button"
            onPress={() => {}}
            fullWidth
          />
        </View>
      </Card>

      {/* =============================================== */}
      {/* CARD SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Cards
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Variants</Text>

          <Card variant="elevated" padding="md">
            <Text variant="body">Elevated Card (with shadow)</Text>
          </Card>

          <Card variant="outlined" padding="md">
            <Text variant="body">Outlined Card (with border)</Text>
          </Card>

          <Card variant="filled" padding="md">
            <Text variant="body">Filled Card (with background)</Text>
          </Card>

          <Card
            variant="elevated"
            padding="md"
            onPress={() => console.log('Card pressed')}
          >
            <Text variant="body">Pressable Card (tap me)</Text>
          </Card>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Padding Options</Text>

          <Card variant="outlined" padding="xs">
            <Text variant="caption">XS Padding (4px)</Text>
          </Card>

          <Card variant="outlined" padding="sm">
            <Text variant="bodySmall">SM Padding (8px)</Text>
          </Card>

          <Card variant="outlined" padding="md">
            <Text variant="body">MD Padding (16px)</Text>
          </Card>

          <Card variant="outlined" padding="lg">
            <Text variant="body">LG Padding (24px)</Text>
          </Card>
        </View>
      </Card>

      {/* =============================================== */}
      {/* BADGE SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Badges
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Variants</Text>

          <View style={styles.badgeRow}>
            <Badge label="Primary" variant="primary" />
            <Badge label="Secondary" variant="secondary" />
            <Badge label="Success" variant="success" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="Error" variant="error" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Info" variant="info" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="Neutral" variant="neutral" />
          </View>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Sizes</Text>

          <View style={styles.badgeRow}>
            <Badge label="Small" variant="primary" size="small" />
            <Badge label="Medium" variant="primary" size="medium" />
            <Badge label="Large" variant="primary" size="large" />
          </View>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Use Cases</Text>

          <View style={styles.badgeRow}>
            <Badge label="10% OFF" variant="success" size="small" />
            <Badge label="New" variant="info" size="small" />
            <Badge label="Sale" variant="error" size="small" />
            <Badge label="Hot" variant="warning" size="small" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="In Stock" variant="success" size="medium" />
            <Badge label="Low Stock" variant="warning" size="medium" />
            <Badge label="Out of Stock" variant="error" size="medium" />
          </View>
        </View>
      </Card>

      {/* =============================================== */}
      {/* CHIP SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Chips
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Variants</Text>

          <View style={styles.badgeRow}>
            <Chip label="Filled" variant="filled" onPress={() => {}} />
            <Chip label="Outlined" variant="outlined" onPress={() => {}} />
            <Chip label="Soft" variant="soft" onPress={() => {}} />
          </View>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Selected State</Text>

          <View style={styles.badgeRow}>
            <Chip
              label="Unselected"
              variant="outlined"
              selected={false}
              onPress={() => {}}
            />
            <Chip
              label="Selected"
              variant="outlined"
              selected={true}
              onPress={() => {}}
            />
          </View>
        </View>

        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Filter Example</Text>

          <View style={styles.badgeRow}>
            {['All', 'Fashion', 'Electronics', 'Home', 'Beauty'].map((filter) => (
              <Chip
                key={filter}
                label={filter}
                variant="outlined"
                selected={selectedFilter === filter.toLowerCase()}
                onPress={() => setSelectedFilter(filter.toLowerCase())}
              />
            ))}
          </View>
        </View>
      </Card>

      {/* =============================================== */}
      {/* INPUT SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Inputs
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Basic Inputs</Text>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Input with Helper Text"
            placeholder="Type something..."
            helperText="This is helper text below the input"
          />

          <Input
            label="Input with Error"
            placeholder="Required field"
            error="This field is required"
          />
        </View>
      </Card>

      {/* =============================================== */}
      {/* DIVIDER SHOWCASE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Dividers
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Horizontal Dividers</Text>

          <Text variant="body">Section 1</Text>
          <Divider spacing="sm" />
          <Text variant="body">Section 2</Text>
          <Divider spacing="md" />
          <Text variant="body">Section 3</Text>
          <Divider spacing="lg" />
          <Text variant="body">Section 4</Text>
        </View>

        <Divider spacing="lg" />

        <View style={styles.group}>
          <Text variant="h4" style={styles.groupTitle}>Custom Colors</Text>

          <Text variant="body">Default color</Text>
          <Divider spacing="sm" />

          <Text variant="body">Primary color</Text>
          <Divider spacing="sm" color={COLORS.primary[500]} thickness={2} />

          <Text variant="body">Error color</Text>
          <Divider spacing="sm" color={COLORS.error[500]} thickness={2} />

          <Text variant="body">Success color</Text>
          <Divider spacing="sm" color={COLORS.success[500]} thickness={2} />
        </View>
      </Card>

      {/* =============================================== */}
      {/* COMPLETE EXAMPLE - PRODUCT CARD */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Complete Example: Product Card
        </Text>
        <Divider spacing="md" />

        <Card variant="elevated" padding="md">
          {/* Product Header */}
          <View style={{ marginBottom: SPACING.sm }}>
            <Text variant="h4" color="primary">
              Little Big Comfort Tee
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs }}>
              <Badge label="Fashion" variant="primary" size="small" />
              <Badge label="In Stock" variant="success" size="small" />
              <Badge label="10% OFF" variant="error" size="small" />
            </View>
          </View>

          <Divider spacing="sm" />

          {/* Price and Location */}
          <View style={{ marginVertical: SPACING.sm }}>
            <Text variant="h2" color="primary">
              ₹2,199
            </Text>
            <Text variant="bodySmall" color="secondary" style={{ marginTop: SPACING.xs }}>
              BTM • 0.7 Km away • Open now
            </Text>
          </View>

          {/* Description */}
          <Text variant="body" color="secondary" numberOfLines={2} style={{ marginBottom: SPACING.md }}>
            Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric
            for all-day comfort and effortless style.
          </Text>

          <Divider spacing="md" />

          {/* Actions */}
          <View style={{ gap: SPACING.sm }}>
            <Button
              title="Add to Cart"
              onPress={() => console.log('Add to cart')}
              variant="primary"
              size="medium"
              fullWidth
            />
            <Button
              title="View Details"
              onPress={() => console.log('View details')}
              variant="outline"
              size="medium"
              fullWidth
            />
          </View>
        </Card>
      </Card>

      {/* =============================================== */}
      {/* SPACING REFERENCE */}
      {/* =============================================== */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text variant="h2" color="primary" style={styles.sectionTitle}>
          Spacing Reference (8px Grid)
        </Text>
        <Divider spacing="md" />

        <View style={styles.group}>
          <View style={[styles.spacingBox, { width: SPACING.xs }]}>
            <Text variant="caption" color="inverse">4px</Text>
          </View>
          <View style={[styles.spacingBox, { width: SPACING.sm }]}>
            <Text variant="caption" color="inverse">8px</Text>
          </View>
          <View style={[styles.spacingBox, { width: SPACING.md }]}>
            <Text variant="caption" color="inverse">16px</Text>
          </View>
          <View style={[styles.spacingBox, { width: SPACING.lg }]}>
            <Text variant="caption" color="inverse">24px</Text>
          </View>
          <View style={[styles.spacingBox, { width: SPACING.xl }]}>
            <Text variant="caption" color="inverse">32px</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  group: {
    gap: SPACING.sm,
  },
  groupTitle: {
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  spacingBox: {
    height: 40,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});
