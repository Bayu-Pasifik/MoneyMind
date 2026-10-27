# OCR proxy

Keeps the OCR.space API key off the device. The app posts the receipt image
here; the Worker adds the key and forwards to OCR.space.

```bash
cd server/ocr-proxy
npx wrangler secret put OCR_SPACE_API_KEY   # paste the key
npx wrangler deploy
```

Put the deployed URL in the app's `.env`:

```
EXPO_PUBLIC_OCR_PROXY_URL=https://moneymind-ocr-proxy.<account>.workers.dev
```

The URL is public by design. Add a Cloudflare rate-limiting rule on the route
to stop others from burning your OCR.space quota.
