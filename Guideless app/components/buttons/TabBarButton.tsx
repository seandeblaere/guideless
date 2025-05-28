import { icon } from '@/constants/icon';
import { Pressable, StyleSheet } from 'react-native';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated'
import Animated from 'react-native-reanimated';
import { useEffect } from 'react';

type TabBarButtonProps = {
    onPress: () => void;
    onLongPress: () => void;
    isFocused: boolean;
    routeName: string;
    color: string;
    label: string;
}

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName, color, label }: TabBarButtonProps) => {
  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    })
  }, [isFocused])

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0])
    return {
      opacity
    }
  }, [])

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])
    const top = interpolate(scale.value, [0, 1], [0, 9])
    return {
      transform: [{ scale: scaleValue }], 
      top
    }
  }, [])

    return (
        <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarItem}
            >
              <Animated.View style={animatedIconStyle}>
                {icon[routeName as keyof typeof icon]({ color })}
              </Animated.View>
            
              <Animated.Text style={[{color, fontSize: 12}, animatedTextStyle]}>
                {label}
              </Animated.Text>
        </Pressable>
    )
}

export default TabBarButton;

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  }
})
