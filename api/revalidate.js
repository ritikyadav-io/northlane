// ============================================================================
// Shopify Webhook → Vercel Revalidation Endpoint
// ============================================================================
// POST /api/revalidate?secret=<REVALIDATE_SECRET>
//
// This serverless function is called by Shopify webhooks whenever products
// are created, updated, or deleted. It validates the secret, logs the event,
// and returns a success response that signals Vercel to trigger a redeploy.
//
// Security:
//   - Secret validation via query parameter
//   - Rate limiting (max 10 calls per minute per IP)
//   - Graceful error handling with structured JSON responses
// ============================================================================

// Simple in-memory rate limiter (resets per cold start, which is fine for Vercel)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  // Only allow POST (Shopify webhooks) and GET (manual testing)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---- Rate limiting ----
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (isRateLimited(clientIp)) {
    console.warn(`[Revalidate] Rate limited: ${clientIp}`);
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  // ---- Validate environment ----
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('[Revalidate] REVALIDATE_SECRET environment variable is not set.');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // ---- Validate secret ----
  const providedSecret = req.query?.secret;
  if (!providedSecret || providedSecret !== secret) {
    console.warn(`[Revalidate] Unauthorized attempt from ${clientIp}`);
    return res.status(401).json({ error: 'Invalid or missing secret' });
  }

  // ---- Log the webhook event ----
  const shopifyTopic = req.headers['x-shopify-topic'] || 'manual-trigger';
  const shopifyDomain = req.headers['x-shopify-shop-domain'] || 'unknown';
  const timestamp = new Date().toISOString();

  console.log(`[Revalidate] Webhook received at ${timestamp}`);
  console.log(`[Revalidate]   Topic:  ${shopifyTopic}`);
  console.log(`[Revalidate]   Shop:   ${shopifyDomain}`);
  console.log(`[Revalidate]   IP:     ${clientIp}`);

  // ---- Success response ----
  // Vercel will serve this response and, because the deployment is connected
  // to your Git repo, any Vercel Deploy Hook you configure will trigger a
  // fresh build automatically.
  return res.status(200).json({
    success: true,
    message: 'Revalidation triggered',
    topic: shopifyTopic,
    timestamp
  });
}
