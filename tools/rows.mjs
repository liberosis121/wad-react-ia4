// tools/rows.mjs — runs README's "Done means" rows 4–10 and 14–19 in a real
// Chromium, driven over the DevTools protocol with real mouse and key events.
// The browser is started so that no host except localhost can be resolved,
// the way the rubric says the marking is run. No packages: Node 22 or newer.
//
//   npm run dev              (in another terminal)
//   node tools/rows.mjs      → evidence/chromium-run.txt and evidence/*.png
import { spawn, execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BROWSER = process.env.CHROMIUM ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:5173';
const PORT = 9333;
const BLOCK = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = [];
const log = (row, what, value) => {
  const line = `${row} | ${what} | ${typeof value === 'string' ? value : JSON.stringify(value)}`;
  lines.push(line);
  console.log(line);
};

// Helpers that live in the page: they only READ the DOM.
const PAGE_HELPERS = `window.T = {
  q: (s) => document.querySelector(s),
  lis: () => [...document.querySelectorAll('ul[aria-label="Products"] > li')],
  names: () => T.lis().map((li) => li.querySelector('h2').textContent),
  status: () => { const s = document.querySelectorAll('[role="status"]'); return s.length === 1 ? s[0].textContent : 'STATUS ELEMENTS: ' + s.length; },
  card: (n) => T.lis().find((li) => li.querySelector('h2').textContent === n),
  btn: (n, t) => [...T.card(n).querySelectorAll('button')].find((b) => b.textContent.trim() === t),
  any: (t) => [...document.querySelectorAll('#root button')].find((b) => b.textContent.trim() === t),
  form: () => document.querySelector('form[aria-label="Checkout"]'),
  field: (l) => document.getElementById([...T.form().querySelectorAll('label')].find((x) => x.textContent === l).htmlFor),
  desc: (el) => (el.getAttribute('aria-describedby') || '').split(/\\s+/).filter(Boolean).map((i) => document.getElementById(i)?.textContent ?? '').join(' | '),
  cart: () => [...T.q('aside[aria-label="Cart"]').querySelectorAll('p')].slice(0, 2).map((p) => p.textContent).join(' / '),
  live: () => T.form().querySelector('[aria-live]').textContent,
  saved: () => [...document.querySelectorAll('section[aria-label="Saved"] li')].map((l) => l.textContent),
  header: () => T.q('header').textContent,
  expanded: () => T.lis().map((li) => li.querySelector('h2').textContent + ':' + li.querySelector('[aria-expanded]').getAttribute('aria-expanded')),
  pressed: () => T.lis().filter((li) => li.querySelector('[aria-pressed="true"]')).map((li) => li.querySelector('h2').textContent),
  focus: () => { const el = document.activeElement; const cs = getComputedStyle(el); return { on: el.labels?.[0]?.textContent || el.textContent.trim(), ring: (el.matches(':focus-visible') ? 'focus-visible ' : 'NOT focus-visible ') + cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor }; },
  measure: () => {
    const vw = document.documentElement.clientWidth;
    const past = [...document.querySelectorAll('#root *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 0.5 || r.left < -0.5); }).length;
    const h = (sel) => Math.min(...[...document.querySelectorAll(sel)].map((b) => b.getBoundingClientRect().height));
    return { clientWidth: vw, scrollWidth: document.documentElement.scrollWidth, productColumns: new Set(T.lis().map((l) => Math.round(l.getBoundingClientRect().left))).size, shortestButton: h('#root button'), shortestField: h('#root input, #root textarea'), elementsPastEdge: past, placeOrderColour: getComputedStyle(T.any('Place order')).backgroundColor };
  },
};`;

const child = spawn(BROWSER, ['--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ia4-'))}`, BLOCK, '--no-first-run',
  '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 100 && !targets; i++) {
  await sleep(100);
  targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => undefined);
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let lastId = 0;
const pending = new Map();
const net = new Map(); // requestId → { url, status, failed }
const origins = new Set(); // origins that answered a request
const refused = []; // requests that never got an answer
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result);
  } else if (m.method === 'Network.requestWillBeSent') {
    const { url } = m.params.request;
    net.set(m.params.requestId, { url });
  } else if (m.method === 'Network.responseReceived') {
    const r = net.get(m.params.requestId);
    if (r) { r.status = m.params.response.status; origins.add(r.url.startsWith('data:') ? 'data: (inline)' : new URL(r.url).origin); }
  } else if (m.method === 'Network.loadingFailed') {
    const r = net.get(m.params.requestId);
    if (r) { r.failed = m.params.canceled ? '(canceled)' : m.params.errorText; if (!m.params.canceled) refused.push(r.url + ' ' + m.params.errorText); }
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++lastId, { resolve, reject });
  ws.send(JSON.stringify({ id: lastId, method, params }));
});
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
async function until(expr, ms = 8000) {
  const t0 = Date.now();
  for (;;) {
    if (await ev(`!!(${expr})`).catch(() => false)) return Date.now() - t0;
    if (Date.now() - t0 > ms) throw new Error('timed out waiting for: ' + expr);
    await sleep(40);
  }
}
const productRequests = () => [...net.values()].filter((r) => r.url.includes('/api/products'))
  .map((r) => r.url.replace(BASE, '') + ' ' + (r.failed ?? r.status ?? 'pending'));
const mode = (m) => fetch(BASE + '/__mode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: m }) });
async function goto(ready = 'T.names().length === 8') {
  await ev('window.__old = true').catch(() => {});
  await send('Page.navigate', { url: BASE + '/' });
  await until(`!window.__old && document.readyState === 'complete' && window.T && document.querySelector('[role="status"]')`);
  await until(ready);
}
// Real input: the mouse at the element's centre, keys through the browser.
// 'instant' because Bootstrap sets scroll-behavior: smooth, and a click sent
// while the page is still scrolling lands on the wrong element.
async function click(el) {
  const p = await ev(`(() => { const el = ${el}; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...p });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', clickCount: 1 });
}
async function press(key, vk, extra = {}) {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code: key, windowsVirtualKeyCode: vk, ...extra });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk });
}
async function type(text, gap = 0) {
  for (const ch of text) {
    const vk = ch.toUpperCase().charCodeAt(0);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch, windowsVirtualKeyCode: vk });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch, windowsVirtualKeyCode: vk });
    if (gap) await sleep(gap);
  }
}
const SEARCH = `T.q('input[type="search"]')`;
async function clearBox() {
  await click(SEARCH);
  await press('a', 65, { code: 'KeyA', modifiers: 2, commands: ['selectAll'] });
  await press('Backspace', 8);
  await until('T.names().length === 8 && T.status() === ""');
}
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join('evidence', name), Buffer.from(data, 'base64'));
};
const size = (width, height = 900) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

