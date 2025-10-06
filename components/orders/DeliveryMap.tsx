import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { OrderLocationUpdate } from '@/hooks/useOrderTracking';

interface DeliveryMapProps {
  locationUpdate: OrderLocationUpdate | null;
  deliveryAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function DeliveryMap({ locationUpdate, deliveryAddress }: DeliveryMapProps) {
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  useEffect(() => {
    if (locationUpdate?.estimatedArrival) {
      const arrival = new Date(locationUpdate.estimatedArrival);
      const now = new Date();
      const diff = arrival.getTime() - now.getTime();
      const minutes = Math.max(0, Math.floor(diff / 60000));

      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setEstimatedTime(`${hours}h ${mins}m`);
      } else {
        setEstimatedTime(`${minutes} min`);
      }

      // Update every minute
      const interval = setInterval(() => {
        const newArrival = new Date(locationUpdate.estimatedArrival!);
        const newNow = new Date();
        const newDiff = newArrival.getTime() - newNow.getTime();
        const newMinutes = Math.max(0, Math.floor(newDiff / 60000));

        if (newMinutes > 60) {
          const hours = Math.floor(newMinutes / 60);
          const mins = newMinutes % 60;
          setEstimatedTime(`${hours}h ${mins}m`);
        } else {
          setEstimatedTime(`${newMinutes} min`);
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [locationUpdate?.estimatedArrival]);

  const handleCallDriver = () => {
    if (locationUpdate?.deliveryPartner.phone) {
      Linking.openURL(`tel:${locationUpdate.deliveryPartner.phone}`);
    }
  };

  const openInMaps = () => {
    if (locationUpdate?.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${locationUpdate.location.latitude},${locationUpdate.location.longitude}`;
      Linking.openURL(url);
    }
  };

  if (!locationUpdate) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderMap}>
          <Text style={styles.placeholderText}>Waiting for delivery tracking...</Text>
          <Text style={styles.placeholderSubtext}>
            Real-time tracking will appear once your order is dispatched
          </Text>
        </View>

        {deliveryAddress && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Delivery Address</Text>
            <Text style={styles.addressText}>
              {deliveryAddress.addressLine1}
              {deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}
            </Text>
            <Text style={styles.addressText}>
              {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder with Location Info */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapMarker}>
            <Text style={styles.mapMarkerText}>📍</Text>
          </View>
          <Text style={styles.mapLocationText}>
            {locationUpdate.location.address || 'Delivery in progress'}
          </Text>

          {locationUpdate.distanceToDestination && (
            <Text style={styles.distanceText}>
              {(locationUpdate.distanceToDestination / 1000).toFixed(1)} km away
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.openMapButton} onPress={openInMaps}>
          <Text style={styles.openMapButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Partner Info */}
      <View style={styles.driverInfoContainer}>
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatarContainer}>
            {locationUpdate.deliveryPartner.photoUrl ? (
              <Image
                source={{ uri: locationUpdate.deliveryPartner.photoUrl }}
                style={styles.driverAvatar}
              />
            ) : (
              <View style={styles.driverAvatarPlaceholder}>
                <Text style={styles.driverAvatarText}>
                  {locationUpdate.deliveryPartner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{locationUpdate.deliveryPartner.name}</Text>
            {locationUpdate.deliveryPartner.vehicle && (
              <Text style={styles.driverVehicle}>
                {locationUpdate.deliveryPartner.vehicle}
              </Text>
            )}
            {estimatedTime && (
              <Text style={styles.estimatedArrival}>Arriving in {estimatedTime}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallDriver}
          activeOpacity={0.7}
        >
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Current Location Info */}
      {locationUpdate.location.address && (
        <View style={styles.currentLocationContainer}>
          <Text style={styles.currentLocationLabel}>Current Location</Text>
          <Text style={styles.currentLocationText}>
            {locationUpdate.location.address}
          </Text>
          <Text style={styles.currentLocationCoords}>
            {locationUpdate.location.latitude.toFixed(6)},{' '}
            {locationUpdate.location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Delivery Address */}
      {deliveryAddress && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
          <Text style={styles.addressText}>
            {deliveryAddress.addressLine1}
            {deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}
          </Text>
          <Text style={styles.addressText}>
            {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  mapContainer: {
    position: 'relative',
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapMarker: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapMarkerText: {
    fontSize: 48,
  },
  mapLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  openMapButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openMapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderMap: {
    height: 250,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    margin: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  driverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatarContainer: {
    marginRight: 12,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  driverVehicle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  estimatedArrival: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: {
    fontSize: 24,
  },
  currentLocationContainer: {
    padding: 16,
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  currentLocationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  currentLocationCoords: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  addressContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
