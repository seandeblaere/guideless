import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Button } from '@/components/buttons/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function AuthScreen() {
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E3D7F7', '#FDD6DF', '#E3D7F7']}
        start={{ x: 0, y: 0.75 }}
        end={{ x: 1, y: 0.1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.titleContainer}>
        <Text style={[
          { fontFamily: 'PlayfairDisplay-Bold' },
          styles.title,
          { color: '#2E3A59' },
        ]}>Guideless</Text>
        <Text style={[
          { fontFamily: 'DMSans-Regular' },
          styles.subtitle,
        ]}>Let your journey match your vibe</Text>
        </View>
      <View style={styles.buttonContainer}>
        <Button title="Login" variant="primary" backgroundColor="#FCFCFC" textColor="#2E3A59" onPress={() => router.push('/login')} />
        <Button title="Register" variant="primary" backgroundColor="#2E3A59" textColor="#FCFCFC" onPress={() => router.push('/register')} />
      </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexGrow: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 60,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#764D9D',
  },
});