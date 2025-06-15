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
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return false;
        }
      } else {
        return false;
      }
      await Notifications.setNotificationChannelAsync('poi-alerts', {
        name: 'Points of Interest',
        description: 'Notifications when you are near a point of interest',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#764D9D',
        enableVibrate: true,
      });

      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        this.handleNotificationResponse(lastResponse);
      }

      this.notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        this.handleNotificationResponse(response);
      });

      return true;
    } catch (error) {
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
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi(poi.id);
      if (hasBeenNotified) {
        return false;
      }
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
      await this.addNotifiedPoi(poi.id);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async sendEndLocationNotification(): Promise<boolean> {
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi('end_location');
      if (hasBeenNotified) {
        return false;
      }
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
      return false;
    }
  }

  static async sendRouteCompletedNotification(isPOI: boolean): Promise<boolean> {
    try {
      const hasBeenNotified = await this.hasBeenNotifiedForPoi('route_completed');
      if (hasBeenNotified) {
        return false;
      }
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
      return false;
    }
  }

  static async sendNoContentNotification(): Promise<boolean> {
    try {
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
      return false;
    }
  }

  static async getNotifiedPois(): Promise<string[]> {
    try {
      const notifiedPoisJson = await AsyncStorage.getItem(NOTIFIED_POIS_KEY);
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

  private static handleNotificationResponse(response: Notifications.NotificationResponse) {
    const poiId = response.notification.request.content.data?.poiId;
    if (poiId && poiId !== 'end_location') {
      router.push({
        pathname: '/maps',
        params: { poiId: poiId as string }
      });
    }
  }
}