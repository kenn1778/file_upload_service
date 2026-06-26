import { useState, useCallback, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

const MENU_ITEMS = [
  { label: 'Home', icon: '🏠', route: 'Home' },
  { label: 'Upload Files', icon: '📤', route: 'Upload' },
  { label: 'My Files', icon: '📂', route: 'Files' },
  { label: 'Settings', icon: '⚙️', route: 'Settings' },
];

interface Props {
  children: ReactNode;
  title?: string;
}

export default function HamburgerMenu({ children, title }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const currentRoute = useNavigationState((s) => s.routes[s.index]?.name);
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    translateX.value = withSpring(0, {
      damping: 28,
      stiffness: 300,
      mass: 0.8,
    });
    overlayOpacity.value = withTiming(0.5, { duration: 300 });
  }, []);

  const closeMenu = useCallback(() => {
    translateX.value = withSpring(-DRAWER_WIDTH, {
      damping: 28,
      stiffness: 300,
      mass: 0.8,
    });
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIsOpen(false), 250);
  }, []);

  const navigate = useCallback((route: string) => {
    closeMenu();
    setTimeout(() => navigation.navigate(route), 300);
  }, [closeMenu, navigation]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 4, height: insets.top + 52 }]}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburgerHitArea} activeOpacity={0.6}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        {title && <Text style={styles.headerTitle}>{title}</Text>}
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>{children}</View>

      {isOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <AnimatedPressable
            style={[styles.overlay, overlayStyle]}
            onPress={closeMenu}
          />
          <Animated.View style={[styles.drawerOuter, drawerStyle]}>
            <View style={[styles.drawer, { paddingTop: insets.top + 20 }]}>
              <View style={styles.drawerHeader}>
                {user?.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarLetter}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'G'}
                    </Text>
                  </View>
                )}
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Guest'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || ''}
                </Text>
              </View>

              <View style={styles.menuSection}>
                {MENU_ITEMS.map((item) => {
                  const isActive = currentRoute === item.route;
                  return (
                    <TouchableOpacity
                      key={item.route}
                      style={[styles.menuItem, isActive && styles.menuItemActive]}
                      onPress={() => navigate(item.route)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.menuItemIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.menuItemLabel,
                          isActive && styles.menuItemLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.drawerFooter}>
                {user ? (
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => { closeMenu(); signOut(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.logoutLabel}>Sign out</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.guestHint}>Sign in to sync your files</Text>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  hamburgerHitArea: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  drawerOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  drawer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom: 24,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    backgroundColor: '#013c64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },

  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  menuItemLabelActive: {
    color: '#013c4b',
    fontWeight: '600',
  },

  drawerFooter: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  guestHint: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
