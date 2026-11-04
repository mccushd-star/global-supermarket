// Example business for demo mode: one shop, two branches, about six months of made-up history.
// Dates are relative to today so the graphs always look current. Every name and figure is invented.
import { r2 } from './lib.js';

const H = 3600000, DAY = 24 * H;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const PROD = [
  ['unga', 'Unga 2kg', 'pieces', 125, 150, 40], ['sugar', 'Sugar 1kg', 'kg', 140, 170, 35], ['oil', 'Cooking oil 1L', 'litres', 290, 350, 20],
  ['milk', 'Milk 500ml', 'pieces', 50, 60, 90], ['bread', 'Bread 400g', 'pieces', 55, 65, 80], ['rice', 'Rice 1kg', 'kg', 160, 200, 25],
];
const SUP = { unga: 'Unga Distributors', sugar: 'Mumias Wholesalers', oil: 'Bidco Depot', milk: 'Brookside Agent', bread: 'Supa Loaf Agent', rice: 'Pishori Traders' };
const BR = { main: { name: 'Westlands (main shop)', scale: 1.0, up: true }, b2: { name: 'Kasarani branch', scale: 0.95, up: false } };
const HW = { 8: 2, 9: 3, 10: 3, 11: 4, 12: 5, 13: 4, 14: 3, 15: 3, 16: 4, 17: 6, 18: 7, 19: 5, 20: 3, 21: 2 };
const DW = [0.9, 0.9, 0.95, 1.0, 1.2, 1.4, 1.0];

