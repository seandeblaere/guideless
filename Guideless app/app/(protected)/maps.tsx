import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { decode } from '@googlemaps/polyline-codec';
import { useRouteStore } from '@/stores/RouteStore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MapScreen() {
  const { route, pois, isLoading:isLoadingRoute } = useRouteStore();
  const { location, isLoading: isLoadingLocation, isLoadingForMapFocus, getCurrentLocation, getLocationForMapFocus } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);
  const decodedPolyline = route?.polyline ? decode(route.polyline, 5) : null;

  useEffect(() => {
    console.log("MapScreen mounted");
    getCurrentLocation();
  }, []);

  const centerOnUserLocation = async () => {
    if (!mapRef.current) return;

      const position = await getLocationForMapFocus();

      if (!position) {
        return;
      }
      
      mapRef.current.animateToRegion({
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
  };

  if (isLoadingRoute || isLoadingLocation || !location) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar translucent backgroundColor="transparent" />
        <ActivityIndicator size={48} color="#764D9D" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>     
        <StatusBar translucent backgroundColor="transparent" />
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          showsCompass={false}
          toolbarEnabled={false}
          showsUserLocation={true}
          showsMyLocationButton={false}
          loadingEnabled={true}
          loadingIndicatorColor="#764D9D"
          loadingBackgroundColor="#FCFCFC"
        >
          {decodedPolyline && decodedPolyline.length > 0 && (
            <Polyline
              coordinates={decodedPolyline.map(([latitude, longitude]) => ({
                latitude,
                longitude,
              }))}
              strokeColor="#FDD6DF"
              strokeWidth={4}
            />
          )}

          {pois.map((poi, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: poi.locationRegion.latitude,
                longitude: poi.locationRegion.longitude,
              }}
              title={poi.name}
              pinColor={poi.visited ? "#8B68B1" : "#E3D7F7"}
              onPress={() => {
                if(poi.visited && poi.content) {
                  router.push({
                    pathname: '/profile',
                    params: {
                      poiId: poi.id,
                    },
                  });
                }
              }}
            />
          ))}
        </MapView>
        
        <TouchableOpacity 
          style={styles.myLocationButton} 
          onPress={centerOnUserLocation}
        >
          {isLoadingForMapFocus ? (
            <ActivityIndicator size="small" color="#764D9D" />
          ) : (
            <MaterialIcons name="my-location" size={28} color="#764D9D" />
          )}
        </TouchableOpacity>
      </SafeAreaView>
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
  myLocationButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});