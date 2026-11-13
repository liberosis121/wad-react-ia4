# REVIEW.md — what the assistant wrote that I kept, changed or rejected

**Student:** 23120193 — Trần Kim Yến

The assistant is Claude Fable 5.2 at high effort, one conversation from start to finish,
given `brief.md` and `brief-ia4.md`. I committed before every request, so each commit
named `assistant Rn` is that one request's diff. The rows quoted below are README's
*Done means* rows. What I saw on each row is in [`evidence/done-means.md`](evidence/done-means.md).
The final code was run once more in a real Chrome with every host but `localhost`
blocked: [`evidence/chromium-run.txt`](evidence/chromium-run.txt).

| Commit | Request |
|---|---|
| `8db4dba` | starter, untouched |
| `9eb6aef` | R1, the plan (`PLAN.md`) |
| `3a33006` | R2, the session 6 page |
| `aaa7f54` | R3, the wishlist |
| `58c2ab7` | R4, the checkout form |
| `a083d81` | R5, Bootstrap |
| `e416a38` | R6, the focus ring |
| — | R7, `npm audit`: nothing changed |
| `91b0dab` | R8, the stale confirmation |

### 1. One wishlist provider, read through a hook
- **Where:** commit `aaa7f54`:
  - `src/WishlistContext.jsx` lines 8–31 (provider) and 34–40 (`useWishlist`);
  - `src/App.jsx` lines 38–54 (`<WishlistProvider>` around `<Header />` … `<SavedPanel />`);
  - `src/components/ProductCard.jsx` line 8;
  - `src/components/Header.jsx` line 9 (`Saved: {saved.length}`).
- **Decision:** kept
- **What decided it:**
  - Row 14: the header, sampled every 50 ms through `hood` and back, only ever read
    `Saved: 2`. The panel listed Cap, Jacket, and both came back `aria-pressed="true"`.
  - Row 15: one context provider in React's fiber tree, above the header, the cards and
    the panel.
  - Checks I1–I3.
  - Row 20, from reading the code: the count is `saved.length`, not state.
- **Why:** the provider is inside `App`, not `main.jsx`. The checks render `<App />`
  alone, so a provider in `main.jsx` would not exist in them. The plan said so before
  any code (`PLAN.md` lines 51–54).
  - Each saved entry copies `{ id, name }`, so a product the search hides is still
    listed (W4).
  - `toggle` returns a new array, so StrictMode's double updater cannot save twice.

### 2. The checkout errors are worked out from the fields
- **Where:** commit `58c2ab7`, `src/components/CheckoutForm.jsx`:
  - lines 9–18, `validate(fields)`;
  - lines 29–32, errors from `validate` on each render, shown only after `submitted`;
  - line 39, `preventDefault()`;
  - line 54, `noValidate`;
  - lines 64 and 78, `aria-describedby` only while there is a message.
- **Decision:** kept
- **What decided it:**
  - Row 17: no message before the first try. After it, `Enter your name.` and the phone
    message each come through their field's `aria-describedby`, with
    `aria-invalid="true"`, plus `Add something to the cart first.`. With Phone
    `090123456` the phone message stays.
  - Row 16: the confirmation, `0 items`, the address bar still `http://localhost:5173/`.
  - Checks I4–I7.
  - Row 20: `grep useEffect src` finds only the fetch in `useProducts.js`.
- **Why:** the only extra state is the `submitted` flag. The messages change as you type
  because they are recomputed on every render. There is no second copy of the errors
  for an effect to keep in sync, which is what `brief-ia4.md` F asks.

### 3. Latest search wins by aborting in the effect's cleanup
- **Where:** commit `3a33006`, `src/useProducts.js`:
  - lines 14–34, one effect on `[query, attempt]`;
  - line 33, `controller.abort()` in the cleanup;
  - lines 24 and 29, return if `signal.aborted`;
  - line 40, `loading` computed from the last answer.
- **Decision:** kept
- **What decided it:**
  - Row 7: in `out-of-order`, `sc` shows only the scarf and still only the scarf at
    3.5 s, with no error.
  - Row 8: `q=c`, `q=ca`, `q=cap`, one each, then nothing.
  - Row 5: the old 8 cards stay while `Loading products…`.
  - Checks C7 and C8.