export function makeDemo(now = Date.now()) {
  const rand = rng(20261104);
  const rnd = (a, b) => a + (b - a) * rand();
  const dayStart = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const today = dayStart(now), nowH = new Date(now).getHours();
  const wd = ts => (new Date(ts).getDay() + 6) % 7;
  const R = { branches: [], meta: [], products: [], stock: [], sales: [], expenses: [], customers: [], entries: [], payments: [] };
  const state = {}, sell = {};
  let k = 0;
  const id = p => p + (++k).toString(36);
  const factor = (b, back) => (BR[b].up ? 1.2 - 0.0027 * back : 0.9 + 0.0028 * back) * BR[b].scale;
  const costAt = (pid, ts) => { const back = (today - dayStart(ts)) / DAY; return Math.round(PROD.find(p => p[0] === pid)[3] * (1 + 0.0002 * (190 - back))); };

  Object.keys(BR).forEach(b => {
    R.branches.push({ id: b, name: BR[b].name });
    PROD.forEach(([pid, name, unit, , sp]) => {
      const key = b + pid; sell[key] = sp; state[key] = { qIn: 0, cIn: 0, out: 0 };
      R.products.push({ id: 'p-' + b + '-' + pid, branchId: b, name, unit, sell: sp });
    });
  });
  R.meta.push({ id: 'settings', shop: 'Njeri\'s Mini Mart', pay: 'Till 5123456', payAirtel: '0733 123 456' });

  const addStock = (b, pid, ts, qty, unitCost, o = {}) => {
    const total = qty * unitCost, st = state[b + pid];
    st.qIn += qty; st.cIn += total;
    R.stock.push({ id: id('k'), branchId: b, productId: 'p-' + b + '-' + pid, qty, unitCost, total, paid: o.opening ? 0 : (o.paid ?? total),
      method: o.opening ? 'opening' : (o.method || 'cash'), supplier: o.sup || '', ts, ...(o.opening ? { opening: true } : {}) });
  };

  const events = [];
  const units = (b, ts) => {
    const f = factor(b, (today - dayStart(ts)) / DAY);
    const o = {};
    PROD.forEach(([pid, , , , , wk]) => { o[pid] = Math.max(0, Math.round(wk / 7 * DW[wd(ts)] * f * rnd(0.85, 1.15))); });
    return o;
  };
  Object.keys(BR).forEach(b => {
    [0, 1].forEach(d => {
      const ds = today - d * DAY, u = units(b, ds), tot = Object.values(HW).reduce((a, c) => a + c, 0);
      Object.keys(HW).map(Number).filter(h => d === 1 || h <= nowH).forEach(h => {
        const lines = [];
        Object.entries(u).forEach(([pid, n]) => { const q = Math.round(n * HW[h] / tot * rnd(0.7, 1.3)); if (q > 0) lines.push([pid, q]); });
        if (lines.length) events.push({ ts: ds + h * H + Math.floor(rnd(1, 50)) * 60000, b, lines });
      });
    });
    let d0 = 27; while (wd(today - d0 * DAY) !== 0) d0++;
    for (let d = 2; d <= d0; d++) { const ds = today - d * DAY; events.push({ ts: ds + 15 * H + Math.floor(rnd(0, 50)) * 60000, b, lines: Object.entries(units(b, ds)).filter(e => e[1] > 0) }); }
    const mon0 = today - d0 * DAY;
    for (let w = 1; w <= 22; w++) {
      const mon = mon0 - 7 * w * DAY, sum = {};
      for (let i = 0; i < 7; i++) Object.entries(units(b, mon + i * DAY)).forEach(([p, q]) => { sum[p] = (sum[p] || 0) + q; });
      events.push({ ts: mon + 2 * DAY + 12 * H, b, lines: Object.entries(sum).filter(e => e[1] > 0) });
    }
  });
  events.sort((a, c) => a.ts - c.ts);
  const first = events[0].ts;
  Object.keys(BR).forEach(b => PROD.forEach(([pid, , , , , wk]) => addStock(b, pid, first - 2 * DAY, Math.round(wk * BR[b].scale * 3), costAt(pid, first), { opening: true })));

  events.forEach(ev => {
    const out = [];
    ev.lines.forEach(([pid, q]) => {
      const st = state[ev.b + pid];
      if (st.qIn - st.out < q + 2) {
        const wk = PROD.find(p => p[0] === pid)[5], qty = Math.max(Math.round(wk * BR[ev.b].scale * 4), q * 2), c = costAt(pid, ev.ts);
        const recent = (today - dayStart(ev.ts)) / DAY < 20 && rand() < 0.45;
        addStock(ev.b, pid, ev.ts - 2 * H, qty, c, { paid: recent ? 0 : qty * c, method: recent ? 'credit' : ['cash', 'mpesa', 'mpesa', 'airtel'][Math.floor(rand() * 4)], sup: SUP[pid] });
      }
      const s2 = state[ev.b + pid], avg = s2.cIn / s2.qIn; s2.out += q;
      out.push({ productId: 'p-' + ev.b + '-' + pid, name: PROD.find(p => p[0] === pid)[1], qty: q, price: sell[ev.b + pid], cost: r2(avg) });
    });
    const total = out.reduce((t, l) => t + l.qty * l.price, 0);
    const cash = Math.floor(total * rnd(0.3, 0.5)), airtel = Math.floor(total * rnd(0.04, 0.12));
    R.sales.push({ id: id('s'), branchId: ev.b, ts: ev.ts, lines: out, total, pays: { cash, mpesa: total - cash - airtel, airtel, credit: 0 }, custId: null, ref: '', note: '' });
  });

  Object.keys(BR).forEach(b => {
    for (let day = dayStart(first); day <= today; day += DAY) {
      const d = new Date(day), dom = d.getDate();
      const ex = (h, category, amount, method, note) => { if (day + h * H < now) R.expenses.push({ id: id('x'), branchId: b, ts: day + h * H, category, amount, method, note }); };
      if (dom === 1) ex(8, 'Rent', b === 'main' ? 4500 : 3800, 'mpesa', 'Monthly rent');
      if (dom === 5) ex(10, 'Electricity and water', b === 'main' ? 1300 : 1000, 'mpesa', '');
      if (dom === 15) ex(9, 'Transport', 900, 'cash', 'Restock transport');
      if (dom === 28) ex(17, 'Wages', b === 'main' ? 5200 : 4600, 'mpesa', 'Monthly pay');
    }
  });

  // a few credit customers
  [['Wanjiru Mwangi', '0712345678', 'main', [[12, 4500, 'Unga, sugar, cooking oil'], [5, 1200, 'Rice and milk']], []],
   ['Otieno Odhiambo', '0722110034', 'b2', [[24, 3800, 'School uniform']], [[18, 1000, 'SGX1A2B3C4']]],
   ['Mama Fiona', '0733987654', 'main', [[2, 950, 'Bread and eggs']], []],
   ['Hassan Ali', '0798123456', 'b2', [[9, 1500, 'Charcoal and soap']], [[0, 1500, 'TKD1H5N8QW']]]].forEach(([name, phone, b, credits, pays]) => {
    const cid = id('c'); R.customers.push({ id: cid, branchId: b, name, phone });
    credits.forEach(([dd, amount, note]) => R.entries.push({ id: id('e'), branchId: b, custId: cid, type: 'credit', amount, ts: now - dd * DAY, note, code: '', from: '' }));
    pays.forEach(([dd, amount, code]) => R.entries.push({ id: id('e'), branchId: b, custId: cid, type: 'payment', amount, ts: now - dd * DAY - 3 * H, note: 'M-Pesa', code, from: name }));
  });

  const shopId = 'demo-shop';
  const accounts = [
    { userId: 'u1', email: 'owner@demo.test', password: 'demo1234', shopId, role: 'owner', branchId: null, demo: true },
    { userId: 'u2', email: 'westlands@demo.test', password: 'demo1234', shopId, role: 'manager', branchId: 'main', demo: true },
    { userId: 'u3', email: 'kasarani@demo.test', password: 'demo1234', shopId, role: 'seller', branchId: 'b2', demo: true },
  ];
  return { shops: { [shopId]: { name: "Njeri's Mini Mart (example)" } }, accounts, records: { [shopId]: R }, session: null };
}
