import { create } from 'zustand';
import { startGeofencingForRoute } from '@/services/GeofencingService';
import * as Location from 'expo-location';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebaseConfig';
import { getRouteStateFromRoute, getPOIStateFromPOIData, getRouteRequestFromFormData } from '@/helpers/convertRouteData';
import { RouteGeneratorFormData } from '@/stores/RouteGeneratorStore';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const getActiveRoute = httpsCallable(functions, 'getActiveRoute');
const generateRoute = httpsCallable(functions, 'generateRoute');
const visitPOI = httpsCallable(functions, 'visitPOI');

export interface Coordinates {
  latitude: number;
  longitude: number;
}

enum ContentType {
  STORY = "story",
  FOOD_TIP = "food_tip",
  NATURE_INFO = "nature_info",
  FUN_FACT = "fun_fact",
  HISTORICAL_CONTEXT = "historical_context",
  DESCRIPTION = "description"
}

enum RouteType {
  ROUND_TRIP = "round_trip",
  DESTINATION = "destination",
  ANYWHERE = "anywhere"
}

interface POIContent {
  contentTypes: ContentType[];
  content: string | null;
}

export interface POI {
  id: string;
  name: string;
  placeId: string;
  types: string[];
  routeIndex: number;
  isStartPoint: boolean;
  isEndPoint: boolean;
  visited: boolean;
  locationRegion: Location.LocationRegion;
  content: POIContent | null;
  contentReady: boolean;
  skipped: boolean;
}

export interface Route {
  id: string;
  routeType: RouteType;

  startLocation: {coordinates: Coordinates; placeId?: string};
  endLocation: {coordinates: Coordinates; placeId?: string} | null;

  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  optimizedIntermediateWaypointIndex: number[];

  totalPOIs: number;
  visitedPOIs: number;
  manuallyCompleted: boolean;
  destinationReached: boolean;
}

interface RouteState {
  hasActiveRoute: boolean;
  isInitialized: boolean;
  isTracking: boolean;
  route: Route | null;
  pois: POI[];
  isGeofencingActive: boolean;
  isLoading: boolean;
  actions: {
    setRoute: (route: Route) => void;
    setPois: (pois: POI[]) => void;
    setIsGeofencingActive: (isGeofencingActive: boolean) => void;
    startRouteTracking: () => Promise<void>;
    initializeRouteStore: () => Promise<void>;
    generateRoute: (formData: RouteGeneratorFormData, currentLocation: Coordinates) => Promise<void>;
    setIsInitialized: (isInitialized: boolean) => void; 
  };
}

export const useRouteStore = create<RouteState>((set, get) => ({
  hasActiveRoute: false,
  isInitialized: false,
  isTracking: false,
  route: null,
  pois: [],
  isGeofencingActive: false,
  isLoading: false,
  actions: {
    setHasActiveRoute: (hasActiveRoute: boolean) => {
      set({ hasActiveRoute });
    },
    setIsTracking: (isTracking: boolean) => {
      set({ isTracking });
    },
    setIsInitialized: (isInitialized: boolean) => {
      set({ isInitialized });
    },
    setRoute: (route: Route) => {
      set({ route });
    },
    setPois: (pois: POI[]) => {
      set({ pois });
    },
    setIsGeofencingActive: (isGeofencingActive: boolean) => {
      set({ isGeofencingActive });
    },

    generateRoute: async (formData: RouteGeneratorFormData, currentLocation: Coordinates) => {
      set({ isLoading: true });
      const routeRequest = getRouteRequestFromFormData(formData, currentLocation); 
      const result = await generateRoute(routeRequest);
      if (!result) {
        Alert.alert('Error', 'Failed to generate route. Please try again.');
        set({ isLoading: false });
        return;
      }
      const routeData = result.data as any;
      if (!routeData) {
        Alert.alert('Error generating route:', 'Failed to generate route. Please try again.');
        set({ isLoading: false });
        return;
      }
      const routeState = getRouteStateFromRoute(routeData.route as Route);
      const pois = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));
      set({ route: routeState, pois: pois, hasActiveRoute: true });
      set({ isLoading: false });
    },

    startRouteTracking: async (): Promise<void> => {
      set({ isLoading: true });
      const { pois } = get();

      if (pois.length === 0) {
        set({ isLoading: false });
        return;
      }

      const success = await startGeofencingForRoute(pois);
      
      if (!success) {
        console.log("Failed to start geofencing");
        return;
      }

      set({ 
        isGeofencingActive: true,
        isTracking: true
      });
      set({ isLoading: false });
  },

  initializeRouteStore: async () => {
    set({ isInitialized: true });
    return;
    const result = await getActiveRoute();
    
    const routeData = result.data as any;

    if (!routeData.success) {
      set({ isInitialized: true });
      return;
    }

    const routeState = getRouteStateFromRoute(routeData.route as Route);
    const pois = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));

    set({ route: routeState, pois: pois, hasActiveRoute: true, isInitialized: true });
  }
  },
}));

export const useRoute = () => useRouteStore((state) => state.route);
export const usePois = () => useRouteStore((state) => state.pois);
export const useIsGeofencingActive = () => useRouteStore((state) => state.isGeofencingActive);
export const useIsInitialized = () => useRouteStore((state) => state.isInitialized);
export const useIsLoading = () => useRouteStore((state) => state.isLoading);
export const useRouteActions = () => useRouteStore((state) => state.actions);
export const useIsTracking = () => useRouteStore((state) => state.isTracking);