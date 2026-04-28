// Navigation Animations Configuration
// This file contains animation configurations for smooth transitions

import {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";

export const ANIMATION_CONFIG = {
  // Default timing for transitions
  timing: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },

  // Slower animation for modal presentations
  modal: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },

  // Fast animation for button feedback
  feedback: {
    duration: 150,
    easing: Easing.inOut(Easing.quad),
  },

  // Stagger delay for list items
  stagger: 50,
};

// Fade in animation
export const useFadeInAnimation = (triggerCondition: boolean) => {
  const opacity = useSharedValue(triggerCondition ? 1 : 0);

  if (!triggerCondition) {
    opacity.value = withTiming(0, ANIMATION_CONFIG.timing);
  } else {
    opacity.value = withTiming(1, ANIMATION_CONFIG.timing);
  }

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
};

// Slide up animation (useful for modals)
export const useSlideUpAnimation = (triggerCondition: boolean) => {
  const translateY = useSharedValue(triggerCondition ? 0 : 50);

  if (!triggerCondition) {
    translateY.value = withTiming(50, ANIMATION_CONFIG.timing);
  } else {
    translateY.value = withTiming(0, ANIMATION_CONFIG.timing);
  }

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
};

// Pulse animation for loading states
export const usePulseAnimation = () => {
  const scale = useSharedValue(1);

  const startPulse = () => {
    scale.value = withTiming(1.05, {
      duration: 500,
      easing: Easing.inOut(Easing.sin),
    });

    // Loop the animation
    setTimeout(() => {
      scale.value = withTiming(0.95, {
        duration: 500,
        easing: Easing.inOut(Easing.sin),
      });
      setTimeout(() => startPulse(), 500);
    }, 500);
  };

  return {
    animatedStyle: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    })),
    startPulse,
  };
};

// Scale animation for buttons
export const useScaleAnimation = (pressed: boolean) => {
  const scale = useSharedValue(1);

  const handlePress = (isPressed: boolean) => {
    scale.value = withTiming(isPressed ? 0.95 : 1, ANIMATION_CONFIG.feedback);
  };

  return {
    animatedStyle: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    })),
    handlePress,
  };
};

// Exit animation (slide down and fade)
export const useExitAnimation = (triggerExit: boolean) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  if (triggerExit) {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(50, { duration: 200 });
  } else {
    opacity.value = withTiming(1, ANIMATION_CONFIG.timing);
    translateY.value = withTiming(0, ANIMATION_CONFIG.timing);
  }

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
};
