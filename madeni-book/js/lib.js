// Pure logic for Madeni Book: formatting, M-Pesa SMS parsing, time buckets, stock, profit.
// No DOM and no network, so it can be unit tested in Node.

export const DAY = 86400000;
export const GRACE = 14;
export const NB = { hour: 24, day: 14, week: 12, month: 12, year: 5 };
export const PERLABEL = { hour: '24 hours', day: '14 days', week: '12 weeks', month: '12 months', year: '5 years' };

/* ---------- formatting ---------- */
export const r2 = n => Math.round(n * 100) / 100;
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = n => 'KSh ' + (Number(n) === 0 ? 0 : Number(n)).toLocaleString('en-KE', { maximumFractionDigits: 2 });
export const sgn = n => (n > 0 ? '+ ' : n < 0 ? '− ' : '') + fmt(Math.abs(n));
export function compact(n) {
  const a = Math.abs(n);
  return (n < 0 ? '−' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1) + 'M' : a >= 1e4 ? Math.round(a / 1e3) + 'k' : a >= 1e3 ? (a / 1e3).toFixed(1) + 'k' : String(Math.round(a)));
}
export function iso(ts) {
  const d = new Date(ts), p = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export const toTitle = s => String(s || '').toLowerCase().replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase());
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- phone numbers ---------- */
export const digits = s => String(s || '').replace(/\D/g, '');
export function toWa(p) {
  const d = digits(p);
  if (d.length === 10 && d[0] === '0') return '254' + d.slice(1);
  if (d.length === 9) return '254' + d;
  return d;
}
export function localPhone(p) {
  let d = String(p || '').replace(/[^\d*]/g, '');
  if (d.indexOf('254') === 0) d = '0' + d.slice(3);
  else if (d.length === 9 && d[0] !== '0') d = '0' + d;
  return d;
}
/** Kenyan number in international form without plus, e.g. 254712345678, or '' if it does not look valid. */
export function intlPhone(p) {
  const l = localPhone(p);
  return /^0[17]\d{8}$/.test(l) ? '254' + l.slice(1) : '';
}
export function phoneMatch(a, b) {
  a = localPhone(a); b = localPhone(b);
  if (!a || !b) return false;
  const ma = a.indexOf('*') > -1, mb = b.indexOf('*') > -1;
  if (!ma && !mb) return a.length >= 9 && b.length >= 9 && a.slice(-9) === b.slice(-9);
  if (ma && mb) return false;
  const masked = ma ? a : b, other = ma ? b : a;
  const head = masked.slice(0, masked.indexOf('*')), tail = masked.slice(masked.lastIndexOf('*') + 1);
  return other.length === masked.length && other.indexOf(head) === 0 && (!tail || other.slice(-tail.length) === tail);
}

/* ---------- M-Pesa SMS ---------- */
const words = n => String(n || '').toUpperCase().split(/[^A-Z]+/).filter(Boolean);
export function sameName(a, b) {
  const A = words(a), B = words(b);
  if (!A.length || !B.length) return false;
  const shared = A.filter(w => B.indexOf(w) > -1).length;
  return shared >= 2 || (shared >= 1 && (A.length === 1 || B.length === 1));
}
const RX = /([A-Z0-9]{10})\s+Confirmed\.?\s*(?:You have received\s*)?Ksh\.?\s*([\d,]+(?:\.\d+)?)\s+(?:received\s+)?from\s+(.+?)\.?\s+(?:(\+?\d[\d* ]{6,12}[\d*])\s+)?on\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+at\s+(\d{1,2}):(\d{2})\s*([AP]M)/i;
export function parseMessages(text) {
  const chunks = String(text || '').split(/(?=[A-Z0-9]{10}\s+Confirmed)/i).filter(c => /Confirmed/i.test(c));
  const items = []; let bad = 0;
  chunks.forEach(c => {
    const m = RX.exec(c);
    if (!m) { bad++; return; }
    let name = m[3].trim(), phone = m[4] || '';
    const lead = /^(\+?\d[\d* ]{7,12}[\d*])\s+(.+)$/.exec(name);
    if (lead) { phone = lead[1]; name = lead[2]; }
    let y = +m[7]; if (y < 100) y += 2000;
    const h = (+m[8]) % 12 + (/p/i.test(m[10]) ? 12 : 0);
    items.push({ code: m[1].toUpperCase(), amount: parseFloat(m[2].replace(/,/g, '')), name: toTitle(name), phone: phone.trim(), ts: new Date(y, +m[6] - 1, +m[5], h, +m[9]).getTime() });
  });
  return { items, bad };
}
export function matchCustomer(customers, item) {
  for (const c of customers) if (phoneMatch(c.phone, item.phone)) return c;
  for (const c of customers) if (sameName(c.name, item.name)) return c;
  return null;
}

