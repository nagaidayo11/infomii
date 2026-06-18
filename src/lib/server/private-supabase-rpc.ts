import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type PrivateRpcClient = ReturnType<typeof getSupabaseAdminServerClient> & {
  schema: (schema: string) => {
    rpc: (
      fn: string,
      args?: Record<string, unknown>,
    ) => ReturnType<ReturnType<typeof getSupabaseAdminServerClient>["rpc"]>;
  };
};

function privateRpc() {
  return getSupabaseAdminServerClient() as PrivateRpcClient;
}

export async function ensureHotelSubscriptionRpc(hotelId: string): Promise<void> {
  const { error } = await privateRpc()
    .schema("private")
    .rpc("ensure_hotel_subscription", { target_hotel_id: hotelId });
  if (error) {
    throw error;
  }
}

export async function bootstrapUserWorkspaceRpc(
  callerUserId: string,
  defaultName: string | null,
): Promise<string> {
  const { data, error } = await privateRpc()
    .schema("private")
    .rpc("bootstrap_user_workspace", {
      caller_user_id: callerUserId,
      default_name: defaultName,
    });
  if (error) {
    throw error;
  }
  if (typeof data !== "string" || !data) {
    throw new Error("ワークスペースの作成に失敗しました");
  }
  return data;
}

export async function redeemHotelInviteRpc(
  callerUserId: string,
  inputCode: string,
): Promise<string> {
  const { data, error } = await privateRpc()
    .schema("private")
    .rpc("redeem_hotel_invite", {
      caller_user_id: callerUserId,
      input_code: inputCode,
    });
  if (error) {
    throw error;
  }
  if (typeof data !== "string" || !data) {
    throw new Error("招待コードの適用に失敗しました");
  }
  return data;
}
