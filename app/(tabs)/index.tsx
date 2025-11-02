import { useAppFont } from '@/components/font-provider';
import SwipeDeck from '@/components/swipe-deck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomButton } from '@/components/ui/custom-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { recordSession } from '@/utils/review-store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import hives from '../../assets/bees.json';

type BasicHive = {
  id: number;
  healthy: boolean;
  description: string;
};

let SAMPLE_HIVES = hives.map((hive: BasicHive) => {
  return {
    uri: `https://raw.githubusercontent.com/OGreenwood672/b-team/refs/heads/main/assets/images/bees/${hive.id}.jpg`,
    ...hive,
  }
});

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


export default function HomeScreen() {
  console.error = () => {};
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'enter' | 'choose' | 'tutorial' | 'test' | 'summary'>('enter');

  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const TEST_DURATION = 10;
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [testRunning, setTestRunning] = useState(false);

  const reviewedCountRef = useRef(reviewedCount);
  const correctCountRef = useRef(correctCount);

  reviewedCountRef.current = reviewedCount;
  correctCountRef.current = correctCount;

  const { fonts } = useAppFont();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (mode === 'test' && testRunning) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            finishTest();
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

  const handleSwipe = (item: any, direction: 'left' | 'right') => {
    const pickedHealthy = direction === 'right';
    const correct = item.healthy === pickedHealthy;

  setReviewedCount((c) => c + 1);
    if (correct) setCorrectCount((c) => c + 1);
  };

  const finishTest = () => {
    const finalCorrect = correctCountRef.current;
    const finalReviewed = reviewedCountRef.current;

    setTestRunning(false);
    recordSession(name || 'Anonymous', finalCorrect, finalReviewed);
    setMode('summary');
  };

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#FFF8E1', dark: '#111111' }, 'background');

  return (
    <ThemedView style={styles.container}>

      {mode === 'enter' && (
        <SafeAreaView style={styles.wrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <Text style={[styles.title, { fontFamily: fonts.monoBold }]}>
              One in ten dead bee hives - yaa
            </Text>
            <Text style={styles.beeEmoji}>🐝</Text>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <ThemedText style={[styles.cardTitle, { fontFamily: fonts.mono }]}>
                What’s your name, honey?
              </ThemedText>
              
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor={tint}
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  { 
                    borderColor: tint, 
                    color: textColor, 
                    fontFamily: fonts.mono 
                  }
                ]}
              />
              
              <Pressable
                style={[
                  styles.buttonBase,
                  { backgroundColor: name.trim() ? colors.primary : '#cccccc' }
                ]}
                onPress={() => setMode('choose')}
                disabled={!name.trim()}
              >
                <Text style={[
                  styles.textBase,
                  { 
                    color: name.trim() ? colors.text : '#666666', 
                    fontFamily: fonts.monoBold
                  }
                ]}>
                  Continue
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

      {mode === 'choose' && (
        <View style={{marginTop: 150}}>
          <ThemedText style={styles.welcome}>Welcome, {name}!</ThemedText>
          <ThemedText style={styles.welcomeSub}>Choose your challenge</ThemedText>
          <CustomButton title="Learn Mode" onPress={() => { SAMPLE_HIVES = shuffleArray(SAMPLE_HIVES); setMode('tutorial'); }} />
          <CustomButton title={`Test (${TEST_DURATION}s)`} onPress={() => { SAMPLE_HIVES = shuffleArray(SAMPLE_HIVES); setMode('test'); setTimeLeft(TEST_DURATION); setTestRunning(true); }} />
          <CustomButton title="Back" onPress={() => { setMode('enter'); setName(''); }} />
        </View>
      )}

      {mode === 'tutorial' && (
        <View style={{ marginTop: 30, flex: 1, position: 'relative' }}>
          <SwipeDeck
            items={SAMPLE_HIVES}
            onSwipe={(item, direction) => {
              const pickedHealthy = direction === 'right';
              const correct = item.healthy === pickedHealthy;

              let explanation = '';
              if (correct) {
                explanation = pickedHealthy
                  ? `Correct — No signs of damage or disease`
                  : `Correct — ${item.description}`;
              } else {
                explanation = pickedHealthy
                  ? `Incorrect — ${item.description}`
                  : `Incorrect — No signs of damage or disease`;
              }
              setFeedback({ text: explanation, correct });
            }}
          />

          {feedback ? (
            <View style={styles.overlayModal} pointerEvents="auto">
              <View style={[styles.popupBox, { backgroundColor: feedback.correct ? '#e6ffea' : '#ffe6e6' }]}>
                <ThemedText style={[styles.popupText, { color: feedback.correct ? '#0b7a3a' : '#a30000' }]}>{feedback.text}</ThemedText>
                <View style={{ marginTop: 12 }}>
                  <CustomButton title="Dismiss" onPress={() => setFeedback(null)} />
                </View>
              </View>
            </View>
          ) : (<View />)}

          <View style={{ position: 'absolute', left: 15, right: 15, bottom: 0 }}>
            <View style={{ marginBottom: 110 }}>
              <CustomButton title="Buzzin back" onPress={() => setMode('choose')} />
            </View>
            <View style={styles.arrowRow} pointerEvents="box-none">
              <Pressable style={[styles.arrowButton, { marginRight: 12 }]} onPress={() => {}}>
                <MaterialIcons name="arrow-back-ios" size={36} color={tint} />
                <View>
                  <ThemedText style={styles.arrowLabel}>Swipe</ThemedText>
                  <ThemedText style={styles.arrowLabel}>Unhealthy</ThemedText>
                </View>
              </Pressable>

              <Pressable style={[styles.arrowButton, { marginLeft: 12 }]} onPress={() => {}}>
                <View>
                  <ThemedText style={styles.arrowLabel}>Swipe</ThemedText>
                  <ThemedText style={styles.arrowLabel}>Healthy</ThemedText>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={36} color={tint} />
              </Pressable>
            </View>
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

          <View style={{ position: 'absolute', left: 5, right: 5, bottom: 0 }}>
            
            <View style={{bottom: 100}}>
              <CustomButton title="Buzz Off" onPress={() => { finishTest(); }} />
            </View>
            <View style={styles.arrowRow} pointerEvents="box-none">
              <Pressable style={[styles.arrowButton, { marginRight: 12 }]} onPress={() => {}}>
                <MaterialIcons name="arrow-back-ios" size={30} color={tint} />
                <ThemedText style={styles.arrowLabel}>Unhealthy</ThemedText>
              </Pressable>

              <Pressable style={[styles.arrowButton, { marginLeft: 12 }]} onPress={() => {}}>
                <ThemedText style={styles.arrowLabel}>Healthy</ThemedText>
                <MaterialIcons name="arrow-forward-ios" size={36} color={tint} />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {mode === 'summary' && (
        <View style={[styles.center]}>
          <ThemedText type="title" style={{marginTop: 100, marginBottom: 40}}>Test complete</ThemedText>
          <ThemedText>Score: {correctCount} / {reviewedCount}</ThemedText>
          <CustomButton title="Buzzing Back" onPress={() => { setMode('choose'); setReviewedCount(0); setCorrectCount(0); }} />
        </View>
      )}

    </ThemedView>
  );
}

const colors = {
  primary: '#FFD400',
  text: '#333333',
  background: '#FFFFFF',
  secondary: '#FFF8DC',
};

const styles = StyleSheet.create({
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
    feedbackPopup: {
      position: 'absolute',
      left: 20,
      right: 20,
      top: 24,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    overlayModal: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.35)',
      zIndex: 9999,
      elevation: 9999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    popupBox: {
      width: '86%',
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    popupText: {
      fontSize: 16,
      textAlign: 'center',
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
  arrowRow: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  arrowButton: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 120,
    marginHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLabel: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    bottom: 2,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  beeEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    padding: 12,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonBase: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
