import { create } from 'zustand';
import { startGeofencingForRoute, cleanupBackgroundTasks } from '@/services/GeofencingService';
import * as Location from 'expo-location';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/firebaseConfig';
import { getRouteStateFromRoute, getPOIStateFromPOIData, getRouteRequestFromFormData } from '@/helpers/convertRouteData';
import { RouteGeneratorFormData } from '@/stores/RouteGeneratorStore';
import { NotificationService } from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getActiveRoute = httpsCallable(functions, 'getActiveRoute');
const generateRoute = httpsCallable(functions, 'generateRoute');
const visitPOI = httpsCallable(functions, 'visitPOI');
const finishRoute = httpsCallable(functions, 'finishRoute');

const getRouteKey = () => {
  const userId = auth.currentUser?.uid;
  return userId ? `guideless_route_${userId}` : null;
};

const getRoutePoIsKey = () => {
  const userId = auth.currentUser?.uid;
  return userId ? `guideless_route_pois_${userId}` : null;
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum ContentType {
  STORY = "story",
  FOOD_TIP = "food_tip",
  NATURE_INFO = "nature_info",
  FUN_FACT = "fun_fact",
  HISTORICAL_CONTEXT = "historical_context",
  DESCRIPTION = "description"
}

export enum RouteType {
  ROUND_TRIP = "round_trip",
  DESTINATION = "destination",
  ANYWHERE = "anywhere"
}

export interface POIContentStructured {
  [ContentType.STORY]?: string;
  [ContentType.FOOD_TIP]?: string;
  [ContentType.NATURE_INFO]?: string;
  [ContentType.FUN_FACT]?: string;
  [ContentType.HISTORICAL_CONTEXT]?: string;
  [ContentType.DESCRIPTION]?: string;
}

export interface POIContent {
  contentTypes: ContentType[];
  content: POIContentStructured;
}

export interface RouteProgress {
  visitedPOIs: number;
  totalPOIs: number;
  completionPercentage: number;
  routeCompleted: boolean;
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

  routeProgress?: RouteProgress;
}

interface RouteState {
  roundTripTriggerFlag: boolean;
  hasActiveRoute: boolean;
  isInitialized: boolean;
  isTracking: boolean;
  route: Route | null;
  pois: POI[];
  isGeofencingActive: boolean;
  isGeneratingRoute: boolean;
  isVisitingPOI: boolean;
  isClearingRoute: boolean;
  isLoadingTracking: boolean;
  actions: {
    setIsGeneratingRoute: (isGeneratingRoute: boolean) => void;
    setRoute: (route: Route) => void;
    setPois: (pois: POI[]) => void;
    setIsGeofencingActive: (isGeofencingActive: boolean) => void;
    startRouteTracking: () => Promise<void>;
    stopRouteTracking: () => Promise<void>;
    initializeRouteStore: () => Promise<void>;
    generateRoute: (formData: RouteGeneratorFormData, currentLocation: Coordinates) => Promise<void>;
    visitPOI: (regionIdentifier: string) => Promise<{poi: POI, routeProgress: RouteProgress} | null>;
    setIsInitialized: (isInitialized: boolean) => void; 
    clearRoute: () => Promise<void>;
    onAuthStateChanged: () => Promise<void>;
  };
}

export const useRouteStore = create<RouteState>((set, get) => ({
  roundTripTriggerFlag: false,
  hasActiveRoute: false,
  isInitialized: false,
  isTracking: false,
  route: null,
  pois: [],
  isGeofencingActive: false,
  isGeneratingRoute: false,
  isVisitingPOI: false,
  isClearingRoute: false,
  isLoadingTracking: false,
  actions: {
    setIsGeneratingRoute: (isGeneratingRoute: boolean) => {
      set({ isGeneratingRoute });
    },
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
      set({ isVisitingPOI: true });
      const { route } = get();
      const { pois } = get();
      if (!route || !pois || pois.length === 0) {
        return null;
      }
      try {
      const poi = pois.find((p) => p.id === regionIdentifier);
      if(!poi) {
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
      const routeProgress = poiData.routeProgress as RouteProgress;
      const poiState = getPOIStateFromPOIData(poiData.poi);
      const newRouteState = getRouteStateFromRoute(route, routeProgress);
      const newPois = pois.map((p) => p.id === regionIdentifier ? poiState : p);
      const routeKey = getRouteKey();
      const poisKey = getRoutePoIsKey();
      if (routeKey && poisKey) {
        await AsyncStorage.setItem(poisKey, JSON.stringify(newPois));
        await AsyncStorage.setItem(routeKey, JSON.stringify(newRouteState));
      }
      set({ pois: newPois, route: newRouteState, roundTripTriggerFlag: true });
      set({ isVisitingPOI: false });
      return {poi: poiState, routeProgress: poiData.routeProgress as RouteProgress};
      } catch (error) {
        set({ isVisitingPOI: false });
        return null;
      }
    },
    generateRoute: async (formData: RouteGeneratorFormData, currentLocation: Coordinates) => {
      set({ isGeneratingRoute: true });
      const routeRequest = getRouteRequestFromFormData(formData, currentLocation); 
      try {
        const result = await generateRoute(routeRequest);
      if (!result) {
        set({ isGeneratingRoute: false });
        console.log("No result from generateRoute");
        return;
      }
      console.log("Result from generateRoute: ", result);
      const routeData = result.data as any;
      console.log("Route data from generateRoute: ", routeData);
      if (!routeData) {
        set({ isGeneratingRoute: false });
        console.log("No route data from generateRoute");
        return;
      }
      if (routeData.success === false || !routeData.route || !routeData.pois) {
        set({ isGeneratingRoute: false });
        console.log("Route data is not valid");
        return;
      }
      const routeState = getRouteStateFromRoute(routeData.route as Route);
      const pois = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));
      set({ route: routeState, pois: pois, hasActiveRoute: true });
      await clearStorage();
      const routeKey = getRouteKey();
      const poisKey = getRoutePoIsKey();
      if (routeKey && poisKey) {
        await AsyncStorage.setItem(routeKey, JSON.stringify(routeState));
        await AsyncStorage.setItem(poisKey, JSON.stringify(pois));
      }
      set({ isGeneratingRoute: false });
      } catch (error) {
        set({ isGeneratingRoute: false });
        console.log("Failed to generate route");
        return;
      }
    },

    startRouteTracking: async (): Promise<void> => {
      set({ isLoadingTracking: true });
      const { pois } = get();
      const { route } = get();
      const { isTracking } = get();
      const { isGeofencingActive } = get();

      if(!route) {
        set({ isLoadingTracking: false });
        console.log("No route to start tracking");
        return;
      }

      if (!pois || pois.length === 0) {
        set({ isLoadingTracking: false });
        console.log("No pois to start tracking");
        return;
      }

      if(isTracking && isGeofencingActive) {
        set({ isLoadingTracking: false });
        console.log("Already tracking");
        return;
      }
      const success = await startGeofencingForRoute(pois, route?.endLocation?.coordinates ?? null);
      if (!success) {
        set({ isLoadingTracking: false });
        console.log("Failed to start geofencing");
        return;
      }
      set({ 
        isGeofencingActive: true,
        isTracking: true
      });
      set({ isLoadingTracking: false });
  },

    stopRouteTracking: async (): Promise<void> => {
      set({ isLoadingTracking: true });
      await cleanupBackgroundTasks();
      set({ isTracking: false, isGeofencingActive: false });
      set({ isLoadingTracking: false });
    },

  initializeRouteStore: async () => {
    set({ isInitialized: false });

    
    const routeKey = getRouteKey();
    const poisKey = getRoutePoIsKey();
    
    if (routeKey && poisKey) {
      const storedRoute = await AsyncStorage.getItem(routeKey);
      const storedPois = await AsyncStorage.getItem(poisKey);

      if(storedRoute && storedPois) {
        const pois = JSON.parse(storedPois) as POI[];
        const roundTripTriggerFlag = pois.filter((poi) => poi.visited === true).length > 0;
        set({ route: JSON.parse(storedRoute) as Route, pois: pois, hasActiveRoute: true, isInitialized: true, roundTripTriggerFlag: roundTripTriggerFlag });
        return;
      }
    }

   try {
    const result = await getActiveRoute();

    if (!result) {
      throw new Error("No result from getActiveRoute");
    }

    const routeData = result.data as any;

    if (!routeData.success) {
      set({ isInitialized: true });
      return;
    }

    if(!routeData.route || !routeData.pois) {
      set({ isInitialized: true });
      return;
    }

    const routeState = getRouteStateFromRoute(routeData.route as Route);
    const pois: POI[] = routeData.pois.map((poi: any) => getPOIStateFromPOIData(poi));

    const roundTripTriggerFlag = pois.filter((poi: POI) => poi.visited === true).length > 0;

    await clearStorage();
    const routeKey = getRouteKey();
    const poisKey = getRoutePoIsKey();
    
    if (routeKey && poisKey) {
      await AsyncStorage.setItem(routeKey, JSON.stringify(routeState));
      await AsyncStorage.setItem(poisKey, JSON.stringify(pois));
    }
    set({ route: routeState, pois: pois, hasActiveRoute: true, isInitialized: true, roundTripTriggerFlag: roundTripTriggerFlag });
  }
    catch (error) {
      set({ isInitialized: true });
      return;
     }
  },
  onAuthStateChanged: async () => {
    await cleanupBackgroundTasks();
    set({ route: null, pois: [], hasActiveRoute: false, isTracking: false, isGeofencingActive: false});
  },
  clearRoute: async () => { 
    set({ isClearingRoute: true });
    const { route } = get();
    if (!route) {
      set({ isClearingRoute: false });
      return;
    }
    try {
    await finishRoute({routeId: route.id});
    } catch (error) {
    }
    set({ route: null, pois: [], hasActiveRoute: false, isTracking: false, isGeofencingActive: false});
    await clearStorage();
    set({ isClearingRoute: false });
  },
  },
}));

const clearStorage = async (): Promise<void> => {
  const routeKey = getRouteKey();
  const poisKey = getRoutePoIsKey();
  
  if (routeKey && poisKey) {
    await AsyncStorage.removeItem(routeKey);
    await AsyncStorage.removeItem(poisKey);
  }
  await NotificationService.resetNotifications();
}

export const useRoute = () => useRouteStore((state) => state.route);
export const usePois = () => useRouteStore((state) => state.pois);
export const useIsGeofencingActive = () => useRouteStore((state) => state.isGeofencingActive);
export const useIsInitialized = () => useRouteStore((state) => state.isInitialized);
export const useIsGeneratingRoute = () => useRouteStore((state) => state.isGeneratingRoute);
export const useIsVisitingPOI = () => useRouteStore((state) => state.isVisitingPOI);
export const useIsClearingRoute = () => useRouteStore((state) => state.isClearingRoute);
export const useIsLoadingTracking = () => useRouteStore((state) => state.isLoadingTracking);
export const useHasActiveRoute = () => useRouteStore((state) => state.hasActiveRoute);
export const useRouteActions = () => useRouteStore((state) => state.actions);
export const useIsTracking = () => useRouteStore((state) => state.isTracking);