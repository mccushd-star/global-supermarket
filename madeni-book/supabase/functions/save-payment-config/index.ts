// Owner stores Safaricom Daraja and Airtel Money credentials. Secrets are write-only: they are never returned to the browser.
import { admin, caller, cors, json } from '../_shared/common.ts';

const FIELDS = ['mpesa_key', 'mpesa_secret', 'mpesa_shortcode', 'mpesa_passkey', 'mpesa_party_b', 'mpesa_type', 'airtel_client_id', 'airtel_client_secret', 'airtel_country', 'airtel_currency'];

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const me = await caller(req, body.shopId);
    if (!me || me.role !== 'owner') return json({ error: 'Only the shop owner can change payment settings.' }, 403);
    const db = admin();
    if (body.status) {
      const { data } = await db.from('payment_config').select('*').eq('shop_id', body.shopId).maybeSingle();
      return json({
        mpesa: !!(data?.mpesa_key && data?.mpesa_secret && data?.mpesa_shortcode && data?.mpesa_passkey),
        airtel: !!(data?.airtel_client_id && data?.airtel_client_secret),
        mpesa_type: data?.mpesa_type || 'till', mpesa_shortcode: data?.mpesa_shortcode || '', mpesa_party_b: data?.mpesa_party_b || '',
        airtel_country: data?.airtel_country || 'KE', airtel_currency: data?.airtel_currency || 'KES',
      });
    }
    const row: Record<string, unknown> = { shop_id: body.shopId, updated_at: new Date().toISOString() };
    for (const f of FIELDS) if (typeof body[f] === 'string' && body[f].trim() !== '') row[f] = body[f].trim();
    const { error } = await db.from('payment_config').upsert(row, { onConflict: 'shop_id' });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
