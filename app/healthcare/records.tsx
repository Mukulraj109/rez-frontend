/**
 * Health Records Page
 * Full management of health documents - upload, view, share, archive
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import healthRecordsApi, { HealthRecord, HealthRecordsFilters } from '@/services/healthRecordsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  gray800: '#1F2937',
  red500: '#EF4444',
  green500: '#22C55E',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  teal500: '#14B8A6',
};

// Record type config
const recordTypes: Record<string, { icon: string; color: string; label: string }> = {
  prescription: { icon: '💊', color: COLORS.blue500, label: 'Prescription' },
  lab_report: { icon: '🔬', color: COLORS.purple500, label: 'Lab Report' },
  diagnosis: { icon: '🩺', color: COLORS.teal500, label: 'Diagnosis' },
  vaccination: { icon: '💉', color: COLORS.green500, label: 'Vaccination' },
  imaging: { icon: '📷', color: COLORS.amber500, label: 'Imaging' },
  discharge_summary: { icon: '🏥', color: COLORS.pink500, label: 'Discharge Summary' },
  other: { icon: '📄', color: COLORS.gray600, label: 'Other' },
};

const HealthRecordsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    recordType: 'prescription' as HealthRecord['recordType'],
    description: '',
    issuedBy: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
  }, [selectedType, showArchived]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const filters: HealthRecordsFilters = {
        isArchived: showArchived,
        limit: 50,
      };
      if (selectedType) {
        filters.recordType = selectedType as HealthRecord['recordType'];
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const response = await healthRecordsApi.getRecords(filters);
      if (response.success && response.data) {
        setRecords(response.data.records);
        setTypeCounts(response.data.typeCounts);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const handleSearch = () => {
    fetchRecords();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permission to capture documents');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSelectedFile({
          uri: image.uri,
          name: `scan_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: 0,
        });
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !selectedFile) {
      Alert.alert('Missing Information', 'Please add a title and select a file');
      return;
    }

    try {
      setUploadLoading(true);

      // In a real app, you would upload the file to Cloudinary first
      // For now, we'll simulate the upload
      const documentUrl = selectedFile.uri; // This would be the Cloudinary URL
      const documentType = selectedFile.type?.includes('pdf') ? 'pdf' : 'image';

      const response = await healthRecordsApi.uploadRecord({
        recordType: uploadForm.recordType,
        title: uploadForm.title,
        description: uploadForm.description,
        documentUrl,
        documentType,
        fileSize: selectedFile.size || 0,
        issuedBy: uploadForm.issuedBy ? { name: uploadForm.issuedBy, type: 'doctor' } : undefined,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map((t) => t.trim()) : [],
        originalFileName: selectedFile.name,
      });

      if (response.success) {
        setShowUploadModal(false);
        setUploadForm({ title: '', recordType: 'prescription', description: '', issuedBy: '', tags: '' });
        setSelectedFile(null);
        fetchRecords();
        Alert.alert('Success', 'Health record uploaded successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload record');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await healthRecordsApi.deleteRecord(recordId);
              if (response.success) {
                setShowRecordModal(false);
                setSelectedRecord(null);
                fetchRecords();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const handleArchiveRecord = async (recordId: string, isArchived: boolean) => {
    try {
      const response = await healthRecordsApi.archiveRecord(recordId, !isArchived);
      if (response.success) {
        setShowRecordModal(false);
        setSelectedRecord(null);
        fetchRecords();
        Alert.alert('Success', isArchived ? 'Record unarchived' : 'Record archived');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update record');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTypeFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
      <TouchableOpacity
        style={[styles.typeFilterChip, !selectedType && styles.typeFilterChipActive]}
        onPress={() => setSelectedType(null)}
      >
        <Text style={[styles.typeFilterText, !selectedType && styles.typeFilterTextActive]}>
          All ({Object.values(typeCounts).reduce((a, b) => a + b, 0)})
        </Text>
      </TouchableOpacity>
      {Object.entries(recordTypes).map(([type, config]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeFilterChip,
            selectedType === type && styles.typeFilterChipActive,
            { borderColor: config.color },
          ]}
          onPress={() => setSelectedType(selectedType === type ? null : type)}
        >
          <Text style={styles.typeFilterEmoji}>{config.icon}</Text>
          <Text style={[styles.typeFilterText, selectedType === type && styles.typeFilterTextActive]}>
            {config.label} ({typeCounts[type] || 0})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRecordCard = (record: HealthRecord) => {
    const typeConfig = recordTypes[record.recordType] || recordTypes.other;

    return (
      <TouchableOpacity
        key={record._id}
        style={styles.recordCard}
        onPress={() => {
          setSelectedRecord(record);
          setShowRecordModal(true);
        }}
      >
        <View style={[styles.recordIcon, { backgroundColor: `${typeConfig.color}20` }]}>
          <Text style={styles.recordEmoji}>{typeConfig.icon}</Text>
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
          <Text style={styles.recordMeta}>
            {typeConfig.label} • {formatDate(record.createdAt)}
          </Text>
          {record.issuedBy && (
            <Text style={styles.recordIssuer} numberOfLines={1}>By: {record.issuedBy.name}</Text>
          )}
        </View>
        <View style={styles.recordActions}>
          <View style={[styles.fileTypeBadge, { backgroundColor: record.documentType === 'pdf' ? COLORS.red500 : COLORS.blue500 }]}>
            <Text style={styles.fileTypeText}>{record.documentType.toUpperCase()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderUploadModal = () => (
    <Modal visible={showUploadModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Health Record</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Select Document</Text>
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color={COLORS.blue500} />
                  <Text style={styles.uploadButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                  <Ionicons name="document" size={24} color={COLORS.purple500} />
                  <Text style={styles.uploadButtonText}>File</Text>
                </TouchableOpacity>
              </View>
              {selectedFile && (
                <View style={styles.selectedFile}>
                  <Ionicons name="document-attach" size={20} color={COLORS.green500} />
                  <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.red500} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Blood Test Report - January 2024"
                value={uploadForm.title}
                onChangeText={(text) => setUploadForm({ ...uploadForm, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Record Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recordTypeGrid}>
                  {Object.entries(recordTypes).map(([type, config]) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.recordTypeOption,
                        uploadForm.recordType === type && { borderColor: config.color, backgroundColor: `${config.color}10` },
                      ]}
                      onPress={() => setUploadForm({ ...uploadForm, recordType: type as HealthRecord['recordType'] })}
                    >
                      <Text style={styles.recordTypeEmoji}>{config.icon}</Text>
                      <Text style={styles.recordTypeLabel}>{config.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Issued By (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Doctor/Lab name"
                value={uploadForm.issuedBy}
                onChangeText={(text) => setUploadForm({ ...uploadForm, issuedBy: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Add notes about this record"
                multiline
                numberOfLines={3}
                value={uploadForm.description}
                onChangeText={(text) => setUploadForm({ ...uploadForm, description: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tags (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="diabetes, yearly, urgent (comma separated)"
                value={uploadForm.tags}
                onChangeText={(text) => setUploadForm({ ...uploadForm, tags: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, (!selectedFile || !uploadForm.title) && styles.submitButtonDisabled]}
              onPress={handleUpload}
              disabled={uploadLoading || !selectedFile || !uploadForm.title}
            >
              {uploadLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Upload Record</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRecordModal = () => {
    if (!selectedRecord) return null;
    const typeConfig = recordTypes[selectedRecord.recordType] || recordTypes.other;

    return (
      <Modal visible={showRecordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.recordModalHeader}>
                <View style={[styles.recordModalIcon, { backgroundColor: `${typeConfig.color}20` }]}>
                  <Text style={styles.recordModalEmoji}>{typeConfig.icon}</Text>
                </View>
                <Text style={styles.modalTitle}>{typeConfig.label}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRecordModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.recordDetailTitle}>{selectedRecord.title}</Text>

              <View style={styles.recordDetailMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={16} color={COLORS.gray600} />
                  <Text style={styles.metaText}>{formatDate(selectedRecord.createdAt)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="document" size={16} color={COLORS.gray600} />
                  <Text style={styles.metaText}>{selectedRecord.documentType.toUpperCase()}</Text>
                </View>
                {selectedRecord.fileSize > 0 && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cloud-download" size={16} color={COLORS.gray600} />
                    <Text style={styles.metaText}>{formatFileSize(selectedRecord.fileSize)}</Text>
                  </View>
                )}
              </View>

              {selectedRecord.issuedBy && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Issued By</Text>
                  <Text style={styles.detailValue}>{selectedRecord.issuedBy.name}</Text>
                </View>
              )}

              {selectedRecord.description && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedRecord.description}</Text>
                </View>
              )}

              {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedRecord.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedRecord.sharedWith && selectedRecord.sharedWith.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Shared With ({selectedRecord.sharedWith.length})</Text>
                  {selectedRecord.sharedWith.map((share, index) => (
                    <View key={index} style={styles.shareItem}>
                      <Ionicons name="person" size={16} color={COLORS.gray600} />
                      <Text style={styles.shareText}>
                        {share.accessLevel === 'download' ? 'Full Access' : 'View Only'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.documentPreview}>
                {selectedRecord.documentType === 'image' ? (
                  <Image source={{ uri: selectedRecord.documentUrl }} style={styles.previewImage} resizeMode="contain" />
                ) : (
                  <View style={styles.pdfPreview}>
                    <Ionicons name="document-text" size={48} color={COLORS.red500} />
                    <Text style={styles.pdfPreviewText}>PDF Document</Text>
                    <Text style={styles.pdfPreviewName}>{selectedRecord.metadata.originalFileName}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.blue500 }]}>
                  <Ionicons name="share-social" size={18} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.green500 }]}>
                  <Ionicons name="download" size={18} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.amber500 }]}
                  onPress={() => handleArchiveRecord(selectedRecord._id, selectedRecord.isArchived)}
                >
                  <Ionicons name={selectedRecord.isArchived ? 'archive' : 'archive-outline'} size={18} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>{selectedRecord.isArchived ? 'Unarchive' : 'Archive'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.red500 }]}
                  onPress={() => handleDeleteRecord(selectedRecord._id)}
                >
                  <Ionicons name="trash" size={18} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Health Records</Text>
            <Text style={styles.headerSubtitle}>Manage your medical documents</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search records..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </LinearGradient>

      <View style={styles.filterRow}>
        {renderTypeFilters()}
        <TouchableOpacity
          style={[styles.archiveToggle, showArchived && styles.archiveToggleActive]}
          onPress={() => setShowArchived(!showArchived)}
        >
          <Ionicons name="archive" size={16} color={showArchived ? COLORS.white : COLORS.gray600} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple500} />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Records Found</Text>
          <Text style={styles.emptySubtitle}>
            {showArchived ? 'No archived records' : 'Upload your first health record'}
          </Text>
          {!showArchived && (
            <TouchableOpacity style={styles.uploadCTA} onPress={() => setShowUploadModal(true)}>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.uploadCTAText}>Upload Record</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.recordsList}
        >
          {records.map(renderRecordCard)}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowUploadModal(true)}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      {renderUploadModal()}
      {renderRecordModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  addButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: COLORS.navy },

  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  typeFilters: { flex: 1, paddingHorizontal: 16 },
  typeFilterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderRadius: 16, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  typeFilterChipActive: { backgroundColor: COLORS.purple500, borderColor: COLORS.purple500 },
  typeFilterEmoji: { fontSize: 14, marginRight: 4 },
  typeFilterText: { fontSize: 12, color: COLORS.gray600 },
  typeFilterTextActive: { color: COLORS.white },
  archiveToggle: { padding: 8, marginRight: 16, backgroundColor: COLORS.gray100, borderRadius: 20 },
  archiveToggleActive: { backgroundColor: COLORS.amber500 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.gray600, textAlign: 'center', marginBottom: 24 },
  uploadCTA: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.purple500, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  uploadCTAText: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginLeft: 8 },

  recordsList: { padding: 16 },
  recordCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.gray200 },
  recordIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  recordEmoji: { fontSize: 24 },
  recordInfo: { flex: 1, marginLeft: 12 },
  recordTitle: { fontSize: 15, fontWeight: '600', color: COLORS.navy },
  recordMeta: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  recordIssuer: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  recordActions: { alignItems: 'flex-end' },
  fileTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  fileTypeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },

  fab: { position: 'absolute', bottom: 90, right: 20, borderRadius: 28, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  recordModalHeader: { flexDirection: 'row', alignItems: 'center' },
  recordModalIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recordModalEmoji: { fontSize: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  modalBody: { padding: 16, maxHeight: 400 },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },

  uploadSection: { marginBottom: 20 },
  uploadLabel: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 12 },
  uploadButtons: { flexDirection: 'row', gap: 12 },
  uploadButton: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: COLORS.gray50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, borderStyle: 'dashed' },
  uploadButtonText: { fontSize: 12, color: COLORS.gray600, marginTop: 8 },
  selectedFile: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.green500 + '10', padding: 12, borderRadius: 8, marginTop: 12 },
  selectedFileName: { flex: 1, fontSize: 13, color: COLORS.navy, marginLeft: 8 },

  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 8 },
  formInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.navy },
  formTextArea: { height: 80, textAlignVertical: 'top' },
  recordTypeGrid: { flexDirection: 'row', gap: 8 },
  recordTypeOption: { alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, minWidth: 80 },
  recordTypeEmoji: { fontSize: 24, marginBottom: 4 },
  recordTypeLabel: { fontSize: 10, color: COLORS.gray600 },

  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.purple500, padding: 16, borderRadius: 12 },
  submitButtonDisabled: { backgroundColor: COLORS.gray400 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginLeft: 8 },

  recordDetailTitle: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  recordDetailMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: COLORS.gray600, marginLeft: 6 },
  detailSection: { marginBottom: 16 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray600, marginBottom: 4 },
  detailValue: { fontSize: 14, color: COLORS.navy },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: COLORS.purple500 + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: COLORS.purple500 },
  shareItem: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  shareText: { fontSize: 13, color: COLORS.navy, marginLeft: 8 },
  documentPreview: { marginTop: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.gray50 },
  previewImage: { width: '100%', height: 200 },
  pdfPreview: { alignItems: 'center', padding: 32 },
  pdfPreviewText: { fontSize: 14, fontWeight: '600', color: COLORS.navy, marginTop: 8 },
  pdfPreviewName: { fontSize: 12, color: COLORS.gray600, marginTop: 4 },

  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12 },
  actionButtonText: { fontSize: 11, fontWeight: '600', color: COLORS.white, marginLeft: 4 },
});

export default HealthRecordsPage;
