// ============================================================================
// Shopify Storefront API Client — Production-Grade
// ============================================================================
// All credentials are loaded from environment variables (VITE_ prefix for Vite).
// NEVER hardcode tokens or store URLs in this file.
// ============================================================================

const DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = '2024-01';

// Validate required environment variables at startup
if (!DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
  console.error(
    '[Shopify] Missing required environment variables.\n' +
    'Ensure VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN are set in your .env file.'
  );
}

const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

async function shopifyFetch(query, variables = {}) {
  if (!DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      'Shopify API is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env'
    );
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    console.log('[Shopify] Raw response:', json);
    if (json.errors) {
      console.error('[Shopify] GraphQL Errors:', json.errors);
      throw new Error(json.errors[0].message);
    }
    return json.data;
  } catch (error) {
    console.error('[Shopify] Fetch Error:', error);
    throw error;
  }
}

// Flatten Shopify connection edges to standard arrays
function flattenConnection(connection) {
  if (!connection || !connection.edges) return [];
  return connection.edges.map(edge => edge.node);
}

// Format a single product
function getCustomSpecsAndFeatures(handle) {
  const lowercase = handle.toLowerCase();
  
  if (lowercase.includes('camping-light') || lowercase.includes('camping-lantern') || lowercase.includes('lantern')) {
    return {
      features: [
        'USB Type-C Rechargeable with 2000mAh built-in battery',
        'Stepless dimming with warm, white, and breathing ambient modes',
        'Anti-drop ABS design with high transparency polycarbonate cover',
        'IPX4 splashproof rating suitable for indoor and outdoor adventures',
        'Provides up to 24 hours of continuous soft illumination'
      ],
      specifications: {
        'Battery Capacity': '2000mAh Lithium-Ion',
        'Charging Port': 'USB Type-C (5V/1A)',
        'Material': 'Premium ABS & Polycarbonate (Anti-drop)',
        'Light Modes': 'Warm Glow, Cool White, breathing ambient mode',
        'Run Time': '5 to 24 hours depending on brightness',
        'Waterproof Rating': 'IPX4 splashproof',
        'Weight': '260g',
        'Shipping': 'Free US/UK tracked delivery (7-15 business days)',
        'Guarantee': '30-Day Hassle-Free Returns'
      }
    };
  }
  
  if (lowercase.includes('octopus')) {
    return {
      features: [
        'Dynamic RGB LED projection showing ocean waves and stars',
        '12 unique color modes with 360-degree silent rotation option',
        'Safe, BPA-free soft silicone cover suitable for children',
        'Remote control operation with built-in auto-shutoff timer',
        'Ideal night light for soothing sleep and relaxing environments'
      ],
      specifications: {
        'Light Source': 'High-power RGB LED beads',
        'Material': 'BPA-free Silicone & Premium ABS',
        'Power Source': 'USB Cable (included) / DC 5V input',
        'Projection Coverage': 'Up to 200 sq ft',
        'Rotation': '360-degree silent motor',
        'Control Interface': 'Remote control & Touch button sensor',
        'Dimensions': '5.2" x 5.2" x 4.8"',
        'Certifications': 'CE, FCC, RoHS certified',
        'Guarantee': '30-Day Hassle-Free Money Back'
      }
    };
  }

  if (lowercase.includes('tumbler')) {
    return {
      features: [
        'Double-wall vacuum insulation keeps drinks ice cold for 24h, hot for 12h',
        'Spill-proof 3-way rotating lid prevents leaks during travel',
        'Ergonomic, easy-grip comfort handle designed for daily carry',
        'Tapered slim base fits perfectly in all standard car cup holders',
        'Crafted from premium BPA-free 18/8 food-grade stainless steel'
      ],
      specifications: {
        'Material': 'Premium 18/8 food-grade Stainless Steel',
        'Insulation': 'Double-wall vacuum-sealed with copper lining',
        'Temp Retention': 'Ice cold for 24+ hours, Hot for 12+ hours',
        'Lid Design': '3-way rotating lid (straw, wide mouth, closed)',
        'Base Diameter': '3.0 inches (Fits standard car cup holders)',
        'Capacity': '40oz (approx. 1180ml)',
        'Straw': 'Reusable Tritan straw included',
        'Care Instructions': 'Hand wash recommended (lid/straw dishwasher safe)',
        'Guarantee': '30-Day Satisfaction Guarantee'
      }
    };
  }

  if (lowercase.includes('water-ripple') || lowercase.includes('ripple')) {
    return {
      features: [
        'Rotating crystal projection creates dynamic relaxing water ripple effect',
        '16 beautiful static colors and 4 dynamic color-shifting transitions',
        'Stepless dimming controls adjust brightness from 10% to 100%',
        'Crafted from high-density acrylic crystal and natural solid wood',
        'Operated via smart touch sensor or the included wireless remote'
      ],
      specifications: {
        'Material': 'High-transparency Acrylic crystal & Solid Wood base',
        'Light Engine': 'Rotating dynamic water ripple projector',
        'Color Modes': '16 static colors & 4 dynamic shifting modes',
        'Power Source': 'USB Plug-in (5V/1.5A)',
        'Brightness Levels': 'Stepless dimming (10% to 100%)',
        'Control Option': 'Remote control & smart touch sensor',
        'Dimensions': '4.3" x 4.3" x 4.5"',
        'Applications': 'Bedroom bedside lamp, living room ambiance, party light',
        'Guarantee': '30-Day Hassle-Free Returns'
      }
    };
  }

  if (lowercase.includes('printer') || lowercase.includes('label')) {
    return {
      features: [
        'Direct thermal printing requires no ink, toner, or ribbon',
        'Wireless Bluetooth connection connects instantly to iOS and Android',
        'Supports labels from 12mm to 15mm for home, kitchen, and office organization',
        'Long-lasting 1200mAh USB rechargeable lithium battery',
        'Free app includes hundreds of icons, borders, and custom fonts'
      ],
      specifications: {
        'Printing Method': 'Inkless Thermal Printing (203 dpi resolution)',
        'Connection': 'Bluetooth 4.0 compatible (iOS & Android via Print App)',
        'Battery': '1200mAh rechargeable lithium battery',
        'Paper Width Range': '12mm to 15mm width supported',
        'Charging Port': 'Micro-USB (5V/1A)',
        'Dimensions': '5.1" x 3.1" x 1.1"',
        'Supported Languages': 'English, Spanish, French, German, Chinese, Japanese',
        'Print Speed': '30mm/s - 50mm/s',
        'Guarantee': '30-Day Satisfaction Guarantee'
      }
    };
  }

  if (lowercase.includes('posture') || lowercase.includes('spine')) {
    return {
      features: [
        'Corrects posture by aligning shoulders, neck, and spine',
        'Adjustable chest straps ensure a snug, comfortable fit for all body types',
        'Made of breathable, lightweight, sweat-resistant neoprene',
        'Discreet, ultra-thin profile fits seamlessly under clothing',
        'Reduces slouching, hunchback, back pain, and muscle tension'
      ],
      specifications: {
        'Material': 'Breathable, lightweight neoprene & composite fabric',
        'Sizing': 'Fully adjustable chest sizes (28" to 43")',
        'Design': 'Dual metal support bars with soft shoulder straps',
        'Usage': 'Recommended 20-30 mins daily, building up to 2 hours',
        'Ergonomics': 'Discreet design (fits comfortably under clothing)',
        'Care': 'Hand wash cold, air dry only',
        'Benefits': 'Relieves back, neck, and shoulder tension',
        'Guarantee': '30-Day Hassle-Free Money Back'
      }
    };
  }

  if (lowercase.includes('ring-light') || lowercase.includes('selfie')) {
    return {
      features: [
        'Dual-flexible arms let you mount phone and ring light independently',
        '3 color temperature modes: Cool White, Warm Light, and Natural White',
        '10 adjustable brightness steps to lock in the perfect lighting',
        'Heavy-duty padded metal clamp clips securely to desks, beds, and tables',
        'Convenient USB power source works with chargers, laptops, and power banks'
      ],
      specifications: {
        'Diameter': '3.5 inches (8.9 cm) ring light',
        'Mounting': 'Heavy-duty anti-scratch metal clamp (up to 2" thickness)',
        'Power': 'USB Powered (5V/1A, works with power bank/PC)',
        'Brightness Levels': '10 adjustable brightness steps',
        'Color Temp': '3 modes (Warm White, Natural White, Cool White)',
        'Stand Design': 'Flexible 360-degree goose-neck arm',
        'Cable Length': '4.8 ft with inline controller',
        'Guarantee': '30-Day Satisfaction Guarantee'
      }
    };
  }

  if (lowercase.includes('lingerie') || lowercase.includes('bra')) {
    return {
      features: [
        'Delicate floral lace pattern with premium soft-touch lining',
        'Underwired cups and adjustable straps provide comfortable lift and support',
        'Matching high-waisted G-string thong completes the set',
        'Breathable and lightweight nylon-spandex blend feels soft on skin',
        'Elasticized band adapts perfectly to your body contours'
      ],
      specifications: {
        'Material': '90% Nylon, 10% Spandex premium soft lace',
        'Style': 'Underwired cups with adjustable spaghetti straps',
        'Closure': 'Hook-and-eye back closure',
        'Sizing': 'S, M, L, XL (Detailed size chart in description)',
        'Care': 'Hand wash cold inside out, dry flat',
        'Stretch': 'Medium elasticity',
        'Guarantee': '30-Day Returns Policy'
      }
    };
  }

  if (lowercase.includes('babydoll') || lowercase.includes('chemise')) {
    return {
      features: [
        'Elegant sheer mesh babydoll with intricate floral lace bust details',
        'A-line draping silhouette flows beautifully and flatters all body shapes',
        'Adjustable cross-back straps ensure a perfect personalized fit',
        'Comes with a matching G-string thong for a complete look',
        'Soft, stretchy modal and mesh blend designed for luxury sleep'
      ],
      specifications: {
        'Material': '88% Polyester, 12% Spandex ultra-soft modal & mesh',
        'Design': 'Sheer lace bodice with flowy mesh skirt, matching G-string',
        'Length': 'Mid-thigh length',
        'Sizing': 'S, M, L, XL, XXL available',
        'Care': 'Machine wash cold in mesh laundry bag, hang dry',
        'Stretch': 'High elasticity',
        'Guarantee': '30-Day Return Window'
      }
    };
  }

  if (lowercase.includes('teddy') || lowercase.includes('dress')) {
    return {
      features: [
        'Plunging V-neckline with scalloped lace edges for a striking look',
        'Convenient snap-crotch bottom closure for easy and comfortable wear',
        'Ultra-flexible floral lace fabric offers a body-hugging, comfortable fit',
        'Open-back design with adjustable crisscross shoulder straps',
        'Skin-friendly, breathable lace overlay stays comfortable all night'
      ],
      specifications: {
        'Material': '92% Polyester, 8% Elastane floral stretch lace',
        'Design': 'Plunging V-neckline, snap crotch bottom, open back straps',
        'Texture': 'Breathable, skin-friendly lace overlay',
        'Sizing': 'True to size (S, M, L, XL)',
        'Care': 'Hand wash cold, do not bleach, air dry',
        'Color Options': 'Classic Black, Ruby Red, Emerald Green',
        'Guarantee': '30-Day Hassle-Free Returns'
      }
    };
  }

  // Fallback default
  return {
    features: [
      'Premium quality materials carefully selected for US & UK markets',
      'Designed for maximum durability, style, and everyday functionality',
      'Fully tracked delivery with secure packaging to protect your order',
      'BPA-free, non-toxic, and environmentally conscious design standards',
      'Backed by our hassle-free customer support and satisfaction guarantee'
    ],
    specifications: {
      'Origin': 'Selected Premium Import',
      'Shipping': 'US & UK tracked delivery (7-15 business days)',
      'Guarantee': '30-Day Hassle-Free Money Back',
      'Quality Standard': 'CE, RoHS and FCC certified where applicable',
      'Care': 'Wipe clean with soft damp cloth / Follow package insert'
    }
  };
}

