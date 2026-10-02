# GLOBAL SUPERMARKET

A responsive supermarket storefront demo built with plain HTML, CSS, and JavaScript. It supports browsing countries and displaying indicative local-currency conversions, while its product catalog and delivery experience remain illustrative.

## Included in this demo

- Searchable worldwide country selection and local-currency price display
- Daily indicative currency conversion from AED (currencies without a current rate remain clearly priced in AED)
- Departments for fresh food, grocery, chilled and frozen foods, home, personal care, baby and kids, and electronics
- Search across product names, departments, brands, and descriptions
- Category, offer, price, and sorting filters
- Favorites and a persistent shopping basket
- Quantity changes, basket totals, delivery estimate, and free-delivery threshold
- Guest demo checkout with destination, delivery-slot, and payment-method choices
- Delivery information, click-and-collect, help, and account-preview dialogs
- Responsive layouts for mobile and desktop

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy on Netlify

This is a static site with no build step. The included `netlify.toml` sets the repository root as the publish directory. Connect this repository to Netlify and deploy from the root.

To make the live site open without a password, disable Team protection or password protection in the Netlify site/team access settings. That access control is managed by Netlify and cannot be changed by this site's files. If the site shows a not-found page instead, confirm the latest deploy is published and its deploy summary lists `index.html`.

## Demo boundaries

The product catalog and AED base prices are illustrative sample content. Prices are converted for display using daily indicative reference rates from [Frankfurter](https://frankfurter.dev/); they are not live retail prices, and availability of a currency rate depends on the rate provider. The country directory is derived from [`countries-list`](https://www.npmjs.com/package/countries-list) under the included MIT license in `data/COUNTRIES-LICENSE`. Country selection changes display currency only: worldwide shipping, stock, checkout, accounts, order tracking, customer support, and payment are not connected. A production supermarket requires a secure backend and authorized integrations for those services.
