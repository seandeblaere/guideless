import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@/stores/authStore';

export default function HomeScreen() {
  const user = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to Guideless!</Text>
      <Text style={styles.userInfo}>
        Signed in as: {user?.displayName || user?.email || 'No user data'}
      </Text>
      {!user?.emailVerified && (
        <Text style={styles.warning}>
          ⚠️ Please verify your email address
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  userInfo: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  warning: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
});