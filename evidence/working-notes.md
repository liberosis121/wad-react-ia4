# Working notes kept during the work

Written after each request and before the next one: the sentence sent, the commit, and what each row showed. R2 to R8 are the requests as sent, shortened only where the standing rules were repeated; R1 is summarised. AI-LOG.md was written from these notes. They were committed after R8, with the final evidence.


## R1 — plan (after commit 8db4dba starter)
Request: before writing any code, give me a plan. Write it to PLAN.md at the project root and nothing else. The plan must cover: the components and files...; where each piece of state lives...; what the wishlist context holds...; latest search wins / duplicate requests / StrictMode; which ONE CSS framework installed with npm...; form library or plain state; the requirements easiest to get wrong. Rules: only PLAN.md, no npm install, no git.

## R2 — session 6 page (after commit 9eb6aef)
"R2: your plan is accepted as written. Now implement step S6 only — the brief.md page — following PLAN.md: src/App.jsx, src/useProducts.js, src/format.js, and src/components/SearchBox.jsx, ProductList.jsx, ProductCard.jsx, CartSummary.jsx. No wishlist, no form, no framework yet. Plain CSS in src/index.css is fine; the page must work at 360 px. Rules: do not touch checks/, mock/, public/, index.html, eslint.config.js, vite.config.js, package.json, package-lock.json or PLAN.md. No npm install, no git, no eslint-disable. Run npm test (11 catalogue checks must pass) and npm run lint, reply with files and results."
### R2 result -> commit 3a33006. npm test 11 passed / 8 failed (ia4 expected); lint silent.
Rows by hand (browser pane, Chromium): 4 pass (8 cards, 95.000 đ, scarf brackets, 1 role=status); 5 pass (Loading at 3.5s with 8 cards, then Cap at 5.5s = 2s); 6 pass (Could not load products., 0 cards, Retry -> 8 cards, Retry gone); 7 pass (sc: Loading 100ms then Scarf only, still Scarf at 3.5s, no error); 8 pass (q=c,q=ca,q=cap one each; reload: first q= ERR_ABORTED = StrictMode); 9 pass (Cap 4th->2nd, stays open, only Cap open); 10 pass (T-shirt only; Cart 1 item, 420.000 đ); 12 pass (360: scrollWidth 360, min button 44px).
Row 11 read: 4 components in src/components; ProductCard no fetch; key={product.id}; no dangerouslySetInnerHTML; count/total computed in CartSummary.jsx:6-7.

## R3 — wishlist (after commit 3a33006)
"R3: the S6 page passed README rows 4–12 in the browser; it is committed. Now implement part W of brief-ia4.md only (W1–W5), as PLAN.md describes: src/WishlistContext.jsx (context, one WishlistProvider, useWishlist()), src/components/Header.jsx (<header> with <h1>Shop</h1> and "Saved: N"), src/components/SavedPanel.jsx (<section aria-label="Saved">), and the Save button with aria-pressed in ProductCard, read through the hook, not props. One provider for the whole page, inside App. N computed, not in state. No form and no framework yet. Same rules as before ... Then run npm test (11 + I1–I3 must pass) and npm run lint."
### R3 result -> commit aaa7f54. npm test 14 passed / 5 failed (I4-I8 expected); lint silent.
Row 14 pass: saved Cap+Jacket, hood -> Hoodie only, header sampled every 50ms = only "Saved: 2"; panel Cap,Jacket; after clear Cap:true Jacket:true others false.
Row 15: no DevTools ext in pane; walked React fiber tree from #root: 1 context provider (depth 4) under App>WishlistProvider, above Header(5), ProductCard(9) and SavedPanel. <header> is first child of #root.
Row 20 (W part): src/WishlistContext.jsx; ProductCard.jsx:8 useWishlist(); Header.jsx count = saved.length.

## R4 — checkout form (after commit aaa7f54)
"R4: W passed rows 14 and 15; it is committed. Now implement part F of brief-ia4.md only (F1–F5), as PLAN.md describes: src/components/CheckoutForm.jsx inside the cart, plain React state, no library. The errors are computed from the fields on every render (no error state, no effect); messages only after the first Place order, each under its field, tied with aria-describedby and aria-invalid; the empty-cart message; the confirmation text exactly as the brief gives it; then the cart and fields are emptied and the wishlist is untouched; the note counter <length>/200 with maxLength 200. No framework yet. Same rules ... run npm test (all 19 must pass) and npm run lint."
### R4 result -> commit 58c2ab7. npm test 19/19; lint silent.
Row 17 pass: before submit form text has no messages; empty submit -> Name "Enter your name." aria-invalid true, Phone msg aria-invalid true, "Add something to the cart first."; then Phone 090123456 -> phone message still on Phone. URL unchanged.
Row 16 pass: Hoodie + An + 0901234567 -> "Order placed for An: 1 item, 420.000 đ.", cart 0 items / 0 đ, fields empty, URL http://localhost:5173/, 1 navigation entry. Header Saved: 0 untouched.
Row 18 pass: focusin log from search: Search, 8x(Details,Save,Add to cart), Name, Phone, Note (optional), Place order — 29 stops, outline auto on each.
Row 20 (F part): CheckoutForm.jsx:29 errors = validate(fields) each render; no useEffect; submitted flag only.

