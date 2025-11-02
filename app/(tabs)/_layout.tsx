import { Tabs } from 'expo-router';
import React from 'react';

import { useAppFont } from '@/components/font-provider';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { fonts, fontKey } = useAppFont();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontFamily: (fonts as any)[fontKey] },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="check-circle" size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="leaderboard" size={size ?? 28} color={color} />,
        }}
      />
    </Tabs>
  );
}
