# The Time Tracker

ローカル専用の勤務時間トラッカー PWA。サーバー・認証・同期は無く、全データは
localStorage に入る（`output: "export"` の静的サイト）。純粋ロジックは
`src/lib/`、UI は `src/components/`、状態と永続化は `src/hooks/` に分かれている。

## パッケージマネージャ

- **pnpm** のみを使う（npm/npx/yarn は使わない）。ツール実行は `pnpm exec <tool>`、
  一時利用は `pnpm dlx <tool>`。
- npm は全パッケージの install script を実行するので、`pnpm-workspace.yaml` の
  `onlyBuiltDependencies` 許可リストを無効化してしまう。また `npx <name>` は
  このプロジェクトの依存ではなくレジストリ全体から解決するため、`npx biome` は
  `@biomejs/biome` ではない無関係な `biome` を取ってくる。
- **依存関係を変更するコマンドはユーザー自身が実行する。** `package.json` /
  `pnpm-workspace.yaml` の編集はして良いが、`pnpm install` `pnpm add`
  `pnpm update` は依頼すること。
- pnpm のコールドスタートは Windows で 120s を超えることがある。タイムアウトを
  伸ばして待つ。別ツールに乗り換えない。

## テスト（TDD）

- テストはソースと同じ場所に置く（`foo.ts` → `foo.test.ts`）。`src/lib/` は
  16/16 が対応するテストを持つ。**`src/lib/` と `src/hooks/` への追加・変更には
  必ずテストを添える。**
- `src/components/` は振る舞いを持つものだけテストする。表示専用
  （`Card` `icons` `DaySpan` など）は対象外。
- `pnpm test` / `pnpm test:watch`（Vitest + React Testing Library、jsdom は
  `vitest.config.ts` で全体既定）。coverage・e2e の設定は無い。
- 完了前に `pnpm test` と `pnpm exec biome check .` が通ることを確認する。
  型は `pnpm exec tsc --noEmit`（下記の既知エラーを除いて）。

## Git

- コミットはユーザーから明示的な指示があったときのみ行う。
- コミットメッセージは英語。
- push はユーザー自身が行う。

## 罠

- **dev サーバーはディレクトリごとに1つ。** Next.js 16 は2つ目の `next dev` を
  拒否して即終了し、別の原因のクラッシュに見える。動いている方に繋ぐ。
- **Service Worker は本番のみ登録される。** dev で有効にすると、ブラウザが最初に
  読んだスタイルシートに固定されて CSS の編集が一切反映されなくなる。リリースで
  旧キャッシュを捨てる必要があるときは `public/sw.js` の `CACHE` を上げる。
- **`pnpm exec tsc --noEmit` は既存の `TS2353` エラー3件を出す**
  （`src/lib/duration.test.ts`）。`next build` はこのファイルを型チェックしない。
  自分が壊したものではない。
- **`src/app/preview/` は使い捨て。** 自己完結したデザイン試作で、どこからも
  import されていない。フォルダ単位で削除して良く、本体の規約の参考にしない。

## 理由がコード側コメントにある決定

変更前にそのコメントを読むこと: `pnpm-workspace.yaml`
（`onlyBuiltDependencies`, `minimumReleaseAge`）、`wrangler.jsonc`
（`workers_dev: false`）、`src/app/layout.tsx`（`metadataBase`）。
