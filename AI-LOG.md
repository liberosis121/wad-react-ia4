# AI-LOG.md — IA#4 React and a CSS framework, with a review

**Student:** 23120193 — Trần Kim Yến

One entry per request to the assistant, in order. Times are local (UTC+7), taken from
the commits. The commit before a request is the starting point of its diff.

**Who did what.** All of this ran in Claude Code (desktop app).

- **The assistant** was Claude Fable 5.2 at high effort: one sub-agent conversation for
  all eight requests, with the briefs and the repository. It wrote all the code.
- **Reviewing it** was Claude Opus 5.5, the main session, on my instructions:
  - committing before each request;
  - reading each diff;
  - running every *Done means* row in the app's browser pane;
  - measuring what the rows ask for;
  - drafting the sentences I sent back.

  That session also drafted `REVIEW.md`, this log, `evidence/done-means.md` and the
  self-assessment. I read them against the commits before handing in.
- **By hand:** no code. I chose the plan of work: one request per part, a commit before
  each, the assistant never touching git. I decided what to keep, change and reject.

---

## 2026-11-14 00:02 — set-up (no assistant)
- **Tool:** none; Claude Code ran the commands.
- **Did:**
  - unzipped `ia4-starter.zip` and committed it untouched as `8db4dba starter`;
  - ran `npm install`; `npm test` showed 19 failed, as README says;
  - created the private repository `liberosis121/wad-react-ia4`.
- **Problem met:** Vite does not run from a path that contains `#`. Under `IA#4` the
  checks failed with `Cannot find module '/@vite/env'`. I moved the project to
  `D:\HK7\WAD\IA\IA4\ia4-starter`; the zip goes back in the `IA#4` folder.

## 2026-11-14 00:03 — R1: a plan before any code
- **Tool:** Claude Code, sub-agent on Claude Fable 5.2 (high).
- **Asked for:** a plan in `PLAN.md` and nothing else, covering:
  - the components, and where each piece of state lives;
  - what the wishlist context holds;
  - latest-wins, duplicate requests and StrictMode;
  - one CSS framework from npm, and a form library or not;
  - the requirements easiest to get wrong.
- **Result:** commit `9eb6aef`, 122 lines.
- **Kept:** all of it:
  - loading and failure computed from the last answer, not stored;
  - abort in the effect's cleanup;
  - one provider inside `App`, because the checks render `<App />` alone;
  - Bootstrap from npm with no Vite change, after it weighed Tailwind's two packages
    and plugin line;
  - plain React state for the form;
  - ten traps, including `noValidate` and Bootstrap's hidden `.invalid-feedback`.
- **Changed:** —
- **Rejected:** — I read it against both *Structure* sections and found nothing to turn
  down.
- **Note:** it ran `git --version` once although told no git, and said so itself. It
  only prints the version.

## 2026-11-14 00:12 — R2: the session 6 page
- **Asked for:** step S6 of the plan only: `App.jsx`, `useProducts.js`, `format.js` and
  the four components. No wishlist, no form, no framework. Run `npm test` and
  `npm run lint`.
- **Result:** commit `3a33006`:
  - 11 of the 11 session 6 checks pass, I1–I8 fail as expected;
  - lint is silent.
- **Kept:** all of it (`REVIEW.md` entries 3 and 8). Rows 4–12, run with real keys and
  clicks, all passed:
  - row 7, `sc` in `out-of-order`: only the scarf, still at 3.5 s;
  - row 8, `q=c`, `q=ca`, `q=cap` once each;
  - row 9, Cap stays open after `a`;
  - row 10, `1 item`, `420.000 đ` after `shirt`.
- **Changed / Rejected:** nothing went wrong.

## 2026-11-14 00:15 — R3: the wishlist (W1–W5)
- **Asked for:** part W only: `WishlistContext.jsx` with one provider and
  `useWishlist()`, `Header.jsx`, `SavedPanel.jsx`, and Save with `aria-pressed` read
  through the hook. The count computed.
- **Result:** commit `aaa7f54`, 14 of 19 checks pass (I4–I8 still to come), lint silent.
- **Kept:** all of it (`REVIEW.md` entry 1).
  - Row 14: `Saved: 2` at every 50 ms sample; Cap and Jacket pressed again.
  - Row 15: one provider, found by walking React's fiber tree, since the DevTools
    extension is not in the pane.
- **Changed / Rejected:** nothing went wrong.