## R5 — CSS framework (after commit 58c2ab7)
"R5: F passed rows 16, 17 and 18; it is committed. Now implement part C of brief-ia4.md (C1–C3) with Bootstrap 5, as PLAN.md section 5 describes: `npm install bootstrap` (this one package only), one import of bootstrap/dist/css/bootstrap.min.css in src/main.jsx, Bootstrap classes on the existing elements, and src/index.css cut down to what Bootstrap does not give. At 360, 768 and 1280 px: no sideways scrolling, nothing cut off, every button at least 44 px tall, products in more than one column at 1280. Labels stay <label>, buttons stay <button>, every text and aria attribute the checks and briefs need stays the same, and the focus ring stays visible. Same rules; vite.config.js unchanged. Run npm test (19) and npm run lint."
### R5 result -> commit a083d81. 19/19; lint silent; row 3 empty; row 13: package.json +bootstrap ^5.3.9 only, vite.config.js unchanged. package-lock +31 lines (bootstrap, @popperjs/core peer).
Row 19: all resources origin http://localhost:5173 only; bootstrap.min.css: no @import, only remote strings = w3 SVG namespace + license comment; .btn-primary bg rgb(13,110,253) => styled from node_modules.
360: scrollW 360=vw, 1 col, min btn 44, min input 44, nothing past edge, nothing clipped; with form errors shown: invalid-feedback display:block x2.
768: vw 753 (scrollbar) scrollW 753, 2 cols, 44/44. 1280: vw 1265 scrollW 1265, 2 cols (card 376 of ul 752), 44/44.
Row 18 restyle: computed from bootstrap.css 2152 (.form-control:focus shadow rgba(13,110,253,.25)), 2968 + 3041/3176/3193 (btn focus rgb .5): ring vs white 1.41:1 inputs, 1.83 btn-primary, 2.06 outline-primary, 1.95 outline-secondary. Under 3:1 (WCAG 1.4.11).
npm audit: 3 vulns (tinypool critical, @vitest/mocker moderate) in vitest dev tree of the starter; fix only via `npm audit fix --force` (vitest major bump) -> would change devDependencies -> row 13. Not run.

## R6 — focus ring (after commit a083d81)
"R6: Row 18: after the Bootstrap step the focus ring is hard to see — Bootstrap's input ring is rgba(13,110,253,.25) (node_modules/bootstrap/dist/css/bootstrap.css line 2152), 1.41:1 against the white page, and the button rings are 1.83–2.06:1, under the 3:1 a focus indicator needs; make the keyboard focus ring of every button, input and textarea at least 3:1 against white, in src/index.css, without changing any element, text or aria attribute."
### R6 result -> commit e416a38. index.css +8 lines: button/input/textarea(.btn/.form-control):focus-visible { outline: 3px solid #0a58ca; outline-offset: 2px } (6.44:1). 19/19, lint silent.

## R7 — npm audit (after commit e416a38)
"R7: your `npm install bootstrap` printed "3 vulnerabilities (1 moderate, 2 critical)". Fix them so `npm audit` is clean. You may run npm commands for this one. Same other rules: ... Then run npm test and npm run lint and reply with what you ran, what changed in package.json and package-lock.json, and both results."
### R7 result: no files changed (git status clean at e416a38). Assistant: all 3 in vitest dev tree of starter; npm audit fix --dry-run changes nothing; only fix = npm audit fix --force -> vitest 5.1.0 (engines node ^22.12||^24||>=26 vs starter 18.18) and rewrites package.json vitest line. Offered "leave it (recommended)" or "upgrade anyway". DECISION: rejected the --force upgrade (row 13, brief-ia4 constraints "Nothing else", README node 18.18); kept "leave it".

## R8 — stale confirmation (after commit e416a38; R7 changed nothing)
Checked in page: Hoodie+An+0901234567 -> Place order -> "Order placed for An: 1 item, 420.000 đ."; then Add Cap -> cart "1 item / Total: 95.000 đ", message still "Order placed for An: 1 item, 420.000 đ.". Read CheckoutForm.jsx:26,45,99-101 (setConfirmation only in handleSubmit).
"R8: on R7 — agreed, leave vitest as the starter has it; nothing to change there. New issue, row 16 follow-on: after a valid order (Hoodie, An, 0901234567), adding Cap leaves "Order placed for An: 1 item, 420.000 đ." under a cart that now reads "1 item, Total: 95.000 đ" — the confirmation describes an order that is gone; it should disappear as soon as something is added to the cart again, without a second copy of state kept in sync by an effect (brief-ia4.md F, last paragraph)."
