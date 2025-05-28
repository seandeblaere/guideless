import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './buttons/TabBarButton';
import { useState, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({width: 100, height: 20})

  const buttonWidth = dimensions.width / state.routes.length
  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    tabPositionX.value = state.index * buttonWidth;
  }, [buttonWidth]);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    setDimensions({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height})
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }]
    }
  }, []);

  return (
    <View style={styles.tabBar} onLayout={onTabBarLayout}>
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
            tabPositionX.value = withSpring(index * buttonWidth, {
              damping: 10,
              stiffness: 50,
            });

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
              color={isFocused ? "white" : "#222"}
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
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10, // Add for Android
    },
    indicator: {
        position: 'absolute',
        backgroundColor: 'blue',
        borderRadius: 30,
        marginHorizontal: 12,
    },
})