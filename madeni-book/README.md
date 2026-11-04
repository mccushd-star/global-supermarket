# Madeni Book

Shop and branch management for small businesses: sales, goods in, expenses, stock, credit, and automatic profit and loss by hour, day, week, month and year.

- Every shop signs in on its own and sees only its own data.
- Roles: **owner** (all branches, staff, settings, combined totals), **manager** (one branch, everything in it), **seller** (one branch, sales and credit only).
- Payment requests to the buyer's phone: Safaricom M-Pesa (Daraja STK Push) and Airtel Money, confirmed by callbacks.

## Try it now (demo mode)

Open `index.html` through any static server, for example `python3 -m http.server 8000` in this folder, then visit `http://localhost:8000/madeni-book/` from the repository root. With `js/config.js` empty the app runs on example data kept in your browser. Logins in demo mode are not secure.

## Go live

1. Create a free project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`.
3. Put the project URL and the `anon` public key in `js/config.js`. Never put a service role key or any other secret there.
4. Deploy the functions in `supabase/functions` (`supabase functions deploy`). Set the callback URLs for `mpesa-callback` and `airtel-callback` in your Safaricom Daraja and Airtel developer accounts.
5. Each shop owner opens the app, signs up, and enters their own M-Pesa and Airtel credentials under Settings. Start in each provider's sandbox before using real money.

## Tests

`npm test` (Node 20 or newer). The tests cover the money maths, the demo store, role limits per branch and shop separation. They do not call Safaricom or Airtel, and they do not exercise a real Supabase project.

## Known limits

- Payment functions have not been run against the real Daraja or Airtel services.
- Provider secrets are stored in the `payment_config` table, readable only by the service role. Use Supabase Vault or an equivalent before taking real payments at scale.
- Offline entry is not built yet.
