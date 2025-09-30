import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';

import { GoingOutHeader } from '@/components/going-out/GoingOutHeader';
import { CategoryTabs } from '@/components/going-out/CategoryTabs';
import { ProductGrid } from '@/components/going-out/ProductGrid';
import { CashbackHubSection } from '@/components/going-out/CashbackHubSection';
import { useGoingOutPage } from '@/hooks/useGoingOutPage';
import { GoingOutProduct } from '@/types/going-out.types';

export default function GoingOutPage() {
  const router = useRouter();
  const { state, actions, handlers } = useGoingOutPage();

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (product: GoingOutProduct) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleViewAllSection = (sectionId: string) => {
    router.push(`/going-out/section/${sectionId}` as any);
  };

  const handleHideSearch = () => {
    if (handlers.handleHideSearch) {
      handlers.handleHideSearch();
    }
  };

  const handleShowSearch = () => {
    if (handlers.handleShowSearch) {
      handlers.handleShowSearch();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <GoingOutHeader
        searchQuery={state.searchQuery}
        onSearchChange={handlers.handleSearchChange}
        onSearchSubmit={handlers.handleSearchSubmit}
        onBack={handleBack}
        onHideSearch={handleHideSearch}
        onShowSearch={handleShowSearch}
        showSearchBar={state.showSearchBar}
      />

      <TouchableWithoutFeedback onPress={handleHideSearch}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Tabs */}
          <CategoryTabs
            categories={state.categories}
            activeCategory={state.activeCategory}
            onCategoryChange={handlers.handleCategoryChange}
          />

          {/* Cashback Hub Sections */}
          {state.cashbackHubSections.map((section) => (
            <CashbackHubSection
              key={section.id}
              section={section}
              onProductPress={handleProductPress}
              onViewAll={() => handleViewAllSection(section.id)}
            />
          ))}

          {/* Main Product Grid */}
          <View style={styles.productGridContainer}>
            <ProductGrid
              products={state.filteredProducts}
              loading={state.loading}
              onProductPress={handleProductPress}
              onLoadMore={handlers.handleLoadMore}
              hasMore={state.hasMore}
              numColumns={2}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  productGridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for tab bar
  },
});