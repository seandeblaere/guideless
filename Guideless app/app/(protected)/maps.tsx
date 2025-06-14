import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { decode } from '@googlemaps/polyline-codec';
import { usePois, useRoute, POI } from '@/stores/RouteStore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRouteActions, useIsTracking, useIsLoadingTracking, useIsGeneratingRoute, useIsClearingRoute } from '@/stores/RouteStore';
import { POIContentModal } from '@/components/POIContentModal';
import { getMarkerIcon } from '@/helpers/getMarkerIcon';

export default function MapScreen() {
  const route = useRoute();
  const pois = usePois();
  const isGeneratingRoute = useIsGeneratingRoute();
  const { location, isLoading: isLoadingLocation, isLoadingForMapFocus, getCurrentLocation, getLocationForMapFocus } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);
  const { startRouteTracking, stopRouteTracking, clearRoute } = useRouteActions();
  const isTracking = useIsTracking();
  const isRouteTrackingLoading = useIsLoadingTracking();
  const isClearingRoute = useIsClearingRoute();
  
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [showPOIContent, setShowPOIContent] = useState(false);
  const { poiId } = useLocalSearchParams();

  const decodedPolyline = route?.polyline ? decode(route.polyline, 5) : null;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (poiId && pois) {
      const poi = pois.find(p => p.id === poiId);
      if (poi?.visited && poi.content) {
        setSelectedPOI(poi);
        setShowPOIContent(true);
      }
    }
  }, [poiId, pois]);

  const handleStartRoute = async () => {
    if(!route || isTracking) {
      return;
    }
    await startRouteTracking();
    Alert.alert(
      "Tracking started",
      "We are now tracking your journey."
    );
  }

  const handleStopRoute = async () => {
    if(!route || !isTracking) {
      return;
    }
    await stopRouteTracking();
    Alert.alert(
      "Tracking stopped",
      "We have stopped tracking your journey. You can start tracking again by pressing the play button."
    );
  }

  const handleFinishRoute = async () => {
    if(!route) {
      return;
    }
    if(isTracking) {
      Alert.alert(
        "Warning",
        "We are currently tracking your journey. Please stop tracking before finishing it.",
        [{ text: "OK" }],
        { cancelable: true }
      );
      return;
    }
    Alert.alert(
      "Finish journey",
      "Are you sure you want to finish this journey?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", onPress: async () => {
          await clearRoute(); 
          router.replace("/");
        }},
      ],
      { cancelable: false }
    );
  }

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

  const centerOnPOI = async (poi: POI) => {
    if (!mapRef.current) return;
    if(!poi.locationRegion) return;
    const region = {
      latitude: poi.locationRegion.latitude,
      longitude: poi.locationRegion.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    mapRef.current.animateToRegion(region, 1000);
  }

  if (isGeneratingRoute || isLoadingLocation || !location || isClearingRoute) {
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
          {decodedPolyline && isTracking && decodedPolyline.length > 0 && (
            <Polyline
              coordinates={decodedPolyline.map(([latitude, longitude]) => ({
                latitude,
                longitude,
              }))}
              strokeColor="#FDD6DF"
              strokeWidth={4}
            />
          )}

          {isTracking && pois.map((poi, index) => (
            <Marker
              key={`poi_${poi.id || index}`}
              coordinate={{
                latitude: poi.locationRegion.latitude,
                longitude: poi.locationRegion.longitude,
              }}
              title={poi.name}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => {
                if(poi.visited && poi.content) {
                  centerOnPOI(poi);
                  setSelectedPOI(poi);
                  setShowPOIContent(true);
                }
              }}
            >
              <View style={styles.markerContainer}>
                <Image 
                  source={getMarkerIcon(poi.visited, poi.types)}
                  style={styles.markerImage}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          ))}
        </MapView>
        
        <View style={styles.mapButtonsContainer}>
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={centerOnUserLocation}
            disabled={isLoadingForMapFocus}
          >
            <View style={styles.buttonContent}>
              {isLoadingForMapFocus ? (
                <ActivityIndicator size="small" color="#764D9D" />
              ) : (
                <MaterialIcons name="my-location" size={28} color="#764D9D" />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mapButton, !route ? styles.disabledButton : {}]} 
            onPress={isTracking ? handleStopRoute : handleStartRoute}
            disabled={isRouteTrackingLoading || !route}
          >
            <View style={styles.buttonContent}>
              {isRouteTrackingLoading ? (
                <ActivityIndicator size="small" color="#764D9D" />
              ) : (
                isTracking ? (
                  <MaterialIcons name="pause" size={28} color="#764D9D" />
                ) : (
                  <MaterialIcons name="play-arrow" size={28} color="#764D9D" />
                )
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mapButton, isTracking || !route ? styles.disabledButton : {}]} 
            onPress={handleFinishRoute}
            disabled={isTracking || !route || isRouteTrackingLoading}
          >
            <View style={styles.buttonContent}>
              {isClearingRoute ? (
                <ActivityIndicator size="small" color="#764D9D" />
              ) : (
                <MaterialIcons name="check" size={28} color="#764D9D" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <POIContentModal 
          poi={selectedPOI}
          visible={showPOIContent}
          onClose={() => {
            setShowPOIContent(false);
            setSelectedPOI(null);
          }}
        />
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
  mapButtonsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 10,
    gap: 10,
  },
  mapButton: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  markerContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: 20,
    height: 20,
  },
});