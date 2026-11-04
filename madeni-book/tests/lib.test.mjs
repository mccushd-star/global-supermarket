import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/lib.js';

const D = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();

test('parses the common M-Pesa wordings', () => {
  const t = [
    'TKD4P7Q2LM Confirmed. Ksh2,000.00 received from WANJIRU MWANGI 0712345678 on 3/11/26 at 9:12 AM. New M-PESA balance is Ksh14,820.00.',
    'TKD4P7R9XA Confirmed.You have received Ksh350.00 from PETER KIPCHOGE 0701555222 on 3/11/26 at 9:40 AM.',
    'QWE1234567 Confirmed. Ksh1,000.50 received from 254733987654 JANE DOE. on 3/11/26 at 3:05 PM.',
    'ABC9876543 Confirmed. Ksh500.00 received from OTIENO ODHIAMBO 0722***034 on 3/11/26 at 12:00 PM.',
    'GARBAGE123 Confirmed nothing useful',
  ].join('\n\n');
  const r = L.parseMessages(t);
  assert.equal(r.items.length, 4);
  assert.equal(r.bad, 1);
  assert.deepEqual(r.items.map(i => i.amount), [2000, 350, 1000.5, 500]);
  assert.equal(r.items[2].phone, '254733987654');
  assert.equal(new Date(r.items[2].ts).getHours(), 15);
  assert.equal(new Date(r.items[3].ts).getHours(), 12);
});

test('matches payments to customers by phone, masked phone, then name', () => {
  const cs = [{ name: 'Wanjiru Mwangi', phone: '0712 345 678' }, { name: 'Mama Fiona', phone: '0733987654' }, { name: 'Otieno Odhiambo', phone: '0722110034' }];
  assert.equal(L.matchCustomer(cs, { phone: '254712345678', name: 'X' }).name, 'Wanjiru Mwangi');
  assert.equal(L.matchCustomer(cs, { phone: '0722***034', name: 'X' }).name, 'Otieno Odhiambo');
  assert.equal(L.matchCustomer(cs, { phone: '0722***035', name: 'X' }), null);
  assert.equal(L.matchCustomer(cs, { phone: '', name: 'Fiona Mama' }).name, 'Mama Fiona');
  assert.equal(L.matchCustomer(cs, { phone: '0701555222', name: 'Peter Kipchoge' }), null);
});

test('normalises Kenyan phone numbers for payment requests', () => {
  assert.equal(L.intlPhone('0712 345 678'), '254712345678');
  assert.equal(L.intlPhone('+254 112 345 678'), '254112345678');
  assert.equal(L.intlPhone('712345678'), '254712345678');
  assert.equal(L.intlPhone('12345'), '');
  assert.equal(L.intlPhone('0612345678'), '');
});

test('splits a sale between cash, mobile money and credit', () => {
  assert.deepEqual(L.paySplit(450, 'mpesa', '300').pays, { cash: 0, mpesa: 300, airtel: 0, credit: 150 });
  assert.deepEqual(L.paySplit(450, 'cash', '').pays, { cash: 450, mpesa: 0, airtel: 0, credit: 0 });
  assert.deepEqual(L.paySplit(450, 'credit', '100').pays, { cash: 0, mpesa: 0, airtel: 0, credit: 450 });
  assert.equal(L.paySplit(450, 'airtel', '9999').recv, 450);
});

function shop() {
  const now = D(2026, 11, 4, 10);
  const S = { products: [{ id: 'u', branchId: 'a', name: 'Unga', sell: 150 }], stock: [], sales: [], expenses: [], entries: [] };
  S.stock.push({ id: 'o', branchId: 'a', productId: 'u', qty: 100, unitCost: 100, total: 10000, paid: 0, method: 'opening', opening: true, ts: D(2026, 10, 1) });
  S.stock.push({ id: 'g', branchId: 'a', productId: 'u', qty: 100, unitCost: 120, total: 12000, paid: 5000, method: 'mpesa', ts: D(2026, 11, 2, 9) });
  const sale = (id, br, ts, q) => S.sales.push({ id, branchId: br, ts, total: q * 150, lines: [{ productId: 'u', qty: q, price: 150, cost: 110 }], pays: { cash: q * 150, mpesa: 0, airtel: 0, credit: 0 } });
  sale('s1', 'a', D(2026, 11, 4, 9), 10);
  sale('s2', 'a', D(2026, 11, 3, 9), 20);
  sale('s3', 'b', D(2026, 11, 4, 8), 5);
  S.expenses.push({ id: 'e1', branchId: 'a', ts: D(2026, 11, 4, 7), amount: 300 });
  return { S, now };
}

