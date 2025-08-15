# Hero Banner Update - Project Planner

## Task Overview
Update the hero banner section in the offers page to replace the "ORDER NOW" button with actual images from the assets folder, creating a more visually appealing design.

## Requirements Analysis
Based on TASK.md:
- Replace the current "ORDER NOW" text button with `order-now.png` image
- Add `bag.png` image to the left of the order-now image
- Align both images properly for good visual presentation
- Maintain responsive design and good spacing

## Current Implementation Review
The current hero banner has:
- Food illustration placeholder image on the left
- Orange "ORDER NOW" button on the right
- White background with shadow elevation
- Responsive layout

## Design Strategy

### Image Integration Approach
1. **Asset Location**: Images are located in `assets/images/` folder
   - `order-now.png` - Primary call-to-action image
   - `bag.png` - Secondary decorative/contextual image

2. **Layout Design**:
   ```
   [Food Image]  [Bag Image] [Order Now Image]
   ```
   - Food illustration (existing)
   - Bag image (new - left alignment)
   - Order now image (new - replaces button)

3. **Alignment Strategy**:
   - Horizontal alignment: Center both new images
   - Vertical alignment: Middle alignment for consistency
   - Spacing: Appropriate gaps between images
   - Responsive: Scale properly on different screen sizes

## Technical Implementation Plan

### Phase 1: Asset Verification and Import
- Verify image assets exist in `assets/images/` folder
- Import images using `require()` statements
- Check image dimensions for proper scaling

### Phase 2: Component Structure Update
- Remove current orange button styling
- Create new image container layout
- Implement flexbox layout for proper alignment
- Add appropriate spacing and margins

### Phase 3: Styling and Responsive Design
- Add image styles for proper scaling
- Implement responsive image sizing
- Ensure consistent alignment across screen sizes
- Add appropriate margins and padding

### Phase 4: Visual Polish
- Fine-tune image sizes for visual balance
- Adjust spacing for optimal appearance
- Test on different screen dimensions
- Ensure accessibility compliance

## Component Architecture

### Current Hero Banner Structure
```tsx
<View style={styles.heroBanner}>
  <View style={styles.heroContent}>
    <Image source={{ uri: offersData.heroBanner.image }} />
    <TouchableOpacity style={styles.orderButton}>
      <View style={styles.orderButtonInner}>
        <ThemedText>ORDER</ThemedText>
        <ThemedText>NOW</ThemedText>
      </View>
    </TouchableOpacity>
  </View>
</View>
```

### Updated Hero Banner Structure
```tsx
<View style={styles.heroBanner}>
  <View style={styles.heroContent}>
    <Image source={{ uri: offersData.heroBanner.image }} />
    <View style={styles.imageContainer}>
      <Image source={require('@/assets/images/bag.png')} />
      <Image source={require('@/assets/images/order-now.png')} />
    </View>
  </View>
</View>
```

## Styling Strategy

### Image Container Styles
- **Container**: Flexbox with row direction
- **Alignment**: Center alignment both horizontally and vertically
- **Gap**: Consistent spacing between images
- **Responsive**: Flexible sizing based on screen width

### Individual Image Styles
- **Bag Image**: Smaller, decorative role
- **Order Now Image**: Primary CTA, slightly larger
- **Scaling**: Maintain aspect ratio
- **Quality**: Optimize for different screen densities

## Responsive Design Considerations

### Screen Size Adaptations
- **Small screens**: Reduce image sizes, maintain proportions
- **Large screens**: Allow images to scale appropriately
- **Orientation**: Handle landscape/portrait changes

### Performance Optimizations
- Use appropriate image formats (PNG for transparency)
- Implement proper image caching
- Optimize image sizes for mobile devices

## Quality Assurance Checklist

### Visual Requirements
- [ ] Images display correctly without distortion
- [ ] Proper alignment and spacing
- [ ] Consistent with overall design theme
- [ ] Good visual hierarchy and balance

### Technical Requirements
- [ ] Images load efficiently
- [ ] No layout shifts during loading
- [ ] Responsive behavior works correctly
- [ ] Accessibility attributes present

### Cross-Platform Testing
- [ ] iOS device testing
- [ ] Android device testing
- [ ] Different screen sizes
- [ ] Different pixel densities

## Success Criteria
1. **Visual Appeal**: Hero banner looks modern and engaging
2. **Functionality**: Images load quickly and consistently
3. **Responsive**: Works well on all device sizes
4. **Performance**: No impact on app loading speed
5. **Consistency**: Matches overall app design language

## Implementation Timeline
- **Phase 1** (30 minutes): Asset verification and imports
- **Phase 2** (45 minutes): Component structure update
- **Phase 3** (30 minutes): Styling and responsive design
- **Phase 4** (15 minutes): Visual polish and testing

**Total Estimated Time**: 2 hours

## Risk Mitigation
- **Missing Assets**: Verify image files exist before implementation
- **Image Quality**: Check image resolution and clarity
- **Layout Issues**: Test thoroughly on different devices
- **Performance**: Monitor impact on load times

## Notes
- Maintain existing hero banner functionality
- Preserve current responsive behavior
- Keep consistent with app's design system
- Consider future scalability for additional images