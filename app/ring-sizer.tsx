// Ring Sizer Tool Page
// Interactive tool to help users determine their ring size

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ringSizeApi from '@/services/ringSizeApi';

const { width } = Dimensions.get('window');

interface RingSize {
  size: string;
  diameter: number;
  circumference: number;
  description: string;
}

const RING_SIZES: RingSize[] = [
  { size: '4', diameter: 14.9, circumference: 46.8, description: 'Very small' },
  { size: '4.5', diameter: 15.3, circumference: 48.0, description: 'Small' },
  { size: '5', diameter: 15.7, circumference: 49.3, description: 'Small' },
  { size: '5.5', diameter: 16.1, circumference: 50.6, description: 'Small-Medium' },
  { size: '6', diameter: 16.5, circumference: 51.9, description: 'Medium' },
  { size: '6.5', diameter: 16.9, circumference: 53.1, description: 'Medium' },
  { size: '7', diameter: 17.3, circumference: 54.4, description: 'Medium-Large' },
  { size: '7.5', diameter: 17.7, circumference: 55.7, description: 'Large' },
  { size: '8', diameter: 18.1, circumference: 56.9, description: 'Large' },
  { size: '8.5', diameter: 18.5, circumference: 58.2, description: 'Large' },
  { size: '9', diameter: 18.9, circumference: 59.5, description: 'Very Large' },
  { size: '9.5', diameter: 19.3, circumference: 60.7, description: 'Very Large' },
  { size: '10', diameter: 19.7, circumference: 62.0, description: 'Extra Large' },
];

