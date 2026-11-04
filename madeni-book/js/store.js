// Data layer. Two interchangeable stores with the same interface:
//   - cloud: Supabase (real logins, row level security, realtime). Used when js/config.js has a URL and key.
//   - local: browser storage with demo logins. For trying the app only. It is NOT secure and not shared between devices.
import { uid } from './lib.js';
import { makeDemo } from './demo.js';

export const COLLS = ['customers', 'entries', 'branches', 'products', 'stock', 'sales', 'expenses', 'payments', 'meta'];
const NO_BRANCH = ['branches', 'meta'];
const strip = o => { const c = {}; Object.keys(o).forEach(k => { if (k !== 'id') c[k] = o[k]; }); return c; };
const branchOf = (coll, o) => (NO_BRANCH.includes(coll) ? null : (o.branchId || null));

/* =================== local demo store =================== */
const LKEY = 'madeni-local-v2';

export function localStore() {
  let db = null, listeners = new Set(), timers = [];
  const load = () => {
    try { db = JSON.parse(localStorage.getItem(LKEY) || 'null'); } catch (_e) { db = null; }
    if (!db) { db = makeDemo(); save(); }
  };
  const save = () => { try { localStorage.setItem(LKEY, JSON.stringify(db)); } catch (_e) { /* storage blocked */ } };
  const cur = () => db.session && db.accounts.find(a => a.userId === db.session.userId);
  const sessionOf = a => a && { userId: a.userId, email: a.email, shopId: a.shopId, shopName: db.shops[a.shopId].name, role: a.role, branchId: a.branchId };
  const visible = (coll, o) => {
    const a = cur(); if (!a) return false;
    if (a.role === 'owner') return true;
    const b = branchOf(coll, o);
    return b === null || b === a.branchId;
  };
  const emit = () => listeners.forEach(f => f());
  const canWrite = (coll, branch) => {
    const a = cur(); if (!a) return false;
    if (a.role === 'owner') return true;
    if (!branch || branch !== a.branchId) return false;
    if (a.role === 'manager') return !NO_BRANCH.includes(coll);
    return ['sales', 'entries', 'customers', 'payments'].includes(coll);
  };
  const recs = () => db.records[cur().shopId];

  const store = {
    mode: 'local',
    async init() { load(); return sessionOf(cur()); },
    demoAccounts() { if (!db) load(); return db.accounts.filter(a => a.demo).map(a => ({ email: a.email, role: a.role, branchId: a.branchId, password: a.password })); },
    async signIn(email, password) {
      load();
      const a = db.accounts.find(x => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.password === password);
      if (!a) throw new Error('Wrong email or password.');
      db.session = { userId: a.userId }; save(); return sessionOf(a);
    },
    async signUp(email, password, shopName) {
      load();
      email = String(email).trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');
      if (db.accounts.some(x => x.email.toLowerCase() === email.toLowerCase())) throw new Error('That email already has an account.');
      const shopId = uid(), userId = uid();
      db.shops[shopId] = { name: shopName };
      db.accounts.push({ userId, email, password, shopId, role: 'owner', branchId: null });
      db.records[shopId] = { branches: [{ id: 'main', name: shopName }], meta: [{ id: 'settings', shop: shopName, pay: '', payAirtel: '' }] };
      COLLS.forEach(c => { if (!db.records[shopId][c]) db.records[shopId][c] = []; });
      db.session = { userId }; save(); return sessionOf(cur());
    },
    async createShop() { throw new Error('Not needed in demo mode.'); },
    async signOut() { db.session = null; save(); listeners = new Set(); timers.forEach(clearTimeout); timers = []; },
    subscribe(onData) {
      const push = () => { if (!cur()) return; COLLS.forEach(c => onData(c, (recs()[c] || []).filter(o => visible(c, o)).map(o => ({ ...o })))); };
      listeners.add(push); push();
      return () => listeners.delete(push);
    },
    async put(coll, obj) {
      const b = branchOf(coll, obj);
      if (!canWrite(coll, b)) throw new Error('Your login is not allowed to change this.');
      const list = recs()[coll] || (recs()[coll] = []), i = list.findIndex(x => x.id === obj.id);
      if (i < 0) list.push({ ...obj }); else list[i] = { ...obj };
      save(); emit();
    },
    async del(coll, id) {
      const a = cur(), list = recs()[coll] || [], o = list.find(x => x.id === id);
      if (!o) return;
      if (!(a.role === 'owner' || (a.role === 'manager' && canWrite(coll, branchOf(coll, o))))) throw new Error('Your login is not allowed to remove this.');
      recs()[coll] = list.filter(x => x.id !== id); save(); emit();
    },
    async listStaff() {
      const a = cur(); if (a.role !== 'owner') return [];
      return db.accounts.filter(x => x.shopId === a.shopId).map(x => ({ userId: x.userId, email: x.email, role: x.role, branchId: x.branchId }));
    },
    async addStaff({ email, password, role, branchId }) {
      const a = cur(); if (a.role !== 'owner') throw new Error('Only the shop owner can add staff.');
      email = String(email).trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');
      if (db.accounts.some(x => x.email.toLowerCase() === email.toLowerCase())) throw new Error('That email already has an account.');
      if (!(recs().branches || []).some(b => b.id === branchId)) throw new Error('Choose one of your branches.');
      db.accounts.push({ userId: uid(), email, password, shopId: a.shopId, role, branchId }); save();
    },
    async removeStaff(userId) {
      const a = cur(); if (a.role !== 'owner' || userId === a.userId) return;
      db.accounts = db.accounts.filter(x => !(x.userId === userId && x.shopId === a.shopId)); save();
    },
    async paymentConfigStatus() { return { demo: true, mpesa: false, airtel: false }; },
    async savePaymentConfig() { throw new Error('Saving payment keys needs the cloud setup. See the README.'); },
    /** Pretends to send a prompt and confirms it a few seconds later. */
    async requestPayment({ network, phone, amount, reference, branchId }) {
      const id = uid();
      await store.put('payments', { id, branchId, status: 'pending', network, phone, amount, reference, ts: Date.now(), demo: true });
      timers.push(setTimeout(() => {
        const list = recs().payments, p = list.find(x => x.id === id);
        if (p) { p.status = 'paid'; p.receipt = 'DEMO' + id.slice(-6).toUpperCase(); p.doneAt = Date.now(); save(); emit(); }
      }, 6000));
      return { paymentId: id };
    },
    resetDemo() { localStorage.removeItem(LKEY); db = null; },
  };
  return store;
}

