import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  DevSettings,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { WebViewNavigation } from "react-native-webview";
import WebView from "react-native-webview";
import {
  getAppEntryUrl,
  resolveWebOrigin,
  WEBVIEW_USER_AGENT_SUFFIX,
} from "../lib/config";
import { buildInjectedBootstrap } from "../lib/injected-script";
import { handleIapBridgeMessage } from "../lib/iap-bridge";
import { triggerNativeHaptic } from "../lib/haptic-bridge";
import { shareViaNativeSheet } from "../lib/share-bridge";
import { isAllowedNavigationUrl } from "../lib/navigation";

const LOAD_TIMEOUT_MS = 20_000;

export function InfomiiWebView() {
  const insets = useSafeAreaInsets();
  const originResolution = resolveWebOrigin();
  const [entryUrl] = useState(() =>
    originResolution.ok
      ? getAppEntryUrl()
      : `${originResolution.origin}/dashboard?client=app`,
  );

  const injectedBeforeLoad = useMemo(
    () => buildInjectedBootstrap(insets),
    [insets.top, insets.bottom, insets.left, insets.right],
  );

  const webViewRef = useRef<WebView>(null);
  const hasLoadedOnceRef = useRef(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(originResolution.ok);
  const [loadError, setLoadError] = useState<string | null>(
    originResolution.ok ? null : originResolution.message,
  );

  const applySafeAreaToWeb = useCallback(() => {
    webViewRef.current?.injectJavaScript(injectedBeforeLoad);
  }, [injectedBeforeLoad]);

  useEffect(() => {
    applySafeAreaToWeb();
  }, [applySafeAreaToWeb]);

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const finishLoading = useCallback(() => {
    clearLoadTimeout();
    hasLoadedOnceRef.current = true;
    setLoading(false);
    applySafeAreaToWeb();
  }, [applySafeAreaToWeb, clearLoadTimeout]);

  const armLoadTimeout = useCallback(() => {
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setLoadError(
        __DEV__
          ? "読み込みがタイムアウトしました。Next.js が起動しているか、.env の IP が正しいか確認してください。"
          : "読み込みがタイムアウトしました。通信環境を確認して、もう一度お試しください。",
      );
    }, LOAD_TIMEOUT_MS);
  }, [clearLoadTimeout]);

  useEffect(() => {
    if (!originResolution.ok) return;
    armLoadTimeout();
    return clearLoadTimeout;
  }, [armLoadTimeout, clearLoadTimeout, originResolution.ok]);

  const onNavigationStateChange = useCallback((event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
    if (loadError && event.url && !event.url.startsWith("about:")) {
      setLoadError(null);
    }
  }, [loadError]);

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

  const webViewProps = {
    ref: webViewRef,
    source: { uri: entryUrl },
    style: styles.webview,
    applicationNameForUserAgent: WEBVIEW_USER_AGENT_SUFFIX,
    injectedJavaScriptBeforeContentLoaded: injectedBeforeLoad,
    sharedCookiesEnabled: true,
    thirdPartyCookiesEnabled: true,
    allowsBackForwardNavigationGestures: true,
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: true,
    pullToRefreshEnabled: true,
    setSupportMultipleWindows: false,
    onNavigationStateChange,
    onLoadStart: () => {
      if (!hasLoadedOnceRef.current) {
        setLoading(true);
        setLoadError(null);
        armLoadTimeout();
      }
    },
    onLoadEnd: () => {
      applySafeAreaToWeb();
      if (!hasLoadedOnceRef.current) return;
    },
    onMessage: (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type?: string };
        if (data.type === "app-shell-ready") {
          finishLoading();
          return;
        }
        if (data.type === "app-haptic") {
          triggerNativeHaptic(
            (data as { style?: string }).style as
              | "light"
              | "medium"
              | "heavy"
              | "success"
              | "warning"
              | "selection"
              | undefined,
          );
          return;
        }
        if (data.type === "app-share") {
          const shareData = data as { title?: string; url?: string; message?: string };
          if (shareData.url) {
            void shareViaNativeSheet({
              title: shareData.title,
              url: shareData.url,
              message: shareData.message,
            });
          }
          return;
        }
        if (data.type === "iap-purchase" || data.type === "iap-restore") {
          void handleIapBridgeMessage(event.nativeEvent.data, webViewRef);
          return;
        }
      } catch {
        /* ignore non-JSON messages */
      }
    },
    onError: (event: { nativeEvent: { description?: string } }) => {
      finishLoading();
      setLoadError(event.nativeEvent.description || "ページを読み込めませんでした。");
    },
    onHttpError: (event: { nativeEvent: { statusCode: number } }) => {
      if (event.nativeEvent.statusCode >= 400) {
        finishLoading();
        setLoadError(`HTTP ${event.nativeEvent.statusCode}`);
      }
    },
    onShouldStartLoadWithRequest: (request: { url: string }) =>
      isAllowedNavigationUrl(request.url),
    ...(Platform.OS === "ios"
      ? {
          contentInsetAdjustmentBehavior: "never" as const,
          automaticallyAdjustsScrollIndicatorInsets: false,
        }
      : {}),
  };

  if (!originResolution.ok) {
    return (
      <SafeAreaView style={styles.root} edges={[]}>
        <StatusBar style="auto" translucent backgroundColor="transparent" />
        <ConfigErrorPanel
          title="設定を直してください"
          message={originResolution.message}
          onRetry={() => DevSettings.reload()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <View
        style={[
          styles.webviewFrame,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <WebView {...webViewProps} />
      </View>

      {loading && !loadError ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingLabel}>読み込み中…</Text>
        </View>
      ) : null}

      {loadError ? (
        <ConfigErrorPanel
          title="接続できません"
          message={loadError}
          onRetry={() => {
            setLoadError(null);
            hasLoadedOnceRef.current = false;
            setLoading(true);
            armLoadTimeout();
            webViewRef.current?.reload();
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ConfigErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorOverlay}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryLabel}>再試行</Text>
      </Pressable>
      {__DEV__ ? (
        <Text style={styles.errorFootnote}>
          実機開発: ルートで npm run dev:lan → apps/mobile で npm run restart（シミュレータは npm run ios）
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webviewFrame: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 24,
  },
  loadingLabel: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: 20,
  },
  errorFootnote: {
    marginTop: 16,
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
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
