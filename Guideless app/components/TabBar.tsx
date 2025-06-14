import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './buttons/TabBarButton';
import { useState, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

interface TabBarProps extends BottomTabBarProps {
  isKeyboardVisible?: boolean;
}

export function TabBar({ state, descriptors, navigation, isKeyboardVisible = false }: TabBarProps) {
  const [dimensions, setDimensions] = useState({width: 100, height: 20})

  const buttonWidth = dimensions.width / state.routes.length
  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, { duration: 1500 });
  }, [state.index, buttonWidth]);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    setDimensions({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height})
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }]
    }
  }, []);

  return (
    <View 
      style={[
        styles.tabBar, 
        { display: isKeyboardVisible ? 'none' : 'flex' }
      ]} 
      onLayout={onTabBarLayout}
    >
      <Animated.View style={[styles.indicator, animatedStyle, {
        height: dimensions.height - 15,
        width: buttonWidth - 25
      }]}/>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const labelString = typeof label === 'string' ? label : route.name;
          const isFocused = state.index === index;
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
  
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
  
          return (
            <TabBarButton
              key={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routeName={route.name}
              color={isFocused ? "#D97995" : "#FCFCFC"}
              label={labelString}
            />
          );
        })}
      </View>
    );
  }

  const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D97995',
        marginHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 35,
        shadowColor: '#2E3A59',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    indicator: {
        position: 'absolute',
        backgroundColor: '#FFE9EF',
        borderRadius: 30,
        marginHorizontal: 12,
    },
})