import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthActions, useIsInitialized, useUser } from "@/stores/authStore";
import { useIsInitialized as useIsRouteInitialized, useRouteActions } from "@/stores/RouteStore";
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize } = useAuthActions();
  const isInitialized = useIsInitialized();
  const user = useUser();
  const router = useRouter();
  const segments = useSegments();
  const isRouteInitialized = useIsRouteInitialized();
  const { initializeRouteStore } = useRouteActions();

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
    const setupBackgroundTasks = async () => {
      await cleanupBackgroundTasks();
    };
    setupBackgroundTasks();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    initializeRouteStore();
  }, [isInitialized]);

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
        navigationBarColor: '#F9FAFB',
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