import test from 'node:test';
import assert from 'node:assert/strict';

const mem = {};
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const { localStore, COLLS } = await import('../js/store.js');

async function as(email) {
  const s = localStore(); await s.init(); await s.signIn(email, 'demo1234');
  const data = {}; COLLS.forEach(c => { data[c] = []; });
  const stop = s.subscribe((c, arr) => { data[c] = arr; });
  return { s, data, stop };
}

test('owner sees every branch, a seller only their own', async () => {
  const o = await as('owner@demo.test'), k = await as('kasarani@demo.test');
  const branchesOf = d => new Set(['sales', 'stock', 'products', 'customers', 'expenses'].flatMap(c => d[c].map(x => x.branchId)));
  assert.deepEqual([...branchesOf(o.data)].sort(), ['b2', 'main']);
  assert.deepEqual([...branchesOf(k.data)], ['b2']);
  assert.equal(o.data.branches.length, 2);
  assert.equal(k.data.branches.length, 2, 'branch names are readable so the seller can see their branch name');
});

test('seller can record sales and credit in their branch only', async () => {
  const k = await as('kasarani@demo.test');
  await k.s.put('sales', { id: 'ts1', branchId: 'b2', ts: Date.now(), total: 10, lines: [], pays: {} });
  await assert.rejects(k.s.put('sales', { id: 'ts2', branchId: 'main', ts: Date.now(), total: 10, lines: [], pays: {} }), /not allowed/);
  await assert.rejects(k.s.put('products', { id: 'px', branchId: 'b2', name: 'x', sell: 1 }), /not allowed/);
  await assert.rejects(k.s.put('expenses', { id: 'ex', branchId: 'b2', amount: 1 }), /not allowed/);
  await assert.rejects(k.s.put('branches', { id: 'zz', name: 'Hijack' }), /not allowed/);
  await assert.rejects(k.s.del('sales', 'ts1'), /not allowed/);
});

test('manager runs one branch but cannot touch settings or other branches', async () => {
  const m = await as('westlands@demo.test');
  await m.s.put('products', { id: 'pm1', branchId: 'main', name: 'Salt', sell: 40 });
  await m.s.put('expenses', { id: 'em1', branchId: 'main', ts: Date.now(), amount: 100, category: 'Other' });
  await assert.rejects(m.s.put('expenses', { id: 'em2', branchId: 'b2', ts: Date.now(), amount: 100 }), /not allowed/);
  await assert.rejects(m.s.put('branches', { id: 'new', name: 'X' }), /not allowed/);
  await assert.rejects(m.s.put('meta', { id: 'settings', shop: 'Mine now' }), /not allowed/);
  assert.equal(m.data.sales.every(x => x.branchId === 'main'), true);
});

test('only the owner manages staff, and new staff are limited to their branch', async () => {
  const k = await as('kasarani@demo.test');
  assert.deepEqual(await k.s.listStaff(), []);
  await assert.rejects(k.s.addStaff({ email: 'a@b.co', password: 'password1', role: 'seller', branchId: 'b2' }), /owner/);
  const o = await as('owner@demo.test');
  await assert.rejects(o.s.addStaff({ email: 'a@b.co', password: 'short', role: 'seller', branchId: 'b2' }), /8 characters/);
  await assert.rejects(o.s.addStaff({ email: 'a@b.co', password: 'password1', role: 'seller', branchId: 'nope' }), /branches/);
  await o.s.addStaff({ email: 'new@shop.co', password: 'password1', role: 'seller', branchId: 'main' });
  const n = await as('new@shop.co').catch(() => null);
  assert.equal(n, null, 'wrong password in helper (demo1234) must fail');
  const s2 = localStore(); await s2.init(); await s2.signIn('new@shop.co', 'password1');
  const seen = []; s2.subscribe((c, arr) => { if (c === 'sales') seen.push(...arr); });
  assert.equal(seen.length > 0 && seen.every(x => x.branchId === 'main'), true);
});

test('a new shop is separate from every other shop', async () => {
  const s = localStore(); await s.init();
  await s.signUp('boss@other.co', 'password1', 'Other Duka');
  const data = {}; COLLS.forEach(c => { data[c] = []; });
  s.subscribe((c, arr) => { data[c] = arr; });
  assert.equal(data.sales.length, 0);
  assert.equal(data.branches[0].name, 'Other Duka');
  await s.put('products', { id: 'op', branchId: 'main', name: 'Tea', sell: 20 });
  await s.signOut();
  const d = await as('owner@demo.test');
  assert.equal(d.data.products.some(p => p.id === 'op'), false);
  await assert.rejects(s.signIn('boss@other.co', 'wrong'), /Wrong email/);
});

test('demo payment prompt starts pending and is confirmed later', async () => {
  const k = await as('kasarani@demo.test');
  const { paymentId } = await k.s.requestPayment({ network: 'mpesa', phone: '254712345678', amount: 450, reference: 'Sale', branchId: 'b2' });
  assert.equal(k.data.payments.find(p => p.id === paymentId).status, 'pending');
  await new Promise(r => setTimeout(r, 6300));
  const p = k.data.payments.find(x => x.id === paymentId);
  assert.equal(p.status, 'paid');
  assert.match(p.receipt, /^DEMO/);
});
