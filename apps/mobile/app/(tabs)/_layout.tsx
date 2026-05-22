import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { colors } from "@/design/colors";

type TabIcon = keyof typeof Ionicons.glyphMap;

function tabIcon(name: TabIcon, focused: boolean) {
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? colors.accentDeep : colors.inkFaint}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentDeep,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => tabIcon(focused ? "home" : "home-outline", focused),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => tabIcon(focused ? "compass" : "compass-outline", focused),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => tabIcon(focused ? "add-circle" : "add-circle-outline", focused),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => tabIcon(focused ? "bookmark" : "bookmark-outline", focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => tabIcon(focused ? "person" : "person-outline", focused),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    backgroundColor: Platform.OS === "android" ? "rgba(250,252,253,0.92)" : "transparent",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: Platform.OS === "ios" ? 0 : 8,
  },
});
