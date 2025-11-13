import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { auth, db, storage } from "../../services/firebase/config";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  query,
  where,
  getDocs,
  collection,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { useAuth } from "../../services/auth/AuthProvider";

export default function SettingsScreen() {
  const { user, profile, displayName } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [reauthVisible, setReauthVisible] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");

  // Ask for confirmation, then show password modal
  const confirmDelete = () => {
    Alert.alert(
      "Delete account?",
      "This will permanently delete your account and all related data (no recovery). Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setReauthVisible(true),
        },
      ]
    );
  };

  // Runs AFTER successful re-auth
  const handleDeleteFlow = async () => {
    try {
      setDeleting(true);
      await tryDeleteEverything();
    } catch (err: any) {
      console.error("Delete flow error:", err);
      Alert.alert(
        "Error",
        "Could not delete the account. Please try again in a moment."
      );
      setDeleting(false);
    }
  };

  const onConfirmReauth = async () => {
    try {
      if (!user?.email) throw new Error("Missing email for re-auth.");
      if (!reauthPassword) {
        Alert.alert("Password required", "Please enter your password.");
        return;
      }

      const cred = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, cred); // ✅ password check

      setReauthVisible(false);
      setReauthPassword("");

      await handleDeleteFlow();
    } catch (e: any) {
      if (e?.code === "auth/wrong-password") {
        Alert.alert("Wrong password", "Please check your password and try again.");
      } else if (e?.code === "auth/too-many-requests") {
        Alert.alert(
          "Too many attempts",
          "Too many failed attempts. Please wait a bit and try again."
        );
      } else {
        console.error("Reauth error:", e);
        Alert.alert("Error", "Could not re-authenticate. Please try again.");
      }
    }
  };

  // 🔹 Delete user data from Storage under a given prefix
  const deleteAllStorageUnder = async (prefix: string) => {
    const rootRef = ref(storage, prefix);
    const walk = async (folderRef: ReturnType<typeof ref>) => {
      const res = await listAll(folderRef);
      await Promise.all(res.items.map((item) => deleteObject(item)));
      await Promise.all(res.prefixes.map((sub) => walk(sub)));
    };

    try {
      await walk(rootRef);
    } catch (err: any) {
      // If folder doesn't exist or user has no uploads, safely ignore
      if (err?.code !== "storage/object-not-found") {
        console.warn("Storage delete error for", prefix, err);
      }
    }
  };

  const deleteUserFirestoreData = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);

    // Helper to delete a collection (optionally filtered by uid)
    const deleteCollection = async (
      colRef: ReturnType<typeof collection>,
      filterByUid: boolean = false
    ) => {
      const qRef = filterByUid ? query(colRef, where("uid", "==", uid)) : colRef;
      const snap = await getDocs(qRef as any);

      if (snap.empty) return;

      let batch = writeBatch(db);
      let count = 0;

      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        count++;
        if (count === 450) {
          // Commit partial batch to stay under 500 limit
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });

      await batch.commit();
    };

    // 1) Old schema: top-level collections (if any still exist)
    await deleteCollection(collection(db, "summaries"), true);
    await deleteCollection(collection(db, "quizzes"), true);

    // 2) Current schema: subcollections under users/{uid}
    await deleteCollection(collection(db, "users", uid, "summaries"));
    await deleteCollection(collection(db, "users", uid, "quizzes"));

    // 3) Finally delete the user doc itself
    await deleteDoc(userDocRef);
  };

  const tryDeleteEverything = async () => {
    if (!user?.uid) throw new Error("No current user.");

    // Delete storage data (user folder + uploads folder)
    await Promise.allSettled([
      deleteAllStorageUnder(`users/${user.uid}`),
      deleteAllStorageUnder(`uploads/${user.uid}`),
    ]);

    // Delete Firestore data
    await deleteUserFirestoreData(user.uid);

    // Delete auth user
    await deleteUser(user);

    setDeleting(false);
    Alert.alert("Account deleted", "Your account and data have been removed.");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{displayName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Center</Text>
          <Text style={styles.label}>See how we use and store your data</Text>
          <Pressable
            onPress={() => router.push("/privacy-center")}
            style={({ pressed }) => [
              styles.privacyBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.privacyBtnText}>Privacy</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              deleting && { opacity: 0.6 },
            ]}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteText}>Delete Account</Text>
            )}
          </Pressable>
          <Text style={styles.smallNote}>
            This will permanently delete your account and all related data. This
            action cannot be undone.
          </Text>
        </View>
      </ScrollView>

      {/* Reauth modal */}
      <Modal
        visible={reauthVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReauthVisible(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm your password</Text>
            <Text style={styles.modalDesc}>
              For your security, please re-enter your password to delete your
              account.
            </Text>
            <TextInput
              value={reauthPassword}
              onChangeText={setReauthPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onConfirmReauth}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setReauthVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onConfirmReauth}
                style={[styles.modalBtn, styles.confirmBtn]}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 20, gap: 16 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: "#6B7280", fontSize: 14 },
  value: { color: "#111827", fontSize: 16, fontWeight: "600" },
  deleteBtn: {
    marginTop: 4,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  smallNote: { color: "#6B7280", fontSize: 12 },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalDesc: { color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  confirmBtn: { backgroundColor: "#111827" },
  cancelText: { color: "#111827", fontWeight: "600" },
  confirmText: { color: "#fff", fontWeight: "700" },
  privacyBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

