# Saanjh: एक लौ

A three-page candle shop with the actual product photos, a persistent bag, checkout review, and WhatsApp orders to +91 8792517450.

## Run locally

Run `npm run dev` and open http://localhost:3000 (or the configured PORT). Run `npm test` to check the catalog, totals, flavors, storage, and WhatsApp drafts. No dependencies are required.

## Pages

- `index.html`: brand homepage.
- `collection.html`: five products, format filters, and the inline sundae flavor selector.
- `checkout.html`: cart editing, optional note, and WhatsApp draft preview.

## Catalog

Products and prices are defined in `app.js`: Sunset Crush ₹150; Cupid's bubblegum ₹120; Lavender Love Letter ₹125; Bubble boba (set of two) ₹80; sundae candle ₹199 per flavor. The sundae listing defaults to Chocolate Sundae and also offers Mango Sunshine Sundae. Selected flavors use separate cart lines and the matching photograph. No unconfirmed weights, burn times, wax types, or fragrance claims are listed.

Product photographs are the supplied originals, copied into `assets/` without alterations. Descriptions refer to visual appearance. Hero and story images remain illustrations. Update the catalog and image paths in `app.js` when needed.

## Ordering and storage

The current cart uses `sanjh-cart-v2` in local storage. Old illustrative sample products are not imported. Each entry stores product ID, optional flavor ID, and quantity; prices are always read from the catalog. The optional order note uses session storage for same-tab navigation. Storage failures permit shopping within the current page but cannot guarantee persistence across navigation.

WhatsApp links include product names, chosen flavors, quantities, line amounts, subtotal, and the optional note. Device support determines whether WhatsApp opens in an installed app or a browser. The customer reviews and sends the message. Opening the link never confirms an order or clears the bag.

## Hosting

Publish all three HTML files, `styles.css`, `app.js`, and `assets/` on a static host. `server.js`, `tests/`, and `package.json` are development files. Google Fonts is optional; system fonts are available as a fallback. No public deployment is configured.

## Individual product pages

Each product now has its own static URL: `sunset-crush.html`, `cupids-bubblegum.html`, `lavender-love-letter.html`, `bubble-boba.html`, and `sundae.html`. Publish these files and `product.js` with the rest of the site. The collection links to these pages instead of opening an inline selector. On the sundae page, photo options switch the selected flavor, large photo, heading, and cart item. Quantity is selected before adding to the shared cart.

Size/weight and wax type are intentionally marked “To be confirmed” in each page until the actual specifications are provided. No weights or wax claims have been invented.
