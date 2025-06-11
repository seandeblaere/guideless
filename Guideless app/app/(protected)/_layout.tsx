import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { Keyboard } from 'react-native';
import { useEffect, useState } from 'react';

export default function ProtectedLayout() {
  const [keyboardShow, setKeyboardShow] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardShow(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardShow(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  return (
    <Tabs
      tabBar={props => <TabBar {...props} isKeyboardVisible={keyboardShow} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Map',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}