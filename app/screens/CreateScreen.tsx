import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { startSummaryApi } from "../../services/api/summaries";
import LottieView from "lottie-react-native";

type PickedFile = { uri: string; name: string; mimeType: string };

export default function CreateScreen() {
  const [text, setText] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsGenerating(false);
      setIsSubmitting(false);
      return () => {
        setIsGenerating(false);
        setIsSubmitting(false);
      };
    }, [])
  );

  const handleFilePick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setPickedFile({
      uri: asset.uri,
      name: asset.name ?? "upload",
      mimeType: asset.mimeType ?? "application/octet-stream",
    });
    Alert.alert("File selected", asset.name ?? "upload");
  };

  const uploadFileToStorage = async (uid: string, file: PickedFile) => {
    const storage = getStorage(undefined, "gs://harlo-2190a.firebasestorage.app");
    const safeName = file.name.replace(/[^\w.\-]/g, "_");
    const storagePath = `users/${uid}/uploads/${Date.now()}_${safeName}`;
    const blob = await (await fetch(file.uri)).blob();
    await uploadBytes(ref(storage, storagePath), blob, { contentType: file.mimeType });
    return { storagePath, filename: safeName };
  };

  const handleGenerate = async () => {
    try {
      setIsSubmitting(true);
      const user = getAuth().currentUser;
      if (!user) throw new Error("Please log in");

      let payload:
        | { sourceType: "text"; originalText: string }
        | { sourceType: "file"; filePath: string; filename?: string };

      if (pickedFile) {
        const { storagePath, filename } = await uploadFileToStorage(user.uid, pickedFile);
        payload = { sourceType: "file", filePath: storagePath, filename };
      } else if (text.trim()) {
        payload = { sourceType: "text", originalText: text.trim() };
      } else {
        Alert.alert("Nothing to process", "Paste text or upload a file first.");
        return;
      }

      setIsGenerating(true);
      const { summaryId } = await startSummaryApi(payload);
      router.push(`/summary/${summaryId}`);
      setText("");
      setPickedFile(null);
      Keyboard.dismiss();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to generate");
      setIsGenerating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.container}>
              <Text style={styles.title}>Create Summary</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Paste or type your text here…"
                multiline
                value={text}
                onChangeText={setText}
                returnKeyType="done"
                blurOnSubmit={false}
                scrollEnabled
                editable={!isSubmitting}
              />

              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handleFilePick}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, styles.outlineButtonText]}>
                  {pickedFile ? `📄 ${pickedFile.name}` : "Upload PDF / DOCX / TXT"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.7 }]}
                onPress={handleGenerate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {isGenerating && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <LottieView
            source={require("../../assets/animation/splashscreen.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Generating your summary…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0, // <-- no side padding at all
    paddingTop: 0,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",

  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 0, // flat edge-to-edge look
    padding: 12,
    minHeight: 160,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10, // edge-to-edge buttons
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  outlineButtonText: {
    color: "#2563EB",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingAnimation: {
    width: 180,
    height: 180,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});


