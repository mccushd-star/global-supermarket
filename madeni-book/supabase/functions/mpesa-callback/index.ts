// Safaricom calls this with the result of an STK Push. Set verify_jwt = false for this function (see config.toml).
import { admin } from '../_shared/common.ts';

Deno.serve(async req => {
  try {
    const body = await req.json();
    const cb = body?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return new Response('ignored');
    const db = admin();
    const { data: rows } = await db.from('records').select('shop_id, id, branch_id, data')
      .eq('coll', 'payments').eq('data->>checkoutId', cb.CheckoutRequestID).limit(1);
    const row = rows?.[0];
    if (!row) return new Response('unknown');
    const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item || [];
    const get = (n: string) => items.find(i => i.Name === n)?.Value;
    const paid = cb.ResultCode === 0;
    await db.from('records').update({
      data: { ...row.data, status: paid ? 'paid' : 'failed', receipt: get('MpesaReceiptNumber') || '', paidAmount: get('Amount') ?? null,
        message: cb.ResultDesc || '', doneAt: Date.now() },
    }).eq('shop_id', row.shop_id).eq('coll', 'payments').eq('id', row.id);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (_e) {
    return new Response('error', { status: 500 });
  }
});
