import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthActions, useIsInitialized, useUser } from "@/stores/authStore";
import { useIsInitialized as useIsRouteInitialized, useHasActiveRoute, useRouteActions, usePois } from "@/stores/RouteStore";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
  useFonts as usePlayfairFonts
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts as useDMSansFonts
} from '@expo-google-fonts/dm-sans';
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
  const { initializeRouteStore, clearRoute } = useRouteActions();
  const pois = usePois();
  const hasActiveRoute = useHasActiveRoute();
  const [showRouteAlert, setShowRouteAlert] = useState(false);

  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
  });

  const [dmSansLoaded] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const fontsLoaded = playfairLoaded && dmSansLoaded;

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
    if (isInitialized && hasActiveRoute && !showRouteAlert) {
      setShowRouteAlert(true);
        Alert.alert(
          "Active route detected",
          "You have an active route. Do you want to continue it?",
          [
            {
              text: "Yes",
              onPress: () => {
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
      }  
  }, [isInitialized, hasActiveRoute, showRouteAlert]);


  useEffect(() => {
    if(!isInitialized || !isRouteInitialized || !fontsLoaded) {
      return;
    }
    const setupBackgroundTasks = async () => {
      await cleanupBackgroundTasks();
      const notificationsInitialized = await NotificationService.initialize();
    if (!notificationsInitialized) {
      Alert.alert("Failed to initialize notifications service. Please make sure to turn on notifications in the settings.");
    }
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response && user && hasActiveRoute) {
      const poiId = response.notification.request.content.data?.poiId;
      if (poiId && pois.find((poi) => poi.id === poiId)) {
        router.replace({
          pathname: '/maps',
          params: { poiId: poiId as string }
        });
      }
    }
    };
    setupBackgroundTasks();
  }, [isInitialized, isRouteInitialized, fontsLoaded, hasActiveRoute]);

  useEffect(() => {
    if (isInitialized && fontsLoaded && isRouteInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, fontsLoaded, isRouteInitialized]);

  useEffect(() => {
    if (!isInitialized || !isRouteInitialized || !fontsLoaded) {
      return;
    }

    const inProtectedGroup = segments[0] === "(protected)";

    if (user && !inProtectedGroup) {
      router.replace("/");
    } else if (!user && inProtectedGroup) {
      router.replace("/auth");
    }
  }, [user, isInitialized, isRouteInitialized, fontsLoaded]);

  return (
      <Stack screenOptions={{ headerShown: false,
     }}>
      <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none',
        navigationBarColor: '#764D9D',
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