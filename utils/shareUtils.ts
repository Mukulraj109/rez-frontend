import { Share, Alert } from 'react-native';
import * as Linking from 'expo-linking';

// App configuration for sharing
const APP_CONFIG = {
  name: 'REZ App',
  deepLinkPrefix: 'rez-app://',
  webUrl: 'https://rez-app.com', // Replace with your actual web URL
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.yourapp.rez',
  appStoreUrl: 'https://apps.apple.com/app/rez-app/id123456789'
};

export interface SharePageOptions {
  page: string;
  title?: string;
  message?: string;
  fallbackUrl?: string;
}

export const shareAppPage = async (options: SharePageOptions) => {
  try {
    // Generate deep link URL
    const deepLink = `${APP_CONFIG.deepLinkPrefix}${options.page}`;
    
    // Generate web fallback URL
    const webUrl = options.fallbackUrl || `${APP_CONFIG.webUrl}/${options.page}`;
    
    const shareContent = {
      message: options.message || `Check out ${options.title || 'this page'} on ${APP_CONFIG.name}!`,
      url: webUrl,
      title: options.title || `${APP_CONFIG.name} - ${options.page}`
    };

    const result = await Share.share(shareContent);
    
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared via:', result.activityType);
      } else {
        console.log('Page shared successfully');
      }
      return { success: true, action: 'shared' };
    } else if (result.action === Share.dismissedAction) {
      console.log('Share was dismissed');
      return { success: true, action: 'dismissed' };
    }
    
    return { success: false, action: 'unknown' };
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Unable to share at this time. Please try again.');
    return { success: false, action: 'error', error };
  }
};

// Specific share functions for different pages
export const shareOffersPage = () => {
  return shareAppPage({
    page: 'offers',
    title: 'MEGA OFFERS',
    message: '🎉 Check out these amazing MEGA OFFERS! Get up to 12% cash back on fashion, electronics, beauty, and more! 💰',
    fallbackUrl: `${APP_CONFIG.webUrl}/offers`
  });
};

export const shareSpecificOffer = (offerId: string, offerTitle: string, cashBack: number) => {
  return shareAppPage({
    page: `offers/${offerId}`,
    title: offerTitle,
    message: `💸 ${offerTitle} - Get ${cashBack}% cash back! Don't miss this amazing deal on ${APP_CONFIG.name}! 🛍️`,
    fallbackUrl: `${APP_CONFIG.webUrl}/offers/${offerId}`
  });
};

export const shareHomePage = () => {
  return shareAppPage({
    page: '',
    title: APP_CONFIG.name,
    message: `Download ${APP_CONFIG.name} for amazing deals and cash back rewards! 🎁`,
    fallbackUrl: APP_CONFIG.webUrl
  });
};

// Utility to check if sharing is available
export const isSharingAvailable = () => {
  return Share.share !== undefined;
};

// Generate app download links based on platform
export const generateAppDownloadMessage = () => {
  const message = `Download ${APP_CONFIG.name} for amazing deals and rewards!\n\n` +
    `📱 Android: ${APP_CONFIG.playStoreUrl}\n` +
    `🍎 iOS: ${APP_CONFIG.appStoreUrl}\n\n` +
    `Or visit: ${APP_CONFIG.webUrl}`;
  
  return message;
};

// Share app download links
export const shareAppDownload = async () => {
  try {
    const result = await Share.share({
      message: generateAppDownloadMessage(),
      title: `Download ${APP_CONFIG.name}`
    });

    if (result.action === Share.sharedAction) {
      console.log('App download link shared successfully');
      return { success: true };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Share app download error:', error);
    Alert.alert('Error', 'Unable to share download link. Please try again.');
    return { success: false, error };
  }
};