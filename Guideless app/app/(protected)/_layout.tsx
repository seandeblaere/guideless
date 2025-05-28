import { Tabs } from 'expo-router';
import { useUser, useAuthActions } from '@/stores/authStore';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { TabBar } from '@/components/TabBar';

export default function ProtectedLayout() {
  const user = useUser();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Sign Out</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: `Welcome ${user?.displayName || user?.email?.split('@')[0]}`,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Map',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}