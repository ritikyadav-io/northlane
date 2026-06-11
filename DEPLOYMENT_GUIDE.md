# Northlane — Shopify Integration & Deployment Guide

## Architecture Overview

```
Shopify Store ─── Storefront API ───► Northlane (Vite + React on Vercel)
     │                                         │
     └── Webhooks (product changes) ──► /api/revalidate ──► Triggers Vercel Deploy Hook
```

**Key principle:** The Vite app fetches products at **runtime** via the Shopify Storefront GraphQL API. When a product is created/updated/deleted in Shopify, a webhook calls the `/api/revalidate` endpoint which triggers a Vercel Deploy Hook to rebuild the site with fresh data.

---

## Environment Variables

### Required Variables

| Variable | Where Used | Purpose |
|----------|-----------|---------|
| `VITE_SHOPIFY_STORE_DOMAIN` | Client (Vite) | Your Shopify store domain |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Client (Vite) | Storefront API access token |
| `REVALIDATE_SECRET` | Server (API) | Secret for webhook authentication |
| `VERCEL_DEPLOY_HOOK_URL` | Server (API) | *(Optional)* Vercel Deploy Hook URL |

> ⚠️ **NEVER** use the Storefront API token as the revalidation secret. They serve different purposes and mixing them is a security risk.

### Setting Up Locally

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your values:
   ```env
   VITE_SHOPIFY_STORE_DOMAIN=northlanesite.myshopify.com
   VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
   REVALIDATE_SECRET=northlane_revalidate-x8K2M9P4Q7L1A6N
   ```

### Setting Up on Vercel

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add each variable listed above
3. Set scope to **Production** (and **Preview** if desired)
4. Click **Save**
5. **Redeploy** the project for changes to take effect

---

## Shopify Webhook Setup

### Required Webhooks

| Webhook Event | Description |
|---------------|-------------|
| `products/create` | Fires when a new product is added to the store |
| `products/update` | Fires when an existing product is modified |
| `products/delete` | Fires when a product is removed from the store |

### Configuration Steps

1. Go to **Shopify Admin → Settings → Notifications → Webhooks**
2. Click **Create webhook** for each event above
3. For each webhook:
   - **Event**: Select the event (e.g., `Products/create`)
   - **Format**: `JSON`
   - **URL**: 
     ```
     https://your-project.vercel.app/api/revalidate?secret=northlane_revalidate-x8K2M9P4Q7L1A6N
     ```
   - Click **Save**

### Testing Webhooks

1. After creating a webhook, click **Send test notification** in Shopify
2. Check Vercel → **Deployments** for a new build
3. Or check Vercel → **Functions** → `api/revalidate` for function logs

---

## Revalidation Endpoint Reference

### `GET/POST /api/revalidate`

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `secret` | Yes | Must match `REVALIDATE_SECRET` env var |

**Response Codes:**
| Code | Meaning |
|------|---------|
| `200` | Success — revalidation triggered |
| `401` | Invalid or missing secret |
| `405` | Method not allowed (only GET/POST) |
| `429` | Rate limited (max 10 requests/minute/IP) |
| `500` | Server misconfigured (missing env var) |

**Success Response:**
```json
{
  "success": true,
  "message": "Revalidation triggered",
  "topic": "products/create",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Security Features:**
- Secret-based authentication via query parameter
- Rate limiting: 10 requests per minute per IP
- Structured error responses
- Webhook event logging (topic, shop domain, IP)

---

## Deployment Checklist

### Local Development

- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Run `npm install`
- [ ] Run `npm run dev` (Vite dev server on port 5173)
- [ ] Verify products load on homepage
- [ ] Test add-to-cart and checkout flow

### Vercel Deployment

- [ ] Push code to GitHub (master branch)
- [ ] Verify `.env` is in `.gitignore` (secrets never committed)
- [ ] Add all environment variables in Vercel dashboard:
  - [ ] `VITE_SHOPIFY_STORE_DOMAIN`
  - [ ] `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
  - [ ] `REVALIDATE_SECRET`
- [ ] Deploy and verify build succeeds
- [ ] Visit live site and confirm products load
- [ ] Test `/api/revalidate?secret=YOUR_SECRET` returns `{"success": true, ...}`

### Shopify Webhooks

- [ ] Create `products/create` webhook pointing to `/api/revalidate`
- [ ] Create `products/update` webhook pointing to `/api/revalidate`
- [ ] Create `products/delete` webhook pointing to `/api/revalidate`
- [ ] Send test notification for each webhook
- [ ] Verify Vercel function logs show the webhook events

### Production Verification

- [ ] Add a test product in Shopify (via CJ or manually)
- [ ] Wait 2-3 minutes for the rebuild
- [ ] Refresh your live site and confirm the new product appears
- [ ] Remove the test product and confirm it disappears after rebuild
- [ ] Check Vercel function logs for any errors

---

## Troubleshooting

### Products not showing on site
1. Check browser console for Shopify API errors
2. Verify `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` are set correctly
3. Ensure the Storefront API token has the correct permissions (read products, read product listings)

### Webhook not triggering rebuild
1. Check Shopify webhook delivery logs (Settings → Notifications → Webhooks → click the webhook)
2. Check Vercel function logs (Project → Functions → api/revalidate)
3. Verify the webhook URL includes the correct `?secret=` parameter
4. Ensure `REVALIDATE_SECRET` matches between Vercel env vars and the webhook URL

### "401 Invalid or missing secret" error
- The `secret` query parameter doesn't match `REVALIDATE_SECRET`
- Double-check for extra spaces or encoding issues in the URL

### "429 Too many requests" error
- Rate limit exceeded (10 requests/minute)
- Wait 1 minute and try again
- If Shopify is firing too many webhooks, this is normal — the rate limiter protects your endpoint

### "500 Server misconfigured" error
- `REVALIDATE_SECRET` environment variable is not set on Vercel
- Add it in Settings → Environment Variables and redeploy

### Build still showing old products
- Verify the webhook is actually triggering a new deployment
- Check the Vercel **Deployments** tab for recent builds
- The Vite app fetches products at runtime, so a simple page refresh may be enough
- Hard refresh with `Ctrl+Shift+R` to bypass browser cache
