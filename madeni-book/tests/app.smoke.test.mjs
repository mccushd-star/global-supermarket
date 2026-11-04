// Drives the real js/app.js against a stub DOM: sign in, look at every chart period, enter a sale, ask for a payment, seller limits.
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = {}, els = {}, handlers = {};
const el = id => els[id] || (els[id] = { id, innerHTML: '', textContent: '', className: '', hidden: false, value: '', focus() {}, setAttribute() {}, closest: () => null });
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
globalThis.document = { getElementById: el, addEventListener: (t, f) => { handlers[t] = f; }, activeElement: null, createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } };
globalThis.requestAnimationFrame = f => setTimeout(f, 0);

await import('../js/app.js');
const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));
const click = (act, attrs = {}) => handlers.click({ target: { closest: () => ({ getAttribute: n => (n === 'data-act' ? act : attrs[n.replace('data-', '')] ?? null) }) } });
const type = (id, value) => handlers.input({ target: { id, value, tagName: 'INPUT', closest: () => null } });
const pick = (id, value) => handlers.change({ target: { id, value, tagName: 'SELECT', closest: () => null } });
const view = () => els.view.innerHTML, nav = () => els.nav.innerHTML, status = () => els.status.textContent;
const clean = h => { assert.doesNotMatch(h, /NaN|undefined|\[object/); };

async function login(email) {
  type('aemail', email); type('apass', 'demo1234'); click('login'); await tick(60);
}

test('starts on the sign-in screen with demo accounts', async () => {
  await tick(60);
  assert.match(view(), /Sign in/);
  assert.match(view(), /owner@demo\.test/);
  assert.equal(nav(), '');
});

test('wrong password is refused with a clear message', async () => {
  type('aemail', 'owner@demo.test'); type('apass', 'nope'); click('login'); await tick(60);
  assert.match(view(), /Wrong email or password/);
});

test('owner sees the overview, graph, every period and each branch', async () => {
  await login('owner@demo.test');
  assert.match(nav(), /Settings/);
  assert.match(view(), /<svg class="chart"/);
  assert.match(view(), /Rising|Falling|Losing money|Holding steady/);
  assert.match(view(), /Westlands/);
  assert.match(view(), /Kasarani/);
  for (const p of ['hour', 'day', 'week', 'month', 'year']) {
    click('period', { p }); await tick(10);
    assert.match(view(), /<svg class="chart"/); clean(view());
  }
  pick('brsel', 'b2'); await tick(10);
  assert.match(els.branchbar.innerHTML, /Kasarani/); assert.doesNotMatch(view(), /Branches, last/); clean(view());
  click('sel', { i: '3' }); await tick(10); clean(view());
});

test('owner enters a sale part-paid by M-Pesa and part on credit', async () => {
  click('tab', { t: 'enter' }); await tick(10);
  pick('sp-0', 'p-b2-unga'); type('sq-0', '3'); click('setf', { k: 'method', v: 'mpesa' }); type('rcv', '300');
  pick('scust', '__new'); type('scname', 'test buyer'); type('scphone', '0711222333'); await tick(10);
  assert.match(view(), /KSh 450/);
  click('savesale'); await tick(30);
  assert.match(status(), /Sale saved: KSh 450.*KSh 150 on credit/);
  click('tab', { t: 'credit' }); await tick(30);
  assert.match(view(), /Test Buyer/);
  clean(view());
});

test('payment prompt goes pending, then paid, and can be used for the sale', async () => {
  click('tab', { t: 'enter' }); await tick(10);
  pick('sp-0', 'p-b2-unga'); type('sq-0', '2'); type('pphone', '0712345678'); await tick(10);
  click('sendprompt'); await tick(40);
  assert.match(status(), /Prompt sent/);
  assert.match(view(), /Waiting for buyer/);
  await tick(6400);
  assert.match(view(), /Paid/);
  assert.match(view(), /Use for this sale/);
  const id = /data-act="usepay" data-id="([^"]+)"/.exec(view())[1];
  click('usepay', { id }); await tick(10);
  click('savesale'); await tick(30);
  assert.match(status(), /Sale saved: KSh 300/);
  assert.doesNotMatch(view(), /Use for this sale/);
});

test('bad phone number is caught before sending', async () => {
  type('pphone', '123'); click('sendprompt'); await tick(10);
  assert.match(status(), /Kenyan phone number/);
});

test('owner settings show staff, branches and payment panel', async () => {
  click('tab', { t: 'settings' }); await tick(40);
  assert.match(view(), /Staff logins/); assert.match(view(), /kasarani@demo\.test/);
  assert.match(view(), /Payment connections/);
  clean(view());
});

test('seller sees only Enter and Credit, no profit and no goods-in or expense forms', async () => {
  click('logout'); await tick(40);
  assert.match(view(), /Sign in/);
  await login('kasarani@demo.test');
  assert.match(nav(), /Enter/); assert.match(nav(), /Credit/);
  assert.doesNotMatch(nav(), /Overview|Stock|Settings/);
  assert.doesNotMatch(view(), /Goods in<\/button>|Expense<\/button>/);
  assert.doesNotMatch(view(), /Westlands/);
  click('tab', { t: 'credit' }); await tick(20);
  assert.doesNotMatch(view(), /<b>(Mama Fiona|Wanjiru Mwangi)<\/b>/);
  assert.match(view(), /<b>(Hassan Ali|Otieno Odhiambo|Test Buyer)<\/b>/);
  clean(view());
});
