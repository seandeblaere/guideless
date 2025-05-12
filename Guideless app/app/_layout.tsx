import { auth } from "@/firebaseConfig";
import { Stack } from "expo-router";
import { User, updateProfile } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [firstName, setFirstName] = useState("");

  const onAuthStateChanged = (user: User | null) => {
    setUser(user || null);
    if (initializing) {
      setInitializing(false);
    }
  };

  const updateUserProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: firstName,
        });
        await user.reload();
        setUser(user);
      } catch (error) {
        alert(error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged);
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  return (
    <View>
      <Text>Hello {user.email}, you are logged in!</Text>
      <Text>First Name: {user.displayName}</Text>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Button title="Update Profile" onPress={updateUserProfile} />
      </KeyboardAvoidingView>
    </View>
  );
}
