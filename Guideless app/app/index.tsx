import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
} from "react-native";
import { useState } from "react";
import { auth } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  updateProfile,
} from "firebase/auth";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User created successfully, check your email for verification");
    } catch (error: any) {
      const err = error as AuthError;
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in successfully");
    } catch (error: any) {
      const err = error as AuthError;
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Sign Up" onPress={signUp} />
        <Button title="Sign In" onPress={signIn} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    marginVertical: 4,
    padding: 10,
    height: 50,
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
});
