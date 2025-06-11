import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeofencingEventType, LocationRegion } from 'expo-location';
import { Alert } from 'react-native';
import { POI } from '@/stores/RouteStore';

const GEOFENCING_TASK_NAME = 'background-geofencing-task';

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    return;
  }
  if (eventType === GeofencingEventType.Enter) {
    Alert.alert("Entered:", region.identifier);
  } else if (eventType === GeofencingEventType.Exit) {
    Alert.alert("Exited:", region.identifier);
  }
});

export async function cleanupBackgroundTasks(): Promise<void> {
  const geofencingStatus = await getGeofencingStatus();

  if (geofencingStatus.isActive) {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
  }

  if (geofencingStatus.isTaskRegistered) {
    await TaskManager.unregisterTaskAsync(GEOFENCING_TASK_NAME);
  }

  if (geofencingStatus.isLocationActive) {
    await Location.stopLocationUpdatesAsync(GEOFENCING_TASK_NAME);
  }
}

export async function startGeofencingForRoute(pois: POI[]): Promise<boolean> {
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