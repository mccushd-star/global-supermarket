// Owner creates a login for a manager or seller of one branch.
import { admin, caller, cors, json } from '../_shared/common.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { shopId, email, password, role, branchId } = await req.json();
    const me = await caller(req, shopId);
    if (!me || me.role !== 'owner') return json({ error: 'Only the shop owner can add staff.' }, 403);
    if (!/^\S+@\S+\.\S+$/.test(email || '')) return json({ error: 'Enter a valid email address.' }, 400);
    if (!password || String(password).length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);
    if (!['manager', 'seller'].includes(role)) return json({ error: 'Role must be manager or seller.' }, 400);
    const db = admin();
    const { data: br } = await db.from('records').select('id').eq('shop_id', shopId).eq('coll', 'branches').eq('id', branchId).maybeSingle();
    if (!br) return json({ error: 'Choose one of your branches.' }, 400);
    const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !created?.user) return json({ error: error?.message || 'Could not create the login.' }, 400);
    const { error: e2 } = await db.from('memberships').insert({ shop_id: shopId, user_id: created.user.id, email, role, branch_id: branchId });
    if (e2) { await db.auth.admin.deleteUser(created.user.id); return json({ error: e2.message }, 400); }
    return json({ ok: true, userId: created.user.id });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
