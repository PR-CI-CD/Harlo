import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { useAuth } from "../../services/auth/AuthProvider";
import RecentSummaries from "../components/RecentSummaries";
import UsefulLinks from "../components/UsefulLinks";

export default function HomeScreen() {
  const { displayName } = useAuth();

  const greeting = useMemo(() => {
    const now = new Date();
    const hour = now.getHours(); // device local time

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.container}>
          <Text style={styles.greeting}>
            {greeting}
            {displayName ? `, ${displayName}!` : "!"}
          </Text>

          {/* Recent summaries */}
          <RecentSummaries limit={6} />

          {/* Useful Links */}
          <UsefulLinks />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF",
    // Prevents overlap with Android status bar since we're not using SafeAreaView
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  scroll: {
    flex: 1,
    margin: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#4B5563",
    marginBottom: 16,
  },
});
