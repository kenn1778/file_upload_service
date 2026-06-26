import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import HamburgerMenu from '../components/HamburgerMenu';
import AnimatedButton from '../components/AnimatedButton';
import { headerEnter, zoomEnter } from '../animations/presets';
import {
  requestUploadUrl,
  confirmUpload,
  uploadFileToS3,
} from '../services/api';

const USER_ID = 'user-1';

const FILE_ICONS: Record<string, string> = {
  'image': '🖼',
  'video': '🎬',
  'audio': '🎵',
  'application/pdf': '📄',
  'application/zip': '📦',
  'text': '📝',
};

function getFileIcon(mime: string): string {
  const entry = Object.entries(FILE_ICONS).find(([key]) => mime.startsWith(key));
  return entry ? entry[1] : '📁';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [userId, setUserId] = useState(USER_ID);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const assets = file && !file.canceled && file.assets?.length ? file.assets : [];

  async function pickFiles() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setFile(result);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick files');
    }
  }

  async function addMoreFiles() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const existingUris = new Set(assets.map((a) => a.uri));
        const newAssets = result.assets.filter((a) => !existingUris.has(a.uri));
        if (newAssets.length === 0) {
          Alert.alert('Notice', 'Those files are already added');
          return;
        }
        setFile({ ...file, assets: [...assets, ...newAssets] } as DocumentPicker.DocumentPickerResult);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add more files');
    }
  }

  function removeFile(index: number) {
    const updated = assets.filter((_, i) => i !== index);
    if (updated.length === 0) {
      setFile(null);
    } else {
      setFile({ ...file, assets: updated } as DocumentPicker.DocumentPickerResult);
    }
  }

  async function handleUpload() {
    if (!file || file.canceled || !file.assets?.length) {
      Alert.alert('Error', 'Please select files first');
      return;
    }

    const toUpload = file.assets;
    setUploading(true);
    let uploaded = 0;

    try {
      for (const asset of toUpload) {
        setProgress(`Requesting URL for ${asset.name}...`);
        const { uploadUrl, s3Key } = await requestUploadUrl(
          userId,
          asset.name,
          asset.size ?? 0,
          asset.mimeType ?? 'application/octet-stream'
        );

        setProgress(`Uploading ${asset.name}...`);
        await uploadFileToS3(uploadUrl, asset.uri, asset.mimeType ?? 'application/octet-stream');

        setProgress(`Saving ${asset.name} metadata...`);
        await confirmUpload(
          userId,
          asset.name,
          asset.size ?? 0,
          asset.mimeType ?? 'application/octet-stream',
          s3Key
        );

        uploaded++;
      }

      setProgress('');
      Alert.alert('Success', `${uploaded} file${uploaded > 1 ? 's' : ''} uploaded successfully!`);
      setFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Failed', `Uploaded ${uploaded} file(s) before error`);
    } finally {
      setUploading(false);
      setProgress('');
    }
  }

  return (
    <HamburgerMenu title="Upload Files">
    <View style={styles.container}>
      <Animated.View entering={headerEnter}>
        <Text style={styles.title}>Upload Files</Text>
        <Text style={styles.subtitle}>Your files never pass through our server</Text>
      </Animated.View>

      <View style={styles.userIdSection}>
        <Text style={styles.label}>User ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter your user ID"
          autoCapitalize="none"
        />
      </View>

      {assets.length > 0 && (
        <ScrollView style={styles.previewList}>
          <Text style={styles.previewCount}>{assets.length} file{assets.length > 1 ? 's' : ''} selected</Text>
          {assets.map((a, i) => (
            <View key={`${a.uri}-${i}`} style={styles.previewCard}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(i)}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.previewHeader}>
                <Text style={styles.previewIcon}>{getFileIcon(a.mimeType ?? '')}</Text>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>{a.name}</Text>
                  <Text style={styles.previewMeta}>
                    {formatSize(a.size ?? 0)} &middot; {a.mimeType || 'unknown'}
                  </Text>
                </View>
              </View>
              {a.mimeType?.startsWith('image/') && (
                <Image source={{ uri: a.uri }} style={styles.previewImage} />
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        {assets.length === 0 ? (
          <AnimatedButton title="Select Files" onPress={pickFiles} variant="primary" disabled={uploading} />
        ) : (
          <>
            <View style={styles.buttonHalf}>
              <AnimatedButton title="Add More" onPress={addMoreFiles} variant="secondary" disabled={uploading} />
            </View>
            <View style={styles.buttonSpacer} />
            <View style={styles.buttonHalf}>
              <AnimatedButton title="Change All" onPress={pickFiles} variant="secondary" disabled={uploading} />
            </View>
          </>
        )}
      </View>

      {progress ? (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      ) : null}

      <View style={styles.uploadButton}>
        <AnimatedButton
          title={uploading ? 'Uploading...' : `Upload${assets.length > 0 ? ` (${assets.length})` : ''}`}
          onPress={handleUpload}
          disabled={assets.length === 0 || uploading}
        />
      </View>
    </View>
    </HamburgerMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
  },
  userIdSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  previewList: {
    maxHeight: 220,
    marginBottom: 16,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonSpacer: {
    width: 12,
  },
  previewCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  previewMeta: {
    fontSize: 13,
    color: '#94A3B8',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 14,
    resizeMode: 'cover',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
  },
  uploadButton: {
    marginTop: 32,
  },
});
