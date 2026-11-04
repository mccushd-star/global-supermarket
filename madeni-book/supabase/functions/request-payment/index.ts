// Sends a payment prompt to the buyer's phone: Safaricom M-Pesa (STK Push) or Airtel Money (collection).
// Writes a 'payments' record with status 'pending'; the callback functions flip it to 'paid' or 'failed'.
import { admin, caller, cors, isSandbox, json } from '../_shared/common.ts';

const MPESA = () => (isSandbox() ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke');
const AIRTEL = () => (isSandbox() ? 'https://openapiuat.airtel.africa' : 'https://openapi.airtel.africa');
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const fnUrl = (name: string) => `${Deno.env.get('SUPABASE_URL')}/functions/v1/${name}`;

async function mpesaPush(cfg: any, phone: string, amount: number, ref: string, desc: string) {
  const auth = await fetch(`${MPESA()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: 'Basic ' + btoa(`${cfg.mpesa_key}:${cfg.mpesa_secret}`) },
  });
  if (!auth.ok) throw new Error('Safaricom rejected the app keys. Check them in Settings.');
  const { access_token } = await auth.json();
  const ts = stamp();
  const till = cfg.mpesa_type !== 'paybill';
  const res = await fetch(`${MPESA()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: cfg.mpesa_shortcode,
      Password: btoa(`${cfg.mpesa_shortcode}${cfg.mpesa_passkey}${ts}`),
      Timestamp: ts,
      TransactionType: till ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: phone,
      PartyB: till ? (cfg.mpesa_party_b || cfg.mpesa_shortcode) : cfg.mpesa_shortcode,
      PhoneNumber: phone,
      CallBackURL: fnUrl('mpesa-callback'),
      AccountReference: ref.slice(0, 12),
      TransactionDesc: desc.slice(0, 20),
    }),
  });
  const out = await res.json();
  if (!res.ok || out.ResponseCode !== '0') throw new Error(out.errorMessage || out.ResponseDescription || 'Safaricom did not accept the request.');
  return { checkoutId: out.CheckoutRequestID as string };
}

async function airtelPush(cfg: any, phone: string, amount: number, ref: string, id: string) {
  const country = cfg.airtel_country || 'KE', currency = cfg.airtel_currency || 'KES';
  const auth = await fetch(`${AIRTEL()}/auth/oauth2/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    body: JSON.stringify({ client_id: cfg.airtel_client_id, client_secret: cfg.airtel_client_secret, grant_type: 'client_credentials' }),
  });
  if (!auth.ok) throw new Error('Airtel rejected the app keys. Check them in Settings.');
  const { access_token } = await auth.json();
  const res = await fetch(`${AIRTEL()}/merchant/v2/payments/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json', Accept: '*/*', 'X-Country': country, 'X-Currency': currency },
    body: JSON.stringify({
      reference: ref.slice(0, 30),
      subscriber: { country, currency, msisdn: phone.replace(/^254/, '') },
      transaction: { amount: Math.ceil(amount), country, currency, id },
    }),
  });
  const out = await res.json();
  if (!res.ok || out?.status?.success === false) throw new Error(out?.status?.message || 'Airtel did not accept the request.');
  return { airtelId: id };
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { shopId, branchId, network, phone, amount, reference, paymentId } = await req.json();
    const me = await caller(req, shopId);
    if (!me) return json({ error: 'Not allowed.' }, 403);
    if (me.role !== 'owner' && me.branchId !== branchId) return json({ error: 'That is not your branch.' }, 403);
    if (!/^254[17]\d{8}$/.test(phone || '')) return json({ error: 'Enter a Kenyan number like 0712 345 678.' }, 400);
    if (!(amount > 0) || amount > 250000) return json({ error: 'Enter an amount between 1 and 250,000.' }, 400);
    if (!['mpesa', 'airtel'].includes(network)) return json({ error: 'Choose Safaricom or Airtel.' }, 400);
    const db = admin();
    const { data: cfg } = await db.from('payment_config').select('*').eq('shop_id', shopId).maybeSingle();
    if (!cfg) return json({ error: 'The owner has not added payment keys yet (Settings, Payment connections).' }, 400);
    const id = paymentId || crypto.randomUUID();
    const ref = reference || 'Sale';
    let extra: Record<string, string> = {};
    if (network === 'mpesa') {
      if (!(cfg.mpesa_key && cfg.mpesa_secret && cfg.mpesa_shortcode && cfg.mpesa_passkey)) return json({ error: 'Safaricom keys are not complete in Settings.' }, 400);
      extra = await mpesaPush(cfg, phone, amount, ref, 'Payment');
    } else {
      if (!(cfg.airtel_client_id && cfg.airtel_client_secret)) return json({ error: 'Airtel keys are not complete in Settings.' }, 400);
      extra = await airtelPush(cfg, phone, amount, ref, id);
    }
    await db.from('records').upsert({
      shop_id: shopId, coll: 'payments', id, branch_id: branchId,
      data: { status: 'pending', network, phone, amount, reference: ref, ts: Date.now(), sandbox: isSandbox(), ...extra },
    });
    return json({ ok: true, paymentId: id });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 502);
  }
});
