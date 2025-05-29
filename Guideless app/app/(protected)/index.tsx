import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { useUser } from '@/stores/authStore';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const user = useUser();

  return (
    <>
    <StatusBar translucent backgroundColor="#FCFCFC" />
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={[
              { fontFamily: 'DMSans_700Bold' },
              styles.title,
            ]}>
          Create your journey
        </Text>
        <View style={styles.buttonContainer}>
        <View style={styles.buttonShadow}>
          <LinearGradient
            colors={['#E0F7FC', '#F0E8FA', '#FFE9EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
          <Pressable style={styles.button}>
          <Text style={[
            { fontFamily: 'DMSans_400Regular' },
            styles.buttonText,
          ]}>History</Text>
          </Pressable>
          </LinearGradient>
        </View>
        <View style={styles.buttonShadow}>
          <LinearGradient
            colors={['#E0F7FC', '#F0E8FA', '#FFE9EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
          <Pressable style={styles.button}>
          <Text style={[
            { fontFamily: 'DMSans_400Regular' },
            styles.buttonText,
          ]}>Culture</Text>
          </Pressable>
          </LinearGradient>
        </View>
        <View style={styles.buttonShadow}>
          <LinearGradient
            colors={['#E0F7FC', '#F0E8FA', '#FFE9EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
          <Pressable style={styles.button}>
          <Text style={[
            { fontFamily: 'DMSans_400Regular' },
            styles.buttonText,
          ]}>Nature</Text>
          </Pressable>
          </LinearGradient>
        </View>
        <View style={styles.buttonShadow}>
          <LinearGradient
            colors={['#E0F7FC', '#F0E8FA', '#FFE9EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
          <Pressable style={styles.button}>
          <Text style={[
            { fontFamily: 'DMSans_400Regular' },
            styles.buttonText,
          ]}>Food</Text>
          </Pressable>
          </LinearGradient>
        </View>
        </View>
    </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FCFCFC',
  },
  title: {
    fontSize: 16,
    color: '#5A3A7A',
  },
  button: {
    paddingVertical: 20,
    width: '100%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 0,
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 18,
    color: '#2E3A59',
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  buttonShadow: {
    elevation: 2,
    shadowColor: '#2E3A59',
    shadowOffset: {
      width: 0.5,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    borderRadius: 15,
    width: '100%',
  },
});