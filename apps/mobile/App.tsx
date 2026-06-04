import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { InfomiiWebView } from "./src/components/InfomiiWebView";
import { registerForPushNotificationsAsync } from "./src/lib/push-notifications";

/**
 * Infomii native shell — WebView loads the responsive web app with ?client=app.
 */
export default function App() {
  useEffect(() => {
    void registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <InfomiiWebView />
    </SafeAreaProvider>
  );
}
