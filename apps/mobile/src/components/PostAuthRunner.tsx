import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { runSessionBootstrap } from "@/lib/post-auth";
import { useAuth } from "@/stores/auth-provider";

/** セッション復元・OAuth 復帰後に招待 redeem / 施設スコープを整える */
export function PostAuthRunner() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!user) {
      ranRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    const root = segments[0];
    if (root === "auth" || root === "invite") return;
    if (ranRef.current) return;
    ranRef.current = true;
    void runSessionBootstrap(router);
  }, [loading, user, segments, router]);

  return null;
}
