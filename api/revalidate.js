// Vercel Serverless Function to trigger a fresh deployment when Shopify notifies of product changes.
// The function expects a secret query param to avoid unauthenticated triggers.

export default async function handler(req, res) {
  const secret = process.env.REVALIDATE_SECRET;
  // Vercel passes query params on `req.query` (for Node.js environments). Adjust if using Edge.
  const provided = req?.query?.secret || (req?.url?.includes('?') ? new URL('http://x' + req.url).searchParams.get('secret') : undefined);

  if (provided !== secret) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  // Respond with 200. Vercel automatically starts a new deployment after this request.
  return res.status(200).json({ ok: true });
}
