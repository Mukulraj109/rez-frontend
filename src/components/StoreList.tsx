import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Store {
  id: string;
  name: string;
  cashback: number;
  logoText: string;
  gradient: string[];
}

const stores: Store[] = [
  {
    id: '1',
    name: 'ZARA',
    cashback: 10,
    logoText: 'ZARA',
    gradient: ['#1F2937', '#374151']
  },
  {
    id: '2',
    name: 'adidas',
    cashback: 10,
    logoText: 'adidas',
    gradient: ['#000000', '#374151']
  },
  {
    id: '3',
    name: 'PUMA',
    cashback: 10,
    logoText: 'PUMA',
    gradient: ['#000000', '#374151']
  },
  {
    id: '4',
    name: 'VANS',
    cashback: 10,
    logoText: 'VANS',
    gradient: ['#DC2626', '#991B1B']
  },
  {
    id: '5',
    name: 'NIKE',
    cashback: 10,
    logoText: 'NIKE',
    gradient: ['#000000', '#374151']
  }
];

const StoreList = () => {
  const handleStorePress = (store: Store) => {
    console.log('Store pressed:', store.name);
  };

  const handleViewAllPress = () => {
    console.log('View all stores pressed');
  };

  const renderStore = (store: Store) => (
    <TouchableOpacity
      key={store.id}
      style={styles.storeContainer}
      onPress={() => handleStorePress(store)}
      activeOpacity={0.8}
    >
      <View style={styles.storeWrapper}>
        {/* Store Logo Circle */}
        <LinearGradient
          colors={store.gradient}
          style={styles.storeCircle}
        >
          <Text style={styles.logoText}>{store.logoText}</Text>
        </LinearGradient>
        
        {/* Cashback Label */}
        <Text style={styles.cashbackText}>{store.cashback}%</Text>
        <Text style={styles.cashbackLabel}>Cash back</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStoreRow = (startIndex: number) => (
    <View key={`row-${startIndex}`} style={styles.storeRow}>
      {stores.slice(startIndex, startIndex + 5).map(renderStore)}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Store you can&apos;t miss</Text>
        <TouchableOpacity onPress={handleViewAllPress}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Store Grid */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* First Row */}
        {renderStoreRow(0)}
        
        {/* Second Row - Duplicate for scrolling effect */}
        {renderStoreRow(0)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  scrollContainer: {
    maxHeight: 200,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  storeContainer: {
    alignItems: 'center',
  },
  storeWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  storeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  cashbackLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});

export default StoreList;