# Done means — what each row showed

Every row of README's *Done means* table, run against the commit named. Pages were
run in the Claude desktop app's browser pane (Chromium), dev server `npm run dev` on
`http://localhost:5173`, mode switched with the yellow panel's API (`POST /__mode`).

How a row was run:

- **Keys and clicks** — real typing, Tab and clicks in the browser pane, with a small
  script in the page that sampled the status line, the cards and the header every
  50–250 ms, so "throughout" and "for about 2 s" have numbers behind them.
- **Final pass** (commit `91b0dab`) — the app window was hidden, and the pane cannot
  send keys to a hidden page. That pass set the fields through React's input events
  and clicked through the DOM; the keyboard rows (8, 18) were not repeated in it.

## Real Chromium, every host but localhost blocked (final code)

Run by `node tools/rows.mjs`; the full output is [`chromium-run.txt`](chromium-run.txt).

- **Browser:** Chrome, headless, started with
  `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost`, so no host except
  `localhost` can be reached. This is the rubric's marking condition.
- **Input:** real mouse and key events sent through the DevTools protocol, not DOM
  events. The script only reads the page to report what is on it.
- **Code:** commit `945736e`, whose `src/` is the same as `91b0dab`.

| # | Seen |
|---|---|
| network | a request from the page to another host fails with `net::ERR_NAME_NOT_RESOLVED` |
| 4 | 8 cards in API order; the Cap card reads `95.000 đ`; no `<i>` element; status empty |
| 5 | 1 s after typing `cap`: `Loading products…` with 8 cards; only Cap 2029 ms after the last key |
| 6 | `Could not load products.`, 0 cards, 1 Retry; after Retry 8 cards and no Retry |
| 7 | `sc`: only the scarf at 0.5 s and at 3.5 s, status empty |
| 8 | reload: `q=` *(canceled)* then `q=` 200; typing: `q=c`, `q=ca`, `q=cap`, one each, nothing more in 3 s |
| 9 | Cap open as the 4th card; after `a` Cap is 2nd, still `true`, every other card `false` |
| 10 | only T-shirt; cart `1 item / Total: 420.000 đ` |
| 14 | the header only ever read `Saved: 2` (sampled every 30 ms); panel Cap, Jacket; both pressed after clearing |
| 15 | one context provider in the fiber tree (depth 4, inside `WishlistProvider` at 3), above `Header` (5), `ProductCard` (10) and `SavedPanel` (10) |
| 16 | `Order placed for An: 1 item, 420.000 đ.`; `0 items / Total: 0 đ`; fields empty; `http://localhost:5173/`; 1 navigation |
| 17 | no message before; then one per field with `aria-invalid="true"`, and the cart message; Phone `090123456` keeps the phone message |
| 18 | 28 real Tab presses from the search box: 29 stops in reading order, each `:focus-visible` with `solid 3px rgb(10, 88, 202)`. Screenshots `row18-focus-button.png`, `row18-focus-place-order.png` |
| 19 | styled with the network blocked (`Place order` is `rgb(13, 110, 253)`); only `localhost:5173` and inline `data:` answered. At 360, 768, 1280 px: `scrollWidth` = `clientWidth`, 0 elements past the edge, shortest button and field 44 px, 1 / 2 / 2 columns. Screenshots `row19-360.png`, `row19-768.png`, `row19-1280.png`, `row19-360-form.png` |

At 360 px `clientWidth` reads 345 because headless Chrome draws a 15 px scrollbar.

**What this run still does not do.** It does not open the React DevTools extension:
row 15 is read from React's fiber tree. It blocks the network by host, not with the
DevTools *Offline* switch.

**The script was wrong once.** Its first run reported Phone `7` and no order on row 16.
Bootstrap sets `scroll-behavior: smooth`, and the script clicked while the page was
still scrolling, so the click missed the Phone field. The script now scrolls instantly.
It also listed its own blocked probe as an origin. Both were faults of the script;
nothing in `src/` changed between the two runs.

## Tools — rows 1–3 and 13 (final commit `91b0dab`)

| # | Command | Result |
|---|---|---|
| 1 | `npm test` | `Test Files  2 passed (2)`, `Tests  19 passed (19)` |
| 2 | `npm run lint` | only npm's two header lines; ESLint prints nothing, exit 0; `grep -rn eslint-disable src` finds nothing |
| 3 | `git diff --stat 8db4dba -- checks mock eslint.config.js index.html public` | nothing |
| 13 | `git diff 8db4dba -- package.json vite.config.js` | one line, `"bootstrap": "^5.3.9"`; `vite.config.js` unchanged |

## The session 6 page — rows 4–12 (commit `3a33006`, keys and clicks)

