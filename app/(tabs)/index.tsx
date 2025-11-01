import SwipeDeck from '@/components/swipe-deck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomButton } from '@/components/ui/custom-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addReview } from '@/utils/review-store';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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

      {mode === 'enter' && (
        <View>
          <ThemedText type="title" style={styles.title}>
            Happy Hives?
          </ThemedText>
          <View style={styles.centerCard}> 
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor={tint}
              value={name}
              onChangeText={setName}
              style={[styles.input, { borderColor: tint, color: textColor }]}
            />
            <Pressable
              style={[
              styles.enterButton,
              { backgroundColor: name.trim() ? '#FFD400' : '#cccccc' }
              ]}
              onPress={() => setMode('choose')}
              disabled={!name.trim()}
            >
              <Text style={[
                styles.enterButtonText, 
                { color: !name.trim() ? '#000' : '#666' }
              ]}>
              Continue
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {mode === 'choose' && (
        <View>
          <ThemedText style={styles.welcome}>Welcome, {name}!</ThemedText>
          <ThemedText style={styles.welcomeSub}>Choose your challenge</ThemedText>
          <CustomButton title="Tutorial" onPress={() => { setMode('tutorial'); }} />
          <CustomButton title="Test (30s)" onPress={() => { setMode('test'); setTimeLeft(TEST_DURATION); setTestRunning(true); }} />
          <CustomButton title="Back" onPress={() => { setMode('enter'); setName(''); }} />
        </View>
      )}

      {mode === 'tutorial' && (
        <View style={{marginTop: 30}}>
          <SwipeDeck
            items={TUTORIAL_SLIDES}
            onSwipe={(item, direction) => {
              const picked = direction === 'right' ? 'healthy' : 'unhealthy';
              const expected = (item as any).expected as 'healthy' | 'unhealthy';
              const correct = expected === picked;
              setFeedback({ text: correct ? 'Correct!' : `Incorrect — correct: ${expected}`, correct });
              setTimeout(() => setFeedback(null), 1400);

            }}
          />

          {feedback ? (
            <ThemedText style={{ color: feedback.correct ? tint : '#ff4d4d', textAlign: 'center', marginTop: 8 }}>{feedback.text}</ThemedText>
          ) : <ThemedText style={{ textAlign: 'center', marginTop: 4, marginBottom: 10 }}>Swipe right for healthy and left for unhealthy</ThemedText>}

          <View style={{ marginTop: 8 }}>
            <CustomButton title="Buzzin back" onPress={() => setMode('choose')} />
          </View>
        </View>
      )}

      {mode === 'test' && (
        <View style={{ flex: 1, position: 'relative' }}>
          <View style={{ marginBottom: 12, marginTop: 20, paddingHorizontal: 15 }}>
            <View style={{ height: 16, backgroundColor: '#111', borderRadius: 8, overflow: 'hidden' }}>
              <View
              style={{
                height: '100%',
                width: `${(timeLeft / TEST_DURATION) * 100}%`,
                backgroundColor: '#FFD400',
              }}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <SwipeDeck items={SAMPLE_HIVES} onSwipe={handleSwipe} />
          </View>

          <View style={{ position: 'absolute', left: 15, right: 15, bottom: 30 }}>
            <CustomButton title="Buzz Off" onPress={() => { setTestRunning(false); setMode('summary'); }} />
          </View>
        </View>
      )}

      {mode === 'summary' && (
        <View style={[styles.center]}>
          <ThemedText type="title" style={{marginTop: 100, marginBottom: 40}}>Test complete</ThemedText>
          <ThemedText>Score: {healthyCount}</ThemedText>
          <CustomButton title="Buzzing Back" onPress={() => { setMode('choose'); setHealthyCount(0); setUnhealthyCount(0); }} />
        </View>
      )}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 8,
    backgroundColor: '#FFF',
    height: '100%',
  },
  title: {
    textAlign: 'center',
    marginTop: 85,
    color: '#000',
  },
  summary: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleYellow: {
    color: '#FFD400',
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleYellow: {
    color: '#FFD400',
  },
  centerCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center',
    marginTop: 100,
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
  enterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcome: {
    marginTop: 30, 
    fontSize: 25,
    fontWeight: 'bold',
    color: "#000",
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 30,
  },
});
