// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader"; // adjust path if needed

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      // turn off auto insets from the navigator itself
      safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",

        // remove per-item horizontal spacing that pushes icons inward
        tabBarItemStyle: {
          marginHorizontal: 0,
          paddingHorizontal: 0,
        },

        tabBarStyle: {
          // pin the bar flush to device edges
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",

          // vertical sizing with safe-area
          height: 68 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,

          // your desired horizontal padding (and ONLY this)
          paddingHorizontal: 0,

          backgroundColor: "white",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summaries"
        options={{
          title: "Summaries",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pencil-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}



