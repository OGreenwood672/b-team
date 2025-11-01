import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type HiveItem = {
  id: string;
  uri: string;
  caption?: string;
};

type Props = {
  items: HiveItem[];
  onSwipe?: (item: HiveItem, direction: 'left' | 'right') => void;
};

export default function SwipeDeck({ items: initialItems, onSwipe }: Props) {
  const [items, setItems] = useState<HiveItem[]>(initialItems);

  const topItem = items[0];

  // Animated values for the top card
  const pan = React.useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-25deg', '0deg', '25deg'],
    extrapolate: 'clamp',
  });

  const handleSwipeComplete = (dir: 'left' | 'right') => {
    if (!topItem) return;
    onSwipe?.(topItem, dir);
    setItems((prev) => prev.slice(1));
    // reset position for next card
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const movedX = gesture.dx;
        const absX = Math.abs(movedX);
        if (absX > SWIPE_THRESHOLD) {
          const toRight = movedX > 0;
          Animated.timing(pan, {
            toValue: { x: (toRight ? SCREEN_WIDTH : -SCREEN_WIDTH) * 1.4, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => handleSwipeComplete(toRight ? 'right' : 'left'));
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const animatedStyle: any = {
    transform: [...pan.getTranslateTransform(), { rotate }],
  };

  return (
    <View style={styles.container}>
      {items.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No more hives to review</Text>
        </View>
      )}

      {items
        .slice(0, 3)
        .reverse()
        .map((item, index) => {
          const isTop = index === 2 || (items.length === 1 && index === 0);
          const cardStyle = isTop ? [styles.card, styles.topCard, animatedStyle] : [styles.card, { top: -index * 8, left: index * 6 }];
          return (
            <Animated.View key={item.id} style={cardStyle as any}>
              {isTop ? (
                <Animated.View {...panResponder.panHandlers} style={{ flex: 1 }}>
                  <Animated.Image source={{ uri: item.uri } as any} style={styles.image as any} />
                  {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
                </Animated.View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
                </View>
              )}
            </Animated.View>
          );
        })}
    </View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.3);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: CARD_HEIGHT + 40,
    marginTop: 12,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  topCard: {
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_HEIGHT,
  },
  emptyText: {
    color: '#666',
  },
});
