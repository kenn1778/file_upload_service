import {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  SlideInRight,
  SlideOutLeft,
  BounceIn,
  ZoomIn,
  LightSpeedInRight,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const timingConfig = {
  duration: 400,
};

export const springValue = (value: number) => withSpring(value, springConfig);

export const timingValue = (value: number) => withTiming(value, timingConfig);

export const cardEnter = FadeInDown.springify()
  .damping(15)
  .stiffness(150)
  .mass(0.5)
  .delay(100);

export const cardExit = FadeOutDown.springify()
  .damping(15)
  .stiffness(150);

export const buttonEnter = BounceIn.springify()
  .damping(12)
  .stiffness(200);

export const screenEnter = SlideInRight.springify()
  .damping(20)
  .stiffness(100);

export const screenExit = SlideOutLeft.springify()
  .damping(20)
  .stiffness(100);

export const headerEnter = FadeInUp.springify()
  .damping(20)
  .stiffness(100);

export const zoomEnter = ZoomIn.springify()
  .damping(15)
  .stiffness(150);

export const lightSpeedEnter = LightSpeedInRight.springify()
  .damping(15)
  .stiffness(120);
