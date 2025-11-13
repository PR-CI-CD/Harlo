// app/screens/RegisterScreen.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { auth, db } from "../../services/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export default function RegisterScreen() {
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [isLoading, setIsLoading]   = useState(false);

  // Refs for “Next” key navigation
  const lastNameRef  = useRef<TextInput>(null);
  const emailRef     = useRef<TextInput>(null);
  const passwordRef  = useRef<TextInput>(null);

  const handleRegister = async () => {
    const trimmedFirst  = firstName.trim();
    const trimmedLast   = lastName.trim();
    const trimmedEmail  = email.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(userCredential.user, {
        displayName: `${trimmedFirst} ${trimmedLast}`,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        createdAt: serverTimestamp(),
      });

      Keyboard.dismiss();
      router.replace("/(tabs)/home");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            Alert.alert("Email already in use", "Try signing in instead.");
            break;
          case "auth/invalid-email":
            Alert.alert("Invalid email", "Please enter a valid email address.");
            break;
          case "auth/weak-password":
          case "auth/password-does-not-meet-requirements":
            Alert.alert(
              "Weak password",
              "Password must be 8–20 characters and include upper & lower case letters, a number, and a symbol."
            );
            break;
          default:
            Alert.alert("Registration failed", "Please try again later.");
            console.error("Register error:", error);
        }
      } else {
        Alert.alert("Unexpected error", "Something went wrong. Please try again.");
        console.error("Unknown register error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tap outside to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0} // set to header height if using a custom header (e.g., 64–88)
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"   // allow tapping buttons/links while keyboard is open
            keyboardDismissMode="on-drag"         // drag down to dismiss on iOS
            contentInsetAdjustmentBehavior="always"
          >
            <View style={styles.container}>
              <Text style={styles.title}>Create Account</Text>

              <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
              />

              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />

              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                textContentType="newPassword"
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={handleRegister}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Register</Text>}
              </TouchableOpacity>

              <Text style={styles.hint}>
                Password must be 8–20 characters and include upper & lower case letters, a number, and a symbol.
              </Text>

              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>← Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",   // keeps the form centered, but still scrolls when keyboard shows
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  container: { width: "100%" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { color: "#6B7280", textAlign: "center", marginTop: 12, fontSize: 12 },
  link: { color: "#2563EB", textAlign: "center", marginTop: 16 },
});

