# オシカツOS(仮称)

**「推し活に必要なすべてを、スマホ1つで。」**

推し活の予定・遠征・持ち物・当日の情報を、スマートフォン1つでまとめて管理できるWebサービスです。
初期ターゲットは King & Prince のファン。内部設計は汎用で、将来ほかの推しにも展開できます。

> 本サービスは特定のアーティスト・事務所の公式サービスではありません。

## 主な機能(MVP)

- 💗 推し登録(標準候補+自由入力、テーマカラーがアプリ全体に反映)
- 📅 推し活カレンダー(14カテゴリー、申込・支払などの期限を警告表示)
- 🎤 **ライブ当日モード** — 公演・座席・チケット・持ち物・交通・宿泊・天気・推し友・行動予定を1画面に集約し、未完了を警告
- 🧳 遠征プランナー(交通・宿泊・予算の自動集計・当日の行動予定)
- 🎒 持ち物チェックリスト(標準16項目テンプレート+自由編集、イベントごとに保存)
- 🔍 情報チェック(よく見るサイトのリンク集+最終チェック日の記録。内容は転載せずリンクのみ)
- 📋 貼り付け一括登録(日程が書かれた文章を貼ると、日付・時刻・カテゴリーを読み取って予定を作成)
- ☀️ 天気の自動表示(会場の都市を設定すると当日モードに予報を表示。取得できない場合も画面は壊れない)
- 🔗 アフィリエイトリンク表示(`web/src/data/affiliate-links.json` で管理。「PR」表記つき)
- 💾 データは各ユーザーの端末(ブラウザ)内に保存。会員登録不要。バックアップ機能つき

## 公開(GitHub Pages・無料)

`main` へのプッシュで GitHub Actions が自動ビルド・公開します。
公開URL:**https://chainonjoli.github.io/oshikatsu/**(リポジトリを Public にする必要があります)
詳細は [docs/09_deploy.md](./docs/09_deploy.md) を参照。

## 開発

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm test             # ユニットテスト
npm run build        # 静的サイトを out/ に生成
```

## 技術構成

Next.js 15(静的エクスポート)/ TypeScript / Tailwind CSS / localStorage(端末内保存)/ Vitest / GitHub Actions + GitHub Pages

## ドキュメント

企画・要件定義・設計・テスト結果は [docs/](./docs) にあります。

| ファイル | 内容 |
|---|---|
| docs/00_project_brief.md | 企画提案書(承認済み) |
| docs/01_target_and_problems.md | ターゲットユーザーと課題 |
| docs/02_competitive_analysis.md | 競合との差別化 |
| docs/03_mvp_requirements.md | MVP要件定義・機能一覧 |
| docs/04_screens_and_flows.md | 画面一覧・導線・ワイヤーフレーム |
| docs/05_ui_design.md | UIデザイン方針 |
| docs/06_database_design.md | データベース設計 |
| docs/07_tech_stack.md | 技術構成 |
| docs/08_test_and_release.md | テスト結果・公開前チェックリスト |
| docs/09_deploy.md | 公開手順(GitHub Pages) |
| docs/10_info_features.md | 情報収集まわり3機能の設計と、転載しない方針 |
