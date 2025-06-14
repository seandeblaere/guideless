import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthActions, useIsInitialized, useUser } from "@/stores/authStore";
import { useIsInitialized as useIsRouteInitialized, useHasActiveRoute, useRouteActions, usePois } from "@/stores/RouteStore";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "@/global.css";
import "@/services/initializeBackgroundTasks";
import { cleanupBackgroundTasks } from "@/services/GeofencingService";
import { NotificationService } from "@/services/NotificationService";
import { Alert } from "react-native";
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize } = useAuthActions();
  const isInitialized = useIsInitialized();
  const user = useUser();
  const router = useRouter();
  const segments = useSegments();
  const isRouteInitialized = useIsRouteInitialized();
  const { initializeRouteStore, clearRoute, startRouteTracking } = useRouteActions();
  const pois = usePois();
  const hasActiveRoute = useHasActiveRoute();
  const [launchedFromNotification, setLaunchedFromNotification] = useState(true);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isInitialized) {
      initializeRouteStore();
    }
  }, [isInitialized]);

  useEffect(() => {
    if(!isInitialized || !isRouteInitialized)  {
      return;
    }
    const checkForNotification = async () => {
        const response = await Notifications.getLastNotificationResponseAsync();
        if(!response || !hasActiveRoute) {
          setLaunchedFromNotification(false);
          return;
        }
          const poiId = response.notification.request.content.data?.poiId;
          if (poiId && pois.find((poi) => poi.id === poiId)) {
            startRouteTracking();
            router.replace({
              pathname: '/maps',
              params: { poiId: poiId as string }
            });
          }
        }
    checkForNotification();
  }, [isInitialized, isRouteInitialized]);

  useEffect(() => {
    if(!isInitialized || !isRouteInitialized) {
      return;
    }

    const setupBackgroundTasks = async () => {
      await cleanupBackgroundTasks();
      const notificationsInitialized = await NotificationService.initialize();
      if (!notificationsInitialized) {
        Alert.alert("Failed to initialize notifications service. Please make sure to turn on notifications in the settings.");
      }
    };

    setupBackgroundTasks();
  }, [isInitialized, isRouteInitialized]);

  useEffect(() => {
    if (!isInitialized || !isRouteInitialized || !hasActiveRoute || launchedFromNotification) {
      return;
    }
        Alert.alert(
          "Active route detected",
          "You have an active route. Do you want to continue it?",
          [
            {
              text: "Yes",
              onPress: () => {
                startRouteTracking();
                router.replace({
                  pathname: '/maps',
                });
              }
            },
            {
              text: "No",
              onPress: () => {
                clearRoute();
                router.replace("/");
              },
              style: 'cancel'
            }
          ],
          { cancelable: false }
        );
  }, [isInitialized, isRouteInitialized, launchedFromNotification]);

  useEffect(() => {
    if (isInitialized && isRouteInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, isRouteInitialized]);

  useEffect(() => {
    if (!isInitialized || !isRouteInitialized) {
      return;
    }

    const inProtectedGroup = segments[0] === "(protected)";

    if (user && !inProtectedGroup) {
      router.replace("/");
    } else if (!user && inProtectedGroup) {
      router.replace("/auth");
    }
  }, [user, isInitialized, isRouteInitialized]);

  return (
      <Stack screenOptions={{ headerShown: false,
     }}>
      <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none',
        navigationBarColor: '#FCFCFC',
       }} />
      <Stack.Screen name="auth" options={{ headerShown: false, animation: 'none',
        navigationBarColor: '#E3D7F7'
       }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_bottom',
        navigationBarColor: '#E3D7F7'
       }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_bottom',
        navigationBarColor: '#E3D7F7'
       }} />
    </Stack>
  );
}