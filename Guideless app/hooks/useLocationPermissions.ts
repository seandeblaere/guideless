import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

export function useLocationPermissions() {
  const [foregroundStatus, setForegroundStatus] = useState<string | null>(null);
  const [backgroundStatus, setBackgroundStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();
      
      setForegroundStatus(foreground.status);
      setBackgroundStatus(background.status);
    } catch (error) {
      Alert.alert('Error', 'Failed to check location permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const foregroundResult = await Location.requestForegroundPermissionsAsync();
      if (!foregroundResult.granted) {
        return false;
      }

      const backgroundResult = await Location.requestBackgroundPermissionsAsync();
      if (!backgroundResult.granted) {
        return false;
      }

      await checkPermissions();
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permissions. Please try again.');
      return false;
    }
  };

  return {
    foregroundStatus,
    backgroundStatus,
    isLoading,
    hasAllPermissions: foregroundStatus === 'granted' && backgroundStatus === 'granted',
    requestPermissions,
    checkPermissions,
  };
}