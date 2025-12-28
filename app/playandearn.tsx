import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LearnMaximiseSection from '../components/earn/LearnMaximiseSection';

const { width } = Dimensions.get('window');

// Icon mapping from lucide-react to Ionicons
const IconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'zap': 'flash',
  'shopping-bag': 'bag',
  'qr-code': 'qr-code',
  'share': 'share-social',
  'star': 'star',
  'users': 'people',
  'calendar': 'calendar',
  'lock': 'lock-closed',
  'heart': 'heart',
  'camera': 'camera',
  'message': 'chatbubble',
  'target': 'locate',
  'award': 'ribbon',
  'flame': 'flame',
  'clock': 'time',
  'chevron-right': 'chevron-forward',
  'check-circle': 'checkmark-circle',
  'sparkles': 'sparkles',
  'store': 'storefront',
  'upload': 'cloud-upload',
  'party': 'happy',
  'graduation': 'school',
  'briefcase': 'briefcase',
  'crown': 'diamond',
  'map-pin': 'location',
  'thumbs-up': 'thumbs-up',
  'video': 'videocam',
  'arrow-right': 'arrow-forward',
  'ticket': 'ticket',
  'gamepad': 'game-controller',
  'trophy': 'trophy',
  'coins': 'cash',
};

const PlayAndEarn = () => {
  const router = useRouter();
  const [currentStreak] = useState(7);
  const [monthlyEarnings] = useState(2480);
  // Force white theme
  const isDark = false;

  // Mock wallet data (replace with actual context/API)
  const rezCoins = 1250;
  const totalBrandedCoins = 450;
  const totalPromoCoins = 200;

  // Featured Creators Data
  const featuredCreators = [
    {
      id: 'creator-1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true,
      rating: 4.8,
      totalPicks: 245,
    },
    {
      id: 'creator-2',
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: true,
      rating: 4.7,
      totalPicks: 156,
    },
  ];

  // Trending Picks Data
  const trendingPicks = [
    {
      id: 'pick-1',
      title: 'Holy Grail Serum for...',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
      productPrice: 599,
      productBrand: 'Minimalist',
      tag: '#skincare',
      views: 12400,
      purchases: 456,
    },
    {
      id: 'pick-2',
      title: 'Best Noise-Cancelling...',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      productPrice: 29990,
      productBrand: 'Sony',
      tag: '#headphones',
      views: 8200,
      purchases: 245,
    },
    {
      id: 'pick-3',
      title: 'My Go-To Summer...',
      productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
      productPrice: 2499,
      productBrand: 'Zara',
      tag: '#summer',
      views: 5400,
      purchases: 127,
    },
  ];

  // Quick Earn Actions
  const quickEarnActions = [
    {
      id: 'scan-pay',
      icon: 'qr-code' as keyof typeof Ionicons.glyphMap,
      title: 'Scan & Pay at Store',
      reward: 'Up to 10% ReZ Coins',
      iconBg: ['#00C06A20', '#00C06A10'],
      iconColor: '#00C06A',
      path: '/pay-in-store',
    },
    {
      id: 'upload-bill',
      icon: 'cloud-upload' as keyof typeof Ionicons.glyphMap,
      title: 'Upload Bill',
      reward: 'Earn ₹50-₹200 Coins',
      iconBg: ['#3B82F620', '#3B82F610'],
      iconColor: '#3B82F6',
      path: '/bill-upload',
    },
    {
      id: 'share-offer',
      icon: 'share-social' as keyof typeof Ionicons.glyphMap,
      title: 'Share an Offer',
      reward: 'Earn 20 ReZ Coins',
      iconBg: ['#A855F720', '#A855F710'],
      iconColor: '#A855F7',
      path: '/referral',
    },
    {
      id: 'write-review',
      icon: 'star' as keyof typeof Ionicons.glyphMap,
      title: 'Write a Review',
      reward: 'Earn 25-100 Coins',
      iconBg: ['#F59E0B20', '#F59E0B10'],
      iconColor: '#F59E0B',
      path: '/explore/review-earn',
    },
    {
      id: 'refer-friend',
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      title: 'Refer a Friend',
      reward: 'Earn 100 Coins',
      iconBg: ['#EC489920', '#EC489910'],
      iconColor: '#EC4899',
      path: '/referral',
    },
    {
      id: 'daily-checkin',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      title: 'Daily Check-in',
      reward: 'Earn 10-500 Coins',
      iconBg: ['#14B8A620', '#14B8A610'],
      iconColor: '#14B8A6',
      path: '/explore/daily-checkin',
    },
  ];

  // Shopping & Payment Methods
  const shoppingMethods = [
    {
      id: 'online-shopping',
      icon: 'bag' as keyof typeof Ionicons.glyphMap,
      title: 'Shop Online via ReZ',
      description: 'Amazon, Flipkart, Myntra & more',
      reward: 'Up to 8% Cashback',
      extraReward: '+ Branded Coins',
      path: '/cash-store',
    },
    {
      id: 'offline-payment',
      icon: 'storefront' as keyof typeof Ionicons.glyphMap,
      title: 'Pay at Partner Stores',
      description: 'Instant ReZ Coins on every purchase',
      reward: 'Always Better Price',
      extraReward: '+ First visit bonus',
      path: '/pay-in-store',
    },
    {
      id: 'lock-price',
      icon: 'lock-closed' as keyof typeof Ionicons.glyphMap,
      title: 'Lock Price Deals',
      description: 'Lock with 10%, earn on both actions',
      reward: 'Double Earnings',
      extraReward: '+ Pickup bonus',
      path: '/deal-store',
    },
  ];

  // Social & Community Actions
  const socialActions = [
    { icon: 'share-social' as keyof typeof Ionicons.glyphMap, title: 'Share Store/Offer', coins: '20-50', description: 'Friends must view', path: '/referral' },
    { icon: 'thumbs-up' as keyof typeof Ionicons.glyphMap, title: 'Vote in Polls', coins: '10', description: 'Daily polls available', path: '/social-media' },
    { icon: 'chatbubble' as keyof typeof Ionicons.glyphMap, title: 'Comment on Offers', coins: '15', description: 'Quality comments', path: '/social-media' },
    { icon: 'camera' as keyof typeof Ionicons.glyphMap, title: 'Upload Photos', coins: '25-100', description: 'Store/product photos', path: '/bill-upload' },
    { icon: 'videocam' as keyof typeof Ionicons.glyphMap, title: 'Create Reels', coins: '50-200', description: 'UGC content rewards', path: '/social-media' },
    { icon: 'heart' as keyof typeof Ionicons.glyphMap, title: 'Rate Events', coins: '20', description: 'After event attendance', path: '/events' },
  ];

  // Special Programs
  const specialPrograms = [
    {
      id: 'student',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      title: 'Student Zone',
      badge: '🎓',
      rewards: ['Student of the Month', 'Event participation', 'Campus ambassador'],
      earnings: 'Up to 5,000 coins/month',
      path: '/offers/zones/student',
    },
    {
      id: 'corporate',
      icon: 'briefcase' as keyof typeof Ionicons.glyphMap,
      title: 'Corporate Perks',
      badge: '🧑‍💼',
      rewards: ['Employee of the Month', 'Corporate events', 'Exclusive BNPL'],
      earnings: 'Up to 3,000 coins/month',
      path: '/offers/zones/corporate',
    },
    {
      id: 'prive',
      icon: 'diamond' as keyof typeof Ionicons.glyphMap,
      title: 'ReZ Privé',
      badge: '👑',
      rewards: ['Premium campaigns', 'High multipliers', 'Brand collaborations'],
      earnings: 'Unlimited potential',
      path: '/prive',
    },
  ];

  // Bonus Opportunities
  const bonusOpportunities = [
    {
      title: 'Big Coin Drop',
      description: 'Complete 3 purchases today',
      reward: '+500 Coins',
      timeLeft: '6h 24m',
      icon: 'happy' as keyof typeof Ionicons.glyphMap,
    },
    {
      title: 'Double Cashback Day',
      description: 'All fashion purchases',
      reward: '2X Earnings',
      timeLeft: '12h 45m',
      icon: 'flash' as keyof typeof Ionicons.glyphMap,
    },
    {
      title: 'Last Chance Bonus',
      description: 'Refer 2 friends today',
      reward: '+200 Coins',
      timeLeft: '3h 15m',
      icon: 'time' as keyof typeof Ionicons.glyphMap,
    },
  ];

  // Daily Games
  const dailyGames = [
    { id: 1, title: 'Spin the Wheel', icon: '🎡', coins: 50, plays: '3 left', colors: ['#A855F720', '#EC489920'], route: '/explore/spin-win' },
    { id: 2, title: 'Daily Check-in', icon: '📅', coins: 25, plays: 'Today', colors: ['#3B82F620', '#06B6D420'], route: '/explore/daily-checkin' },
    { id: 3, title: 'Scratch Card', icon: '🎫', coins: 100, plays: '1 left', colors: ['#F59E0B20', '#F9731620'], route: '/scratch-card' },
    { id: 4, title: 'Coin Hunt', icon: '🪙', coins: 75, plays: 'Unlimited', colors: ['#22C55E20', '#10B98120'], route: '/playandearn/coinhunt' },
  ];

  // Active Challenges
  const challenges = [
    { id: 1, title: 'Shop 3 Stores Today', progress: 66, reward: 200, icon: '🏪', timeLeft: '6h left' },
    { id: 2, title: 'Invite 5 Friends', progress: 40, reward: 500, icon: '👥', timeLeft: '2d left' },
    { id: 3, title: 'Scan 10 Bills', progress: 80, reward: 300, icon: '📄', timeLeft: '1d left' },
    { id: 4, title: 'Complete Profile', progress: 90, reward: 150, icon: '✅', timeLeft: 'Anytime' },
  ];

  // Live Tournaments
  const tournaments = [
    { id: 1, title: 'Weekend Shopping Sprint', prize: '₹10,000', participants: 1247, endsIn: '2d 5h', status: 'Live', rank: 23, icon: '🏆', path: '/playandearn/TournamentDetail' },
    { id: 2, title: 'Coin Master Challenge', prize: '50,000 coins', participants: 892, endsIn: '5d', status: 'Live', rank: 45, icon: '🪙', path: '/playandearn/TournamentDetail' },
    { id: 3, title: 'Referral Rally', prize: '₹5,000', participants: 543, endsIn: '1d 12h', status: 'Ending Soon', rank: 12, icon: '👥', path: '/playandearn/TournamentDetail' },
  ];

  // Mini Games
  const miniGames = [
    { id: 1, title: 'Quiz Master', icon: '🧠', plays: '5/day', earnings: '250 coins/day', path: '/playandearn/quiz' },
    { id: 2, title: 'Memory Match', icon: '🃏', plays: '3/day', earnings: '150 coins/day', path: '/playandearn/memorymatch' },
    { id: 3, title: 'Lucky Draw', icon: '🎰', plays: '1/day', earnings: 'Up to 1000 coins', path: '/playandearn/luckydraw' },
    { id: 4, title: 'Guess the Price', icon: '💰', plays: 'Unlimited', earnings: '50 coins/win', path: '/playandearn/guessprice' },
  ];

  // Achievements
  const achievements = [
    { id: 1, title: 'First Purchase', icon: '🎯', unlocked: true, coins: 100 },
    { id: 2, title: 'Week Streak', icon: '🔥', unlocked: true, coins: 500 },
    { id: 3, title: 'Social Butterfly', icon: '🦋', unlocked: false, coins: 300, progress: 60 },
    { id: 4, title: 'Deal Hunter', icon: '🎪', unlocked: false, coins: 400, progress: 25 },
  ];

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header: Earnings Snapshot */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Your Earnings</Text>

          {/* Wallet Summary Pills */}
          <View style={styles.walletGrid}>
            <View style={[styles.walletCard, { backgroundColor: '#E6F9F0', borderColor: '#80DFAD' }]}>
              <Text style={styles.walletLabel}>ReZ Coins</Text>
              <Text style={[styles.walletValue, { color: '#00A85D' }]}>{rezCoins.toLocaleString()}</Text>
            </View>
            <View style={[styles.walletCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
              <Text style={styles.walletLabel}>Branded</Text>
              <Text style={[styles.walletValue, { color: '#9333EA' }]}>{totalBrandedCoins.toLocaleString()}</Text>
            </View>
            <View style={[styles.walletCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={styles.walletLabel}>Promo</Text>
              <Text style={[styles.walletValue, { color: '#E6B34F' }]}>{totalPromoCoins.toLocaleString()}</Text>
            </View>
          </View>

          {/* This Month Earned */}
          <LinearGradient
            colors={['#E6F9F0', '#FFFBEB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.monthlyCard}
          >
            <View>
              <Text style={styles.monthlyLabel}>This Month Earned</Text>
              <Text style={styles.monthlyValue}>₹{monthlyEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.monthlyButtons}>
              <TouchableOpacity style={styles.walletButton} onPress={() => navigateTo('/wallet')}>
                <Text style={styles.walletButtonText}>View Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.howButton} onPress={() => navigateTo('/how-rez-works')}>
                <Text style={styles.howButtonText}>How Coins Work</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Earn Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Earn Now</Text>
          </View>

          <View style={styles.quickEarnGrid}>
            {quickEarnActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickEarnCard}
                onPress={() => navigateTo(action.path)}
              >
                <View style={[styles.iconContainer, { backgroundColor: action.iconBg[0] }]}>
                  <Ionicons name={action.icon} size={24} color={action.iconColor} />
                </View>
                <Text style={styles.quickEarnTitle}>{action.title}</Text>
                <Text style={styles.quickEarnReward}>{action.reward}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Creator Earnings Section */}
        <LinearGradient
          colors={['#FAF5FF', '#FDF2F8']}
          style={styles.creatorSection}
        >
          <View style={styles.creatorHeader}>
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              style={styles.creatorIcon}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.creatorHeaderText}>
              <Text style={styles.creatorTitle}>Become a Creator</Text>
              <Text style={styles.creatorSubtitle}>Earn by recommending products</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/creators')} style={styles.exploreLink}>
              <Text style={styles.exploreLinkText}>Explore</Text>
              <Ionicons name="arrow-forward" size={16} color="#A855F7" />
            </TouchableOpacity>
          </View>

          {/* Featured Creators */}
          <View style={styles.featuredCreatorsGrid}>
            {featuredCreators.map((creator) => (
              <TouchableOpacity
                key={creator.id}
                style={styles.creatorCard}
                onPress={() => navigateTo(`/creators/${creator.id}`)}
              >
                <View style={styles.creatorAvatarRow}>
                  <Image
                    source={{ uri: creator.avatar }}
                    style={styles.creatorAvatar}
                  />
                  {creator.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    </View>
                  )}
                </View>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <View style={styles.creatorStats}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.creatorStatText}>{creator.rating}</Text>
                  <Text style={styles.creatorStatDivider}>•</Text>
                  <Text style={styles.creatorStatText}>{creator.totalPicks} picks</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trending Picks */}
          <View style={styles.trendingSection}>
            <Text style={styles.trendingTitle}>Trending Picks</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.trendingScroll}
            >
              {trendingPicks.map((pick) => (
                <TouchableOpacity
                  key={pick.id}
                  style={styles.pickCard}
                  onPress={() => navigateTo(`/picks/${pick.id}`)}
                >
                  <View style={styles.pickImageContainer}>
                    <Image
                      source={{ uri: pick.productImage }}
                      style={styles.pickImage}
                    />
                    <TouchableOpacity style={styles.pickHeartButton}>
                      <Ionicons name="heart-outline" size={16} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.pickTag}>
                      <Text style={styles.pickTagText}>{pick.tag}</Text>
                    </View>
                    <View style={styles.pickViewsBadge}>
                      <Ionicons name="trending-up" size={12} color="#EC4899" />
                      <Text style={styles.pickViewsText}>{(pick.views / 1000).toFixed(1)}k</Text>
                    </View>
                  </View>
                  <View style={styles.pickContent}>
                    <Text style={styles.pickTitle} numberOfLines={2}>{pick.title}</Text>
                    <View style={styles.pickPriceRow}>
                      <Text style={styles.pickPrice}>₹{pick.productPrice.toLocaleString()}</Text>
                      <Text style={styles.pickBrand}>{pick.productBrand}</Text>
                    </View>
                    <View style={styles.pickStatsRow}>
                      <Ionicons name="eye-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.pickStatText}>{(pick.views / 1000).toFixed(1)}k</Text>
                      <Text style={styles.pickStatDivider}>•</Text>
                      <Text style={styles.pickStatText}>{pick.purchases} sold</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.creatorCTA}
            onPress={() => navigateTo('/creators')}
          >
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.creatorCTAGradient}
            >
              <Ionicons name="diamond" size={20} color="#FFF" />
              <Text style={styles.creatorCTAText}>Start Earning as Creator</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Daily & Streak Earnings */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#FFF7ED', '#FEF2F2']}
            style={styles.streakCard}
          >
            <View style={styles.streakHeader}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="flame" size={28} color="#F97316" />
              </View>
              <View>
                <Text style={styles.streakTitle}>Daily Rewards</Text>
                <Text style={styles.streakSubtitle}>Current Streak: {currentStreak} days 🔥</Text>
              </View>
            </View>

            {/* Streak Progress */}
            <View style={styles.streakMilestones}>
              {[
                { day: 1, coins: 10, completed: currentStreak >= 1 },
                { day: 3, coins: 30, completed: currentStreak >= 3 },
                { day: 7, coins: 100, completed: currentStreak >= 7 },
                { day: 30, coins: 500, completed: currentStreak >= 30, special: true },
              ].map((milestone) => (
                <View
                  key={milestone.day}
                  style={[
                    styles.milestoneItem,
                    milestone.completed && styles.milestoneCompleted,
                  ]}
                >
                  <Text style={styles.milestoneDay}>Day {milestone.day}</Text>
                  <Text style={[
                    styles.milestoneCoins,
                    milestone.completed && styles.milestoneCoinsCompleted,
                  ]}>
                    {milestone.special && '🎉 '}+{milestone.coins}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStreak / 30) * 100}%` }]} />
            </View>

            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => navigateTo('/explore/daily-checkin')}
            >
              <LinearGradient
                colors={['#F97316', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkinGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.checkinText}>Check in Today</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Shopping & Payment Earnings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag" size={24} color="#A855F7" />
            <Text style={styles.sectionTitle}>Earn While Shopping</Text>
          </View>

          {shoppingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.shoppingCard}
              onPress={() => navigateTo(method.path)}
            >
              <View style={styles.shoppingIconContainer}>
                <Ionicons name={method.icon} size={28} color="#00C06A" />
              </View>
              <View style={styles.shoppingContent}>
                <Text style={styles.shoppingTitle}>{method.title}</Text>
                <Text style={styles.shoppingDescription}>{method.description}</Text>
                <View style={styles.shoppingRewards}>
                  <Text style={styles.shoppingReward}>{method.reward}</Text>
                  <Text style={styles.shoppingExtra}>{method.extraReward}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* Special Highlight */}
          <LinearGradient
            colors={['#E6F9F0', '#F0FDFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.highlightCard}
          >
            <Ionicons name="locate" size={24} color="#00C06A" />
            <Text style={styles.highlightText}>🎯 Pay via ReZ = Always Better Price</Text>
          </LinearGradient>
        </View>

        {/* Social & Community Earnings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>Share & Engage</Text>
          </View>

          <View style={styles.socialGrid}>
            {socialActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.socialCard}
                onPress={() => navigateTo(action.path)}
              >
                <Ionicons name={action.icon} size={24} color="#EC4899" />
                <Text style={styles.socialTitle}>{action.title}</Text>
                <Text style={styles.socialDescription}>{action.description}</Text>
                <Text style={styles.socialCoins}>+{action.coins} coins</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Social Highlight */}
          <LinearGradient
            colors={['#FDF2F8', '#FAF5FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.socialHighlight}
          >
            <Text style={styles.socialHighlightText}>
              👥 <Text style={styles.socialHighlightBold}>Friends redeemed your shared deal</Text> → +50 ReZ Coins
            </Text>
          </LinearGradient>
        </View>

        {/* Social Impact Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.impactCard}
            onPress={() => navigateTo('/social-impact')}
          >
            <LinearGradient
              colors={['#ECFDF5', '#EFF6FF', '#F0FDF4']}
              style={styles.impactGradient}
            >
              <View style={styles.impactHeader}>
                <LinearGradient
                  colors={['#10B981', '#3B82F6']}
                  style={styles.impactIcon}
                >
                  <Ionicons name="heart" size={28} color="#FFF" />
                </LinearGradient>
                <View style={styles.impactHeaderText}>
                  <View style={styles.impactTitleRow}>
                    <Text style={styles.impactTitle}>Social Impact</Text>
                    <View style={styles.impactBadge}>
                      <Text style={styles.impactBadgeText}>Powerful Differentiator</Text>
                    </View>
                  </View>
                  <Text style={styles.impactSubtitle}>Earn while making a difference</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </View>

              <View style={styles.impactActivities}>
                {[
                  { icon: '🩸', label: 'Blood Donation', coins: 200 },
                  { icon: '🌳', label: 'Tree Plantation', coins: 150 },
                  { icon: '🏖️', label: 'Beach Cleanup', coins: 120 },
                  { icon: '🍲', label: 'NGO Volunteer', coins: 100 },
                ].map((activity, idx) => (
                  <View key={idx} style={styles.impactActivity}>
                    <Text style={styles.impactActivityIcon}>{activity.icon}</Text>
                    <Text style={styles.impactActivityLabel}>{activity.label}</Text>
                    <Text style={styles.impactActivityCoins}>+{activity.coins}</Text>
                  </View>
                ))}
              </View>

              <LinearGradient
                colors={['#D1FAE5', '#DBEAFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.impactFooter}
              >
                <Text style={styles.impactFooterText}>
                  💰 Earn ReZ Coins + 🏪 Branded Coins from sponsors
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Special Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Special Programs</Text>
          </View>

          {specialPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => navigateTo(program.path)}
            >
              <View style={styles.programHeader}>
                <View style={styles.programIconContainer}>
                  <Ionicons name={program.icon} size={28} color="#F59E0B" />
                </View>
                <View style={styles.programContent}>
                  <View style={styles.programTitleRow}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <Text style={styles.programBadge}>{program.badge}</Text>
                  </View>
                  <View style={styles.programRewards}>
                    {program.rewards.map((reward, idx) => (
                      <View key={idx} style={styles.programRewardItem}>
                        <Ionicons name="checkmark-circle" size={12} color="#00C06A" />
                        <Text style={styles.programRewardText}>{reward}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.programEarnings}>{program.earnings}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.eligibilityButton}>
                <Text style={styles.eligibilityText}>Check Eligibility</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events & Offline Earnings */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.eventsCard}
            onPress={() => navigateTo('/events')}
          >
            <LinearGradient
              colors={['#FAF5FF', '#FDF2F8', '#FFF7ED']}
              style={styles.eventsGradient}
            >
              <View style={styles.eventsHeader}>
                <View style={styles.eventsIconContainer}>
                  <Ionicons name="ticket" size={28} color="#A855F7" />
                </View>
                <View style={styles.eventsHeaderText}>
                  <Text style={styles.eventsTitle}>Earn at Events</Text>
                  <Text style={styles.eventsSubtitle}>College fests, markets, concerts & more</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </View>

              <View style={styles.eventsTypes}>
                {[
                  { icon: '🎓', label: 'College Fests' },
                  { icon: '🛍️', label: 'Flea Markets' },
                  { icon: '🎵', label: 'Music Nights' },
                  { icon: '⚽', label: 'Sports Events' },
                ].map((type, idx) => (
                  <View key={idx} style={styles.eventType}>
                    <Text style={styles.eventTypeIcon}>{type.icon}</Text>
                    <Text style={styles.eventTypeLabel}>{type.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.eventsFooter}>
                <Text style={styles.eventsFooterText}>
                  💰 Ways to earn: Entry • Purchases • Sharing • Voting • Participation
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bonus & Limited-Time Earnings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="happy" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>Bonus Zone</Text>
          </View>

          {bonusOpportunities.map((bonus, idx) => (
            <View key={idx} style={styles.bonusCard}>
              <View style={styles.bonusIconContainer}>
                <Ionicons name={bonus.icon} size={24} color="#F97316" />
              </View>
              <View style={styles.bonusContent}>
                <Text style={styles.bonusTitle}>{bonus.title}</Text>
                <Text style={styles.bonusDescription}>{bonus.description}</Text>
                <View style={styles.bonusFooter}>
                  <Text style={styles.bonusReward}>{bonus.reward}</Text>
                  <View style={styles.bonusTime}>
                    <Ionicons name="time" size={16} color="#F97316" />
                    <Text style={styles.bonusTimeText}>{bonus.timeLeft}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Learn & Maximise Section */}
        <LearnMaximiseSection />

        {/* Daily Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller" size={24} color="#A855F7" />
            <Text style={styles.sectionTitle}>Daily Games</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Free coins every day!</Text>

          <View style={styles.gamesGrid}>
            {dailyGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => navigateTo(game.route)}
              >
                <LinearGradient
                  colors={game.colors}
                  style={styles.gameCard}
                >
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameIcon}>{game.icon}</Text>
                    <View style={styles.gameCoinsBadge}>
                      <Text style={styles.gameCoinsText}>+{game.coins}</Text>
                    </View>
                  </View>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gamePlays}>{game.plays}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Challenges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithLink}>
            <View>
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              <Text style={styles.sectionSubtitle}>Complete to earn bonus coins</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/missions')}>
              <Text style={styles.viewAllLink}>View all →</Text>
            </TouchableOpacity>
          </View>

          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                  <View>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeTime}>{challenge.timeLeft}</Text>
                  </View>
                </View>
                <View style={styles.challengeReward}>
                  <Text style={styles.challengeCoins}>+{challenge.reward} coins</Text>
                  <Text style={styles.challengeProgress}>{challenge.progress}%</Text>
                </View>
              </View>
              <View style={styles.challengeProgressBar}>
                <View style={[styles.challengeProgressFill, { width: `${challenge.progress}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Live Tournaments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Live Tournaments</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Compete with thousands</Text>

          {tournaments.map((tournament) => (
            <TouchableOpacity
              key={tournament.id}
              onPress={() => navigateTo(tournament.path)}
            >
              <LinearGradient
                colors={['#A855F715', '#EC489915']}
                style={styles.tournamentCard}
              >
                <View style={styles.tournamentHeader}>
                  <View style={styles.tournamentInfo}>
                    <Text style={styles.tournamentIcon}>{tournament.icon}</Text>
                    <View>
                      <Text style={styles.tournamentTitle}>{tournament.title}</Text>
                      <Text style={styles.tournamentParticipants}>
                        {tournament.participants.toLocaleString()} players
                      </Text>
                    </View>
                  </View>
                  {tournament.status === 'Ending Soon' && (
                    <View style={styles.endingSoonBadge}>
                      <Text style={styles.endingSoonText}>{tournament.status}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.tournamentStats}>
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatLabel}>Prize Pool</Text>
                    <Text style={styles.tournamentStatValue}>{tournament.prize}</Text>
                  </View>
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatLabel}>Your Rank</Text>
                    <Text style={styles.tournamentRank}>#{tournament.rank}</Text>
                  </View>
                  <View style={styles.tournamentStat}>
                    <Text style={styles.tournamentStatLabel}>Ends In</Text>
                    <Text style={styles.tournamentEnds}>{tournament.endsIn}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mini Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mini Games</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Quick & fun</Text>

          <View style={styles.miniGamesGrid}>
            {miniGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.miniGameCard}
                onPress={() => navigateTo(game.path)}
              >
                <Text style={styles.miniGameIcon}>{game.icon}</Text>
                <Text style={styles.miniGameTitle}>{game.title}</Text>
                <Text style={styles.miniGamePlays}>{game.plays}</Text>
                <Text style={styles.miniGameEarnings}>{game.earnings}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithLink}>
            <View>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.sectionSubtitle}>Unlock badges & coins</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/playandearn/achievements')}>
              <Text style={styles.viewAllLink}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.unlocked && styles.achievementUnlocked,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View style={styles.achievementHeader}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  {achievement.unlocked && <Text>✅</Text>}
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementCoins}>+{achievement.coins} coins</Text>
                {!achievement.unlocked && achievement.progress && (
                  <View style={styles.achievementProgressContainer}>
                    <View style={styles.achievementProgressBar}>
                      <View style={[styles.achievementProgressFill, { width: `${achievement.progress}%` }]} />
                    </View>
                    <Text style={styles.achievementProgressText}>{achievement.progress}% complete</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Leaderboard Preview */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#EFF6FF', '#FAF5FF']}
            style={styles.leaderboardCard}
          >
            <Ionicons name="trophy" size={48} color="#F59E0B" />
            <Text style={styles.leaderboardTitle}>Weekly Leaderboard</Text>
            <Text style={styles.leaderboardText}>
              You're ranked #147 this week{'\n'}
              Top 100 win bonus coins!
            </Text>
            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() => navigateTo('/playandearn/leaderboard')}
            >
              <LinearGradient
                colors={['#10B981', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.leaderboardButtonGradient}
              >
                <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Why ReZ Pays More */}
        <View style={styles.section}>
          <View style={styles.whyRezCard}>
            <Text style={styles.whyRezTitle}>Why ReZ Pays You More</Text>
            <View style={styles.whyRezGrid}>
              {[
                { emoji: '💰', title: 'Merchant-Funded', subtitle: 'Real savings, not\ndiscounts' },
                { emoji: '⚡', title: 'Instant Rewards', subtitle: 'No waiting periods' },
                { emoji: '🎯', title: 'Triple Stack', subtitle: 'Cashback + Coins +\nLoyalty' },
                { emoji: '🔄', title: 'High Frequency', subtitle: 'Earn daily,\neverywhere' },
              ].map((item, idx) => (
                <View key={idx} style={styles.whyRezItem}>
                  <Text style={styles.whyRezEmoji}>{item.emoji}</Text>
                  <Text style={styles.whyRezItemTitle}>{item.title}</Text>
                  <Text style={styles.whyRezItemSubtitle}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity onPress={() => navigateTo('/pay-in-store')}>
          <LinearGradient
            colors={['#00C06A', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomCTAGradient}
          >
            <View style={styles.bottomCTAContent}>
              <Ionicons name="location" size={24} color="#FFF" />
              <View>
                <Text style={styles.bottomCTATitle}>Find Ways to Earn Near Me</Text>
                <Text style={styles.bottomCTASubtitle}>Partner stores nearby</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  walletGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  walletCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  walletLabel: {
    fontSize: 11,
    color: '#4A5568',
    marginBottom: 4,
    fontWeight: '500',
  },
  walletValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthlyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#80DFAD',
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  monthlyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  walletButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  walletButtonText: {
    color: '#0B2240',
    fontSize: 12,
    fontWeight: '600',
  },
  howButton: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  howButtonText: {
    color: '#0B2240',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderWithLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B2240',
    fontFamily: 'Poppins',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#4A5568',
    marginTop: 4,
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 12,
    color: '#10B981',
  },
  quickEarnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickEarnCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickEarnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 4,
  },
  quickEarnReward: {
    fontSize: 11,
    color: '#00A85D',
    fontWeight: '500',
  },
  creatorSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  creatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  creatorSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  exploreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreLinkText: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '600',
  },
  creatorCTA: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  creatorCTAGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  creatorCTAText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredCreatorsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  creatorCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  creatorAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorStatText: {
    fontSize: 11,
    color: '#6B7280',
  },
  creatorStatDivider: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  trendingSection: {
    marginBottom: 16,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  trendingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  pickCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pickImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  pickImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickHeartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pickTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickViewsBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pickViewsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickContent: {
    padding: 10,
  },
  pickTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 16,
  },
  pickPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  pickPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  pickBrand: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  pickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickStatText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  pickStatDivider: {
    fontSize: 10,
    color: '#D1D5DB',
  },
  streakCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakMilestones: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  milestoneItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  milestoneCompleted: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  milestoneDay: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  milestoneCoins: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  milestoneCoinsCompleted: {
    color: '#F97316',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  checkinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkinGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  checkinText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shoppingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  shoppingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0,192,106,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shoppingContent: {
    flex: 1,
  },
  shoppingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 4,
  },
  shoppingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  shoppingRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shoppingReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00C06A',
  },
  shoppingExtra: {
    fontSize: 12,
    color: '#A855F7',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C0F0D9',
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    marginTop: 12,
    marginBottom: 4,
  },
  socialDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  socialCoins: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  socialHighlight: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  socialHighlightText: {
    fontSize: 14,
    color: '#0B2240',
    textAlign: 'center',
  },
  socialHighlightBold: {
    fontWeight: '600',
  },
  impactCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  impactGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  impactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  impactBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  impactBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
  },
  impactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  impactActivities: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  impactActivity: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  impactActivityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  impactActivityLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  impactActivityCoins: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  impactFooter: {
    padding: 12,
    borderRadius: 8,
  },
  impactFooterText: {
    fontSize: 14,
    color: '#0B2240',
    textAlign: 'center',
  },
  programCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  programIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  programContent: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B2240',
  },
  programBadge: {
    fontSize: 20,
  },
  programRewards: {
    marginBottom: 8,
  },
  programRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  programRewardText: {
    fontSize: 12,
    color: '#6B7280',
  },
  programEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  eligibilityButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  eventsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventsGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventsHeaderText: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  eventsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventsTypes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  eventType: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
  },
  eventTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  eventTypeLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  eventsFooter: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  eventsFooterText: {
    fontSize: 14,
    color: '#0B2240',
  },
  bonusCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  bonusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bonusContent: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 4,
  },
  bonusDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  bonusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bonusReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00C06A',
  },
  bonusTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameIcon: {
    fontSize: 32,
  },
  gameCoinsBadge: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  gameCoinsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
    marginBottom: 4,
  },
  gamePlays: {
    fontSize: 12,
    color: '#6B7280',
  },
  challengeCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  challengeTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
  challengeCoins: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  challengeProgress: {
    fontSize: 12,
    color: '#6B7280',
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tournamentCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tournamentIcon: {
    fontSize: 24,
  },
  tournamentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  tournamentParticipants: {
    fontSize: 12,
    color: '#6B7280',
  },
  endingSoonBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  endingSoonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tournamentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tournamentStat: {},
  tournamentStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  tournamentStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A855F7',
  },
  tournamentRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
  },
  tournamentEnds: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  miniGamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniGameCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniGameIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  miniGameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
    marginBottom: 4,
  },
  miniGamePlays: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  miniGameEarnings: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  achievementLocked: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2240',
    marginBottom: 4,
  },
  achievementCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  achievementProgressContainer: {
    marginTop: 8,
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  leaderboardCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2240',
    marginTop: 12,
    marginBottom: 8,
  },
  leaderboardText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  leaderboardButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  leaderboardButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  leaderboardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  whyRezCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  whyRezTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  whyRezGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  whyRezItem: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    marginBottom: 2,
  },
  whyRezEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  whyRezItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  whyRezItemSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  bottomCTAGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  bottomCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomCTATitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomCTASubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default PlayAndEarn;
