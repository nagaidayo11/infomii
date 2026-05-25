import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootAuthGuard } from "@/components/RootAuthGuard";
import { AuthProvider } from "@/stores/auth-provider";
import { SavedProvider } from "@/stores/saved-store";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SavedProvider>
          <StatusBar style="dark" />
          <RootAuthGuard />
        </SavedProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
