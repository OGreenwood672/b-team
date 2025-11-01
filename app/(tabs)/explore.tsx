import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLeaderboard, subscribe } from '@/utils/review-store';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
      headerImage={<IconSymbol size={220} color="#8A63FF" name="star" style={styles.headerImage} />}>
      
      <ThemedView style={styles.container}>
        <ThemedText type="title">Leaderboard</ThemedText>
        <ThemedText type="subtitle">Top hive reviewers</ThemedText>
        {data.length === 0 && (
          <ThemedText>No reviews yet — be the first!</ThemedText>
        )}

        {data.map((item, index) => (
          <View 
            key={item.name}
            style={[styles.row, { backgroundColor: cardBg }]}
          >
            <ThemedText style={styles.rank}>{index + 1}.</ThemedText>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            <ThemedText style={styles.count}>{item.reviews} reviews</ThemedText>
          </View>
        ))}

        {/* <CustomButton title="Reset Leaderboard" onPress={() => resetStore()} /> */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  headerImage: {
    bottom: -30,
    left: -20,
    position: 'absolute',
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
});
