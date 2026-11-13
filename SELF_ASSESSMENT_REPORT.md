# Self-assessment — IA#4 React and a CSS framework, with a review

Submitted by: 23120193 — Trần Kim Yến

Repository: https://github.com/liberosis121/wad-react-ia4 (private)

Total I claim: 100 / 100

| # | Criterion | Max | I claim | Evidence |
|---|---|---|---|---|
| 1 | The session 6 page | 20 | 20 | `npm test` 19/19, with all 11 session 6 checks among them; `npm run lint` silent with no `eslint-disable`. Rows 4–12 run with real keys and clicks on `3a33006`, again on `91b0dab` (`evidence/done-means.md`): row 7 only the scarf at 3.5 s; row 9 Cap 4th → 2nd and still open; row 10 `1 item`, `420.000 đ`. Row 11: `ProductList.jsx` line 8 `key={product.id}`, count and total computed in `CartSummary.jsx` |
| 2 | The wishlist W1–W5 | 15 | 15 | I1–I3 pass. Row 14: `Saved: 2` at every 50 ms sample through `hood`. Row 15: one provider in the fiber tree. Row 20: `src/WishlistContext.jsx`, one `<WishlistProvider>` in `App.jsx`, `ProductCard.jsx` reads `useWishlist()`, `Header.jsx` shows `saved.length`. `REVIEW.md` entry 1 |
| 3 | The checkout form F1–F5 | 15 | 15 | I4–I8 pass. Row 16: confirmation, `0 items`, URL unchanged. Row 17: one message per field through `aria-describedby`, with `aria-invalid`. Row 18: 29 Tab stops in reading order. Row 20: `CheckoutForm.jsx` `validate(fields)` on each render, no effect. Later fix `91b0dab` (stale confirmation). `REVIEW.md` entries 2, 6 |
| 4 | One CSS framework C1–C3 | 10 | 10 | Row 13: `package.json` gains only `bootstrap`; `vite.config.js` is unchanged. Imported from `node_modules` in `src/main.jsx` line 3. Row 19: every resource from `localhost`; at 360, 768 and 1280 px, `scrollWidth` = viewport, nothing past the edge, buttons ≥ 44 px, 2 columns at 768 and 1280. Labels are `<label>`, buttons `<button>`; focus outline 6.44:1 (`e416a38`). `REVIEW.md` entries 4, 5, 9 |
| 5 | REVIEW.md | 20 | 20 | 9 entries, each with a commit and lines that exist at that commit. Kept: 1, 2, 3, 4, 8, 9. Changed: 5 (focus ring, row 18 measured 1.41–2.06:1) and 6 (stale confirmation). Rejected: 7 (`npm audit fix --force`, row 13 / brief constraints / Node 18.18). Context: 1. Form: 2, 6, 9. Framework and dependency: 4, 5, 7. Each rests on a row, a check, a measured number or a line read, with the sentence sent for 5, 6, 7 |
| 6 | AI-LOG.md | 10 | 10 | `AI-LOG.md`: one entry per request R1–R8 plus set-up and the final pass, each with the tool, the request, the result commit, and Kept/Changed/Rejected. Changed and Rejected match `REVIEW.md` 5, 6, 7 |
| 7 | Scope and commit history | 10 | 10 | `8db4dba` is the untouched starter, then one commit per request: R1 `9eb6aef`, R2 `3a33006`, R3 `aaa7f54`, R4 `58c2ab7`, R5 `a083d81`, R6 `e416a38`, R8 `91b0dab` (R7 changed nothing). Row 3 prints nothing. Row 13: one `bootstrap` line, `vite.config.js` untouched. Paperwork in separate commits after them |

## What I did not manage

- **No real browser extensions or DevTools switches.** I could not use React DevTools or
  DevTools *Offline* in the app's browser pane.
  - Row 15 was checked by walking React's fiber tree from the page.
  - Row 19's offline case was checked by listing every resource origin (all
    `localhost`) and reading `bootstrap.min.css` for remote URLs.
  - The marker will run both for real in Chromium.
- **Keyboard rows not re-run on the final commit.** The last pass on `91b0dab` ran
  through DOM events, because the app window was hidden. Rows 8 and 18 with real keys
  were last run on `3a33006` and `58c2ab7`, and the R6 outline only by the assistant's
  own Tab run.
- **The assistant wrote all the code.** My part was the plan of work, the commits, the
  rows and the decisions. Those were carried out through Claude Code, which also
  drafted these three files.
- **The `npm audit` warnings are still there.** They are in the starter's vitest. I
  left them on purpose (`REVIEW.md` entry 7).

## What I would do differently

Run the framework step with the focus ring and contrast in mind from the start. Both
"changed" entries came from things the checks cannot see: a pale focus ring and a
message that outlived its order. I found them only by looking past the rows' wording.