export default function RingSizerPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'measure' | 'compare' | 'guide'>('measure');
  const [fingerMeasurement, setFingerMeasurement] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<RingSize | null>(null);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleMethodSelect = useCallback((method: 'measure' | 'compare' | 'guide') => {
    setSelectedMethod(method);
    setSelectedSize(null);
    setFingerMeasurement('');
  }, []);

  const handleMeasurementChange = useCallback((value: string) => {
    setFingerMeasurement(value);
    const measurement = parseFloat(value);
    if (!isNaN(measurement)) {
      // Find closest ring size based on circumference
      const closestSize = RING_SIZES.reduce((prev, curr) => 
        Math.abs(curr.circumference - measurement) < Math.abs(prev.circumference - measurement) 
          ? curr : prev
      );
      setSelectedSize(closestSize);
    } else {
      setSelectedSize(null);
    }
  }, []);

  const [saving, setSaving] = useState(false);
  const [savedSize, setSavedSize] = useState<string | null>(null);

  // Load saved ring size on mount
  useEffect(() => {
    loadSavedRingSize();
  }, []);

  const loadSavedRingSize = useCallback(async () => {
    try {
      const response = await ringSizeApi.getRingSize();
      if (response.success && response.data) {
        setSavedSize(response.data.size);
      }
    } catch (error) {
      console.error('Error loading saved ring size:', error);
    }
  }, []);

  const handleSaveRingSize = useCallback(async (size: RingSize) => {
    if (saving) return;

    try {
      setSaving(true);

      // Validate ring size before saving
      if (!size.size || size.size.trim() === '') {
        Alert.alert('Validation Error', 'Please select a valid ring size');
        return;
      }

      const response = await ringSizeApi.saveRingSize(size.size, selectedMethod);

      if (response.success) {
        setSavedSize(size.size);
        Alert.alert(
          'Success',
          response.message || 'Ring size saved to your profile!',
          [
            {
              text: 'OK',
              onPress: () => {
              }
            }
          ]
        );
      } else {
        // Show error with retry option
        Alert.alert(
          'Save Failed',
          response.error || 'Failed to save ring size',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => handleSaveRingSize(size)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving ring size:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: () => handleSaveRingSize(size)
          }
        ]
      );
    } finally {
      setSaving(false);
    }
  }, [saving, selectedMethod]);

  const handleSizeSelect = useCallback(async (size: RingSize) => {
    setSelectedSize(size);

    const isSaved = savedSize === size.size;

    Alert.alert(
      'Ring Size Selected',
      `You selected ring size ${size.size} (${size.description})\n\nDiameter: ${size.diameter}mm\nCircumference: ${size.circumference}mm${isSaved ? '\n\nThis size is already saved to your profile.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSaved ? 'Saved' : 'Save to Profile',
          onPress: () => handleSaveRingSize(size),
          style: isSaved ? 'default' : 'default'
        }
      ]
    );
  }, [savedSize, handleSaveRingSize]);

  const renderMeasurementMethod = () => (
    <View style={styles.methodContainer}>
      <ThemedText style={styles.methodTitle}>Measure Your Finger</ThemedText>
      <ThemedText style={styles.methodDescription}>
        Wrap a piece of string or paper around your finger, mark where it overlaps, 
        then measure the length with a ruler.
      </ThemedText>
      
      <View style={styles.measurementInput}>
        <ThemedText style={styles.inputLabel}>Finger Circumference (mm):</ThemedText>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputPrefix}>mm</ThemedText>
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputValue}>
              {fingerMeasurement || '0'}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.measurementButtons}>
        {[40, 45, 50, 55, 60, 65].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.measurementButton,
              fingerMeasurement === value.toString() && styles.measurementButtonActive
            ]}
            onPress={() => handleMeasurementChange(value.toString())}
          >
            <ThemedText style={[
              styles.measurementButtonText,
              fingerMeasurement === value.toString() && styles.measurementButtonTextActive
            ]}>
              {value}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSize && (
        <View style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Recommended Size:</ThemedText>
          <TouchableOpacity
            style={styles.resultButton}
            onPress={() => handleSizeSelect(selectedSize)}
          >
            <ThemedText style={styles.resultSize}>Size {selectedSize.size}</ThemedText>
            <ThemedText style={styles.resultDescription}>{selectedSize.description}</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCompareMethod = () => (
    <View style={styles.methodContainer}>
      <ThemedText style={styles.methodTitle}>Compare with Existing Ring</ThemedText>
      <ThemedText style={styles.methodDescription}>
        If you have a ring that fits well, place it on the chart below to find your size.
      </ThemedText>
      
      <View style={styles.sizeChart}>
        <ThemedText style={styles.chartTitle}>Ring Size Chart</ThemedText>
        <View style={styles.chartContainer}>
          {RING_SIZES.map((size) => (
            <TouchableOpacity
              key={size.size}
              style={[
                styles.sizeItem,
                selectedSize?.size === size.size && styles.sizeItemSelected
              ]}
              onPress={() => handleSizeSelect(size)}
            >
              <ThemedText style={[
                styles.sizeText,
                selectedSize?.size === size.size && styles.sizeTextSelected
              ]}>
                {size.size}
              </ThemedText>
              <ThemedText style={styles.sizeDescription}>
                {size.diameter}mm
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderGuideMethod = () => (
    <View style={styles.methodContainer}>
      <ThemedText style={styles.methodTitle}>Ring Sizing Guide</ThemedText>
      
      <View style={styles.guideSection}>
        <ThemedText style={styles.guideSectionTitle}>📏 How to Measure</ThemedText>
        <ThemedText style={styles.guideText}>
          1. Use a piece of string or paper strip{'\n'}
          2. Wrap it around the base of your finger{'\n'}
          3. Mark where the string overlaps{'\n'}
          4. Measure the length with a ruler{'\n'}
          5. Use our measurement tool above
        </ThemedText>
      </View>

      <View style={styles.guideSection}>
        <ThemedText style={styles.guideSectionTitle}>💡 Tips</ThemedText>
        <ThemedText style={styles.guideText}>
          • Measure at the end of the day when fingers are largest{'\n'}
          • Measure the finger you plan to wear the ring on{'\n'}
          • If between sizes, choose the larger size{'\n'}
          • Consider the width of the ring band
        </ThemedText>
      </View>

      <View style={styles.guideSection}>
        <ThemedText style={styles.guideSectionTitle}>⚠️ Important Notes</ThemedText>
        <ThemedText style={styles.guideText}>
          • Ring sizes may vary between countries{'\n'}
          • Wide bands may require a larger size{'\n'}
          • This is a guide - professional sizing is recommended for expensive rings
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Ring Sizer</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Saved Ring Size Banner */}
        {savedSize && (
          <View style={styles.savedSizeBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <ThemedText style={styles.savedSizeText}>
              Your saved ring size: {savedSize}
            </ThemedText>
          </View>
        )}

        {/* Method Selection */}
        <View style={styles.methodSelection}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              selectedMethod === 'measure' && styles.methodButtonActive
            ]}
            onPress={() => handleMethodSelect('measure')}
          >
            <Ionicons 
              name="resize-outline" 
              size={24} 
              color={selectedMethod === 'measure' ? '#7C3AED' : '#6B7280'} 
            />
            <ThemedText style={[
              styles.methodButtonText,
              selectedMethod === 'measure' && styles.methodButtonTextActive
            ]}>
              Measure
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              selectedMethod === 'compare' && styles.methodButtonActive
            ]}
            onPress={() => handleMethodSelect('compare')}
          >
            <Ionicons 
              name="git-compare-outline" 
              size={24} 
              color={selectedMethod === 'compare' ? '#7C3AED' : '#6B7280'} 
            />
            <ThemedText style={[
              styles.methodButtonText,
              selectedMethod === 'compare' && styles.methodButtonTextActive
            ]}>
              Compare
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              selectedMethod === 'guide' && styles.methodButtonActive
            ]}
            onPress={() => handleMethodSelect('guide')}
          >
            <Ionicons 
              name="help-circle-outline" 
              size={24} 
              color={selectedMethod === 'guide' ? '#7C3AED' : '#6B7280'} 
            />
            <ThemedText style={[
              styles.methodButtonText,
              selectedMethod === 'guide' && styles.methodButtonTextActive
            ]}>
              Guide
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Method Content */}
        {selectedMethod === 'measure' && renderMeasurementMethod()}
        {selectedMethod === 'compare' && renderCompareMethod()}
        {selectedMethod === 'guide' && renderGuideMethod()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBg: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  savedSizeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  savedSizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginLeft: 8,
  },
  methodSelection: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  methodButtonActive: {
    backgroundColor: '#F3E8FF',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  methodButtonTextActive: {
    color: '#7C3AED',
  },
  methodContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  measurementInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  inputValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  measurementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  measurementButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  measurementButtonActive: {
    backgroundColor: '#7C3AED',
  },
  measurementButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  measurementButtonTextActive: {
    color: '#FFFFFF',
  },
  resultContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  resultButton: {
    alignItems: 'center',
  },
  resultSize: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  resultDescription: {
    fontSize: 14,
    color: '#166534',
  },
  sizeChart: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeItem: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  sizeItemSelected: {
    backgroundColor: '#7C3AED',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  sizeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
