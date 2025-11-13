import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function PrivacyCenterScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* Action bar */}
      <View style={styles.actionBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      {/* Your page content */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
          Privacy Center
        </Text>
        <Text>How we use and store your data…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 4,
  },
  closeBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  closeText: {
    color: "#111827",
    fontWeight: "700",
  },
});
