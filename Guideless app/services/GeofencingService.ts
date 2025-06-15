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
    return;
  }
  if (eventType === GeofencingEventType.Enter) {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_COOLDOWN) {
      return;
    }
    lastTriggerTime = now;
    await handleEnter(region);
  }
});

export async function handleEnter(region: LocationRegion): Promise<void> {
    const route = useRouteStore.getState().route;
    const roundTripTriggerFlag = useRouteStore.getState().roundTripTriggerFlag;
    if(!route) {
      return;
    }
    if(!region.identifier) {
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
      await NotificationService.sendNoContentNotification();
      return;
    }
    const {poi, routeProgress} = result;
    if(!poi) {
      await NotificationService.sendNoContentNotification();
      return;
    }
    await NotificationService.sendPoiNotification(poi);
    if(routeProgress && routeProgress.routeCompleted && route.routeType === RouteType.ANYWHERE) {
      await NotificationService.sendRouteCompletedNotification(true);
      await cleanupBackgroundTasks();
      await useRouteStore.getState().actions.clearRoute();
    }
}

export async function cleanupBackgroundTasks(): Promise<void> {
  const geofencingStatus = await getGeofencingStatus();
  try {
  if (geofencingStatus.isActive) {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
  }

  if (geofencingStatus.isLocationActive) {
    await Location.stopLocationUpdatesAsync(GEOFENCING_TASK_NAME);
  }
  } catch (error) {
  }
}

export async function startGeofencingForRoute(pois: POI[], endLocation: Coordinates | null): Promise<boolean> { 
  try {
    await cleanupBackgroundTasks();

    const foregroundResult = await Location.requestForegroundPermissionsAsync();
    if (!foregroundResult.granted) {
      return false;
    }

    const backgroundResult = await Location.requestBackgroundPermissionsAsync();
    if (!backgroundResult.granted) {
      return false;
    }

    const regions: LocationRegion[] = pois.map((poi) => poi.locationRegion);
    if(endLocation) {
      console.log("Adding end location to geofencing regions");
      console.log("End location: ", endLocation);
      console.log("latitude: ", endLocation.latitude);
      console.log("longitude: ", endLocation.longitude);
      regions.push({
        identifier: 'end_location',
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        radius: 50,
      });
    }

    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    return await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
  } catch (error) {
    console.log("Failed to start geofencing: ", error);
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