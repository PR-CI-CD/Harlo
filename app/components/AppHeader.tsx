// components/AppHeader.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../../services/firebase/config";
import { useAuth } from "../../services/auth/AuthProvider";
import { getInitials } from "../../services/auth/profile";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import ProfileActionSheet from "./ProfileActionSheet";

// 👉 Add your logo import (static require)
const harloLogo = require("../../assets/images/harlo-logo.png");

export default function AppHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, displayName } = useAuth();

  const handleNavigateSettings = () => {
    router.push("/settings");
  };

  const handleNavigateProfile = () => {
    Alert.alert("Profile", "Go to profile screen…");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Signed out", "You’ve been logged out.", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Could not sign out. Please try again.");
    }
  };

  const handleUploadPhoto = async () => {
    try {
      setUploading(true);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;

      const asset = res.assets[0];
      const uri = asset.uri;
      if (!user?.uid) throw new Error("No signed-in user.");

      const fileResp = await fetch(uri);
      const blob = await fileResp.blob();

      const fileRef = ref(storage, `profilePics/${user.uid}/avatar.jpg`);
      await uploadBytes(fileRef, blob, {
        contentType: blob.type || "image/jpeg",
      });

      const url = await getDownloadURL(fileRef);
      await updateProfile(user, { photoURL: url });
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url },
        { merge: true }
      );

      Alert.alert("Profile updated", "Your profile photo has been updated.");
    } catch (e) {
      console.error("Upload photo error:", e);
      Alert.alert("Error", "Could not upload profile photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const photoURL = user?.photoURL || undefined;
  const initials = getInitials(displayName);

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {/* Replace text with logo */}
        <Image source={harloLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={styles.avatarBtn}
          hitSlop={8}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.initials]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ProfileActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPressProfile={handleNavigateProfile}
        onPressUploadPhoto={handleUploadPhoto}
        onPressSettings={handleNavigateSettings}
        onPressLogout={handleLogout}
        uploading={uploading}
        displayName={displayName}
      />
    </View>
  );
}

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  wrap: {
    height: 106 + (Platform.OS === "ios" ? 6 : 0),
    paddingTop: Platform.OS === "ios" ? 45 : 0,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },

  // 👇 New logo style
  logo: {
    width: 20,    // tweak to fit nicely   // tweak to your aspect ratio
  },

  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  right: { flexDirection: "row", alignItems: "center" },
  avatarBtn: { marginLeft: 8 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#E5E7EB",
  },
  initials: {
    backgroundColor: "#dd9309ff",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});

