# imgay.lgbt

LGBTQ+を支援する団体の準備サイトです。Astro・TypeScript・Three.jsで構成し、日本語 `/` と英語 `/en/` を静的HTMLとして生成します。

## ローカルで起動

Node.js 22.22以上（推奨: Node.js 24 LTS）、npmを使用します。

```sh
npm ci
npm run dev
```

表示されたローカルURL（通常は `http://localhost:4321`）を開きます。

```sh
npm run check
npm run build
npm run preview
```

`check` はAstro/TypeScriptの型検査、`build` は `dist/` への本番ビルド、`preview` は本番出力のローカル確認です。

## 原稿・デザインの編集

- `src/data/content.ts`: 日英の全原稿。仮称・活動案を実際の情報に差し替えてください。お問い合わせ先もこのファイルの `contactEmail` で管理します。
- `src/components/Site.astro`: 両言語共通の構成とSEOメタデータ。
- `src/styles/global.css`: 色、レイアウト、レスポンシブ、動きを減らす設定。
- `src/scripts/scene.ts`: 虹色リボンの3D描画。
- `public/og.png`: SNS向け画像（1200×630）。編集元は `public/og.svg`。

団体名・活動は仮原稿です。公開前に正式な団体情報と内容を確認してください。お問い合わせ欄は `rainbow@imgay.lgbt` 宛ての `mailto:` リンクで、端末のメールアプリを開きます。サイト内でのメール送信処理や個別相談の受付機能、寄付決済、CMS、解析はありません。

## Cloudflare Pages（GitHub自動デプロイ）

Cloudflareプロジェクト: `imgay-lgbt-web`。GitHubの `xxvw/ImGay-LGBT` と連携し、`main` へのpushで本番サイトを更新します。

- 本番ブランチ: `main`
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- Node.js: `24`（`.node-version` で固定）
- ルートディレクトリ: リポジトリ直下

静的サイトなのでサーバー用Astroアダプター、データベース、秘密情報は不要です。`wrangler.jsonc` もPages向けの設定です。生成した `404.html` により、不明なURLは404になります。

Cloudflareに近いローカル確認:

```sh
npm run cf:preview
```

通常の公開・更新には、後述の `git push origin main` を使用します。手動デプロイが必要な場合のみ、このプロジェクトを管理するCloudflareアカウントでWranglerにログインして実行します。

```sh
npx wrangler login
CLOUDFLARE_ACCOUNT_ID=f03c9582f827f3b63cac0fd092147553 npm run deploy
```

独自ドメインは `www.imgay.lgbt` を使用します。DNS管理は外部サービスのまま維持します。CloudflareのWorkers & Pages → `imgay-lgbt-web` → Custom domainsで登録します。

外部DNS側に追加するレコード:

| 種類 | ホスト名 | 値 |
| --- | --- | --- |
| CNAME | `www` | `imgay-lgbt-web.pages.dev` |

TTLはデフォルト値で構いません。反映後、Cloudflareがドメインを検証してHTTPS証明書を発行します。メール用のMXやTXTレコードは変更しません。ルートの `imgay.lgbt` は、このCNAME設定だけでは接続されません。

別ドメインへ変更する場合は `astro.config.mjs`、`Site.astro` 内のURL、`public/robots.txt`、`public/sitemap.xml` も合わせて更新します。

## 動き・アクセシビリティ

Three.jsはヒーロー付近で遅延読み込みし、画面外・非表示タブでは連続描画を停止します。モバイルは描画解像度を制限します。OSの「視差効果を減らす」等の設定では3D読み込みとスクロール演出を停止し、CSSの静的な虹を表示します。WebGLが利用できない場合も同じ装飾を表示します。

本文はJavaScriptなしでも読めます。FAQは標準のdetails要素を使い、モバイルメニューはEscapeで閉じられます。言語切り替えでは表示中のセクションを引き継ぎます。

フォントはGoogle Fonts（Noto Sans JP）から読み込み、取得できない場合は端末のサンセリフ体にフォールバックします。その他の外部サービスへの接続はありません。

## 確認済みの内容

- Astro/TypeScript: エラー・警告なし。本番静的ビルド成功。
- Chromiumで375・768・1440pxの日英ページを確認。横方向のはみ出し、3D表示、固定ヘッダー、セクションを引き継ぐ言語切り替え、FAQ、モバイルメニューの開閉とEscape操作を検証。
- OSの動きを減らす設定、表示中の設定変更、WebGL無効、JavaScript無効時の本文・静的装飾・FAQを確認。
- Wranglerのドライラン成功。ローカル配信で日英ページ200、存在しないページ404、OG画像とサイトマップ200を確認。
- npm依存関係の監査: 既知の脆弱性0件（実装時点）。

Three.jsの遅延読み込みチャンクは約510KB（非圧縮）のため、ビルド時にサイズの注意が表示されます。本文の初期表示とは分離して読み込みます。

## GitHubで更新する

リポジトリ: https://github.com/xxvw/ImGay-LGBT

```sh
git add .
git commit -m "Update website"
git push origin main
```

ローカルの `main` は `origin/main` を追跡します。CloudflareのGit連携を設定済みのため、このpushを契機に本番サイトを再ビルドします。設定値は本番ブランチ `main`、ビルドコマンド `npm run build`、出力先 `dist`、Node.js `24` です。
