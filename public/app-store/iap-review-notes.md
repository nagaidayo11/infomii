# IAP 審査用スクリーンショット・メモ（App Store Connect）

## スクリーンショット

| ファイル | サイズ | 用途 |
|---------|--------|------|
| `iap-review-screenshot-1290x2796.jpg` | 1290×2796 JPEG | **4商品すべて**の「審査に関する情報」に同じ画像をアップロード可 |
| `screenshots/raw/06-billing.png` | 1290×2796 PNG | 再生成元（`APP_STORE_CAPTURE_ONLY=06 npm run app-store:capture-screenshots`） |

審査用スクショは **Plan タブの実画面** で問題ありません（プロモーション画像とは別物です）。

### 再生成

```bash
npm run dev   # 別ターミナル
APP_STORE_CAPTURE_ONLY=06 npm run app-store:capture-screenshots
# JPEG へ変換（macOS）
sips -s format jpeg -s formatOptions 90 \
  public/app-store/screenshots/raw/06-billing.png \
  --out public/app-store/iap-review-screenshot-1290x2796.jpg
```

---

## 審査メモ（共通ベース）

App Review Information のパスワード欄に **審査用パスワード** を記載してください（メモ本文には書かない）。

### 全商品共通（コピペ用・英語）

```
Infomii is a WebView shell for https://www.infomii.com (responsive web app).

HOW TO TEST SUBSCRIPTIONS (App Store IAP only on iOS)
1. Sign in with the demo account (email/password in App Review Information).
2. Open the "Plan" tab (プラン) in the bottom navigation.
3. Toggle Monthly / Annual at the top to see prices.
4. Tap "Proを申し込む (App Store)" or "Businessを申し込む (App Store)" to purchase via StoreKit.
5. "購入を復元" (Restore Purchases) is on the same screen.

REQUIRED SUBSCRIPTION DISCLOSURES (on Plan tab)
- Subscription titles: Pro / Business
- Duration: 1 month or 1 year (user selects Monthly / Annual toggle)
- Price: shown on each tier (tax included, JPY)
- Terms of Use: https://www.infomii.com/terms
- Privacy Policy: https://www.infomii.com/privacy
(Links at the bottom of the Plan screen.)

PLAN FEATURES
- Pro: up to 10 published pages, analytics.
- Business: unlimited pages, team invites, auto-translation, dynamic blocks.

WEB (STRIPE) SUBSCRIBERS
Users who subscribed on the website see their plan after login but cannot purchase via Stripe inside the iOS app.

ACCOUNT DELETION
Settings (設定) → Delete account (アカウントを削除).
```

---

## 商品ごとの審査メモ（全文・コピペ用）

App Review Information のパスワード欄に **審査用パスワード** を記載してください（メモ本文には書かない）。

### Pro Monthly (`com.infomii.app.pro.monthly`)

```
Infomii is a WebView shell for https://www.infomii.com.

HOW TO TEST THIS SUBSCRIPTION (App Store IAP)
1. Sign in with the demo account (email/password in App Review Information).
2. Open the "Plan" tab (プラン) in the bottom navigation.
3. Tap "Monthly" (月払い) at the top to show monthly prices.
4. Tap "Proを申し込む (App Store)" to purchase Pro Monthly via StoreKit.
5. "購入を復元" (Restore Purchases) is on the same screen.

THIS PRODUCT
Pro Monthly — ¥1,280/month, auto-renewable (Product ID: com.infomii.app.pro.monthly).

REQUIRED DISCLOSURES (visible on Plan tab)
- Subscription name: Pro
- Duration: 1 month
- Price: ¥1,280/month (tax included)
- Terms of Use: https://www.infomii.com/terms
- Privacy Policy: https://www.infomii.com/privacy

PLAN FEATURES
Pro: up to 10 published pages, analytics.

NOTES
- New purchases on iOS use App Store IAP only (no Stripe checkout in the app).
- Existing web (Stripe) subscribers see their plan after login but cannot purchase via Stripe in the iOS app.
- Account deletion: Settings (設定) → Delete account.
```

### Pro Annual (`com.infomii.app.pro.annual`)

