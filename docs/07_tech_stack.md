# 工程10:技術構成

## 1. 構成(決定)

| 層 | 技術 | 選定理由 |
|---|---|---|
| フレームワーク | **Next.js 15(App Router)+ TypeScript** | 1つのコードでサーバー処理と画面を実装でき、スマホ向けの高速な表示に強い。人材・情報が豊富で保守しやすい |
| UI | **Tailwind CSS** | スマホファーストのスタイルを素早く一貫して書ける |
| データベース | **SQLite(better-sqlite3)** | MVPに十分。サーバー1台で完結し運用が簡単。将来 PostgreSQL 等へ移行可能なSQL設計 |
| 認証 | 自前実装(scrypt ハッシュ+httpOnly Cookie セッション) | MVPの要件(メール+パスワード)に対し外部サービス不要で完結。パスワードは不可逆ハッシュ保存 |
| 画面更新 | Server Components + Server Actions | API層を薄くでき、フォーム中心のアプリに合う |
| テスト | Vitest(ロジック単体テスト)+ `next build` | 集計・日付判定・認証ロジックを自動テスト |

## 2. 本番運用の想定(推定)

- MVP検証:Node.js が動く1台のサーバー/コンテナ(例:Render、Railway、Fly.io、VPS)+SQLite ファイル
- 本格運用時:DB を PostgreSQL(例:Supabase、Neon)へ移行、画像は S3 互換ストレージ
- SQLite → PostgreSQL 移行を見越し、SQL は標準的な機能のみ使用

## 3. ディレクトリ構成

```
src/
  app/                    # 画面(App Router)
    (auth)/login, register
    setup/
    calendar/, events/
    today/
    trips/
    checklists/
    settings/
    admin/links/
  components/             # 共通UI(ナビ、カード、警告、PRブロック)
  lib/
    db.ts                 # SQLite 接続+スキーマ初期化
    auth.ts               # パスワードハッシュ・セッション
    actions/              # Server Actions(登録・更新系)
    queries/              # 取得系
    constants.ts          # カテゴリー・テンプレート・K&Pプリセット
    dates.ts              # Asia/Tokyo 日付ユーティリティ
data/app.db               # SQLite(gitignore)
docs/                     # 本ドキュメント群
```

## 4. セキュリティ方針

- パスワード:Node 標準 `crypto.scrypt`(salt 16byte、`timingSafeEqual` 比較)
- セッション:ランダム32byteトークンを httpOnly / SameSite=Lax Cookie に保存、DB側で失効管理(有効30日)
- 認可:全クエリ・全アクションで `user_id` 一致を強制。管理画面は `is_admin` チェック
- 入力:Server Actions 側でバリデーション(必須・長さ・型)
- XSS:React の標準エスケープに依存し `dangerouslySetInnerHTML` を使わない

## 5. 既知の制約(MVPとして許容)

- パスワード再設定メールなし(メール基盤未導入。公開前チェックリストに記載)
- SQLite は同時書き込みに弱いが、MVP規模では問題なし(推定)
- 画像アップロードなし(設計上の予約のみ)
