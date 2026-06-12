# Customizing or Hiding the "Northlane" Header at Checkout

Because Shopify checkout is hosted on secure Shopify servers (`northlanesite.myshopify.com`), custom code cannot be directly injected to edit or delete the header elements. However, Shopify provides two standard built-in ways in the admin panel to either **hide** the text or **make it link back to your site** instead of Shopify.

---

### Option 1: Hide the "Northlane" Brand Header (Upload a Transparent Logo)
If you want to remove the visible "Northlane" text button from the checkout page entirely:

1. **Create or download a transparent image**: Use a small transparent PNG image (even a 1x1 transparent square).
2. **Go to Shopify Admin**: Log into [admin.shopify.com](https://admin.shopify.com/).
3. **Open the Customizer**:
   * Go to **Online Store** -> **Themes**.
   * Click the **Customize** button on your active theme (Dawn).
4. **Navigate to Checkout Settings**:
   * In the left-hand toolbar, click on the **Theme Settings** icon (the gear/cog icon ⚙️).
   * Scroll down and click on **Checkout**.
5. **Upload the Logo**:
   * Under the **Logo** section, click **Select image** and upload your transparent PNG.
   * Click **Save** in the top right.
   
*Since the logo image is transparent, the text "Northlane" will be hidden, and there will be nothing visible to click in that position!*

---

### Option 2: Point the Logo to Your Storefront (`northlaneofficial.shop`)
If you want to keep the "Northlane" branding but ensure that when users tap it, they land on your storefront (`https://northlaneofficial.shop`) rather than the Shopify online store:

1. **Go to Shopify Admin Settings**:
   * Click **Settings** in the bottom-left corner of the Shopify admin panel.
2. **Open Domains Settings**:
   * Click on **Domains** in the settings sidebar.
3. **Set as Primary Domain**:
   * Connect your custom domain `northlaneofficial.shop` (if not already done).
   * Click on the domain `northlaneofficial.shop` and select **Set as primary**.

*Once `northlaneofficial.shop` is set as your store's primary domain, Shopify will automatically rewrite the checkout logo link to point directly to `https://northlaneofficial.shop/`!*

> [!TIP]
> **Temporary Removal**: If you haven't bought/launched the custom domain yet or want to remove it for now, change your Shopify store's **Primary Domain** back to your default `.myshopify.com` domain (or active staging domain) in the settings. Then, use the dynamic redirection script outlined in [SHOPIFY_REDIRECT_INSTRUCTIONS.md](file:///c:/Users/prime/OneDrive/Desktop/Northlane/SHOPIFY_REDIRECT_INSTRUCTIONS.md) to redirect visitors to whatever active storefront they came from.
