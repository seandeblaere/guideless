import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeofencingEventType, LocationRegion } from 'expo-location';
import { Coordinates, POI, RouteType, useRouteStore } from '@/stores/RouteStore';
import { NotificationService } from '@/services/NotificationService';

const GEOFENCING_TASK_NAME = 'background-geofencing-task';

let lastTriggerTime = 0;
const TRIGGER_COOLDOWN = 5000;

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    return;
  }
  if(eventType === GeofencingEventType.Exit) {
    console.log("Exited region: ", region);
    return;
  }
  if (eventType === GeofencingEventType.Enter) {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_COOLDOWN) {
      return;
    }
    lastTriggerTime = now;
    console.log("Entered region: ", region);
    await handleEnter(region);
  }
});

export async function handleEnter(region: LocationRegion): Promise<void> {
    console.log("Entered:", region.identifier);
    const route = useRouteStore.getState().route;
    const roundTripTriggerFlag = useRouteStore.getState().roundTripTriggerFlag;
    if(!route) {
      console.log("No route found");
      return;
    }
    if(!region.identifier) {
      console.log("No region identifier found");
      return;
    }
    if(region.identifier === 'end_location' && route.routeType === RouteType.DESTINATION) {
      if(!route.routeProgress?.routeCompleted) {
        await NotificationService.sendEndLocationNotification();
        return;
      }
      await NotificationService.sendRouteCompletedNotification(false);
      await cleanupBackgroundTasks();
      await useRouteStore.getState().actions.clearRoute();
      return;
    }
    if (region.identifier === 'end_location' && route.routeType === RouteType.ROUND_TRIP) {
      if (!roundTripTriggerFlag) {
          return;
      }
      if(!route.routeProgress?.routeCompleted) {
        await NotificationService.sendEndLocationNotification();
        return;
      }
      await NotificationService.sendRouteCompletedNotification(false);
      await cleanupBackgroundTasks();
      await useRouteStore.getState().actions.clearRoute();
      return;
    }
    const result = await useRouteStore.getState().actions.visitPOI(region.identifier);
    if(!result) {
      console.log("No result from visitPOI");
      await NotificationService.sendNoContentNotification();
      return;
    }
    const {poi, routeProgress} = result;
    if(!poi) {
      console.log("No POI found");
      await NotificationService.sendNoContentNotification();
      return;
    }
    await NotificationService.sendPoiNotification(poi);
    if(routeProgress && routeProgress.routeCompleted && route.routeType === RouteType.ANYWHERE) {
      console.log("Route completed");
      await NotificationService.sendRouteCompletedNotification(true);
      await cleanupBackgroundTasks();
      await useRouteStore.getState().actions.clearRoute();
    }
}

export async function cleanupBackgroundTasks(): Promise<void> {
  console.log("Cleaning up background tasks...");
  const geofencingStatus = await getGeofencingStatus();
  console.log("Geofencing status: ", geofencingStatus);
  try {
  if (geofencingStatus.isActive) {
    console.log("geofencing was active, stopping it...");
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
    console.log("Geofencing stopped");
  }

  if (geofencingStatus.isLocationActive) {
    console.log("location updates were active, stopping them...");
    await Location.stopLocationUpdatesAsync(GEOFENCING_TASK_NAME);
    console.log("Location updates stopped");
  }
  console.log("Background tasks cleaned up");
  } catch (error) {
    console.log("Error cleaning up background tasks: ", error);
  }
}

export async function startGeofencingForRoute(pois: POI[], endLocation: Coordinates | null): Promise<boolean> {
  console.log("Starting geofencing for route...");
  try {
    await cleanupBackgroundTasks();

    const foregroundResult = await Location.requestForegroundPermissionsAsync();
    if (!foregroundResult.granted) {
      console.log("Foreground permissions not granted");
      return false;
    }

    const backgroundResult = await Location.requestBackgroundPermissionsAsync();
    if (!backgroundResult.granted) {
      console.log("Background permissions not granted");
      return false;
    }

    console.log("Foreground and background permissions granted");

    const regions: LocationRegion[] = pois.map((poi) => poi.locationRegion);
    if(endLocation) {
      regions.push({
        identifier: 'end_location',
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        radius: 50,
      });
    }

    console.log("Starting geofencing with regions: ", regions);
    console.log("Regions length: ", regions.length, " pois length: ", pois.length);
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    return await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
  } catch (error) {
    return false;
  }
}

export async function updateGeofencingRegions(pois: POI[]): Promise<void> {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);

    const regions: LocationRegion[] = pois.map((poi) => poi.locationRegion);

    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
}

export async function getGeofencingStatus(): Promise<{
  isActive: boolean;
  isTaskRegistered: boolean;
  isLocationActive: boolean;
}> {
    const isActive = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK_NAME);
    const isLocationActive = await Location.hasStartedLocationUpdatesAsync(GEOFENCING_TASK_NAME);

    return { isActive, isTaskRegistered, isLocationActive };
}