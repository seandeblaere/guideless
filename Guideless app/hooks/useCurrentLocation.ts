import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useLocationPermissions } from './useLocationPermissions';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForMapFocus, setIsLoadingForMapFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { hasAllPermissions, requestPermissions } = useLocationPermissions();

  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!hasAllPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          setError('Location permissions not granted');
          return null;
        }
      }
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      setLocation(coordinates);
      return coordinates;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get location';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasAllPermissions, requestPermissions]);

  const getLocationForMapFocus = useCallback(async (): Promise<LocationCoordinates | null> => {
    setIsLoadingForMapFocus(true);
    setError(null);

    if (!hasAllPermissions) {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Location permissions not granted');
        return null;
      }
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low
    });
    
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    setIsLoadingForMapFocus(false);

    return coordinates;
  }, [hasAllPermissions, requestPermissions]);

  return {
    location,
    isLoading,
    isLoadingForMapFocus,
    error,
    getCurrentLocation,
    getLocationForMapFocus
  };
}