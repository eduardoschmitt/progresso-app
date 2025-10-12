import { Tabs } from 'expo-router';
import React from 'react';

import DiagnosticQuizModal from '@/components/quiz/DiagnosticQuizModal';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DiagnosticQuizProvider } from '@/context/DiagnosticQuizContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <DiagnosticQuizProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Conquistas',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'Atividades',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Hábitos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="leaf.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
          }}
        />
      </Tabs>
      <DiagnosticQuizModal />
    </DiagnosticQuizProvider>
  );
}
