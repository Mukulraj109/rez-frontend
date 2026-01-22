import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../services/ordersApi';
import { LinearGradient } from 'expo-linear-gradient';
import { useRegion } from '@/contexts/RegionContext';

// Use same colors as FoodDiningCategoryPage
const COLORS = {
    primaryGreen: '#00C06A',
    primaryGold: '#F59E0B',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    white: '#FFFFFF',
    background: '#F5F5F5',
};

interface OrderAgainSectionProps {
    orders: Order[];
    limit?: number;
}

// Helper to format time ago
const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

export default function OrderAgainSection({ orders, limit = 10 }: OrderAgainSectionProps) {
    const router = useRouter();
    const { getCurrencySymbol } = useRegion();
    const currencySymbol = getCurrencySymbol();

    // Process orders to get unique items/stores to order again
    const orderItems = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        const items: any[] = [];
        const seenProducts = new Set();
        const seenStores = new Set(); // If we want to dedup by store instead

        // Flatten orders
        orders.forEach(order => {
            // For each order, get the first item or unique items
            // Requirement: "Redirect to product page" and "Order Again"
            // We will show the MAIN item from the order or just the order itself represented by an item

            const firstItem = order.items?.[0];
            if (!firstItem) return;

            // Unique key based on product ID
            if (!seenProducts.has(firstItem.productId)) {
                seenProducts.add(firstItem.productId);

                // Calculate savings for this order
                const savings = (order.totals?.discount || 0) + (order.totals?.cashback || 0);

                items.push({
                    id: firstItem.productId, // Use product ID for navigation
                    storeId: firstItem.product?.store?.id,
                    storeName: firstItem.product?.store?.name || 'Restaurant',
                    productName: firstItem.product?.name || 'Item',
                    image: firstItem.product?.images?.[0]?.url || firstItem.product?.store?.logo,
                    timeAgo: getTimeAgo(order.createdAt),
                    savings: savings > 0 ? savings : 0,
                    orderId: order.id,
                });
            }
        });

        return items.slice(0, limit);
    }, [orders, limit]);

    if (orderItems.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons name="reload-circle" size={20} color={COLORS.primaryGreen} />
                    <Text style={styles.title}>Order Again</Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            >
                {orderItems.map((item) => (
                    <TouchableOpacity
                        key={`${item.orderId}-${item.id}`} // composite key
                        style={styles.card}
                        onPress={() => {
                            // Redirect to product page as requested
                            router.push(`/ProductPage?id=${item.id}&storeId=${item.storeId}` as any);
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={styles.imageContainer}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                            ) : (
                                <View style={[styles.image, styles.placeholderImage]}>
                                    <Ionicons name="fast-food" size={24} color={COLORS.textSecondary} />
                                </View>
                            )}
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.storeName} numberOfLines={1}>{item.storeName}</Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                            </View>

                            {item.savings > 0 && (
                                <Text style={styles.savings}>
                                    Saved {currencySymbol}{item.savings} total
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    list: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 140,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        // Shadow
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        height: 90,
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 10,
    },
    storeName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timeAgo: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    savings: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.primaryGreen,
    },
});
