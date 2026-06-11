# How to Fix Shopify Checkout Back-Redirection

Because the Shopify checkout page is securely hosted on Shopify's servers (`northlanesite.myshopify.com`), the React storefront application is not running there. This means we cannot intercept clicks on the checkout's header link (the "Northlane" logo) or the "Return to cart" button from our React code. 

To ensure that tapping the **"Northlane"** logo or the **"Return to cart"** button redirects customers back to your storefront (`http://localhost:5173/` locally or `https://yourdomain.com` in production), you need to add a small redirect script to your Shopify theme.

---

### Step-by-Step Configuration Guide (Takes 1 Minute)

1. **Log in to Shopify Admin**:
   Go to [admin.shopify.com](https://admin.shopify.com/) and log into your store.

2. **Open the Theme Code Editor**:
   * In the left sidebar, click **Online Store** -> **Themes**.
   * On your active theme (usually Dawn), click the **three dots (`...`)** button next to Customize.
   * Select **Edit code** from the dropdown menu.

3. **Edit `theme.liquid`**:
   * In the file search box or directory tree, open the **`layout/theme.liquid`** file.
   * Locate the opening `<head>` tag (usually near line 3 to 10).
   * Paste the following script directly below the `<head>` tag:

```html
<script>
  // Redirect visitors back to your custom storefront
  var customStorefront = 'https://northlaneofficial.shop'; // Your production domain
  
  // Smart detection: if testing locally, keep redirecting to localhost
  if (document.referrer.indexOf('localhost') > -1 || window.location.search.indexOf('dev=true') > -1) {
    customStorefront = 'http://localhost:5173';
  }
    
  if (window.location.hostname === 'northlanesite.myshopify.com') {
    // If they clicked "Return to cart", redirect them back and open the cart drawer
    if (window.location.pathname.indexOf('/cart') === 0) {
      window.location.href = customStorefront + '?open_cart=true';
    } else {
      // If they clicked the header logo, redirect them to the storefront homepage
      window.location.href = customStorefront;
    }
  }
</script>
```

4. **Save the Changes**:
   Click the **Save** button in the top-right corner of the code editor.

---

### How this works after saving:
* **Tapping the "Northlane" Logo at Checkout**: Shopify redirects the user to `https://northlanesite.myshopify.com/`. The script intercepts this instantly and redirects them back to the storefront homepage (`http://localhost:5173/`).
* **Tapping "Return to Cart" at Checkout**: Shopify redirects the user to `https://northlanesite.myshopify.com/cart`. The script intercepts this, redirects them to `http://localhost:5173/?open_cart=true`, and our React application automatically opens the cart drawer with all active items and quantity controls.
