import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/stores/auth-provider";
import { SavedProvider } from "@/stores/saved-store";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SavedProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
            <Stack.Screen
              name="itinerary/[id]"
              options={{ animation: "slide_from_right", presentation: "card" }}
            />
          </Stack>
        </SavedProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
