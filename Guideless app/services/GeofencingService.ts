import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeofencingEventType, LocationRegion } from 'expo-location';
import { Coordinates, POI, useRouteStore } from '@/stores/RouteStore';
import { NotificationService } from '@/services/NotificationService';

const GEOFENCING_TASK_NAME = 'background-geofencing-task';

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    return;
  }
  if(eventType === GeofencingEventType.Exit) {
    return;
  }
  if (eventType === GeofencingEventType.Enter) {
    console.log("Entered region: ", region);
    await handleEnter(region);
  }
});

async function handleEnter(region: LocationRegion): Promise<void> {
    console.log("Entered:", region.identifier);
    if(!region.identifier) {
      return;
    }
    if(region.identifier === 'end_location') {
      // TODO: Finish route
      return;
    }
    const poi = await useRouteStore.getState().actions.visitPOI(region.identifier);
    if(!poi) {
      return;
    }
    console.log("Sending POI to the notification service");
    await NotificationService.sendPoiNotification(poi);
}

export async function cleanupBackgroundTasks(): Promise<void> {
  console.log("Cleaning up background tasks...");
  const geofencingStatus = await getGeofencingStatus();
  console.log("Geofencing status: ", geofencingStatus);
  if (geofencingStatus.isActive) {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
    console.log("Geofencing stopped");
  }

  if (geofencingStatus.isTaskRegistered) {
    await TaskManager.unregisterTaskAsync(GEOFENCING_TASK_NAME);
    console.log("Task unregistered");
  }

  if (geofencingStatus.isLocationActive) {
    await Location.stopLocationUpdatesAsync(GEOFENCING_TASK_NAME);
    console.log("Location updates stopped");
  }
  console.log("Background tasks cleaned up");
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
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    return await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
  } catch (error) {
    return false;
  }
}

export async function updateGeofencingRegions(pois: POI[]): Promise<void> {
    await cleanupBackgroundTasks();

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