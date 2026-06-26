import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
} from 'react-native';
import Animated from 'react-native-reanimated';
import HamburgerMenu from '../components/HamburgerMenu';
import FileCard from '../components/FileCard';
import AnimatedButton from '../components/AnimatedButton';
import { headerEnter } from '../animations/presets';
import { listUserFiles, type FileRecord } from '../services/api';

const USER_ID = 'user-1';

export default function FilesScreen() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [userId, setUserId] = useState(USER_ID);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await listUserFiles(userId);
      setFiles(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function handleDownload(url: string) {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open download URL');
    });
  }

  function handleRefresh() {
    fetchFiles(true);
  }

  return (
    <HamburgerMenu title="My Files">
    <View style={styles.container}>
      <Animated.View entering={headerEnter}>
        <Text style={styles.title}>My Files</Text>
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

      <AnimatedButton
        title="Refresh"
        onPress={handleRefresh}
        variant="secondary"
        disabled={loading}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileCard file={item} onDownload={handleDownload} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4F46E5"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No files found</Text>
              <Text style={styles.emptySubtext}>
                Upload your first file to see it here
              </Text>
            </View>
          }
          contentContainerStyle={files.length === 0 ? styles.emptyList : styles.list}
        />
      )}
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
    marginBottom: 20,
  },
  userIdSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFF',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
  },
});
