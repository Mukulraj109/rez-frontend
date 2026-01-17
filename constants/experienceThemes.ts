
/**
 * Experience Themes & Configuration
 * centralized source of truth for experience styles and metadata
 */

export interface ExperienceTheme {
    gradientColors: string[];
    icon: string;
    iconColor: string;
    bg: string;
    description: string;
    benefits?: string[];
    sectionTitle?: string; // New: Custom title for Think Outside The Box
}

export const EXPERIENCE_THEMES: Record<string, ExperienceTheme> = {
    'default': {
        gradientColors: ['#3B82F6', '#06B6D4'],
        icon: '🛍️',
        iconColor: '#3B82F6',
        bg: '#E0F2FE',
        description: 'Explore curated stores and products.',
        sectionTitle: 'Think Outside the Box',
        benefits: [
            'Exclusive deals and offers',
            'Earn ReZ coins on every purchase',
            'Cashback on all transactions',
            'Verified stores only',
        ]
    },
    'sample-trial': {
        gradientColors: ['#3B82F6', '#06B6D4'],
        icon: '🧪',
        iconColor: '#3B82F6',
        bg: '#E0F2FE',
        description: 'Experience products before making a purchase. Get free samples and trial offers from top brands.',
        sectionTitle: 'Try Before You Buy',
        benefits: [
            'Free product samples',
            'Trial period for electronics',
            'Test cosmetics before buying',
            'Money-back guarantee on trials'
        ]
    },
    '60-min-delivery': {
        gradientColors: ['#F97316', '#EF4444'],
        icon: '⚡',
        iconColor: '#F97316',
        bg: '#FFEDD5',
        description: 'Get your orders delivered in 60 minutes or less. Perfect for urgent needs and last-minute shopping.',
        sectionTitle: 'Speedy Essentials',
        benefits: [
            'Guaranteed 60-min delivery',
            'Real-time order tracking',
            'Free delivery on orders ₹500+',
            'Late delivery = coins back'
        ]
    },
    // Alias for 60-min-delivery matches
    'fast-delivery': {
        gradientColors: ['#F97316', '#EF4444'],
        icon: '⚡',
        iconColor: '#F97316',
        bg: '#FFEDD5',
        description: 'Get your orders delivered in 60 minutes or less. Perfect for urgent needs and last-minute shopping.',
        sectionTitle: 'Speedy Essentials',
        benefits: [
            'Guaranteed 60-min delivery',
            'Real-time order tracking',
            'Free delivery on orders ₹500+',
            'Late delivery = coins back'
        ]
    },
    'luxury': {
        gradientColors: ['#8B5CF6', '#EC4899'],
        icon: '💎',
        iconColor: '#8B5CF6',
        bg: '#F3E8FF',
        description: 'Indulge in premium shopping experiences with exclusive luxury brands and VIP treatment.',
        sectionTitle: 'Exclusive Collection',
        benefits: [
            'Personal shopping assistance',
            'Exclusive brand collections',
            'Premium gift wrapping',
            'VIP lounge access'
        ]
    },
    'organic': {
        gradientColors: ['#22C55E', '#10B981'],
        icon: '🌿',
        iconColor: '#22C55E',
        bg: '#DCFCE7',
        description: 'Shop 100% certified organic products. Healthy choices for you and sustainable for the planet.',
        sectionTitle: 'Green Picks',
        benefits: [
            'Certified organic products',
            'Farm-to-table freshness',
            'Eco-friendly packaging',
            'Sustainability rewards'
        ]
    },
    'men': {
        gradientColors: ['#6B7280', '#475569'],
        icon: '👔',
        iconColor: '#64748B',
        bg: '#F1F5F9',
        description: "Curated collection of fashion, grooming, and lifestyle products exclusively for men.",
        sectionTitle: "Gentleman's Choice",
        benefits: [
            'Style consultation',
            'Grooming guides',
            "Exclusive men's brands",
            'Loyalty rewards'
        ]
    },
    'women': {
        gradientColors: ['#EC4899', '#F43F5E'],
        icon: '👗',
        iconColor: '#EC4899',
        bg: '#FCE7F3',
        description: "Discover the latest in women's fashion, beauty, wellness, and lifestyle essentials.",
        sectionTitle: 'Trending Now',
        benefits: [
            'Personal stylist service',
            'Beauty consultations',
            "Exclusive women's brands",
            'Special occasion styling'
        ]
    },
    'children': {
        gradientColors: ['#EAB308', '#F59E0B'],
        icon: '🧸',
        iconColor: '#EAB308',
        bg: '#FEF9C3',
        description: 'Everything your little ones need - from toys and clothes to educational products.',
        sectionTitle: 'Little Wonders',
        benefits: [
            'Age-appropriate selections',
            'Safety certified products',
            'Educational toys',
            'Parent discounts'
        ]
    },
    'rental': {
        gradientColors: ['#6366F1', '#3B82F6'],
        icon: '🔄',
        iconColor: '#6366F1',
        bg: '#E0E7FF',
        description: 'Rent high-quality products instead of buying. Perfect for special occasions and temporary needs.',
        sectionTitle: 'Rent & Relax',
        benefits: [
            'Flexible rental periods',
            'No maintenance hassle',
            'Try before you buy option',
            'Eco-friendly choice'
        ]
    },
    'gifting': {
        gradientColors: ['#EF4444', '#EC4899'],
        icon: '🎁',
        iconColor: '#F43F5E',
        bg: '#FFE4E6',
        description: 'Find the perfect gift for every occasion. From personalized items to luxury hampers.',
        sectionTitle: 'Perfect Gifts',
        benefits: [
            'Gift wrapping included',
            'Personalization options',
            'Same-day delivery',
            'Gift cards available'
        ]
    },
    // New Generic Categories
    'dining': {
        gradientColors: ['#F59E0B', '#D97706'],
        icon: '🍽️',
        iconColor: '#D97706',
        bg: '#FEF3C7',
        description: 'Fine dining, quick bites, and gourmet experiences.',
        sectionTitle: "Chef's Specials",
    },
    'night-life': {
        gradientColors: ['#7C3AED', '#4C1D95'],
        icon: '🍸',
        iconColor: '#7C3AED',
        bg: '#EDE9FE',
        description: 'Explore the best nightlife, clubs, and evening entertainment.',
        sectionTitle: 'Party Essentials',
    }
};

/**
 * Get theme for a given slug with fuzzy matching fallback
 */
export const getTheme = (slug: string): ExperienceTheme => {
    if (!slug) return EXPERIENCE_THEMES['default'];

    // 1. Direct match
    if (EXPERIENCE_THEMES[slug]) return EXPERIENCE_THEMES[slug];

    // 2. Partial/Keyword match
    const lowerSlug = slug.toLowerCase();
    const keys = Object.keys(EXPERIENCE_THEMES);

    const match = keys.find(k => k !== 'default' && lowerSlug.includes(k));
    if (match) return EXPERIENCE_THEMES[match];

    return EXPERIENCE_THEMES['default'];
};
