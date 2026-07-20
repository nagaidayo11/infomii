import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";
import { COMMERCE_PRICING_LINE } from "@/lib/plan-pricing";

export type LegalVariant = "web" | "app";

function LegalVariantBanner({ variant }: { variant: LegalVariant }) {
  const variantLabel = variant === "app" ? "iOS アプリ" : "Web サイト";

  return (
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      本ページは <strong>{variantLabel}</strong> 向けの記載です。Infomii
      は同一アカウントで Web と iOS アプリの両方を利用できますが、お支払い・解約方法は利用環境により異なります。
      {variant === "app" ? (
        <>
          {" "}
          Web サイト向けの記載は
          <Link href="/commerce" className="text-emerald-700 underline">
            こちら
          </Link>
          をご覧ください。
        </>
      ) : (
        <>
          {" "}
          iOS アプリ向けの記載は
          <Link href="/commerce?client=app" className="text-emerald-700 underline">
            こちら
          </Link>
          をご覧ください。
        </>
      )}
    </p>
  );
}

function CollectedInfoSection({ variant }: { variant: LegalVariant }) {
  if (variant === "app") {
    return (
      <section>
        <h2 className="text-base font-semibold text-slate-900">1. 取得する情報（iOS アプリ）</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>アカウント情報（メールアドレス、表示名、認証プロバイダ識別子）</li>
          <li>作成したページ・カード・画像などのコンテンツ</li>
          <li>
            端末・アプリ情報（OS、端末種別、アプリバージョン、プッシュ通知用トークン（通知を許可した場合）など）
          </li>
          <li>
            App Store 経由のサブスクリプションに関する情報（製品 ID、取引 ID、契約状態など。決済は Apple
            が処理し、当社はクレジットカード番号等の支払手段の詳細を取得・保持しません）
          </li>
          <li>
            Web サイト（ブラウザ）で Stripe により既に契約している場合、当社は Stripe
            上の契約状態を参照します（カード情報は Stripe が処理し、当社は保持しません）
          </li>
          <li>お問い合わせ内容</li>
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900">1. 取得する情報（Web サイト）</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>アカウント情報（メールアドレス、表示名、認証プロバイダ識別子）</li>
        <li>作成したページ・カード・画像などのコンテンツ</li>
        <li>公開ページの閲覧ログ（閲覧日時、参照元、端末・ブラウザ情報など）</li>
        <li>
          有料プランの契約・決済に関する情報（Stripe が決済を処理。当社はクレジットカード番号等の支払手段の詳細を保持しません）
        </li>
        <li>お問い合わせ内容</li>
      </ul>
    </section>
  );
}

function ThirdPartySection({ variant }: { variant: LegalVariant }) {
  if (variant === "app") {
    return (
      <section>
        <h2 className="text-base font-semibold text-slate-900">3. 第三者サービス（iOS アプリ）</h2>
        <p>当アプリは次のサービスを利用します。各サービスのポリシーもご確認ください。</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Supabase（認証・データベース・ストレージ）</li>
          <li>
            Apple（Sign in with Apple、App Store 課金、App Store Server Notifications による契約状態の確認）
          </li>
          <li>Google（OAuth ログイン）</li>
          <li>Expo（プッシュ通知の配信）</li>
          <li>AI 機能利用時の推論 API（ページ生成など。入力テキストを送信する場合があります）</li>
          <li>
            Stripe（Web サイトで既に Stripe 契約がある場合の契約状態参照のみ。アプリ内の新規課金は App Store
            経由です）
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900">3. 第三者サービス（Web サイト）</h2>
      <p>当 Web サイトは次のサービスを利用します。各サービスのポリシーもご確認ください。</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Supabase（認証・データベース・ストレージ）</li>
        <li>Stripe（決済・サブスクリプション管理）</li>
        <li>Google（OAuth ログイン、本番環境では Google Analytics による利用分析）</li>
        <li>Apple（Sign in with Apple）</li>
        <li>AI 機能利用時の推論 API（ページ生成など。入力テキストを送信する場合があります）</li>
      </ul>
    </section>
  );
}

export function PrivacyPolicySections({ variant = "web" }: { variant?: LegalVariant }) {
  return (
    <>
      <LegalVariantBanner variant={variant} />
      <CollectedInfoSection variant={variant} />
      <section>
        <h2 className="text-base font-semibold text-slate-900">2. 利用目的</h2>
        <p>
          サービス提供、本人確認、請求・契約管理、障害対応、品質改善、重要なお知らせ、不正利用防止、プッシュ通知の送信（アプリで許可した場合）のために利用します。
        </p>
      </section>
      <ThirdPartySection variant={variant} />
      <section>
        <h2 className="text-base font-semibold text-slate-900">4. 第三者提供</h2>
        <p>
          法令に基づく場合を除き、本人の同意なく第三者に提供しません。業務委託先には、業務遂行に必要な範囲で提供することがあります。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">5. 保存期間</h2>
        <p>
          利用目的の達成に必要な期間、または法令で定められた期間保存し、その後削除または匿名化します。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">6. 開示・訂正・削除</h2>
        <p>
          本人からの請求に応じ、法令に従い合理的な範囲で対応します。アプリの「設定」からアカウント削除が可能です。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">7. お問い合わせ</h2>
        <p>
          連絡先:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </>
  );
}

export function CommerceDisclosureTable({ variant = "web" }: { variant?: LegalVariant }) {
  const refundHref = "/refund";
  const privacyHref = variant === "app" ? "/privacy?client=app" : "/privacy";

  return (
  <>
    <LegalVariantBanner variant={variant} />
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm text-slate-700">
        <tbody>
          <tr className="border-b border-slate-200">
            <th className="w-44 bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売事業者名</th>
            <td className="px-4 py-3">Infomii</td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">運営責任者</th>
            <td className="px-4 py-3">永井 克範</td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">所在地</th>
            <td className="px-4 py-3">請求があった場合に遅滞なく開示します。</td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">連絡先</th>
            <td className="px-4 py-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline">
                {SUPPORT_EMAIL}
              </a>
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売価格（税込）</th>
            <td className="px-4 py-3">
              {COMMERCE_PRICING_LINE}
              <br />
              {variant === "app" ? (
                <>
                  最新の価格はアプリの
                  <Link href="/settings/billing?client=app" className="text-emerald-700 underline">
                    プラン画面
                  </Link>
                  に表示します。
                </>
              ) : (
                <>
                  最新の価格は{" "}
                  <Link href="/lp/business#pricing-plans" className="text-emerald-700 underline">
                    料金ページ
                  </Link>
                  に表示します。
                </>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">商品代金以外の必要料金</th>
            <td className="px-4 py-3">インターネット接続に必要な通信料金等は利用者負担です。</td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払方法</th>
            <td className="px-4 py-3">
              {variant === "app" ? (
                <>
                  App Store アプリ内課金（In-App Purchase）。Apple ID
                  に登録されたお支払い方法（クレジットカード等）が Apple 経由で利用されます。当社はカード番号を保持しません。
                </>
              ) : (
                <>クレジットカード決済（Stripe Checkout）</>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払時期</th>
            <td className="px-4 py-3">
              {variant === "app" ? (
                <>
                  有料プラン申込時に初回課金され、選択した更新期間（月額または年額）ごとに App Store
                  経由で自動更新されます。課金タイミングは Apple のサブスクリプション規約に従います。
                </>
              ) : (
                <>
                  有料プラン申込時に初回課金され、選択した更新期間（月額または年額）ごとに自動更新課金されます。
                </>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">提供時期</th>
            <td className="px-4 py-3">決済完了後、直ちに有料機能（公開上限拡張等）を利用できます。</td>
          </tr>
          <tr className="border-b border-slate-200">
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">解約・返金</th>
            <td className="px-4 py-3">
              {variant === "app" ? (
                <>
                  解約・プラン変更は、アプリのプラン画面の「App Store
                  で解約・プラン変更」、または iPhone の「設定」→「Apple ID」→「サブスクリプション」から行えます。
                  <br />
                  解約後も契約期間満了までは有料機能を利用でき、次回更新日以降は自動更新が停止されます。
                  <br />
                  返金は Apple のポリシーに従います。詳細は
                  <Link href={refundHref} className="text-emerald-700 underline">
                    返金・キャンセルポリシー
                  </Link>
                  をご確認ください。
                </>
              ) : (
                <>
                  解約は Stripe Customer Portal または管理画面の請求設定からいつでも可能です。
                  <br />
                  解約後は次回請求日以降に自動更新が停止されます。
                  <br />
                  返金条件は
                  <Link href={refundHref} className="text-emerald-700 underline">
                    返金・キャンセルポリシー
                  </Link>
                  をご確認ください。
                </>
              )}
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">動作環境</th>
            <td className="px-4 py-3">
              {variant === "app" ? (
                <>iPhone / iPad（iOS 15.1 以降）。App Store からインストールした Infomii iOS アプリ。</>
              ) : (
                <>最新の主要ブラウザ（Chrome / Safari / Edge）でご利用ください。</>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      関連ページ:
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/terms" className="text-emerald-700 underline">
          利用規約
        </Link>
        <Link href={privacyHref} className="text-emerald-700 underline">
          プライバシーポリシー
        </Link>
        <Link href={refundHref} className="text-emerald-700 underline">
          返金・キャンセルポリシー
        </Link>
        <Link href={variant === "app" ? "/login?client=app" : "/login"} className="text-emerald-700 underline">
          ログイン
        </Link>
      </div>
    </div>
  </>
  );
}

export function TermsOfServiceSections() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第1条（適用）</h2>
        <p>
          本規約は、Infomii（以下「当サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ当サービスを利用するものとします。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第2条（アカウント）</h2>
        <p>
          利用者は正確な情報で登録し、自己の責任で認証情報を管理します。第三者への貸与・譲渡は禁止します。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第3条（禁止事項）</h2>
        <p>
          法令違反、公序良俗違反、第三者の権利侵害、不正アクセス、虚偽・違法な公開コンテンツの掲載、サービス運営を妨害する行為を禁止します。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第4条（有料プラン）</h2>
        <p>
          有料プランの内容・価格・更新・解約条件は料金ページおよび特定商取引法に基づく表記に従います。iOS
          アプリからの新規申し込みは、App Store の方針に従い Web サイトで行う場合があります。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第5条（サービス提供の停止）</h2>
        <p>
          保守、障害、外部サービスの停止等により、事前通知なく当サービスの全部または一部を停止することがあります。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第6条（免責）</h2>
        <p>
          当サービスは現状有姿で提供され、特定目的適合性や完全性を保証しません。当サービス利用による損害について、当方の故意または重過失を除き責任を負いません。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第7条（規約変更）</h2>
        <p>
          本規約は必要に応じて変更されることがあります。変更後の規約は本ページ掲載時点から効力を生じます。
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">第8条（準拠法・管轄）</h2>
        <p>
          本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は当方所在地を管轄する裁判所を第一審の専属的合意管轄とします。
        </p>
      </section>
    </>
  );
}
