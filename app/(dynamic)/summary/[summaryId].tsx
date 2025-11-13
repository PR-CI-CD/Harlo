import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { subscribeSummary, type SummaryDoc } from '../../../services/api/getsummaries';

export default function SummaryDetailRoute() {
  const params = useLocalSearchParams<{ summaryId?: string }>();
  const summaryId = params.summaryId ? String(params.summaryId) : undefined;

  const [data, setData] = useState<(SummaryDoc & { id: string }) | null>(null);

  const insets = useSafeAreaInsets();
  const floatingBarHeight = 68 + insets.bottom;

  useEffect(() => {
    if (!summaryId) return;
    const unsub = subscribeSummary(summaryId, setData);
    return () => unsub?.();
  }, [summaryId]);

  if (!summaryId) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Missing summaryId</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text> Loading summary…</Text>
      </View>
    );
  }

  if (data.status === 'processing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text> Processing…</Text>
      </View>
    );
  }

  if (data.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Error</Text>
        <Text>{data.error || 'Failed to process'}</Text>
      </View>
    );
  }

  // Handlers – plug in your real logic
  const handleViewAllSummaries = () => {
    router.push('/summaries');
  };

  const handleGenerateQuiz = () => {
    console.log('Generate quiz for summary:', summaryId);
  };

  const handleRegenerate = () => {
    console.log('Regenerate summary:', summaryId);
  };

  const handleDelete = () => {
    console.log('Delete summary:', summaryId);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {/* Top bar */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.ghost]}
          onPress={() => router.back()}
        >
          <Text style={styles.ghostText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content – extra padding at bottom so it doesn't hide behind toolbar */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.wrap,
          { paddingBottom: 20 + floatingBarHeight },
        ]}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.h1}>Summary</Text>
        <Text style={styles.body}>{data.summary}</Text>

        {!!data.keyPoints?.length && (
          <>
            <Text style={styles.h2}>Key Points</Text>
            {data.keyPoints.map((kp, i) => (
              <Text key={i} style={styles.li}>
                • {kp}
              </Text>
            ))}
          </>
        )}

        {!!data.roadmap?.length && (
          <>
            <Text style={styles.h2}>Roadmap</Text>
            {data.roadmap.map((step, i) => (
              <Text key={i} style={styles.li}>
                {i + 1}. {step}
              </Text>
            ))}
          </>
        )}

        {!!data.resources?.length && (
          <>
            <Text style={styles.h2}>Resources</Text>
            {data.resources.map((r, i) => (
              <TouchableOpacity key={i} onPress={() => Linking.openURL(r.url)}>
                <Text style={styles.link}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating tool bar – styled like main tab bar */}
      <View
        style={[
          styles.floatingBar,
          {
            height: floatingBarHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          },
        ]}
      >
        <TouchableOpacity style={styles.floatingBtn} onPress={handleViewAllSummaries}>
          <Ionicons name="list-outline" size={24} color="#2563EB" />
          <Text style={styles.floatingLabel}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingBtn} onPress={handleGenerateQuiz}>
          {/* Book icon matches your Quiz tab */}
          <Ionicons name="school-outline" size={24} color="#2563EB" />
          <Text style={styles.floatingLabel}>Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingBtn} onPress={handleRegenerate}>
          {/* Pencil icon for regenerate */}
          <Ionicons name="pencil-outline" size={24} color="#2563EB" />
          <Text style={styles.floatingLabel}>Regen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#B91C1C" />
          <Text style={[styles.floatingLabel, { color: '#B91C1C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // Top bar (same as before, minus right button)
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ghostText: {
    color: '#111827',
    fontWeight: '600',
  },

  // Main scroll
  scroll: {
    flex: 1,
  },
  wrap: {
    padding: 20,
  },

  // Typography
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  body: { fontSize: 16, lineHeight: 22 },
  li: { fontSize: 16, marginBottom: 4 },
  link: { fontSize: 16, textDecorationLine: 'underline', marginBottom: 6 },
  err: { fontSize: 18, fontWeight: '700', color: 'red', marginBottom: 8 },

  // Floating bottom bar – matches Tabs tabBarStyle
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingHorizontal: 0,
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  floatingBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLabel: {
    fontSize: 11,
    marginTop: 2,
    color: '#2563EB', // matches tabBarActiveTintColor
    fontWeight: '500',
  },
});