test('stock on hand and average cost', () => {
  const { S } = shop();
  const m = L.calcMap(S).u;
  assert.equal(m.qIn, 200);
  assert.equal(m.out, 35);
  assert.equal(m.stock, 165);
  assert.equal(m.avg, 110);
});

test('profit is sales minus cost of goods minus expenses, per period and branch', () => {
  const { S, now } = shop();
  const W = L.windowData(S, 'day', 'a', now);
  const today = W.B[W.B.length - 1], yday = W.B[W.B.length - 2];
  assert.equal(today.sales, 1500);
  assert.equal(today.cogs, 1100);
  assert.equal(today.exp, 300);
  assert.equal(today.profit, 100);
  assert.equal(yday.profit, 3000 - 2200);
  assert.equal(today.gin, 0);
  const all = L.windowData(S, 'day', 'all', now).B.pop();
  assert.equal(all.sales, 1500 + 750);
  assert.equal(all.profit, 100 + (750 - 550));
});

test('goods in count as purchases but opening stock does not', () => {
  const { S, now } = shop();
  const W = L.windowData(S, 'week', 'a', now);
  assert.equal(L.sumF(W.B, 'gin'), 12000);
  assert.equal(L.sumF(W.B, 'ginPaid'), 5000);
  assert.equal(L.sumF(W.B, 'gin') - L.sumF(W.B, 'ginPaid'), 7000);
  assert.equal(L.sumF(W.B, 'cogs') > 0, true);
  assert.equal(W.B.reduce((t, b) => t + b.gp.mpesa, 0), 5000);
});

test('hourly window buckets by hour', () => {
  const { S, now } = shop();
  const W = L.windowData(S, 'hour', 'a', now);
  assert.equal(W.B.length, 24);
  const at9 = W.B.find(b => new Date(b.start).getHours() === 9 && new Date(b.start).getDate() === 4);
  assert.equal(at9.sales, 1500);
});

test('rising and falling verdicts', () => {
  const mk = vals => ({ B: vals.slice(-3).map(p => ({ profit: p, sales: 100, exp: 0, gin: 0, cogs: 0, ginPaid: 0 })), P: vals.slice(0, 3).map(p => ({ profit: p, sales: 100, exp: 0, gin: 0, cogs: 0, ginPaid: 0 })), N: 3 });
  assert.equal(L.summarize(mk([10, 10, 10, 30, 30, 30])).state, 'rising');
  assert.equal(L.summarize(mk([30, 30, 30, 10, 10, 10])).state, 'falling');
  assert.equal(L.summarize(mk([20, 20, 20, 20, 20, 21])).state, 'steady');
  const s = L.summarize(mk([-5, 10, 0, -5, 20, 0]));
  assert.equal(s.made, 20);
  assert.equal(s.lost, -5);
});

test('customer credit balance and lateness', () => {
  const now = D(2026, 11, 4);
  const S = { entries: [
    { custId: 'c', type: 'credit', amount: 1000, ts: now - 30 * L.DAY },
    { custId: 'c', type: 'credit', amount: 500, ts: now - 3 * L.DAY },
    { custId: 'c', type: 'payment', amount: 1000, ts: now - 2 * L.DAY },
  ] };
  const s = L.custStat(S, { id: 'c' }, now);
  assert.equal(s.bal, 500);
  assert.equal(s.age, 3);
  assert.equal(s.overdue, false);
  S.entries.push({ custId: 'c', type: 'payment', amount: 600, ts: now });
  assert.equal(L.custStat(S, { id: 'c' }, now).bal, -100);
});
