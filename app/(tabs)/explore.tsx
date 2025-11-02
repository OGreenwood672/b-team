import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomButton } from '@/components/ui/custom-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLeaderboard, resetStore, subscribe } from '@/utils/review-store';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function LeaderboardScreen() {
  const [data, setData] = useState(() => getLeaderboard());
  const cardBg = useThemeColor({ light: '#FFF8E1', dark: '#111111' }, 'background');

  useEffect(() => {
    const unsub = subscribe(() => setData(getLeaderboard()));
    return () => {
      unsub();
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F6F3FF', dark: '#2B2433' }}
      headerImage={
        <Image source={require('../../assets/images/bee.png')} style={styles.headerImage} contentFit="cover" />
      }>
      
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Leaderboard</ThemedText>
        <ThemedText style={styles.subtitle}>Top hive reviewers</ThemedText>
        {data.length === 0 && (
          <ThemedText>No reviews yet — be the first!</ThemedText>
        )}

        {data.map((item, index) => {
          const bestCorrect = (item as any).bestCorrect ?? (item as any).correct ?? 0;
          const bestReviewed = (item as any).bestReviewed ?? (item as any).reviews ?? 0;
          return (
            <View 
              key={item.name}
              style={[styles.row, { backgroundColor: cardBg }]}
            >
              <ThemedText style={styles.rank}>{index + 1}.</ThemedText>
              <ThemedText style={styles.name}>{item.name}</ThemedText>
              <ThemedText style={styles.count}>Best: {bestCorrect} / {bestReviewed}</ThemedText>
            </View>
          );
        })}

        <View style={{ marginTop: 8 }}>
          <CustomButton
            title="Reset Leaderboard"
            onPress={() =>
              Alert.alert('Reset leaderboard', 'Are you sure you want to clear all scores?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => resetStore() },
              ])
            }
          />
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  rank: {
    width: 28,
  },
  name: {
    flex: 1,
  },
  count: {
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
    subtitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  headerImage: {
    width: '100%',
    height: 250,
    borderRadius: 0,
    top: 0,
    left: 0,
    position: 'absolute',
  },
});