- **Why:** an aborted request returns before any `setSettled`, so a dropped answer is
  neither shown nor reported as `Could not load products.`. Retry bumps `attempt`, so it
  goes through the same effect and the same abort.

### 4. Bootstrap 5 from npm, CSS only, no Vite plugin
- **Where:** commit `a083d81`:
  - `package.json` line 16, `"bootstrap": "^5.3.9"`;
  - `src/main.jsx` line 3, `import 'bootstrap/dist/css/bootstrap.min.css'`;
  - `src/index.css` line 4, `.btn, .form-control { min-height: 44px; }`;
  - `src/components/ProductList.jsx` line 7, `row row-cols-1 row-cols-md-2`.
- **Decision:** kept
- **What decided it:**
  - Row 13: `git diff 8db4dba -- package.json vite.config.js` is that one line.
  - Row 19: every resource came from `localhost:5173`, and `bootstrap.min.css` has no
    `@import` or remote URL. At 360, 768 and 1280 px nothing scrolls sideways or is
    cut off, the shortest button is 44 px, and there are 2 columns at 768 and 1280.
  - Checks still 19/19.
- **Why:**
  - Tailwind v4 would add two packages and a plugin line in `vite.config.js`; the
    plan weighed this and chose Bootstrap (`PLAN.md` lines 86–87).
  - The `min-height` rule is needed: a Bootstrap `.btn` is 38 px tall.
  - `package-lock.json` also lists `@popperjs/core`, Bootstrap's peer, which npm added
    by itself. Nothing imports it and `package.json` does not name it, as the plan
    predicted.

### 5. Bootstrap's focus ring — changed
- **Where:** commit `a083d81`, R5's `src/index.css` (lines 1–10) kept Bootstrap's own
  focus styles:
  - `node_modules/bootstrap/dist/css/bootstrap.css` line 2152,
    `box-shadow: 0 0 0 .25rem rgba(13,110,253,.25)` on `.form-control:focus`;
  - line 2968, `rgba(var(--bs-btn-focus-shadow-rgb), .5)` on `.btn:focus-visible`,
    with `outline: 0` at line 3007.
- **Decision:** changed (fixed in `e416a38`, `src/index.css` lines 9–14)
- **What decided it:** row 18 asks for a visible focus ring. I composited each ring over
  white and measured it against the page:
  - 1.41:1 for the inputs;
  - 1.83:1 for `btn-primary`;
  - 2.06:1 for `btn-outline-primary`;
  - 1.95:1 for `btn-outline-secondary`.

  All are under the 3:1 a focus indicator needs (WCAG 1.4.11). Before Bootstrap, the
  browser's own outline was there on all 29 stops (row 18 on `58c2ab7`).
- **Why:** the ring is the only thing that shows a keyboard user where they are. A pale
  blue halo on white is easy to lose on a page with 29 stops. The fix is CSS only:
  - `outline: 3px solid #0a58ca`, 6.44:1, with a 2px offset;
  - on `button`, `input` and `textarea` with `.btn` or `.form-control`, which outranks
    Bootstrap's `outline: 0`.

  No element, text or aria attribute changed, and the checks still pass 19/19.
- **Sentence sent:** "R6: Row 18: after the Bootstrap step the focus ring is hard to see —
  Bootstrap's input ring is rgba(13,110,253,.25) (node_modules/bootstrap/dist/css/bootstrap.css
  line 2152), 1.41:1 against the white page, and the button rings are 1.83–2.06:1, under the
  3:1 a focus indicator needs; make the keyboard focus ring of every button, input and
  textarea at least 3:1 against white, in src/index.css, without changing any element, text
  or aria attribute."

### 6. The order confirmation outlived its order — changed
- **Where:** commit `58c2ab7`, `src/components/CheckoutForm.jsx`:
  - line 26, `confirmation` state;
  - lines 45–47, set on a valid order;
  - line 100, `{cartError || confirmation}`, shown until the next Place order.
