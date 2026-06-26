import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import HamburgerMenu from '../components/HamburgerMenu';
import AnimatedButton from '../components/AnimatedButton';
import { headerEnter, zoomEnter } from '../animations/presets';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <HamburgerMenu title="FileVault">
      <View style={styles.container}>
        <Animated.View entering={headerEnter} style={styles.headerSection}>
          <Text style={styles.heading}>Upload Files Here</Text>
          <Text style={styles.subtitle}>Select one or more files to upload directly to S3</Text>
        </Animated.View>

        <Animated.View entering={zoomEnter} style={styles.buttonSection}>
          <AnimatedButton
            title="Choose Files"
            onPress={() => navigation.navigate('Upload')}
            variant="primary"
          />
        </Animated.View>
      </View>
    </HamburgerMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: {
    alignItems: 'center',
  },
});
