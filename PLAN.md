# PLAN — shop page (brief.md) + wishlist, checkout form, CSS framework (brief-ia4.md)

Plan only: nothing written, installed or run. `src/` is the empty starter, so there are four
steps, each committed first: **S6** (brief.md, 11 checks) → **W** wishlist → **F** form → **C** framework.

## 1. Files (one component per file)

| File | Step | What it is |
|---|---|---|
| `src/App.jsx` | S6 | default export `App`. Owns search text and cart, calls `useProducts`, renders the status line and Retry, lays out the page. Wraps everything in the one `WishlistProvider` (W). |
| `src/useProducts.js` | S6 | custom hook: the fetch, abort, retry. Returns `{ products, loading, failed, retry }`. |
| `src/format.js` | S6 | `formatPrice(n)` = `n.toLocaleString('vi-VN') + ' đ'`; `formatItems(n)` = `1 item` / `2 items`. Shared by card, cart and confirmation. |
| `src/components/SearchBox.jsx` | S6 | `<label>Search products</label>` + `<input type="search">`, controlled by props `value`, `onChange`. No `<form>` around it. |
| `src/components/ProductList.jsx` | S6 | `<ul aria-label="Products">`, always rendered (even empty); maps `<ProductCard key={product.id}>`. |
| `src/components/ProductCard.jsx` | S6, W | the `<li>`: `<h2>` name, price, `Details` (`aria-expanded`), `Save` (`aria-pressed`, W), `Add to cart`. Props: `product`, `onAddToCart`. No fetch. |
| `src/components/CartSummary.jsx` | S6, F | `<aside aria-label="Cart">`: item count, total, and `<CheckoutForm>` inside it (F). Props: `items`, `onOrderPlaced`. |
| `src/WishlistContext.jsx` | W | the context, `WishlistProvider`, `useWishlist()`. |
| `src/components/Header.jsx` | W | the page's only `<header>`: `<h1>Shop</h1>` and `Saved: N`. |
| `src/components/SavedPanel.jsx` | W | `<section aria-label="Saved">`: `<ul>` of names, or `Nothing saved yet.` |
| `src/components/CheckoutForm.jsx` | F | `<form aria-label="Checkout" noValidate>`. Props: `itemCount`, `total`, `onOrderPlaced`. |
| `src/main.jsx`, `src/index.css` | C | one import line added; `index.css` shrinks to a few rules (see 5). |

Not touched: `checks/`, `mock/`, `public/`, `index.html`, `eslint.config.js`, `vite.config.js`.

## 2. Where each piece of state lives

| State | Lives in | Notes |
|---|---|---|
| search text | `App` (`query`) | passed to `SearchBox` and `useProducts(query)`; sent raw, `encodeURIComponent`-ed |
| products | `useProducts`, inside `settled = { query, attempt, products, failed }` | the last answer; stays on screen until the next answer replaces it; `[]` on failure |
| loading / error | **computed** in `useProducts` | `loading = settled.query !== query \|\| settled.attempt !== attempt`; `failed = !loading && settled.failed`. No separate "status" state to fall out of sync |
| retry | `useProducts` (`attempt`, a number) | Retry does `attempt + 1`; the effect depends on `[query, attempt]` |
| status text | computed in `App` | loading → `Loading products…`; failed → `Could not load products.`; `[]` → `No products match.`; else empty |
| cart | `App`: array of `{ id, name, price, quantity }` | a snapshot of the product, so a hidden product still counts |
| item count, total | computed in `CartSummary` render | never in `useState` |
| Details open/closed | `ProductCard` (`useState(false)`) | kept across list changes by `key={product.id}` |
| wishlist | `WishlistProvider`: array of `{ id, name }` in save order | count `N = saved.length`, computed in `Header` |
| form fields | `CheckoutForm`: `{ name, phone, note }` | controlled inputs |
| form errors | computed: `validate(fields)` every render | shown only if `submitted`; no error state, no effect |
| "tried to submit" | `CheckoutForm` (`submitted`, boolean) | `true` on a rejected submit, back to `false` after a valid order |
| cart-empty message | computed: `submitted && itemCount === 0` | disappears by itself when something is added |
| confirmation | `CheckoutForm` (`confirmation`, string) | real state: it is a snapshot of name/count/total taken before the cart is emptied; cleared on the next rejected submit |

## 3. Wishlist context

- **Holds:** `saved`, an array of `{ id, name }` in the order saved. Names are stored, not looked
  up in the current product list, so a product hidden by the search is still listed (W4).
- **Exposes** (memoised value): `saved`, `isSaved(id)`, `toggle(product)`. `toggle` is a pure
  functional update: remove if present, else append. No `count` in the value.
  `useWishlist()` throws when there is no provider, so a missing provider is loud.
- **The one provider** is the outermost element returned by `App`, around `Header`, the cards
  and `SavedPanel`. Not in `main.jsx`: the checks render `<App />` directly, so a provider there
  would not exist in the tests. `App` itself never reads the wishlist; `Header`, `ProductCard`
  and `SavedPanel` do, through the hook.

