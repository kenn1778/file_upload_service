import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { buttonEnter } from '../animations/presets';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({ title, onPress, variant = 'primary', disabled }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.95);
  }

  function handlePressOut() {
    scale.value = withSpring(1);
  }

  const colors = {
    primary: { bg: '#4F46E5', text: '#FFF' },
    secondary: { bg: '#E0E7FF', text: '#4F46E5' },
    danger: { bg: '#EF4444', text: '#FFF' },
  };

  const theme = colors[variant];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      entering={buttonEnter}
      style={[
        styles.button,
        { backgroundColor: theme.bg, opacity: disabled ? 0.5 : 1 },
        animatedStyle,
      ]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: theme.text }]}>{title}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
