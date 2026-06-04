import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";

export function PrivacyPolicySections() {
  return (
  <>
    <section>
      <h2 className="text-base font-semibold text-slate-900">1. 取得する情報</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>アカウント情報（メールアドレス、表示名、認証プロバイダ識別子）</li>
        <li>作成したページ・カード・画像などのコンテンツ</li>
        <li>公開ページの閲覧ログ（閲覧日時、参照元、端末・ブラウザ情報など）</li>
        <li>決済に必要な情報（Stripe が処理。当社はカード番号を保持しません）</li>
        <li>お問い合わせ内容</li>
      </ul>
    </section>
    <section>
      <h2 className="text-base font-semibold text-slate-900">2. 利用目的</h2>
      <p>
        サービス提供、本人確認、請求・契約管理、障害対応、品質改善、重要なお知らせ、不正利用防止のために利用します。
      </p>
    </section>
    <section>
      <h2 className="text-base font-semibold text-slate-900">3. 第三者サービス</h2>
      <p>当サービスは次のサービスを利用します。各サービスのポリシーもご確認ください。</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Supabase（認証・データベース・ストレージ）</li>
        <li>Stripe（決済・サブスクリプション管理）</li>
        <li>Google（OAuth ログイン、本番環境では Google Analytics による利用分析）</li>
        <li>Apple（Sign in with Apple）</li>
        <li>AI 機能利用時の推論 API（ページ生成など。入力テキストを送信する場合があります）</li>
      </ul>
    </section>
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
