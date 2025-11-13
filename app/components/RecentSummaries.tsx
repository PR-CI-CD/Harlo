import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
    subscribeRecentSummaries,
    type SummaryDoc,
} from "../../services/api/getsummaries"; // ← adjust if your path differs

type Row = { id: string } & SummaryDoc;

function deriveTitle(summary?: string) {
    if (!summary) return "Untitled summary";
    const clean = summary.replace(/\s+/g, " ").trim();
    const firstPeriod = clean.indexOf(".");
    let title = firstPeriod !== -1 ? clean.slice(0, firstPeriod + 1) : clean.slice(0, 60);
    if (title.length > 80) title = title.slice(0, 77) + "…";
    return title;
}

export default function RecentSummaries({
    limit = 6,
    title = "Recent Summaries",
}: {
    limit?: number;
    title?: string;
}) {
    const [rows, setRows] = useState<Row[] | null>(null);

    useEffect(() => {
        const unsub = subscribeRecentSummaries(limit, setRows);
        return () => unsub && unsub();
    }, [limit]);

    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Text style={styles.h1}>{title}</Text>
            </View>

            {rows === null ? (
                <Text style={styles.muted}>Loading…</Text>
            ) : rows.length === 0 ? (
                <Text style={styles.muted}>No summaries yet. Create one to get started.</Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hlist}
                >
                    {rows.map((row) => {
                        const t = deriveTitle(row.summary);
                        const keypoints = (row.keyPoints ?? []).slice(0, 2);
                        return (
                            <TouchableOpacity key={row.id} style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/summary/${row.id}`)}>
                                {/* Title: cap to 2 lines */}
                                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                                    {title}
                                </Text>

                                {/* Key points: cap to 2 items, each 1 line */}
                                {keypoints.length > 0 ? (
                                    <View style={styles.kpWrap}>
                                        {keypoints.slice(0, 2).map((k, i) => (
                                            <Text key={i} style={styles.kpItem} numberOfLines={1} ellipsizeMode="tail">
                                                • {k}
                                            </Text>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.kpItem}>No key points</Text>
                                )}

                                {/* Footer anchored at bottom */}
                                <View style={styles.cardFooter}>
                                    <Text style={styles.link}>Open →</Text>
                                </View>
                            </TouchableOpacity>

                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginTop: 16 },
    header: { marginBottom: 8, flexDirection: "row", alignItems: "center" },
    h1: { fontSize: 15, fontWeight: "300", color: "#111827" },
    muted: { color: "#6B7280" },

    hlist: { paddingVertical: 6, gap: 12, paddingRight: 6 },

    card: {
        width: 260,
        minHeight: 160,            // or set height: 180 for perfectly equal
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    kpWrap: { gap: 4 },
    kpItem: { color: "#374151", fontSize: 14, lineHeight: 18 },

    // pins the footer to the bottom regardless of content height
    cardFooter: {
        marginTop: "auto",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 8,
    },
    link: { color: "#2563EB", fontWeight: "700" },
});