- **Decision:** changed (fixed in `91b0dab`, lines 38 and 112)
- **What decided it:**
  - A row 16 follow-on: after Hoodie, `An`, `0901234567` and Place order, I added Cap.
    The cart read `1 item / Total: 95.000 đ`, and under it the form still said
    `Order placed for An: 1 item, 420.000 đ.`.
  - Reading `CheckoutForm.jsx`, `setConfirmation` was only called in `handleSubmit`.
- **Why:** the message describes an order that is gone, next to a cart that says
  otherwise. I asked for the fix without an effect. The assistant computes
  `shownConfirmation = itemCount === 0 ? confirmation : ''` from a prop it already had:
  no new state, no effect.
  - Checked again on `91b0dab`: Add Cap empties the message line.
  - Rows 16 and 17 still pass; I7 still passes.
- **Sentence sent:** "R8: … New issue, row 16 follow-on: after a valid order (Hoodie, An,
  0901234567), adding Cap leaves "Order placed for An: 1 item, 420.000 đ." under a cart that
  now reads "1 item, Total: 95.000 đ" — the confirmation describes an order that is gone; it
  should disappear as soon as something is added to the cart again, without a second copy of
  state kept in sync by an effect (brief-ia4.md F, last paragraph)."

### 7. `npm audit fix --force` to clear the audit warnings — rejected
- **Where:** R7's answer, against commit `e416a38`. Its fix was `npm audit fix --force`,
  which would rewrite `package.json` line 31, `"vitest": "^3.2.0"`, to vitest 5.1.0. The
  three findings (`tinypool` critical, `vitest` critical, `@vitest/mocker` moderate) are
  in the starter's own test runner.
- **Decision:** rejected
- **What decided it:**
  - Row 13: `package.json` may gain the framework and nothing else.
  - `brief-ia4.md`, Constraints: "New dependencies: the CSS framework, and a form library
    if you choose one. Nothing else."
  - README: "Node 18.18 or newer". `npm view vitest@5.1.0 engines` needs `^22.12.0`.
  - `npm audit fix --dry-run` changes nothing, because 3.2.7 is the last 3.x.
- **Why:**
  - The findings are in a dev-only test runner that the course ships. They are not in
    the page or in Bootstrap.
  - The upgrade would change a starter dependency the marking relies on, and might not
    run where the checks are marked.
  - The assistant did not run it; it set out both options and recommended leaving it. I
    took that recommendation and turned the upgrade down. `git status` after R7 was
    clean, and `npm test` is still 19/19.
- **Sentence sent:** "R8: on R7 — agreed, leave vitest as the starter has it; nothing to
  change there."

### 8. Details state in the card, keyed by id
- **Where:**
  - commit `3a33006`, `src/components/ProductList.jsx` line 8,
    `<ProductCard key={product.id} …>`;
  - `src/components/ProductCard.jsx` line 5, `useState(false)` for Details.
- **Decision:** kept
- **What decided it:**
  - Row 9: Details on Cap, then `a`. Cap moves from 4th to 2nd, stays
    `aria-expanded="true"` with `Adjustable strap.`, and no other card is open.
  - Check C11.
  - Row 11: no index key, no `dangerouslySetInnerHTML`, no `fetch` in `ProductCard`.
- **Why:** with `key={product.id}` React keeps each card's state with its product when
  the list reorders. The list is always rendered, even empty, so the cards are not
  remounted while loading.

### 9. Bootstrap's `.invalid-feedback` needs `.is-invalid` — kept
- **Where:** commit `a083d81`, `src/components/CheckoutForm.jsx`:
  - lines 62 and 77, `is-invalid` on an input with a message;
  - lines 69 and 84, `invalid-feedback`.
- **Decision:** kept
- **What decided it:** row 19 at 360 px, after Place order with empty fields. Both
  messages compute to `display: block` and nothing scrolls sideways.
- **Why:** Bootstrap hides `.invalid-feedback` unless the input before it has
  `.is-invalid`. The checks read text, not CSS, so they would pass with invisible
  messages. The plan flagged this in advance (`PLAN.md` line 118), and the R5 code
  handles it.