/* =================== Supabase store =================== */
export async function cloudStore(cfg) {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  const sb = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  let session = null, channel = null;

  async function resolveSession() {
    const { data } = await sb.auth.getSession();
    const u = data?.session?.user;
    if (!u) return null;
    const { data: m, error } = await sb.from('memberships').select('shop_id, role, branch_id, email, shops(name)').eq('user_id', u.id).limit(1);
    if (error) throw new Error(error.message);
    if (!m || !m.length) return { userId: u.id, email: u.email, shopId: null, shopName: '', role: null, branchId: null };
    return { userId: u.id, email: m[0].email, shopId: m[0].shop_id, shopName: m[0].shops?.name || '', role: m[0].role, branchId: m[0].branch_id };
  }
  const fn = async (name, body) => {
    const { data, error } = await sb.functions.invoke(name, { body });
    if (error) {
      let msg = error.message;
      try { const j = await error.context?.json?.(); if (j?.error) msg = j.error; } catch (_e) { /* keep default */ }
      throw new Error(msg);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const store = {
    mode: 'cloud',
    async init() { session = await resolveSession(); return session; },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email: String(email).trim(), password });
      if (error) throw new Error(/invalid/i.test(error.message) ? 'Wrong email or password.' : error.message);
      session = await resolveSession(); return session;
    },
    async signUp(email, password, shopName) {
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');
      const { data, error } = await sb.auth.signUp({ email: String(email).trim(), password });
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error('CONFIRM_EMAIL');
      await store.createShop(shopName);
      return session;
    },
    async createShop(shopName) {
      const { error } = await sb.rpc('create_shop', { shop_name: shopName });
      if (error) throw new Error(error.message);
      session = await resolveSession(); return session;
    },
    async signOut() { if (channel) { await sb.removeChannel(channel); channel = null; } await sb.auth.signOut(); session = null; },
    subscribe(onData) {
      const cache = {}; COLLS.forEach(c => { cache[c] = new Map(); });
      const emit = c => onData(c, [...cache[c].values()]);
      const toObj = r => ({ ...r.data, id: r.id });
      let stopped = false;
      (async () => {
        let from = 0; const step = 1000;
        for (;;) {
          const { data, error } = await sb.from('records').select('coll,id,data').eq('shop_id', session.shopId).order('coll').order('id').range(from, from + step - 1);
          if (error || stopped) { if (error) onData('__error', error.message); break; }
          data.forEach(r => { if (cache[r.coll]) cache[r.coll].set(r.id, toObj(r)); });
          if (data.length < step) break; from += step;
        }
        COLLS.forEach(emit);
      })();
      channel = sb.channel('records-' + session.shopId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records', filter: `shop_id=eq.${session.shopId}` }, p => {
          const r = p.eventType === 'DELETE' ? p.old : p.new;
          if (!r || !cache[r.coll]) return;
          if (p.eventType === 'DELETE') cache[r.coll].delete(r.id); else cache[r.coll].set(r.id, toObj(r));
          emit(r.coll);
        })
        .subscribe(status => { if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onData('__error', 'Live updates are not connecting.'); });
      return () => { stopped = true; if (channel) sb.removeChannel(channel); channel = null; };
    },
    async put(coll, obj) {
      const { error } = await sb.from('records').upsert({ shop_id: session.shopId, coll, id: obj.id, branch_id: branchOf(coll, obj), data: strip(obj) });
      if (error) throw new Error(error.code === '42501' ? 'Your login is not allowed to change this.' : error.message);
    },
    async del(coll, id) {
      const { error } = await sb.from('records').delete().eq('shop_id', session.shopId).eq('coll', coll).eq('id', id);
      if (error) throw new Error(error.message);
    },
    async listStaff() {
      const { data, error } = await sb.from('memberships').select('user_id,email,role,branch_id').eq('shop_id', session.shopId);
      if (error) throw new Error(error.message);
      return data.map(m => ({ userId: m.user_id, email: m.email, role: m.role, branchId: m.branch_id }));
    },
    async addStaff(s) { await fn('add-staff', { shopId: session.shopId, ...s }); },
    async removeStaff(userId) {
      const { error } = await sb.from('memberships').delete().eq('shop_id', session.shopId).eq('user_id', userId);
      if (error) throw new Error(error.message);
    },
    async paymentConfigStatus() { return fn('save-payment-config', { shopId: session.shopId, status: true }); },
    async savePaymentConfig(cfgObj) { await fn('save-payment-config', { shopId: session.shopId, ...cfgObj }); },
    async requestPayment(p) { return fn('request-payment', { shopId: session.shopId, paymentId: uid(), ...p }); },
  };
  return store;
}
