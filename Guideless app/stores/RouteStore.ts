import { create } from 'zustand';
import { startGeofencingForRoute } from '@/services/GeofencingService';
import * as Location from 'expo-location';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebaseConfig';
import { getRouteStateFromRoute, getPOIStateFromPOIData, getRouteRequestFromFormData } from '@/helpers/convertRouteData';
import { RouteGeneratorFormData } from '@/stores/RouteGeneratorStore';
import { NotificationService } from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getActiveRoute = httpsCallable(functions, 'getActiveRoute');
const generateRoute = httpsCallable(functions, 'generateRoute');
const visitPOI = httpsCallable(functions, 'visitPOI');
const finishRoute = httpsCallable(functions, 'finishRoute');

const ROUTE_KEY = 'guideless_route';
const ROUTE_POIS_KEY = 'guideless_route_pois';

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
    visitPOI: (regionIdentifier: string) => Promise<POI | null>;
    setIsInitialized: (isInitialized: boolean) => void; 
    clearRoute: () => Promise<void>;
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
    visitPOI: async (regionIdentifier: string) => {
      console.log("Visiting POI with region identifier: ", regionIdentifier);
      set({ isLoading: true });
      const { route } = get();
      const { pois } = get();
      if (!route || !pois || pois.length === 0) {
        return null;
      }
      const result = await visitPOI({routeId: route.id, poiId: regionIdentifier});
      if (!result) {
        return null;
      }
      const poiData = result.data as any;
      if(!poiData.success) {
        return null;
      }
      console.log("New POI data retrieved successfully");
      const poiState = getPOIStateFromPOIData(poiData.poi);
      const newPois = pois.map((p) => p.id === regionIdentifier ? poiState : p);
      console.log("New POIs: ", newPois);
      await AsyncStorage.setItem(ROUTE_POIS_KEY, JSON.stringify(newPois));
      set({ pois: newPois });
      set({ isLoading: false });
      return poiState;
    },
    generateRoute: async (formData: RouteGeneratorFormData, currentLocation: Coordinates) => {
      set({ isLoading: true });
      const routeRequest = getRouteRequestFromFormData(formData, currentLocation); 
      const result = await generateRoute(routeRequest);
      if (!result) {
        set({ isLoading: false });
        return;
      }
      const routeData = result.data as any;
      if (!routeData) {
        set({ isLoading: false });
        return;
      }
      const routeState = getRouteStateFromRoute(routeData.route as Route);
      const pois = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));
      set({ route: routeState, pois: pois, hasActiveRoute: true });
      await clearStorage();
      await AsyncStorage.setItem(ROUTE_KEY, JSON.stringify(routeState));
      await AsyncStorage.setItem(ROUTE_POIS_KEY, JSON.stringify(pois));
      set({ isLoading: false });
    },

    startRouteTracking: async (): Promise<void> => {
      set({ isLoading: true });
      const { pois } = get();
      const { route } = get();
      if(!route) {
        set({ isLoading: false });
        return;
      }

      if (!pois || pois.length === 0) {
        set({ isLoading: false });
        return;
      }

      const success = await startGeofencingForRoute(pois, route?.endLocation?.coordinates ?? null);
      
      if (!success) {
        return;
      }

      set({ 
        isGeofencingActive: true,
        isTracking: true
      });
      set({ isLoading: false });
  },

  initializeRouteStore: async () => {
    set({ isInitialized: false });

    console.log("Initializing route store");
    console.log("Checking for stored route");
    const storedRoute = await AsyncStorage.getItem(ROUTE_KEY);
    const storedPois = await AsyncStorage.getItem(ROUTE_POIS_KEY);

    if(storedRoute && storedPois) {
      console.log("Found stored route and pois");
      console.log("Setting stored route and pois");
      set({ route: JSON.parse(storedRoute) as Route, pois: JSON.parse(storedPois) as POI[], hasActiveRoute: true, isInitialized: true });
      return;
    }

    console.log("No stored route and pois found");
    console.log("Getting active route from server");

    const result = await getActiveRoute();
    
    const routeData = result.data as any;

    if (!routeData.success) {
      console.log("Failed to get active route from server");
      set({ isInitialized: true });
      return;
    }

    if(!routeData.route || !routeData.pois) {
      set({ isInitialized: true });
      return;
    }

    const routeState = getRouteStateFromRoute(routeData.route as Route);
    const pois = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));

    console.log("Route retrieved from server");

    await AsyncStorage.setItem(ROUTE_KEY, JSON.stringify(routeState));
    await AsyncStorage.setItem(ROUTE_POIS_KEY, JSON.stringify(pois));
    set({ route: routeState, pois: pois, hasActiveRoute: true, isInitialized: true });
  },
  clearRoute: async () => {
    console.log("Clearing route");
    await clearStorage();
    set({ isLoading: true });
    const { route } = get();
    if (!route) {
      console.log("No route to clear");
      set({ isLoading: false });
      return;
    }
    try {
    const result = await finishRoute({routeId: route.id});
    console.log("result: ", result);
    } catch (error) {
      console.log("Failed to finish route in server: ", error);
    }
    set({ route: null, pois: [], hasActiveRoute: false, isTracking: false, isGeofencingActive: false});
    await clearStorage();
    set({ isLoading: false });
  },
  },
}));

const clearStorage = async (): Promise<void> => {
  console.log("Clearing storage");
  await AsyncStorage.removeItem(ROUTE_KEY);
  await AsyncStorage.removeItem(ROUTE_POIS_KEY);
  await NotificationService.resetNotifications();
}

export const useRoute = () => useRouteStore((state) => state.route);
export const usePois = () => useRouteStore((state) => state.pois);
export const useIsGeofencingActive = () => useRouteStore((state) => state.isGeofencingActive);
export const useIsInitialized = () => useRouteStore((state) => state.isInitialized);
export const useIsLoading = () => useRouteStore((state) => state.isLoading);
export const useHasActiveRoute = () => useRouteStore((state) => state.hasActiveRoute);
export const useRouteActions = () => useRouteStore((state) => state.actions);
export const useIsTracking = () => useRouteStore((state) => state.isTracking);