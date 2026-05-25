import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView, type WebViewProps } from "react-native-webview";
import { colors } from "@/design/colors";
import {
  buildSupabaseSessionInjectionScript,
  getSessionPayloadForWebView,
} from "@/lib/supabase-auth-bridge";

type Props = Omit<WebViewProps, "source"> & {
  uri: string;
};

export function AuthenticatedWebView({ uri, ...rest }: Props) {
  const [sessionPayload, setSessionPayload] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const payload = await getSessionPayloadForWebView();
      if (!active) return;
      setSessionPayload(payload);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [uri]);

  const injectScript = buildSupabaseSessionInjectionScript();

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accentDeep} />
      </View>
    );
  }

  return (
    <WebView
      {...rest}
      source={{ uri }}
      injectedJavaScriptBeforeContentLoaded={
        sessionPayload && injectScript
          ? `window.__INFOMII_MOBILE_SESSION__ = ${JSON.stringify(sessionPayload)}; ${injectScript}`
          : undefined
      }
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmWhite,
  },
});