## 4. Requests: latest wins, no duplicates, StrictMode

One effect in `useProducts`, dependencies `[query, attempt]` (two primitives): create an
`AbortController`; `fetch('/api/products?q=' + encodeURIComponent(query), { signal })`; non-2xx →
throw; before **every** `setSettled` (success and failure) return if `signal.aborted`; the
cleanup calls `controller.abort()`.

- **Latest wins:** each new text aborts the previous request. An aborted request is dropped:
  not shown, and not reported as `Could not load products.` (easy to miss in the `catch`).
- **No duplicates:** the effect is the only place that fetches (no fetch in `onChange` or in the
  Retry handler); it sets no state synchronously and depends on nothing it changes, so idle
  means no re-run. Retry changes `attempt`, so it uses the same effect and the same abort.
- **StrictMode:** mount → effect → cleanup aborts request 1 → effect sends request 2. Two lines in
  the Network tab on reload, the first *(canceled)*: expected. No `useRef` "already fetched" flag:
  with the abort cleanup that flag leaves the page loading forever in dev.
- **No debounce:** optional, and abort already cancels superseded requests (one timer less).
- State updaters (`setCart`, `toggle`) never mutate: StrictMode runs them twice in dev, and the
  checks do not use StrictMode, so a mutating updater passes `npm test` and adds 2 in the browser.

## 5. CSS framework and form library

**Recommendation: Bootstrap 5**, `npm install bootstrap` (run in step C, not now).

- **Import:** one line in `src/main.jsx`, before `./index.css`:
  `import 'bootstrap/dist/css/bootstrap.min.css';`. CSS only: no Bootstrap JS, no `data-bs-*`
  (Details stays React state), no icon font, no CDN. Works offline.
- **`package.json`:** one new line in `dependencies` (`bootstrap`). `package-lock.json` changes
  too and will list `@popperjs/core`, Bootstrap's peer dependency, which npm installs by itself;
  we never import it and it is not added to `package.json`. (Not verified: nothing installed.)
- **`vite.config.js`:** unchanged, zero lines. Vite imports plain CSS without a plugin.
- **Why not Tailwind:** v4 needs two packages (`tailwindcss`, `@tailwindcss/vite`) and both an
  import and a plugin entry in `vite.config.js`: a bigger diff for row 13, for no gain here.
- **Layout:** `container`; products `col-lg-8`, cart + Saved `col-lg-4`. The `<ul>` is
  `list-unstyled row row-cols-1 row-cols-md-2 g-3`, each `<li>` a `col`: 1 column at 360,
  2 at 768 and 1280. DOM order = visual order (no `order-*`), so Tab order is reading order.
- **`index.css` keeps:** `button, .btn { min-height: 44px }` (a Bootstrap `.btn` is 38 px), and
  bottom padding on `main` so the fixed yellow test panel does not cover `Place order`.

**Form: plain React state, no library.** Three fields, two rules; the brief's behaviour is
literally `submitted && validate(fields)`. `react-hook-form` would add a dependency, keep its own
copy of the errors, need `mode`/`reValidateMode`/`reset` set exactly right, and still not cover
the empty-cart rule, the note counter or the confirmation. Rules: name invalid when
`name.trim() === ''`; phone valid only when `/^0\d{9}$/` matches the value as typed (no trim).

## 6. Easiest to get wrong

1. **Exactly one `role="status"`,** with exact text (the real `…` character), never hidden when
   empty, Retry outside it. The form's confirmation and cart message use `aria-live="polite"`,
   not `role="status"` and not `<output>` (implicit status). No Bootstrap spinner.
2. **Always rendered:** the Products `<ul>` (empty on error / no match), the Saved section, the
   cart and the checkout form (also with an empty cart). The checks look them up in every state.
3. **Old products stay while loading:** no `loading ? spinner : list`, which also remounts the
   cards and loses Details. Keys are `product.id`, never the index.
4. **Provider inside `App`, once.** `Header` is the only `<header>`, outside `<main>`. Cart and
   wishlist store the product's name/price, not ids looked up in the current list.
5. **Form:** `preventDefault()` first, on every submit. `noValidate` and no `required`/`pattern`,
   or the browser blocks the submit and shows its own bubbles instead of the brief's messages.
6. **After a valid order `submitted` goes back to `false`**, or the emptied fields and cart show
   three messages at once. The confirmation is built before the cart is cleared.
7. **Exact text:** labels `Name`, `Phone`, `Note (optional)`; the `0/200` counter outside the
   `<label>`; `maxLength={200}`. Each message has an id its field names in `aria-describedby`.
   Saved `<li>`s hold the name only; `Nothing saved yet.` is not an `<li>`.
8. **Bootstrap `.invalid-feedback` is `display: none`** unless the input has `is-invalid`. The
   checks read text, not CSS, so they pass while the message is invisible: check row 17 by eye.
9. **360 px:** a `row` outside a `container` scrolls sideways; the long Vietnamese name must wrap.
10. **Lint and format:** an unused `catch (err)` is an error here, so write `catch {`. Prices are
    not `Intl` currency style (that prints `₫`, not `đ`).
