# Public Team Sync Backend

Use this when the three users are not on the same Wi-Fi. It deploys a tiny public HTTPS backend for the app's Team Chat.

The deployed URL will look like:

```text
https://core-research-team-sync.<your-cloudflare-subdomain>.workers.dev
```

Paste that URL into the app's Team tab under **Shared team sync server URL** on all three users' devices.

You can also open the GitHub Pages app with the sync URL already attached:

```text
https://ryetechv1.github.io/core-research-atlas/?sync=https://core-research-team-sync.<your-cloudflare-subdomain>.workers.dev
```

## Deploy

Run these from this folder:

```powershell
cd .\cloudflare\team-sync
npx wrangler login
npx wrangler kv namespace create TEAM_CHAT_KV
```

Copy the returned namespace `id` into `wrangler.jsonc`, replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

Then deploy:

```powershell
npx wrangler deploy
```

After deployment, test it:

```powershell
Invoke-RestMethod https://core-research-team-sync.<your-cloudflare-subdomain>.workers.dev/api/health
Invoke-RestMethod https://core-research-team-sync.<your-cloudflare-subdomain>.workers.dev/api/team-chat
```

## Routes

- `GET /api/health`
- `GET /api/team-chat`
- `POST /api/team-chat`
- `OPTIONS /api/team-chat`

## Notes

- This backend stores messages in Cloudflare Workers KV.
- The endpoint is intentionally CORS-enabled so the GitHub Pages app can call it.
- Anyone who knows the URL can post to it. For a private production deployment, add authentication before sharing broadly.