| # | Seen |
|---|---|
| 4 | 8 cards in API order; `Cap` reads `95.000 đ`; the last one is `Scarf <i>limited</i>`, no `<i>` element in the list; one `role="status"` |
| 5 | `slow`, typed `cap`: at +3.5 s `Loading products…` with all 8 cards still shown; at +5.5 s status empty, only Cap |
| 6 | `error`, reload: `Could not load products.`, 0 cards, one Retry. `normal`, Retry: 8 cards, status empty, no Retry |
| 7 | `out-of-order`, typed `sc`: `Loading products…` at 100 ms, then only the scarf at 300 ms, still only the scarf at 3.5 s, status empty |
| 8 | Network, `products`: typed `c`, `a`, `p` one second apart → `q=c`, `q=ca`, `q=cap`, one each, nothing more in 3 s. On reload: `q=` *(canceled, ERR_ABORTED)* then `q=` 200 — StrictMode |
| 9 | Details on Cap (4th), typed `a`: Cap is 2nd and `aria-expanded="true"` with `Adjustable strap.`; every other card `false` |
| 10 | Add to cart on Hoodie, typed `shirt`: only T-shirt; cart `1 item`, `Total: 420.000 đ` (StrictMode did not add it twice) |
| 11 | Read `src/`: `SearchBox`, `ProductList`, `ProductCard`, `CartSummary` in `src/components/`; no `fetch` in `ProductCard.jsx`; `key={product.id}` (`ProductList.jsx` line 8); no `dangerouslySetInnerHTML`; count and total computed in `CartSummary.jsx` lines 6–7 |
| 12 | 360 px: `scrollWidth` 360 = viewport; shortest button 44 px |

## The wishlist — rows 14–15 (commit `aaa7f54`)

| # | Seen |
|---|---|
| 14 | Save on Cap and Jacket, typed `hood`, cleared: the header, sampled every 50 ms, only ever read `Saved: 2`; Saved panel `Cap`, `Jacket`; after clearing, Cap and Jacket `aria-pressed="true"`, the other six `false` |
| 15 | The React DevTools extension is not available in the pane, so I walked React's fiber tree from `#root` instead: exactly one context provider, under `App` → `WishlistProvider`, above `Header`, every `ProductCard` and `SavedPanel`; `<header>` is the first element in `#root` |

## The checkout form — rows 16–18 (commit `58c2ab7`, keys and clicks)

| # | Seen |
|---|---|
| 16 | Hoodie, Name `An`, Phone `0901234567`, Place order: `Order placed for An: 1 item, 420.000 đ.`; cart `0 items`, `0 đ`; all three fields empty; address bar `http://localhost:5173/`, one navigation entry; header still `Saved: 0` |
| 17 | Before the first Place order: no message in the form. Place order with everything empty: Name → `Enter your name.`, Phone → `Enter a 10-digit phone number starting with 0.` (each through `aria-describedby`, `aria-invalid="true"`), and `Add something to the cart first.`. Phone `090123456`: the phone message stays on Phone (Name keeps its own, still empty) |
| 18 | Tab from the search box: Search → 8 × (Details, Save, Add to cart) → Name → Phone → Note (optional) → Place order, 29 stops in reading order, each with the browser's outline |

## The framework — row 19 (commit `a083d81`, plus the outline from `e416a38`)

The pane has no DevTools *Offline* switch. In its place:

- On reload, every resource the page loaded came from `http://localhost:5173`, and
  nowhere else.
- `bootstrap.min.css` from `node_modules` has no `@import`. Its only `http` strings
  are the SVG namespace inside `data:` icons and the licence comment.
- `.btn-primary` computes to `rgb(13, 110, 253)`, Bootstrap's blue: the styles come
  from the npm package.

| Width | `scrollWidth` | Past the edge | Clipped | Product columns | Shortest button / input |
|---|---|---|---|---|---|
| 360 | 360 (= viewport) | none | none | 1 | 44 / 44 px |
| 360, form messages shown | 360 | none | none | 1 | 44 / 44 px; both `.invalid-feedback` `display: block` |
| 768 | 753 (= viewport without scrollbar) | none | none | 2 | 44 / 44 px |
| 1280 | 1265 (= viewport without scrollbar) | none | none | 2 (376 px each in a 752 px list) | 44 / 44 px |

**Focus ring after Bootstrap (row 18 again).** Bootstrap's rings are translucent
box-shadows. I composited them over white and measured the contrast:

| Ring | Source in `bootstrap.css` | Contrast with white |
|---|---|---|
| inputs: `rgba(13,110,253,.25)` | line 2152 | 1.41:1 |
| `.btn-primary` | lines 2968, 3041 | 1.83:1 |
| `.btn-outline-primary` | line 3176 | 2.06:1 |
| `.btn-outline-secondary` | line 3193 | 1.95:1 |

All four are under the 3:1 a focus indicator needs. After `e416a38`, the outline is
`3px solid #0a58ca` at 6.44:1. The assistant tabbed through all 29 stops and each one
computed to that outline (its R6 report). I checked the rule in `src/index.css`,
lines 9–14.

## Final pass on `91b0dab` (DOM events, window hidden)

| Rows | Result |
|---|---|
| 4, 5, 6, 7, 9, 10, 14 | all as above |
| 5 | at 1 s: `Loading products…` and 8 cards; at 2.6 s: only Cap |
| 7 | `s` then `sc` in `out-of-order`: at 3 s only the scarf, status empty |
| 16 | the `submit` event comes back `defaultPrevented: true`, the URL is unchanged |
| 17 | as above |
| R8 | after the order, Add Cap empties the message line |
| 18 | `maxLength` 200 and `0/200` on the note |
