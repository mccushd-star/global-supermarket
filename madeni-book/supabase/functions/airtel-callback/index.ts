// Airtel Money calls this with the result of a collection. Set verify_jwt = false for this function (see config.toml).
import { admin } from '../_shared/common.ts';

Deno.serve(async req => {
  try {
    const body = await req.json();
    const t = body?.transaction;
    if (!t?.id) return new Response('ignored');
    const db = admin();
    const { data: rows } = await db.from('records').select('shop_id, id, data')
      .eq('coll', 'payments').eq('data->>airtelId', t.id).limit(1);
    const row = rows?.[0];
    if (!row) return new Response('unknown');
    const paid = t.status_code === 'TS';
    await db.from('records').update({
      data: { ...row.data, status: paid ? 'paid' : 'failed', receipt: t.airtel_money_id || '', message: t.message || '', doneAt: Date.now() },
    }).eq('shop_id', row.shop_id).eq('coll', 'payments').eq('id', row.id);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (_e) {
    return new Response('error', { status: 500 });
  }
});