/* ---------- time buckets ---------- */
export function startOf(ts, per) {
  const d = new Date(ts);
  if (per === 'hour') { d.setMinutes(0, 0, 0); return d.getTime(); }
  d.setHours(0, 0, 0, 0);
  if (per === 'day') return d.getTime();
  if (per === 'week') { d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
  if (per === 'month') { d.setDate(1); return d.getTime(); }
  d.setMonth(0, 1); return d.getTime();
}
export function addUnit(ts, per, n) {
  const d = new Date(ts);
  if (per === 'hour') d.setHours(d.getHours() + n);
  else if (per === 'day') d.setDate(d.getDate() + n);
  else if (per === 'week') d.setDate(d.getDate() + 7 * n);
  else if (per === 'month') d.setMonth(d.getMonth() + n);
  else d.setFullYear(d.getFullYear() + n);
  return d.getTime();
}
export function trend(vals) {
  const n = vals.length, mx = (n - 1) / 2, my = vals.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  vals.forEach((v, i) => { num += (i - mx) * (v - my); den += (i - mx) * (i - mx); });
  const b = den ? num / den : 0;
  return { a: my - b * mx, b };
}
export function blabel(ts, per, long) {
  const d = new Date(ts);
  if (per === 'hour') return long ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + String(d.getHours()).padStart(2, '0') + ':00 to ' + String((d.getHours() + 1) % 24).padStart(2, '0') + ':00' : String(d.getHours()).padStart(2, '0');
  if (per === 'day') return d.toLocaleDateString('en-GB', long ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });
  if (per === 'week') return (long ? 'Week of ' : '') + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (per === 'month') return d.toLocaleDateString('en-GB', long ? { month: 'long', year: 'numeric' } : { month: 'short' });
  return String(d.getFullYear());
}

/* ---------- books ---------- */
export const bid = x => x.branchId || 'main';

/** Stock on hand and average buying cost per product. */
export function calcMap(S) {
  const m = {};
  S.products.forEach(p => { m[p.id] = { qIn: 0, cIn: 0, out: 0 }; });
  S.stock.forEach(s => { const c = m[s.productId]; if (c) { c.qIn += s.qty; c.cIn += s.total; } });
  S.sales.forEach(x => (x.lines || []).forEach(l => { const c = m[l.productId]; if (c) c.out += l.qty; }));
  Object.keys(m).forEach(k => { const c = m[k]; c.stock = r2(c.qIn - c.out); c.avg = c.qIn ? c.cIn / c.qIn : 0; });
  return m;
}