function formatProduct(product) {
  if (!product) return null;
  
  const images = flattenConnection(product.images).map(img => img.url);
  const variants = flattenConnection(product.variants).map(v => ({
    id: v.id,
    title: v.title,
    price: parseFloat(v.price.amount),
    compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null,
    selectedOptions: v.selectedOptions || [],
    image: v.image ? v.image.url : (images[0] || null),
    availableForSale: v.availableForSale
  }));

  const { features, specifications } = getCustomSpecsAndFeatures(product.handle);

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    productType: product.productType || 'Uncategorized',
    images: images,
    variants: variants,
    minPrice: product.priceRange?.minVariantPrice ? parseFloat(product.priceRange.minVariantPrice.amount) : 0,
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount) : null,
    features,
    specifications,
    availableForSale: product.availableForSale !== false
  };
}

export async function fetchProducts(first = 20) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            description
            descriptionHtml
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  const rawProducts = flattenConnection(data?.products);
  // Filter out sold-out products
  const inStockProducts = rawProducts.filter(p => p.availableForSale !== false);
  return inStockProducts.map(formatProduct);
}

export async function fetchProductByHandle(handle) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        availableForSale
        description
        descriptionHtml
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
              }
              availableForSale
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle });
  return formatProduct(data?.product);
}

export async function createCheckout(lineItems) {
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // lineItems should be: [{ variantId: "...", quantity: 1 }]
  const variables = {
    input: {
      lines: lineItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: parseInt(item.quantity, 10),
      })),
    },
  };

  const data = await shopifyFetch(mutation, variables);
  
  if (data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  
  return data?.cartCreate?.cart?.checkoutUrl;
}

// Export the store domain for use in fallback cart URLs
export function getStoreDomain() {
  return DOMAIN;
}

export async function fetchCollections(first = 50) {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { first });
  return flattenConnection(data?.collections);
}

