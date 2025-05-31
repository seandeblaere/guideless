import { useState, useEffect } from 'react';
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
      console.error('Error checking permissions:', error);
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
      console.error('Error requesting permissions:', error);
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