/** Buckets for the last N periods and the N before them. Profit = sales - cost of goods sold - expenses. */
export function windowData(S, per, brSel, now = Date.now()) {
  const N = NB[per], cur = startOf(now, per), B = [];
  for (let i = -(2 * N - 1); i <= 0; i++) {
    B.push({ start: addUnit(cur, per, i), end: addUnit(cur, per, i + 1), sales: 0, cogs: 0, exp: 0, gin: 0, ginPaid: 0, count: 0,
      pays: { cash: 0, mpesa: 0, airtel: 0, credit: 0 }, gp: { cash: 0, mpesa: 0, airtel: 0 } });
  }
  const slot = ts => { for (let k = B.length - 1; k >= 0; k--) if (ts >= B[k].start && ts < B[k].end) return B[k]; return null; };
  const ok = x => brSel === 'all' || bid(x) === brSel;
  S.sales.forEach(x => {
    if (!ok(x)) return; const b = slot(x.ts); if (!b) return;
    b.sales += x.total; b.count++;
    (x.lines || []).forEach(l => { b.cogs += l.qty * (l.cost || 0); });
    ['cash', 'mpesa', 'airtel', 'credit'].forEach(k => { b.pays[k] += (x.pays && x.pays[k]) || 0; });
  });
  S.stock.forEach(x => {
    if (!ok(x) || x.opening) return; const b = slot(x.ts); if (!b) return;
    b.gin += x.total; b.ginPaid += x.paid || 0; if (b.gp[x.method] !== undefined) b.gp[x.method] += x.paid || 0;
  });
  S.expenses.forEach(x => { if (!ok(x)) return; const b = slot(x.ts); if (b) b.exp += x.amount; });
  B.forEach(b => { b.profit = b.sales - b.cogs - b.exp; });
  return { N, per, B: B.slice(N), P: B.slice(0, N) };
}
export const sumF = (arr, f) => arr.reduce((t, b) => t + b[f], 0);

export function summarize(W) {
  const cur = sumF(W.B, 'profit'), prev = sumF(W.P, 'profit'), delta = cur - prev;
  const made = W.B.reduce((t, b) => t + (b.profit > 0 ? b.profit : 0), 0), lost = W.B.reduce((t, b) => t + (b.profit < 0 ? b.profit : 0), 0);
  const sales = sumF(W.B, 'sales'), has = sales > 0 || sumF(W.B, 'exp') > 0 || sumF(W.B, 'gin') > 0;
  const hasPrev = sumF(W.P, 'sales') > 0 || sumF(W.P, 'exp') > 0;
  let state = 'steady';
  if (has && hasPrev) {
    const base = Math.max(Math.abs(prev), Math.abs(cur), 1);
    if (Math.abs(delta) >= 0.05 * base) state = delta > 0 ? 'rising' : 'falling';
  } else if (has) {
    const ps = W.B.map(b => b.profit), tr = trend(ps), span = tr.b * (W.N - 1), avg = ps.reduce((t, v) => t + Math.abs(v), 0) / W.N;
    if (Math.abs(span) >= 0.15 * Math.max(avg, 1)) state = span > 0 ? 'rising' : 'falling';
  }
  return { cur, prev, delta, hasPrev, made, lost, sales, has, state, pct: prev > 0 ? delta / prev * 100 : null,
    cogs: sumF(W.B, 'cogs'), exp: sumF(W.B, 'exp'), gin: sumF(W.B, 'gin'), ginPaid: sumF(W.B, 'ginPaid') };
}

/** Customer credit balance and how long the oldest unpaid credit has been open. */
export function custStat(S, c, now = Date.now()) {
  const cr = S.entries.filter(e => e.custId === c.id && e.type === 'credit').sort((a, b) => a.ts - b.ts);
  const paid = S.entries.filter(e => e.custId === c.id && e.type === 'payment').reduce((s, e) => s + e.amount, 0);
  const total = cr.reduce((s, e) => s + e.amount, 0), bal = r2(total - paid);
  let left = paid, oldest = null;
  for (let i = 0; i < cr.length; i++) { const r = cr[i].amount - left; if (r > 0.001) { oldest = cr[i].ts; break; } left -= cr[i].amount; }
  const age = bal > 0 && oldest ? Math.floor((now - oldest) / DAY) : 0;
  return { bal, age, overdue: bal > 0 && age > GRACE };
}

/** Split a sale total across payment methods. method: cash|mpesa|airtel|credit. received: amount paid now or '' for all. */
export function paySplit(total, method, received) {
  const raw = received === '' || received == null ? total : Math.max(parseFloat(received) || 0, 0);
  const recv = method === 'credit' ? 0 : Math.min(total, raw);
  const pays = { cash: 0, mpesa: 0, airtel: 0, credit: r2(total - recv) };
  if (method !== 'credit') pays[method] = r2(recv);
  return { method, recv: r2(recv), credit: pays.credit, pays };
}
