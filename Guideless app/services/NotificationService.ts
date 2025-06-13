import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POI } from '@/stores/RouteStore';
import { router } from 'expo-router';

const NOTIFIED_POIS_KEY = 'guideless_notified_pois';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static notificationSubscription: Notifications.EventSubscription | null = null;

  static async initialize(): Promise<boolean> {
    this.cleanup();
    console.log("Initializing notification service...");
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        console.log("Existing status: ", existingStatus);
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        console.log("Final status: ", finalStatus);
        if (finalStatus !== 'granted') {
          return false;
        }
        console.log("Notifications permissions granted");
      } else {
        return false;
      }
      console.log("Setting notification channel");
      await Notifications.setNotificationChannelAsync('poi-alerts', {
        name: 'Points of Interest',
        description: 'Notifications when you are near a point of interest',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#764D9D',
        enableVibrate: true,
      });
      console.log("Setting notification response received listener");
      this.notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const poiId = response.notification.request.content.data?.poiId;
        if (poiId && poiId !== 'end_location') {
          router.push({
            pathname: '/maps',
            params: { poiId: poiId as string }
          });
        }
      });
      console.log("Notification channel set");
      console.log("Notification service initialized");
      return true;
    } catch (error) {
      console.log("Error initializing notification service: ", error);
      return false;
    }
  }
  
  static async hasBeenNotifiedForPoi(poiId: string): Promise<boolean> {
    try {
      const notifiedPois = await this.getNotifiedPois();
      return notifiedPois.includes(poiId);
    } catch (error) {
      return false;
    }
  }
  
  static async sendPoiNotification(poi: POI): Promise<boolean> {
    console.log("Sending POI notification: ", poi.id);
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi(poi.id);
      console.log("Has been notified: ", hasBeenNotified);
      if (hasBeenNotified) {
        return false;
      }
      console.log("Notifying POI...");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Discovered: ${poi.name}`,
          body: 'Tap to explore this location',
          data: { poiId: poi.id },
          color: '#764D9D',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log("POI notification sent");
      await this.addNotifiedPoi(poi.id);
      return true;
    } catch (error) {
      console.log("Error sending POI notification: ", error);
      return false;
    }
  }

  static async sendEndLocationNotification(): Promise<boolean> {
    console.log("Sending end location notification: ");
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi('end_location');
      console.log("Has been notified: ", hasBeenNotified);
      if (hasBeenNotified) {
        return false;
      }
      console.log("Notifying end location...");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Destination reached`,
          body: 'You have reached your destination, but not all points of interest have been visited. You can continue exploring or finish your journey.',
          data: { poiId: 'end_location' },
          color: '#764D9D',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      await this.addNotifiedPoi('end_location');
      return true;
    } catch (error) {
      console.log("Error sending end location notification: ", error);
      return false;
    }
  }

  static async sendRouteCompletedNotification(isPOI: boolean): Promise<boolean> {
    console.log("Sending route completed notification: ");
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi('route_completed');
      console.log("Has been notified: ", hasBeenNotified);
      if (hasBeenNotified) {
        return false;
      }
      console.log("Notifying route completed...");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Journey completed`,
          body: 'Congratulations! You have completed your journey! Route tracking will be stopped automatically.',
          data: { poiId: 'route_completed' },
          color: '#764D9D',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: isPOI ?{
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30,
        } : null,
      });
      await this.addNotifiedPoi('route_completed');
      return true;
    } catch (error) {
      console.log("Error sending route completed notification: ", error);
      return false;
    }
  }

  static async sendNoContentNotification(): Promise<boolean> {
    console.log("Sending no content notification: ");
    try {
      console.log("Notifying no content...");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Region entered`,
          body: 'You have entered a region, but there was no server response for this area. Please check back later to see if content is available.',
          data: { poiId: 'no_content' },
          color: '#764D9D',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      return true;
    } catch (error) {
      console.log("Error sending no content notification: ", error);
      return false;
    }
  }

  static async getNotifiedPois(): Promise<string[]> {
    console.log("Getting notified POIs");
    try {
      const notifiedPoisJson = await AsyncStorage.getItem(NOTIFIED_POIS_KEY);
      console.log("Notified POIs: ", notifiedPoisJson);
      return notifiedPoisJson ? JSON.parse(notifiedPoisJson) : [];
    } catch (error) {
      return [];
    }
  }
  
  static async addNotifiedPoi(poiId: string): Promise<void> {
      const notifiedPois = await this.getNotifiedPois();
      if (!notifiedPois.includes(poiId)) {
        notifiedPois.push(poiId);
        await AsyncStorage.setItem(NOTIFIED_POIS_KEY, JSON.stringify(notifiedPois));
      }
  }
  
  static async resetNotifications(): Promise<void> {
    await AsyncStorage.removeItem(NOTIFIED_POIS_KEY);
  }

  static cleanup(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }
  }
}