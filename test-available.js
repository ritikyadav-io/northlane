const DOMAIN = 'northlanesite.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = '7f932127358d30354fb8e1c901c3a989';
const API_VERSION = '2024-01';
const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

const testQuery = `
  query getProducts {
    products(first: 5) {
      edges {
        node {
          id
          title
          handle
          availableForSale
        }
      }
    }
  }
`;

async function test() {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: testQuery }),
    });

    const json = await response.json();
    console.log('Result:', JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
