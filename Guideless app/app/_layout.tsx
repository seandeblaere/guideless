import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthActions, useIsInitialized, useUser } from "@/stores/authStore";
import { useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize } = useAuthActions();
  const isInitialized = useIsInitialized();
  const user = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const inProtectedGroup = segments[0] === "(protected)";

    if (user && !inProtectedGroup) {
      router.replace("/");
    } else if (!user && inProtectedGroup) {
      router.replace("/login");
    }
  }, [user, isInitialized]);

  return (
    <Stack screenOptions={{ headerShown: false,
     }}>
      <Stack.Screen name="(protected)" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'none',
        navigationBarColor: '#E3D7F7'
       }} />
    </Stack>
  );
}