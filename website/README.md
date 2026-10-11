# Website

https://launch.jammaru.com

静的な Astro サイトです。公開は Cloudflare CLI (`cf`) です。

## 開発

```bash
npm install
npm run dev
```

## 公開

`jammaru.com` が同じ Cloudflare アカウントのゾーンにある状態で、`website/` から実行します。

```bash
npm install -g cf
cf auth login
cf deploy
```

`cloudflare.config.ts` の `domains` が `launch.jammaru.com` です。認証なしでビルドだけ確認するときは `cf deploy --dry-run` です。
