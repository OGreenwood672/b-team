import SwipeDeck from '@/components/swipe-deck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addReview } from '@/utils/review-store';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

const SAMPLE_HIVES = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1549625907-5f7ae0f2f6a6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9d2c9f1dc3a1f8a5f9f9b8b1f8f9a3c4',
    caption: 'Hive A',
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5c8d9c6d8c6d6c6d8c6d6c6d6c6d6c6',
    caption: 'Hive B',
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1507914376894-ec5a9d19c4f4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    caption: 'Hive C',
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    caption: 'Hive D',
  },
];

export default function HomeScreen() {
  const [healthyCount, setHealthyCount] = useState(0);
  const [unhealthyCount, setUnhealthyCount] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'enter' | 'choose' | 'tutorial' | 'test' | 'summary'>('enter');

  // Tutorial slides (simple examples) — each has an expected correct label
  const TUTORIAL_SLIDES = [
    {
      id: 't1',
      uri: SAMPLE_HIVES[0].uri,
      expected: 'healthy' as const,
      text: 'Healthy hive: bees are active, combs look clean and consistent.',
    },
    {
      id: 't2',
      uri: SAMPLE_HIVES[1].uri,
      expected: 'unhealthy' as const,
      text: 'Unhealthy signs: discolored combs, few bees, visible pests or mold.',
    },
  ];
  const [tutorialCount, setTutorialCount] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  // Test timer
  const TEST_DURATION = 30; // seconds
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [testRunning, setTestRunning] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (mode === 'test' && testRunning) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTestRunning(false);
            setMode('summary');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, testRunning]);

  const handleSwipe = (item: { id: string }, direction: 'left' | 'right') => {
    if (direction === 'right') setHealthyCount((c) => c + 1);
    else setUnhealthyCount((c) => c + 1);
    addReview(name || 'Anonymous', direction === 'right' ? 'healthy' : 'unhealthy');
  };

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#FFF8E1', dark: '#111111' }, 'background');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ color: tint }}>
        Hive Health Review
      </ThemedText>
      <ThemedText type="subtitle" style={{ color: textColor }}>
        Swipe right = healthy, left = unhealthy
      </ThemedText>

      {mode === 'enter' && (
        <View style={[styles.centerCard, { backgroundColor: cardBg }]}> 
          <ThemedText style={{ color: '#0B0B0B', fontSize: 20, fontWeight: '700' }}>Welcome</ThemedText>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor={tint}
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: tint, color: textColor }]}
          />
          <View style={styles.buttonRow}>
            <Button color={tint} title="Continue" onPress={() => { if (name.trim().length) setMode('choose'); }} disabled={name.trim().length === 0} />
          </View>
        </View>
      )}

      {mode === 'choose' && (
        <View>
          <ThemedText>Welcome, {name}.</ThemedText>
          <Button title="Gamemode 1: Tutorial" onPress={() => { setTutorialCount(TUTORIAL_SLIDES.length); setMode('tutorial'); }} />
          <Button title="Gamemode 2: Test (30s)" onPress={() => { setMode('test'); setTimeLeft(TEST_DURATION); setTestRunning(true); }} />
          <Button title="Change Name" onPress={() => { setMode('enter'); setName(''); }} />
        </View>
      )}

      {mode === 'tutorial' && (
        <View>
      <ThemedText>Tutorial: swipe to indicate whether the hive is healthy or unhealthy. We will tell you after each swipe.</ThemedText>

          <SwipeDeck
            items={TUTORIAL_SLIDES}
            onSwipe={(item, direction) => {
              const picked = direction === 'right' ? 'healthy' : 'unhealthy';
              const expected = (item as any).expected as 'healthy' | 'unhealthy';
              const correct = expected === picked;
              setFeedback({ text: correct ? 'Correct!' : `Incorrect — correct: ${expected}`, correct });
              setTimeout(() => setFeedback(null), 1400);
              setTutorialCount((c) => {
                const next = c - 1;
                if (next <= 0) {
                  setTimeout(() => setMode('choose'), 1600);
                }
                return next;
              });
            }}
          />

          {feedback ? (
            <ThemedText style={{ color: feedback.correct ? tint : '#ff4d4d', textAlign: 'center', marginTop: 8 }}>{feedback.text}</ThemedText>
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 8 }}>{tutorialCount} slides remaining</ThemedText>
          )}

          <View style={{ marginTop: 8 }}>
            <Button title="Back to Modes" onPress={() => setMode('choose')} />
          </View>
        </View>
      )}

      {mode === 'test' && (
        <View>
          <ThemedText>Time left: {timeLeft}s</ThemedText>
          <SwipeDeck items={SAMPLE_HIVES} onSwipe={handleSwipe} />
          <Button title="End Test" onPress={() => { setTestRunning(false); setMode('summary'); }} />
        </View>
      )}

      {mode === 'summary' && (
        <View>
          <ThemedText type="title">Test complete</ThemedText>
          <ThemedText>Healthy: {healthyCount}</ThemedText>
          <ThemedText>Unhealthy: {unhealthyCount}</ThemedText>
          <Button title="Back to Modes" onPress={() => { setMode('choose'); setHealthyCount(0); setUnhealthyCount(0); }} />
        </View>
      )}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  summary: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enterBackground: {
    backgroundColor: '#000',
    flex: 1,
    paddingTop: 40,
  },
  titleYellow: {
    color: '#FFD400',
  },
  subtitleYellow: {
    color: '#FFD400',
  },
  centerCard: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD400',
    color: '#FFD400',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  buttonRow: {
    width: '100%',
  },
});
