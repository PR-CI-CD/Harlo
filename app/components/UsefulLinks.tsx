import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";

export default function UsefulLinks() {
  const links = [
    {
      title: "Google Scholar",
      description: "Access millions of academic papers and research articles.",
      url: "https://scholar.google.com",
      color: "#C9B59C",
    },
    {
      title: "LinkedIn Learning",
      description: "Upskill with expert-led courses across various fields.",
      url: "https://www.linkedin.com/learning/",
      color: "#D9CFC7",
    },
    {
      title: "Coursera",
      description: "Learn from top universities and companies worldwide.",
      url: "https://www.coursera.org",
      color: "#EFE9E3",
    },
    {
      title: "edX",
      description: "University-level online courses from Harvard, MIT & more.",
      url: "https://www.edx.org",
      color: "#F9F8F6",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>Useful Links</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => Linking.openURL(link.url)}
            activeOpacity={0.8}
            style={[styles.card, { backgroundColor: link.color }]}
          >
            <Text style={styles.title}>{link.title}</Text>
            <Text style={styles.description}>{link.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  header: { marginBottom: 8, flexDirection: "row", alignItems: "center" },
  h1: { fontSize: 15, fontWeight: "300", color: "#111827" },
  scrollContainer: { paddingRight: 16 },
  card: {
    width: 220,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  description: {
    fontSize: 13,
    color: "#374151",
    marginTop: 6,
    lineHeight: 18,
  },
});
