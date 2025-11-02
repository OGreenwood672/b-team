import { Image as ExpoImage } from 'expo-image'; // <-- 1. IMPORT & RENAME
import React, { useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// --- 2. CREATE THE ANIMATED VERSION ---
// This goes *outside* your component, at the top level of the file
const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

type HiveItem = {
  id: string;
  uri: string;
  caption?: string;
  isHealthy?: boolean;
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
  
  // --- 3. ADD THE 'useEffect' FIX ---
  // This resets the pan *after* the state updates, fixing the "flash"
  React.useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [topItem?.id, pan]); // Resets when the top item's ID changes

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

      {(() => {
        const rendered = items.slice(0, 3).reverse();
        return rendered.map((item, index) => {
          const isTop = index === rendered.length - 1;
          const cardStyle = isTop ? [styles.card, styles.topCard, animatedStyle] : [styles.card, { top: -index * 8, left: index * 6 }];
          
          return (
            <Animated.View key={item.id} style={cardStyle as any}>
              {isTop ? (
                <Animated.View {...panResponder.panHandlers} style={{ flex: 1 }}>
                  
                  {/* --- 4. USE THE NEW ANIMATED COMPONENT --- */}
                  <AnimatedExpoImage
                    source={{ uri: item.uri }}
                    style={styles.image}
                    contentFit="cover" // Use expo-image props
                  />
                  
                  {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
                </Animated.View>
              ) : (
                <View style={{ flex: 1 }}>
                
                  {/* --- 5. USE THE REGULAR 'ExpoImage' --- */}
                  <ExpoImage 
                    source={{ uri: item.uri }} 
                    style={styles.image} 
                    contentFit="cover" 
                  />
                </View>
              )}
            </Animated.View>
          );
        });
      })()}
    </View>
  );
}

// --- (Styles are unchanged) ---
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