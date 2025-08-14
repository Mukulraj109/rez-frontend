# StoreActionButtons Documentation

## Overview
Complete documentation for the StoreActionButtons component - a feature-rich, responsive action button system for product and service stores.

## 📚 Documentation Index

### Core Documentation
- **[Component API](./StoreActionButtons-API.md)** - Complete API reference, props, and usage examples
- **[Styling & Theming](./STYLING_THEMING.md)** - Design system, colors, responsive layouts, and customization
- **[Conditional Logic](./CONDITIONAL_LOGIC.md)** - Product vs Service conditional rendering and backend integration guide

### Implementation Files
- **Component**: `app/StoreSection/StoreActionButtons.tsx`
- **Types**: `types/store-actions.ts`, `types/api-integration.ts`
- **Logic**: `utils/store-action-logic.ts`, `utils/button-state-manager.ts`
- **Mock Data**: `utils/simple-mock-handlers.ts`, `utils/mock-store-data.ts`

## 🚀 Quick Start

### Basic Usage
```typescript
import StoreActionButtons from '@/app/StoreSection/StoreActionButtons';

// Product store (Buy + Lock buttons)
<StoreActionButtons
  storeType="PRODUCT"
  onBuyPress={handleBuy}
  onLockPress={handleLock}
/>

// Service store (Buy + Lock + Booking buttons)
<StoreActionButtons
  storeType="SERVICE"  
  onBuyPress={handleBuy}
  onLockPress={handleLock}
  onBookingPress={handleBooking}
/>
```

### Integration in StorePage
```typescript
// Current integration (app/StorePage.tsx:32)
<StoreActionButtons
  storeType="PRODUCT"
  onBuyPress={handleBuyPress}
  onLockPress={handleLockPress}
/>
```

## 📱 Features

### ✅ Completed Features
- **Conditional Rendering** - Shows 2-3 buttons based on store type
- **Responsive Layout** - Adapts from row to column on small screens
- **State Management** - Loading, disabled, and error states
- **Visual Design** - Gradient buttons with icons and animations
- **Accessibility** - Full screen reader and keyboard support
- **Performance** - Optimized with React hooks and memoization
- **Theme Integration** - Works with app's light/dark mode system

### 🔮 Future Enhancements (Backend Integration)
- Dynamic store type from API
- Real-time availability updates
- User permission-based button states
- Analytics and tracking integration

## 📐 Architecture

### Component Structure
```
StoreActionButtons/
├── StoreActionButtons.tsx     # Main component
├── types/
│   ├── store-actions.ts       # Component interfaces
│   └── api-integration.ts     # Future API types
├── utils/
│   ├── store-action-logic.ts  # Conditional rendering logic
│   ├── button-state-manager.ts # State management
│   └── simple-mock-handlers.ts # Mock API calls
└── docs/
    ├── StoreActionButtons-API.md
    ├── STYLING_THEMING.md
    ├── CONDITIONAL_LOGIC.md
    └── README.md (this file)
```

### Data Flow
```
StorePage → StoreActionButtons → Button Logic → State Manager → UI Render
     ↓              ↓                 ↓             ↓            ↓
  Props        Button Configs    Visibility    Loading State   Visual Feedback
```

## 🎯 Design Decisions

### Why Conditional Rendering?
- **Product stores** need Buy/Lock functionality (physical inventory)
- **Service stores** need Buy/Lock/Booking functionality (appointments/reservations)
- Future flexibility for business rule changes

### Why Three-Tier State Management?
- **Component Level**: UI state (loading, errors)
- **Logic Level**: Business rules (visibility, permissions)  
- **Props Level**: External data (store type, handlers)

### Why Responsive Column Layout?
- Mobile-first approach for narrow screens
- Maintains button accessibility (44px minimum touch target)
- Prevents UI cramping on small devices

## 🔧 Development

### Adding New Button Types
1. Update `ActionButtonConfig` in `types/store-actions.ts`
2. Add new button logic in `utils/store-action-logic.ts:createButtonConfigs()`
3. Update layout calculations in `getButtonLayout()`
4. Add styling in component's StyleSheet

### Adding New Store Types
1. Extend `StoreType` in `types/store-actions.ts`
2. Update visibility logic in `utils/store-action-logic.ts:getVisibleButtons()`
3. Add test cases for new type combinations

### Customizing Themes
1. Override props: `containerStyle`, `buttonStyle`, `textStyle`
2. Modify color gradients in `createButtonConfigs()`
3. Extend responsive breakpoints in `getButtonLayout()`

## 🧪 Testing

### Scenarios Tested
- ✅ Product store shows 2 buttons (Buy, Lock)
- ✅ Service store shows 3 buttons (Buy, Lock, Booking)  
- ✅ Override logic works (`showBookingButton` prop)
- ✅ Responsive layouts adapt to screen sizes
- ✅ Button interactions trigger proper handlers
- ✅ Loading states prevent multiple simultaneous actions
- ✅ Error handling provides user feedback

### Test Coverage Areas
- Unit: Button visibility logic, state management
- Integration: Full component rendering, prop combinations
- Visual: Responsive layouts, theme variations
- Accessibility: Screen reader, keyboard navigation

## 📈 Performance Metrics

### Optimizations Applied
- **Memoization**: `useMemo` for configs, `useCallback` for handlers
- **Efficient Re-renders**: Minimal dependency arrays
- **State Batching**: Functional setState updates
- **Layout Calculations**: Cached responsive breakpoints

### Bundle Impact
- Component size: ~8KB (minified)
- Dependency tree: React Native core + Expo components only
- No external libraries required

## 🚚 Deployment Checklist

### Pre-Backend Integration
- [x] Component fully functional with mock data
- [x] All documentation complete
- [x] Integration points clearly marked with TODOs
- [x] Type definitions ready for API integration
- [x] Responsive design tested across device sizes

### Backend Integration Ready
- [ ] Replace mock handlers with API calls
- [ ] Update `storeType` prop to dynamic value
- [ ] Add error boundary for API failures
- [ ] Implement real-time updates
- [ ] Add analytics tracking

## 🤝 Contributing

### Code Style
- Follow existing TypeScript patterns
- Use React Native StyleSheet for performance
- Maintain accessibility standards (WCAG 2.1 AA)
- Document new features and breaking changes

### Pull Request Requirements
- Update relevant documentation
- Add test cases for new functionality
- Ensure backward compatibility
- Performance impact assessment

---

**Component Version**: 1.0.0  
**Last Updated**: Phase 9 Implementation Complete  
**Status**: ✅ Production Ready (Backend Integration Pending)