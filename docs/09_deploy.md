# 公開手順(GitHub だけで公開:GitHub Pages 版)

このアプリは **GitHub だけで公開**できます(他のサービスの登録・費用は一切不要)。
公開先URL:**https://chainonjoli.github.io/oshikatsu/**

## しくみ(この構成の特徴)

- アプリは「静的サイト」として GitHub Pages で配信されます(サーバー・データベース不要)
- **各ユーザーのデータは、その人のスマホ(ブラウザ)の中だけに保存**されます
  - 会員登録・ログイン不要で、URLを開けばすぐ使えます
  - 他人にデータが見られることはありません(端末の外にデータが出ません)
  - ⚠️ 端末をまたいだ同期はありません。ブラウザのデータ削除で消えるため、設定画面に**バックアップの保存/読み込み**機能があります
- アフィリエイトリンクは `web/src/data/affiliate-links.json` を GitHub 上で編集して管理します(保存すると自動で再デプロイ)

## 公開までの手順(ご本人の操作は1つだけ)

### 1. リポジトリを公開(Public)にする ← 必須

GitHub の無料プランでは、**非公開リポジトリのままだと GitHub Pages が使えません**。

1. https://github.com/chainonjoli/oshikatsu/settings を開く
2. いちばん下の「Danger Zone」→「Change repository visibility」→「Change to public」
3. リポジトリ名を入力して確認

※ 公開されるのはプログラムのコードだけです。ユーザーのデータは各自の端末内のみで、リポジトリには含まれません。

### 2. 自動デプロイを待つ

`main` ブランチが更新されるたびに、GitHub Actions が自動でビルドして公開します。
リポジトリの「Actions」タブで進行状況が見られます(3〜5分)。

もし「1」を後から行った場合は、Actions タブ → 「Deploy to GitHub Pages」→「Run workflow」で再実行してください。

### 3. URLを開く

**https://chainonjoli.github.io/oshikatsu/** をスマホで開けば完成です。
ホーム画面に追加(iPhone:共有 → ホーム画面に追加)すると、アプリのように使えます。

## アフィリエイトリンクの管理

1. GitHub で `web/src/data/affiliate-links.json` を開き、鉛筆アイコンで編集
2. `links` の配列に項目を追加(`category` は hotel / transport / goods / media / other)
3. `active` を `true` にして「Commit changes」
4. 数分後にサイトへ自動反映(すべて「PR」表記つきで表示されます)

## うまくいかないとき

| 症状 | 対処 |
|---|---|
| Actions が失敗している(赤い×) | リポジトリが Public になっているか確認 → Actions タブから Re-run |
| ページが404 | Settings → Pages で「Source: GitHub Actions」になっているか確認 |
| データが消えた | ブラウザのサイトデータ削除が原因。設定画面のバックアップから復元 |

## この構成の制限(将来サーバー版に戻す場合)

ログイン・端末間同期・推し友共有・AIコンシェルジュなどのサーバー機能が必要になったら、サーバー版(Vercel + Turso 対応)のコードが git 履歴(PR #2 時点の main)に残っているため、そこから再開できます。
