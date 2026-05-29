import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { WebViewNavigation } from "react-native-webview";
import WebView from "react-native-webview";
import { getAppEntryUrl, WEBVIEW_USER_AGENT_SUFFIX } from "../lib/config";
import { INJECTED_CLIENT_BOOTSTRAP } from "../lib/injected-script";
import { isAllowedNavigationUrl } from "../lib/navigation";

export function InfomiiWebView() {
  const webViewRef = useRef<WebView>(null);
  const [entryUrl] = useState(() => getAppEntryUrl());
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const onNavigationStateChange = useCallback((event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
    setLoadError(null);
  }, []);

  const handleAndroidBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", handleAndroidBack);
    return () => sub.remove();
  }, [handleAndroidBack]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        source={{ uri: entryUrl }}
        style={styles.webview}
        applicationNameForUserAgent={WEBVIEW_USER_AGENT_SUFFIX}
        injectedJavaScriptBeforeContentLoaded={INJECTED_CLIENT_BOOTSTRAP}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        pullToRefreshEnabled
        setSupportMultipleWindows={false}
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={() => {
          setLoading(true);
          setLoadError(null);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={(event) => {
          setLoading(false);
          setLoadError(event.nativeEvent.description || "ページを読み込めませんでした。");
        }}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 400) {
            setLoadError(`HTTP ${event.nativeEvent.statusCode}`);
          }
        }}
        onShouldStartLoadWithRequest={(request) => isAllowedNavigationUrl(request.url)}
      />

      {loading && !loadError ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : null}

      {loadError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>接続できません</Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <Text style={styles.errorHint}>{entryUrl}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoadError(null);
              setLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryLabel}>再試行</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(241, 245, 249, 0.85)",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f8fafc",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0d9488",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
