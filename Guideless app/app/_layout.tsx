import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthActions, useIsInitialized, useUser } from "@/stores/authStore";
import { useRouter, useSegments } from "expo-router";
import "../global.css";

export default function RootLayout() {
  const { initialize } = useAuthActions();
  const isInitialized = useIsInitialized();
  const user = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

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

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});