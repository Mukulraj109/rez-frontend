
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumStoreCardProps {
    store: any;
    onPress: (store: any) => void;
}

const PremiumStoreCard: React.FC<PremiumStoreCardProps> = ({ store, onPress }) => {
    const storeImage = store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300';
    const storeName = store.name || 'Store';
    const storeCategory = store.category?.name || store.category || 'Other';
    const storeRating = store.rating || 0;
    const storeDistance = store.distance || 'N/A';
    const storeOffer = store.offer || 'Special Deals';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(store)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: storeImage }} style={styles.image} resizeMode="cover" />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.gradientOverlay}
                />

                <View style={styles.topBadges}>
                    <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={12} color="#1E293B" />
                        <Text style={styles.distanceText}>{storeDistance}</Text>
                    </View>
                    <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart-outline" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomInfo}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>{typeof storeRating === 'number' ? storeRating.toFixed(1) : storeRating}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={1}>{storeName}</Text>
                        <Text style={styles.category}>{storeCategory}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <View style={styles.offerBadge}>
                        <Ionicons name="ticket-outline" size={14} color="#8B5CF6" />
                        <Text style={styles.offerText} numberOfLines={1}>{storeOffer}</Text>
                    </View>

                    <TouchableOpacity style={styles.visitLink}>
                        <Text style={styles.visitText}>Visit</Text>
                        <Ionicons name="arrow-forward-circle" size={20} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
        backgroundColor: '#F1F5F9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    topBadges: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 100,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bottomInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#1E293B',
    },
    contentContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    offerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
        flex: 1,
        marginRight: 12,
    },
    offerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7C3AED',
        flex: 1,
    },
    visitLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    visitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
});

export default PremiumStoreCard;
