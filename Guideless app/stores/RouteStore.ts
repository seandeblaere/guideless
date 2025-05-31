import { create } from 'zustand';
import { startGeofencingForRoute } from '@/services/GeofencingService';
import { useLocationPermissions } from '@/hooks/useLocationPermissions';

interface RouteState {
  route: any | null;
  isGeofencingActive: boolean;
  startRouteTracking: (routeData: any) => Promise<boolean>;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  route: null,
  isGeofencingActive: false,

  startRouteTracking: async (routeData: any) => {
    try {
      const success = await startGeofencingForRoute(routeData.pointsOfInterest);
      
      if (success) {
        set({ 
          route: routeData, 
          isGeofencingActive: true 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start route tracking:', error);
      return false;
    }
  },
}));