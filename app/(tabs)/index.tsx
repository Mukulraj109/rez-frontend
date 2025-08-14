import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  const router = useRouter();

  const handleFashionPress = () => {
    router.push('/FashionPage');
  };

  const handleMainStorePress = () => {
    router.push('/MainStorePage');
  };

  const handleWalletPress = () => {
    router.push('/WalletScreen');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="white" />
            <ThemedText style={styles.locationText}>BTM,Bangalore</ThemedText>
            <Ionicons name="chevron-down" size={16} color="white" />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.coinsContainer} onPress={() => router.push('/CoinPage')}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.coinsText}>382</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/CartPage')}>
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileAvatar}>
              <ThemedText style={styles.profileText}>R</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Greeting */}
        <ThemedText style={styles.greeting}>Good night Rejaul!</ThemedText>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search for the service"
            placeholderTextColor="#666"
          />
        </View>
      </LinearGradient>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Partner Status Card */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerInfo}>
            <View style={styles.partnerIcon}>
              <Ionicons name="star" size={20} color="#8B5CF6" />
            </View>
            <View>
              <ThemedText style={styles.partnerLevel}>Partner</ThemedText>
              <ThemedText style={styles.level1}>Level 1</ThemedText>
            </View>
          </View>
          <View style={styles.partnerStats}>
            <View style={styles.stat}>
              <ThemedText style={styles.statNumber}>0/10</ThemedText>
              <ThemedText style={styles.statLabel}>Orders</ThemedText>
            </View>
            <View style={styles.progressDot} />
            <View style={styles.stat}>
              <ThemedText style={styles.statNumber}>20 Orders in 67</ThemedText>
              <ThemedText style={styles.statLabel}>Days to go</ThemedText>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="receipt-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Voucher</ThemedText>
            <ThemedText style={styles.actionValue}>0</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleWalletPress}>
            <View style={styles.actionIcon}>
              <Ionicons name="wallet-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Wallet</ThemedText>
            <ThemedText style={styles.actionValue}>₹ 0</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="pricetag-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Offers</ThemedText>
            <ThemedText style={styles.actionValue}>2 New</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleMainStorePress}>
            <View style={styles.actionIcon}>
              <Ionicons name="storefront-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Store</ThemedText>
            <ThemedText style={styles.actionValue}>Explore</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Going Out Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Going Out</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.viewAll}>View all</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryItem} onPress={handleFashionPress}>
              <View style={styles.categoryIcon}>
                <Ionicons name="shirt-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fashion</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="car-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fleet Market</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Gift</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="restaurant-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Restaurant</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Electronic</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Home Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Home Delivery</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.viewAll}>View all</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="leaf-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Organic</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="basket-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Grocery</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="medical-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Medicine</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="nutrition-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fruit</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name="restaurant" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Meat</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  partnerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  level1: {
    fontSize: 12,
    color: '#666',
  },
  partnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  actionValue: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  section: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryItem: {
    width: '18%',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
