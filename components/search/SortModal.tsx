import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSort: (sortBy: string) => void;
  currentSort: string;
}

const SORT_OPTIONS = [
  {
    id: 'relevance',
    label: 'Most Relevant',
    icon: 'star-outline',
    description: 'Best matches first',
  },
  {
    id: 'price_low',
    label: 'Price: Low to High',
    icon: 'trending-up-outline',
    description: 'Cheapest first',
  },
  {
    id: 'price_high',
    label: 'Price: High to Low',
    icon: 'trending-down-outline',
    description: 'Most expensive first',
  },
  {
    id: 'rating',
    label: 'Highest Rated',
    icon: 'star',
    description: 'Top rated first',
  },
  {
    id: 'newest',
    label: 'Newest First',
    icon: 'time-outline',
    description: 'Recently added',
  },
  {
    id: 'popular',
    label: 'Most Popular',
    icon: 'flame-outline',
    description: 'Trending items',
  },
  {
    id: 'cashback',
    label: 'Highest Cashback',
    icon: 'cash-outline',
    description: 'Best cashback offers',
  },
];

export default function SortModal({
  visible,
  onClose,
  onSelectSort,
  currentSort,
}: SortModalProps) {
  const [selectedSort, setSelectedSort] = useState(currentSort);

  const handleSelect = (sortId: string) => {
    setSelectedSort(sortId);
    onSelectSort(sortId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sort By</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.optionsContainer}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  selectedSort === option.id && styles.optionItemActive,
                ]}
                onPress={() => handleSelect(option.id)}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      selectedSort === option.id && styles.iconContainerActive,
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={selectedSort === option.id ? '#FFFFFF' : '#7C3AED'}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedSort === option.id && styles.optionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>

                {selectedSort === option.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  optionItemActive: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#7C3AED',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionLabelActive: {
    color: '#7C3AED',
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkmark: {
    marginLeft: 8,
  },
});

