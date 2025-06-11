import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { decode } from '@googlemaps/polyline-codec';
import { useRouteStore } from '@/stores/RouteStore';

export default function MapScreen() {
  const { route, currentLocation, pois } = useRouteStore();
  const [myLocation, setMyLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = currentLocation;
        if (location) {
          setMyLocation(location);
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    getLocation();
  }, []);

  if (isLoadingLocation || !myLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#764D9D" />
      </View>
    );
  }

  const decodedPolyline = route?.polyline ? decode(route.polyline, 5) : [];

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>     
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
        >
          {decodedPolyline.length > 0 && (
            <Polyline
              coordinates={decodedPolyline.map(([latitude, longitude]) => ({
                latitude,
                longitude,
              }))}
              strokeColor="#FDD6DF"
              strokeWidth={4}
            />
          )}
          
          <Marker
            coordinate={myLocation}
            title="My Location"
            description="This is your current location"
            pinColor="#2563EB"
          />

          {pois.map((poi, index) => (
            <Marker
              key={poi.placeId}
              coordinate={{
                latitude: poi.locationRegion.latitude,
                longitude: poi.locationRegion.longitude,
              }}
              title={poi.name}
              description={`POI ${index + 1}`}
              pinColor="#E3D7F7"
            />
          ))}
        </MapView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
});