```
Infomii is a WebView shell for https://www.infomii.com.

HOW TO TEST THIS SUBSCRIPTION (App Store IAP)
1. Sign in with the demo account (email/password in App Review Information).
2. Open the "Plan" tab (プラン) in the bottom navigation.
3. Tap "Annual" (年払い) at the top to show annual prices.
4. Tap "Proを申し込む (App Store)" to purchase Pro Annual via StoreKit.
5. "購入を復元" (Restore Purchases) is on the same screen.

THIS PRODUCT
Pro Annual — ¥12,800/year, auto-renewable (Product ID: com.infomii.app.pro.annual).

REQUIRED DISCLOSURES (visible on Plan tab)
- Subscription name: Pro
- Duration: 1 year
- Price: ¥12,800/year (tax included)
- Terms of Use: https://www.infomii.com/terms
- Privacy Policy: https://www.infomii.com/privacy

PLAN FEATURES
Pro: up to 10 published pages, analytics.

NOTES
- New purchases on iOS use App Store IAP only (no Stripe checkout in the app).
- Existing web (Stripe) subscribers see their plan after login but cannot purchase via Stripe in the iOS app.
- Account deletion: Settings (設定) → Delete account.
```

### Business Monthly (`com.infomii.app.business.monthly`)

```
Infomii is a WebView shell for https://www.infomii.com.

HOW TO TEST THIS SUBSCRIPTION (App Store IAP)
1. Sign in with the demo account (email/password in App Review Information).
2. Open the "Plan" tab (プラン) in the bottom navigation.
3. Tap "Monthly" (月払い) at the top to show monthly prices.
4. Tap "Businessを申し込む (App Store)" to purchase Business Monthly via StoreKit.
5. "購入を復元" (Restore Purchases) is on the same screen.

THIS PRODUCT
Business Monthly — ¥3,480/month, auto-renewable (Product ID: com.infomii.app.business.monthly).

REQUIRED DISCLOSURES (visible on Plan tab)
- Subscription name: Business
- Duration: 1 month
- Price: ¥3,480/month (tax included)
- Terms of Use: https://www.infomii.com/terms
- Privacy Policy: https://www.infomii.com/privacy

PLAN FEATURES
Business: unlimited published pages, team invites, auto-translation, dynamic blocks.

NOTES
- New purchases on iOS use App Store IAP only (no Stripe checkout in the app).
- Existing web (Stripe) subscribers see their plan after login but cannot purchase via Stripe in the iOS app.
- Account deletion: Settings (設定) → Delete account.
```

### Business Annual (`com.infomii.app.business.annual`)

```
Infomii is a WebView shell for https://www.infomii.com.

HOW TO TEST THIS SUBSCRIPTION (App Store IAP)
1. Sign in with the demo account (email/password in App Review Information).
2. Open the "Plan" tab (プラン) in the bottom navigation.
3. Tap "Annual" (年払い) at the top to show annual prices.
4. Tap "Businessを申し込む (App Store)" to purchase Business Annual via StoreKit.
5. "購入を復元" (Restore Purchases) is on the same screen.

THIS PRODUCT
Business Annual — ¥34,800/year, auto-renewable (Product ID: com.infomii.app.business.annual).

REQUIRED DISCLOSURES (visible on Plan tab)
- Subscription name: Business
- Duration: 1 year
- Price: ¥34,800/year (tax included)
- Terms of Use: https://www.infomii.com/terms
- Privacy Policy: https://www.infomii.com/privacy

PLAN FEATURES
Business: unlimited published pages, team invites, auto-translation, dynamic blocks.

NOTES
- New purchases on iOS use App Store IAP only (no Stripe checkout in the app).
- Existing web (Stripe) subscribers see their plan after login but cannot purchase via Stripe in the iOS app.
- Account deletion: Settings (設定) → Delete account.
```

---

## 商品ごとの追記（1行・旧形式）

各サブスクリプションの審査メモ末尾に **1行だけ** 追記する場合:

---

## App バージョン用 Review Notes（概要とは別）

**一般 → App Review → Notes** にも以下を追記:

```
Terms of Use (EULA): https://www.infomii.com/terms
Privacy Policy: https://www.infomii.com/privacy
IAP promotional images removed (not used for App Store promotion).
```