const { product } = await send('Browser.getVersion');
const head = [`Browser: ${product}, headless, started with ${BLOCK}`,
  `Commit: ${execSync('git rev-parse --short HEAD').toString().trim()}  Page: ${BASE}  Date: ${new Date().toISOString()}`, ''];
try {
  await send('Page.enable');
  await send('Network.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: PAGE_HELPERS });
  await size(1280);

  await mode('normal');
  await goto();
  log('network', 'a request to another host, from the page', await ev(`fetch('https://example.com/', { mode: 'no-cors' }).then(() => 'REACHED — not blocked', (e) => 'blocked: ' + e.message)`));
  log('row 4', 'cards, in order', await ev('T.names()'));
  log('row 4', 'Cap card text / <i> elements in the list / status', await ev(`[T.card('Cap').textContent, document.querySelectorAll('ul[aria-label="Products"] i').length, T.status()]`));

  await mode('slow');
  await click(SEARCH);
  await type('cap');
  await sleep(1000);
  log('row 5', '1 s after typing cap: status, cards on screen', await ev('[T.status(), T.names().length]'));
  const slow = 1000 + await until(`T.names().join() === 'Cap' && T.status() === ''`);
  log('row 5', 'then', `only Cap, status empty, ${slow} ms after the last key`);

  await mode('error');
  await goto(`T.status() === 'Could not load products.'`);
  log('row 6', 'error mode: status, cards, Retry buttons', await ev(`[T.status(), T.names().length, [...document.querySelectorAll('#root button')].filter((b) => b.textContent === 'Retry').length]`));
  await mode('normal');
  await click(`T.any('Retry')`);
  await until('T.names().length === 8 && T.status() === ""');
  log('row 6', 'after Retry: status, cards, Retry present', await ev(`[T.status(), T.names().length, !!T.any('Retry')]`));

  await mode('out-of-order');
  await goto();
  await click(SEARCH);
  await type('sc');
  await sleep(500);
  log('row 7', '0.5 s after typing sc: cards, status', await ev('[T.names(), T.status()]'));
  await sleep(3000);
  log('row 7', '3.5 s after: cards, status', await ev('[T.names(), T.status()]'));

  await mode('normal');
  net.clear();
  await goto();
  log('row 8', 'requests on reload (StrictMode)', productRequests());
  net.clear();
  await click(SEARCH);
  await type('cap', 1000);
  await sleep(3000);
  log('row 8', 'requests while typing c, a, p one second apart, then 3 s idle', productRequests());

  await clearBox();
  await click(`T.btn('Cap', 'Details')`);
  log('row 9', 'Details opened on Cap, 4th card', await ev('T.expanded()'));
  await click(SEARCH);
  await type('a');
  await until('T.names().length === 6 && T.status() === ""');
  log('row 9', 'after typing a', await ev('T.expanded()'));
  log('row 9', 'Cap card text', await ev(`T.card('Cap').textContent`));

  await clearBox();
  await click(`T.btn('Hoodie', 'Add to cart')`);
  await click(SEARCH);
  await type('shirt');
  await until('T.names().length === 1 && T.status() === ""');
  log('row 10', 'after Add to cart on Hoodie and searching shirt: cards, cart', await ev('[T.names(), T.cart()]'));

  await clearBox();
  await click(`T.btn('Cap', 'Save')`);
  await click(`T.btn('Jacket', 'Save')`);
  await ev('(window.__h = new Set(), window.__iv = setInterval(() => __h.add(T.header()), 30), 1)');
  await click(SEARCH);
  await type('hood');
  await until('T.names().length === 1 && T.status() === ""');
  log('row 14', 'while searching hood: cards, header, Saved panel', await ev('[T.names(), T.header(), T.saved()]'));
  await clearBox();
  log('row 14', 'every header text seen (sampled each 30 ms) / Saved panel / pressed Save buttons', await ev('(clearInterval(__iv), [[...__h], T.saved(), T.pressed()])'));

  log('row 15', 'React fiber tree', await ev(`(() => {
    const root = document.getElementById('root');
    const key = Object.keys(root).find((k) => k.startsWith('__reactContainer'));
    const providers = []; const comps = [];
    const walk = (f, d) => { for (; f; f = f.sibling) { const t = f.type;
      if (t && typeof t === 'object' && (t.$$typeof === Symbol.for('react.context') || t.$$typeof === Symbol.for('react.provider'))) providers.push('depth ' + d);
      if (typeof t === 'function') comps.push({ d, n: t.name });
      walk(f.child, d + 1); } };
    walk(root[key].stateNode.current, 0);
    const depth = (n) => comps.filter((c) => c.n === n).map((c) => c.d);
    return { contextProviders: providers, WishlistProvider: depth('WishlistProvider'), Header: depth('Header'), ProductCard: [...new Set(depth('ProductCard'))], SavedPanel: depth('SavedPanel'), firstElementInRoot: root.firstElementChild.tagName };
  })()`));

  await goto();
  log('row 17', 'before the first Place order, form text', await ev('T.form().textContent'));
  await click(`T.any('Place order')`);
  log('row 17', 'Place order, all empty: Name [message, aria-invalid], Phone [message, aria-invalid], form message', await ev(`[[T.desc(T.field('Name')), T.field('Name').getAttribute('aria-invalid')], [T.desc(T.field('Phone')), T.field('Phone').getAttribute('aria-invalid')], T.live()]`));
  await click(`T.field('Phone')`);
  await type('090123456');
  log('row 17', 'Phone 090123456: Name message, Phone message', await ev(`[T.desc(T.field('Name')), T.desc(T.field('Phone'))]`));

  await click(`T.btn('Hoodie', 'Add to cart')`);
  await click(`T.field('Name')`);
  await type('An');
  await click(`T.field('Phone')`);
  await press('End', 35);
  await type('7');
  log('row 16', 'Hoodie added, Name An, Phone completed: field values, messages left', await ev(`[T.field('Name').value, T.field('Phone').value, T.desc(T.field('Name')), T.desc(T.field('Phone')), T.live()]`));
  await click(`T.any('Place order')`);
  await sleep(300);
  log('row 16', 'after Place order: message, cart, field values, address bar, navigations', await ev(`[T.live(), T.cart(), [T.field('Name').value, T.field('Phone').value, T.field('Note (optional)').value], location.href, performance.getEntriesByType('navigation').length]`));
  log('row 16', 'header (wishlist untouched)', await ev('T.header()'));
  await click(`T.btn('Cap', 'Add to cart')`);
  log('REVIEW 6', 'after adding Cap to the new cart: cart, form message', await ev('[T.cart(), T.live()]'));

  await goto();
  await click(SEARCH);
  const stops = [await ev('T.focus()')];
  for (let i = 0; i < 28; i++) {
    await press('Tab', 9);
    stops.push(await ev('T.focus()'));
    if (i === 1) await shot('row18-focus-button.png');
  }
  await shot('row18-focus-place-order.png');
  log('row 18', `${stops.length} stops, Tab pressed 28 times from the search box`, stops.map((s) => s.on));
  log('row 18', 'focus ring on those stops (distinct values)', [...new Set(stops.map((s) => s.ring))]);

  for (const width of [360, 768, 1280]) {
    await size(width);
    await goto();
    log('row 19', `${width} px`, await ev('T.measure()'));
    await shot(`row19-${width}.png`);
  }
  await size(360);
  await goto();
  await click(`T.any('Place order')`);
  log('row 19', '360 px with the form messages shown', await ev(`({ ...T.measure(), messages: [...document.querySelectorAll('.invalid-feedback')].map((e) => getComputedStyle(e).display + ': ' + e.textContent) })`));
  await shot('row19-360-form.png');
  log('row 19', 'every origin that answered a request during the whole run', [...origins]);
  log('row 19', 'requests that got no answer', refused);
  log('row 19', 'elements: <label> count, every form control has one <label>, elements faking a button with role=button', await ev(`[document.querySelectorAll('#root label').length, [...document.querySelectorAll('#root input, #root textarea')].every((e) => e.labels.length === 1), document.querySelectorAll('#root [role="button"]').length]`));
} catch (error) {
  log('ERROR', 'the run stopped', error.message);
  process.exitCode = 1;
} finally {
  await mode('normal').catch(() => {});
  writeFileSync(join('evidence', 'chromium-run.txt'), [...head, ...lines, ''].join('\n'));
  await send('Browser.close').catch(() => {});
  ws.close();
  child.kill();
}
