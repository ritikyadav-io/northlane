import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchCollections, getStoreDomain } from '../shopify';

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [envCheck, setEnvCheck] = useState({});

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setLoading(true);
        setError(null);

        // 1. Check environment variables
        const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
        const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
        const revalidateSecret = import.meta.env.VITE_REVALIDATE_SECRET || "Not Set in Client";

        setEnvCheck({
          domain: domain || 'MISSING',
          token: token ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 'MISSING',
          hasToken: !!token,
          hasDomain: !!domain,
        });

        if (!domain || !token) {
          throw new Error('Missing VITE_SHOPIFY_STORE_DOMAIN or VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN in environment.');
        }

        // 2. Fetch products
        console.log('[Debug] Fetching products...');
        const fetchedProducts = await fetchProducts(250);
        setProducts(fetchedProducts);

        // 3. Fetch collections
        console.log('[Debug] Fetching collections...');
        const fetchedCollections = await fetchCollections(50);
        setCollections(fetchedCollections);

        // 4. Capture a raw response for display by re-fetching
        const apiVersion = '2024-01';
        const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
        const testQuery = `
          query getDebugInfo {
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
            products(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                  onlineStoreUrl
                }
              }
            }
          }
        `;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token,
          },
          body: JSON.stringify({ query: testQuery }),
        });
        
        const json = await res.json();
        setRawResponse(json);

      } catch (err) {
        console.error('[Debug] Diagnostic Error:', err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    runDiagnostics();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 24px 80px', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Diagnostics & Debugging
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Shopify Storefront API Integration Status
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-accent)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderWidth: '4px' }}></div>
          <p style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Running diagnostics...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Environment Variables & API Connection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: 'var(--color-bg-secondary)', boxShadow: '0 4px 6px var(--color-shadow)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Environment Configuration</h3>
              <p style={{ margin: '8px 0' }}><strong>Store Domain:</strong> <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{envCheck.domain}</code></p>
              <p style={{ margin: '8px 0' }}><strong>Storefront Access Token:</strong> <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{envCheck.token}</code></p>
              <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>Status:</strong> 
                {envCheck.hasDomain && envCheck.hasToken ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓ Configured</span>
                ) : (
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✗ Incomplete</span>
                )}
              </p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: 'var(--color-bg-secondary)', boxShadow: '0 4px 6px var(--color-shadow)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Connection Summary</h3>
              <p style={{ margin: '8px 0' }}><strong>Total Collections:</strong> {collections.length}</p>
              <p style={{ margin: '8px 0' }}><strong>Total Products (first 50):</strong> {products.length}</p>
              {products.length > 0 && (
                <>
                  <p style={{ margin: '8px 0' }}><strong>First Product Title:</strong> {products[0].title}</p>
                  <p style={{ margin: '8px 0' }}><strong>First Product Handle:</strong> <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{products[0].handle}</code></p>
                </>
              )}
              {error && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#FEE2E2', border: '1px solid #F87171', borderRadius: '6px', color: '#991B1B', fontSize: '0.9rem' }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Collections List */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-primary)' }}>Collections ({collections.length})</h3>
              {collections.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No collections found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0' }}>Title</th>
                      <th style={{ padding: '8px 0' }}>Handle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map(col => (
                      <tr key={col.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 0', fontWeight: '500' }}>{col.title}</td>
                        <td style={{ padding: '8px 0' }}><code>{col.handle}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Products List */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-primary)' }}>Products ({products.length})</h3>
              {products.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No products found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0' }}>Title</th>
                      <th style={{ padding: '8px 0' }}>Type</th>
                      <th style={{ padding: '8px 0' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 0', fontWeight: '500' }}>{p.title}</td>
                        <td style={{ padding: '8px 0', color: 'var(--color-text-muted)' }}>{p.productType}</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold' }}>${p.minPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Raw Response */}
          {rawResponse && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: '#1E293B', color: '#F8FAFC' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#F8FAFC' }}>Raw API Response (Sample)</h3>
              <pre style={{ margin: 0, padding: '12px', backgroundColor: '#0F172A', borderRadius: '6px', overflowX: 'auto', fontSize: '0.85rem', lineHeight: '1.4', maxHeight: '300px' }}>
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Action to trigger webhook / revalidation */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', backgroundColor: 'var(--color-bg-secondary)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)' }}>Vercel Revalidation & Deploy Hooks</h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '15px' }}>
              To trigger automatic updates when products are added/updated in your Shopify Admin, create a webhook in <strong>Shopify Admin &gt; Settings &gt; Notifications &gt; Webhooks</strong> for the topics <code>Product creation</code>, <code>Product update</code>, and <code>Product deletion</code> pointing to:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <code style={{ background: '#fff', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', flexGrow: 1, wordBreak: 'break-all' }}>
                {window.location.origin}/api/revalidate?secret=northlane_revalidate-x8K2M9P4Q7L1A6N
              </code>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Note: For local development, use a tunnel like <code>ngrok http 5173</code> to expose your local server, then use the ngrok URL as the webhook address.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
