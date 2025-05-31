import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeofencingEventType, LocationRegion } from 'expo-location';
import { Alert } from 'react-native';

const GEOFENCING_TASK_NAME = 'background-geofencing-task';

// Define the geofencing background task
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    console.error('Geofencing task error:', error.message);
    return;
  }

  if (eventType === GeofencingEventType.Enter) {
    console.log("🟢 Entered:", region.identifier);
    // Note: Alert.alert may not work in background - consider using notifications instead
    try {
      Alert.alert("🟢 Entered:", region.identifier);
    } catch (e) {
      console.log("Alert not shown (app in background)");
    }
  } else if (eventType === GeofencingEventType.Exit) {
    console.log("🔴 Exited:", region.identifier);
    try {
      Alert.alert("🔴 Exited:", region.identifier);
    } catch (e) {
      console.log("Alert not shown (app in background)");
    }
  }
});

// Clean up any existing background tasks and geofencing
export async function cleanupBackgroundTasks(): Promise<void> {
  try {
    console.log('🧹 Cleaning up existing background tasks...');

    // 1. Stop any existing geofencing
    const isGeofencingActive = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    if (isGeofencingActive) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
      console.log('✅ Stopped existing geofencing');
    }

    // 2. Stop any existing location updates (if you had any)
    const isLocationActive = await Location.hasStartedLocationUpdatesAsync(GEOFENCING_TASK_NAME);
    if (isLocationActive) {
      await Location.stopLocationUpdatesAsync(GEOFENCING_TASK_NAME);
      console.log('✅ Stopped existing location updates');
    }

    // 3. Unregister the task (this will clean up completely)
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK_NAME);
    if (isTaskRegistered) {
      await TaskManager.unregisterTaskAsync(GEOFENCING_TASK_NAME);
      console.log('✅ Unregistered existing task');
    }

    console.log('🎉 Cleanup completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Initialize clean geofencing setup
export async function initializeGeofencing(): Promise<void> {
  try {
    console.log('🚀 Initializing fresh geofencing setup...');
    
    // Clean up any existing tasks first
    await cleanupBackgroundTasks();
    
    console.log('✅ Geofencing initialized and ready');
  } catch (error) {
    console.error('❌ Error initializing geofencing:', error);
  }
}

// Updated start function with cleanup
export async function startGeofencingForRoute(routePoints: any[]): Promise<boolean> {
  try {
    console.log('🚀 Starting geofencing for route...');
    
    // Always clean up first
    await cleanupBackgroundTasks();

    // Request permissions
    const foregroundResult = await Location.requestForegroundPermissionsAsync();
    if (!foregroundResult.granted) {
      console.log('❌ Foreground permission denied');
      return false;
    }

    const backgroundResult = await Location.requestBackgroundPermissionsAsync();
    if (!backgroundResult.granted) {
      console.log('❌ Background permission denied');
      return false;
    }

    // Create fresh geofence regions
    const regions: LocationRegion[] = routePoints.map((point, index) => ({
      identifier: point.name || `waypoint-${index}`,
      latitude: point.latitude,
      longitude: point.longitude,
      radius: 20, // Keep your 20m radius
    }));

    // Start fresh geofencing
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    
    const isActive = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    
    if (isActive) {
      console.log(`✅ Started fresh geofencing for ${regions.length} regions`);
    } else {
      console.log('❌ Failed to start geofencing');
    }
    
    return isActive;
  } catch (error) {
    console.error('❌ Error starting geofencing:', error);
    return false;
  }
}

// Updated update function with cleanup
export async function updateGeofencingRegions(newRoutePoints: any[]): Promise<void> {
  try {
    console.log('🔄 Updating geofencing regions...');
    
    // Clean up existing geofences first
    await cleanupBackgroundTasks();
    
    // Create new regions
    const regions: LocationRegion[] = newRoutePoints.map((point, index) => ({
      identifier: point.name || `waypoint-${index}`,
      latitude: point.latitude,
      longitude: point.longitude,
      radius: 20,
    }));

    // Start with new regions
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    
    console.log(`✅ Updated geofencing with ${regions.length} new regions`);
  } catch (error) {
    console.error('❌ Error updating geofencing regions:', error);
  }
}

// Clean stop function
export async function stopGeofencing(): Promise<void> {
  console.log('🛑 Stopping geofencing...');
  await cleanupBackgroundTasks();
}

// Check current status
export async function getGeofencingStatus(): Promise<{
  isActive: boolean;
  isTaskRegistered: boolean;
}> {
  try {
    const isActive = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK_NAME);
    
    return { isActive, isTaskRegistered };
  } catch (error) {
    console.error('Error checking geofencing status:', error);
    return { isActive: false, isTaskRegistered: false };
  }
}

// Check if geofencing is active (for compatibility with your existing code)
export async function isGeofencingActive(): Promise<boolean> {
  try {
    return await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
  } catch (error) {
    console.error('Error checking if geofencing is active:', error);
    return false;
  }
}

// Get stored geofence events (if you want to track them)
export async function getGeofenceEvents(): Promise<any[]> {
  // Placeholder - you can implement event storage if needed
  return [];
}