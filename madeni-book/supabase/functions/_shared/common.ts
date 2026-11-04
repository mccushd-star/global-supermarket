// Shared helpers for Madeni Book edge functions (Deno).
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export const admin = (): SupabaseClient =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

export type Caller = { userId: string; role: 'owner' | 'manager' | 'seller'; branchId: string | null };

/** Verifies the caller's JWT and returns their membership in the given shop, or null. */
export async function caller(req: Request, shopId: string): Promise<Caller | null> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || !shopId) return null;
  const db = admin();
  const { data: u, error } = await db.auth.getUser(token);
  if (error || !u?.user) return null;
  const { data: m } = await db.from('memberships').select('role, branch_id').eq('shop_id', shopId).eq('user_id', u.user.id).maybeSingle();
  if (!m) return null;
  return { userId: u.user.id, role: m.role, branchId: m.branch_id };
}

export const isSandbox = () => (Deno.env.get('PAYMENTS_ENV') || 'sandbox') !== 'production';