## 2026-11-14 00:19 — R4: the checkout form (F1–F5)
- **Asked for:** part F only, in plain React state:
  - errors computed from the fields on each render, with no error state and no effect;
  - messages only after the first Place order, tied with `aria-describedby`;
  - the exact confirmation text;
  - the note counter.
- **Result:** commit `58c2ab7`, 19 of 19 checks pass, lint silent.
- **Kept:** the form (`REVIEW.md` entry 2). Rows 16, 17 and 18 passed with real keys;
  row 18 is 29 Tab stops in reading order.
- **Changed:** later, in R8: the confirmation stayed on screen after a new cart was
  started.
- **Rejected:** —

## 2026-11-14 01:21 — R5: Bootstrap (C1–C3), after a one-hour pause for the plan's usage limit
- **Asked for:** part C with Bootstrap 5 from npm:
  - one package and one import;
  - classes on the existing elements;
  - 360, 768 and 1280 px without sideways scroll;
  - buttons ≥ 44 px;
  - more than one column at 1280;
  - labels and buttons unchanged.
- **Result:** commit `a083d81`, 19/19, lint silent.
  - `package.json` gained only `"bootstrap": "^5.3.9"`; `vite.config.js` is unchanged.
  - Rows 3 and 13 pass.
- **Kept:** the install, the import, the grid, the 44 px rule, and `is-invalid` with
  `.invalid-feedback` (`REVIEW.md` entries 4 and 9).
  - Row 19: every resource from `localhost`, no remote URL in the CSS.
  - At all three widths: no sideways scroll, shortest button 44 px, 2 columns at 768
    and 1280.
- **Changed:** Bootstrap's focus rings, which measured 1.41–2.06:1 against white
  (row 18). See R6.
- **Rejected:** —

## 2026-11-14 01:25 — R6: the focus ring (row 18)
- **Asked for:** the sentence in `REVIEW.md` entry 5: make every keyboard focus ring at
  least 3:1 against white, in `src/index.css`, with nothing else changed.
- **Result:** commit `e416a38`, 8 lines of CSS: `outline: 3px solid #0a58ca`, 6.44:1,
  with an offset. 19/19, lint silent.
- **Kept:** the rule. I checked the selectors outrank Bootstrap's `outline: 0`, and the
  assistant tabbed all 29 stops with the outline on each.
- **Changed / Rejected:** —

## 2026-11-14 01:29 — R7: the `npm audit` warnings
- **Asked for:** clear the "3 vulnerabilities (1 moderate, 2 critical)" that
  `npm install bootstrap` printed. npm commands were allowed for this one request.
- **Result:** no file changed (`git status` clean). The assistant found:
  - all three are in vitest, the starter's test runner;
  - `npm audit fix --dry-run` does nothing;
  - the only fix, `npm audit fix --force`, moves vitest to 5.1.0, which needs Node 22.12
    or newer.

  It offered "leave it" (its recommendation) or "upgrade anyway".
- **Kept:** "leave it".
- **Changed:** —
- **Rejected:** the `--force` upgrade (`REVIEW.md` entry 7). It would change a starter
  devDependency against row 13 and the brief's "Nothing else", and break README's
  Node 18.18.

## 2026-11-14 01:30 — R8: the confirmation outlived its order
- **Asked for:** the sentence in `REVIEW.md` entry 6. After an order, adding Cap left
  `Order placed for An: 1 item, 420.000 đ.` under a cart of `1 item, 95.000 đ`. Hide it
  once the cart has something again, without an effect.
- **Result:** commit `91b0dab`, two lines in `CheckoutForm.jsx`:
  `shownConfirmation = itemCount === 0 ? confirmation : ''`. 19/19, lint silent.
- **Kept:** the fix. No new state, no effect. Re-run on `91b0dab`: Add Cap empties the
  message line, and rows 16 and 17 still pass.
- **Changed / Rejected:** —
- **Note:** `PLAN.md` still describes the confirmation as before R8. I left it as the
  plan the assistant wrote at R1.

## 2026-11-14 — final pass and paperwork
- **Tool:** Claude Code (Opus 5.5).
- **Did:** ran the whole table again on `91b0dab`, and wrote these files.
  - Rows 1–3 and 13 with the commands.
  - Rows 4–7, 9, 10, 14, 16 and 17 through DOM events, because the app window was
    hidden and the pane cannot send keys to a hidden page.
  - Rows 8 and 18 were last run with real keys, on `3a33006` and `58c2ab7`, and the R6
    outline was checked by the assistant's own Tab run.
