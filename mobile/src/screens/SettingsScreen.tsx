import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import HamburgerMenu from '../components/HamburgerMenu';
import AnimatedButton from '../components/AnimatedButton';
import { useAuth } from '../context/AuthContext';
import { headerEnter } from '../animations/presets';

export default function SettingsScreen() {
  const { user, signInWithGoogle, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <HamburgerMenu title="Settings">
      <View style={styles.container}>
        <Animated.View entering={headerEnter} style={styles.profileSection}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name || 'Not signed in'}</Text>
          <Text style={styles.email}>{user?.email || 'Sign in to access all features'}</Text>
        </Animated.View>

        <Animated.View entering={headerEnter} style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Provider</Text>
            <Text style={styles.infoValue}>{user ? 'Google' : '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{user?.id || '—'}</Text>
          </View>
        </Animated.View>

        <View style={styles.buttonSection}>
          {user ? (
            <AnimatedButton title="Sign Out" onPress={handleSignOut} variant="danger" />
          ) : (
            <AnimatedButton title="Sign In with Google" onPress={signInWithGoogle} variant="primary" />
          )}
        </View>
      </View>
    </HamburgerMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  email: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    maxWidth: '60%',
  },
  buttonSection: {
    alignItems: 'center',
  },
});
