import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { cardEnter, cardExit } from '../animations/presets';
import type { FileRecord } from '../services/api';

interface Props {
  file: FileRecord;
  onDownload: (url: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FileCard({ file, onDownload }: Props) {
  return (
    <AnimatedTouchable
      entering={cardEnter}
      exiting={cardExit}
      onPress={() => onDownload(file.downloadUrl)}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📄</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName}
        </Text>
        <Text style={styles.meta}>
          {formatSize(file.fileSize)} &middot; {file.mimeType}
        </Text>
        <Text style={styles.date}>{formatDate(file.uploadedAt)}</Text>
      </View>
      <Text style={styles.downloadArrow}>⬇</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  downloadArrow: {
    fontSize: 18,
    marginLeft: 8,
  },
});
