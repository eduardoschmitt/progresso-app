// app/(tabs)/_layout.tsx (ou onde fica seu layout de Tabs)
import { HapticTab } from "@/components/haptic-tab";
import DiagnosticQuizModal from "@/components/quiz/DiagnosticQuizModal";
import { DiagnosticQuizProvider } from "@/context/DiagnosticQuizContext";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

// Breakpoint para colocar o texto ao lado do ícone
const WIDE_BREAKPOINT = 600;

type TabPillProps = {
  source: number;
  focused: boolean;
  title: string;
};

function TabPill({ source, focused, title }: TabPillProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  return (
    <View
      style={[
        styles.pillBase,
        isWide ? styles.pillRow : styles.pillCol,
        focused && styles.pillFocused,
      ]}
    >
      <Image source={source} style={styles.icon} resizeMode="contain" />
      <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <DiagnosticQuizProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E6E6E6",
            height: 84,
            paddingTop: 20,
            paddingBottom: 18,
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabPill
                focused={focused}
                title="Home"
                source={require("@/assets/images/icons/home.webp")}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="conquistas"
          options={{
            title: "Conquistas",
            tabBarIcon: ({ focused }) => (
              <TabPill
                focused={focused}
                title="Conquistas"
                source={require("@/assets/images/icons/trofeu.webp")}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="activities"
          options={{
            title: "Atividades",
            tabBarIcon: ({ focused }) => (
              <TabPill
                focused={focused}
                title="Atividades"
                source={require("@/assets/images/icons/atividades.webp")}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="habits"
          options={{
            title: "Hábitos",
            tabBarIcon: ({ focused }) => (
              <TabPill
                focused={focused}
                title="Hábitos"
                source={require("@/assets/images/icons/habitos.webp")}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ focused }) => (
              <TabPill
                focused={focused}
                title="Perfil"
                source={require("@/assets/images/icons/perfil.webp")}
              />
            ),
          }}
        />
      </Tabs>

      <DiagnosticQuizModal />
    </DiagnosticQuizProvider>
  );
}

const styles = StyleSheet.create({
  // Container base do "pill"
  pillBase: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: 140, // evita quebrar muito em telas pequenas
    gap: 6,
  },
  // Layout empilhado (ícone em cima, texto embaixo)
  pillCol: {
    flexDirection: "column",
  },
  // Layout em linha (ícone ao lado do texto) para telas largas
  pillRow: {
    flexDirection: "row",
  },
  pillFocused: {
    backgroundColor: "#FFEFB0",
    borderWidth: 1,
    borderColor: "#FFD466",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    width: 28,
    height: 28,
  },
  // Estilo do texto conforme seu CSS:
  // color: rgb(124,124,125); font-family: system-ui,...; font-weight: 500;
  label: {
    color: "rgb(124,124,125)",
    fontWeight: "500",
    // Fallbacks de font-family em RN (system-ui não é literalmente suportado):
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: undefined,
    }),
    fontSize: 12,
  },
  labelFocused: {
    // destaca um pouco quando focado
    color: "#6A4B00",
  },
});
