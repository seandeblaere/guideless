import React from "react";
import { StyleSheet, View, PanResponder, Animated } from "react-native";

interface CustomSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  style?: any;
}

const SLIDER_WIDTH = 280;
const HANDLE_SIZE = 24;
const TRACK_HEIGHT = 6;

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  style,
}) => {
  const pan = React.useRef(new Animated.ValueXY()).current;
  
  const animState = React.useRef({
    sliderWidth: SLIDER_WIDTH - HANDLE_SIZE,
    offSet: 0,
    startOffset: 0,
    currentValue: value,
    currentPosition: 0,
    isDragging: false,
  }).current;

  const getPositionFromValue = (val: number) => {
    const range = maximumValue - minimumValue;
    const normalizedValue = (val - minimumValue) / range;
    return normalizedValue * animState.sliderWidth - (animState.sliderWidth / 2);
  };

  const getValueFromPosition = (pos: number) => {
    const normalizedPos = (pos + animState.sliderWidth / 2) / animState.sliderWidth;
    const rawValue = minimumValue + normalizedPos * (maximumValue - minimumValue);
    return Math.max(minimumValue, Math.min(maximumValue, rawValue));
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animState.startOffset = animState.offSet;
        animState.isDragging = true;
      },
      onPanResponderMove: (_, gesture) => {
        const newPosition = animState.startOffset + (gesture.dx * 1);
        const clampedPosition = Math.max(
          -animState.sliderWidth / 2,
          Math.min(animState.sliderWidth / 2, newPosition)
        );
        
        animState.currentPosition = clampedPosition;
        pan.setValue({ x: clampedPosition, y: 0 });
        
        const rawValue = getValueFromPosition(clampedPosition);
        // Round the value to steps of 15, but keep slider smooth
        const steppedValue = Math.round(rawValue / step) * step;
        const finalValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
        
        if (animState.currentValue !== finalValue) {
          animState.currentValue = finalValue;
          onValueChange(finalValue);
        }
      },
      onPanResponderRelease: () => {
        animState.offSet = animState.currentPosition;
        animState.isDragging = false;
        pan.flattenOffset();
      },
    })
  ).current;

  React.useEffect(() => {
    if (!animState.isDragging && value !== animState.currentValue) {
      const position = getPositionFromValue(value);
      animState.offSet = position;
      animState.currentValue = value;
      pan.setValue({ x: position, y: 0 });
    }
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.fill,
            {
              width: pan.x.interpolate({
                inputRange: [-animState.sliderWidth / 2, animState.sliderWidth / 2],
                outputRange: [HANDLE_SIZE / 2, (SLIDER_WIDTH - HANDLE_SIZE / 2) + HANDLE_SIZE / 2],
                extrapolate: 'clamp',
              }),
            },
          ]} 
        />
        <Animated.View
          style={[
            styles.handle,
            {
              transform: [{ translateX: pan.x }],
              left: SLIDER_WIDTH / 2,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: SLIDER_WIDTH,
    height: TRACK_HEIGHT,
    backgroundColor: '#E0E0E0',
    borderRadius: TRACK_HEIGHT / 2,
    position: 'relative',
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: '#764D9D',
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
  },
  handle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: '#764D9D',
    borderRadius: HANDLE_SIZE / 2,
    position: 'absolute',
    top: (TRACK_HEIGHT - HANDLE_SIZE) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 