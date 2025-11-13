// components/ProfileActionSheet.tsx
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPressProfile: () => void;
  onPressUploadPhoto: () => void;
  onPressSettings: () => void;
  onPressLogout: () => void;
  uploading?: boolean;
  displayName?: string | null;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8; // 80% of screen

export default function ProfileActionSheet({
  visible,
  onClose,
  onPressProfile,
  onPressUploadPhoto,
  onPressSettings,
  onPressLogout,
  uploading,
  displayName,
}: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Open animation
  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  // Centralised close with animation
  const animateClose = (after?: () => void) => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      after && after();
    });
  };

  // Drag-to-close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        return Math.abs(gesture.dy) > 5;
      },
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        const shouldClose =
          gesture.dy > 100 || gesture.vy > 0.75;

        if (shouldClose) {
          animateClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => animateClose()}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.overlay} onPress={() => animateClose()} />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.sheetInner} {...panResponder.panHandlers}>
          {/* Grab handle + header row (with Close button) */}
          <View style={styles.headerWrapper}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Account</Text>
                {displayName ? (
                  <Text style={styles.headerSubtitle}>{displayName}</Text>
                ) : null}
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => animateClose()}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <ActionRow
              label="Profile"
              onPress={() => animateClose(onPressProfile)}
            />

            <ActionRow
              label={uploading ? "Uploading…" : "Upload profile photo"}
              onPress={() => !uploading && animateClose(onPressUploadPhoto)}
              disabled={uploading}
            />

            <ActionRow
              label="Settings"
              onPress={() => animateClose(onPressSettings)}
            />

            <View style={styles.divider} />

            <ActionRow
              label="Log out"
              onPress={() => animateClose(onPressLogout)}
              destructive
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

type ActionRowProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

function ActionRow({ label, onPress, disabled, destructive }: ActionRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        pressed && !disabled && styles.actionRowPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.actionLabel,
          destructive && { color: "#DC2626", fontWeight: "700" },
          disabled && { opacity: 0.6 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const SHEET_RADIUS = 24;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheetInner: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  headerWrapper: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2563EB",
  },
  actions: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  actionRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionRowPressed: {
    backgroundColor: "#F3F4F6",
  },
  actionLabel: {
    fontSize: 16,
    color: "#111827",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 18,
  },
});
