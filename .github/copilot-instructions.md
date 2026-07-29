# 📋 Copilot Instructions — OSRS Board Game (Reference Repo)

> **🔗 Using this repo as a reference for new projects?**  
> Copy this file (`.github/copilot-instructions.md`) to your new repo's `.github/` folder.  
> Copilot automatically reads it when you work on that repo.  
> The patterns, fixes, and conventions documented here are battle-tested in OsrsGame1.

## Self-review after UI/layout changes

After every prompt involving UI or layout changes:
1. Re-read what was asked
2. Mentally compare the change against the request
3. If an image was attached, verify the result matches
4. Avoid unnecessary changes beyond what was requested
5. When reverting, only revert the specific changes the user is unhappy with — don't cascade
6. **Look at the BIG picture** — don't hyperfocus on just the new detail you're adding. Check whether your change affects surrounding elements, existing layout, or overall visual structure. Review screenshots with fresh eyes: if something looks broken (clipping, overlapping, shifting), investigate before concluding the fix is done.
7. **Don't hallucinate solutions** — read the prompt literally. If the user says "move this down", don't decide to make the container bigger. Ask yourself: does this change exactly match what was requested, or am I inventing a different approach? When in doubt, ask the user concisely before making structural changes.
8. **Ask before making design decisions** — if you're about to change sizing, padding, margins, or layout structure beyond what was literally asked, stop and ask the user first with a short question. Don't assume you know what they want.

## Testing changes

When making UI/layout changes, test the result by simulating the user flow:
1. Mentally walk through roll → complete → roll again and check for layout shifts
2. Verify button visibility toggles don't cause the board or any element to jump
3. Check that all game phases (roll1, roll2, joker_choice, done) render correctly

## Preventing layout shifts when toggling element visibility

When elements are shown/hidden (e.g., buttons or panels toggled via `display:none`/`display:block`), CSS Grid layouts can collapse columns/rows and cause other elements to shift. This is a common issue in game UIs where controls appear per-phase.

### Root cause

Toggling `display:none` removes an element from the layout entirely. In a CSS Grid with `auto` column widths, a column that loses its visible children collapses to 0 width. The freed space is redistributed to `fr` columns, pushing adjacent `auto` columns to new positions. Similarly, if a parent uses `min-height`, removing tall children can shrink the container, shifting everything below it.

### General solutions

| Technique | When to use |
|-----------|-------------|
| **`min-width` on the container** | The grid column must keep its width even when children are hidden. Give the container e.g. `min-width:270px` so the column never collapses. |
| **`height` instead of `min-height`** | The container's height must stay fixed regardless of visible content. Use a fixed `height` that accommodates all possible visible states. |
| **`visibility:hidden` instead of `display:none`** | The element should be invisible but still occupy its grid/flex space. Combine with `pointer-events:none` if needed to prevent interaction. |
| **`minmax()` in grid definition** | Replace bare `auto` columns with e.g. `minmax(200px, auto)` to set a minimum width. Works best when you control the grid template directly. |
| **`overflow:hidden` on adjacent containers** | If a sibling might grow/shrink and you want to contain the effect, `overflow:hidden` prevents spill but does not prevent grid re-distribution. |

### Real example (OsrsGame1)

In `index.html`, the `topBar` grid had `grid-template-columns: 1fr 1fr auto auto`. The Complete/Give Up buttons (column 4) used `display:none` when not in the `done` phase. This caused:

1. **Points display jitter** — Column 4 collapsed to 0, `fr` columns expanded, pushing the points display (column 3) to the right.
2. **Board vertical shift** — `min-height:54px` allowed the topBar to shrink when buttons disappeared, moving the board up.

**Fix:** Added `min-width:270px` to `#controls` to prevent column collapse, and changed `min-height:54px` to `height:60px` on `#topBar` to lock its height.

Reference: [`OsrsGame1/index.html`](c:\administratie\git\OsrsGame1\index.html) lines 91-104.

## Preventing content shift inside tile/grid items when state changes

When the content inside a CSS flex/grid item changes (e.g., region name replaced by a checkmark), the item's height can change. If the parent uses `justify-content:center`, the entire group re-centers, pushing sibling elements like colored bars into new positions — causing overlap with absolute-positioned elements (like tile numbers).

### Root cause

`display:flex; flex-direction:column; justify-content:center` centers all flex items as a group. When one item's content height changes (e.g., emoji → ✅), the group re-centers at a different position, shifting all items. This causes absolute-positioned elements (numbers) to overlap with in-flow elements (bars).

### General solutions

| Technique | When to use |
|-----------|-------------|
| **`justify-content:flex-start` + `flex:1` on content** | The bar/title must stay at a fixed position from the top. Use `flex-start` so flex items pack at the top, and give the dynamic content area `flex:1` to fill remaining space. |
| **`min-height` on the dynamic element** | The content changes size but must not shrink the element. Set `min-height` to the maximum needed height so the parent layout never shifts. |
| **Absolute positioning for fixed elements** | Position critical elements like numbers and bars absolutely so they're out of the flex flow and immune to content height changes. |
| **Inner flex container for centering** | If you need centered text inside a flex item that has `flex:1`, make the item itself a flex container (`display:flex; flex-direction:column; justify-content:center; align-items:center`) to keep its content centered regardless of the available space. |

### Real example (OsrsGame1)

In `index.html`, each board `.space` used `justify-content:center` to vertically center the bar + region name. When a region was completed, the `.sn` content changed from `emoji<br>name` to `✅<br>name`, which could alter its effective height. The `justify-content:center` re-centered the group, shifting the colored bar up — causing the absolute-positioned number (`.space-num`) to overlap with the bar.

**Fix:**
1. Changed `.space` to `justify-content:flex-start` so the bar stays at a fixed position
2. Increased `padding-top` from `28px` to `46px` to make room for the absolute number
3. Made `.sn` a flex container with `flex:1` so it fills remaining space and centers its text via `justify-content:center; align-items:center`
4. Set `pointer-events:none` on `.space-num` to prevent interaction issues

Reference: [`OsrsGame1/index.html`](c:\administratie\git\OsrsGame1\index.html) lines 1-25 (CSS rules for `.space`, `.bar`, `.sn`, `.space-num`).

## Vertical shift inside a fixed-height grid row when children toggle

Even after fixing the topBar to `height:60px`, a ~1mm vertical jump of the dice + points display remained when the Complete/Give Up buttons appeared/disappeared.

### Why this was tricky

The previous fix (`height:60px` + `min-width:270px`) addressed the **horizontal** points jitter and the **board** vertical shift, but a small **vertical** shift of the topBar's own contents persisted. The root cause was invisible because:

1. **`height:60px` on a grid container ≠ fixed row height.** Setting `height:60px` on the grid container constrains the outer box, but without `grid-template-rows`, the single grid row's height is **auto-sized** based on the tallest grid item.
2. **Buttons are taller than 60px.** The Complete button (padding + emoji span + text) measures ~64px due to the `display:block` emoji span at `font-size:1.4rem` plus text at `1.1rem`. This makes the auto row 64px when buttons are visible.
3. **Items re-center when the row shrinks.** When the buttons disappear (`display:none`), the tallest item becomes the points display (~58px). The row shrinks from 64→58px, and `align-items:center` re-centers everything within the smaller row — causing a subtle upward shift of dice and points.

### How it was fixed

Added `grid-template-rows:64px` (and increased height to `height:64px`) on the topBar grid container. This **locks the row height** to a fixed value regardless of which children are visible. Items are always centered at the same position, so no shift occurs.

### Tips & tricks

| Situation | What to check |
|-----------|---------------|
| **Grid shifts when content appears/disappears** | Check if `grid-template-rows` (or `grid-template-columns`) is set. Without it, rows/columns are auto-sized and can change. |
| **`height` on grid container doesn't stop row resize** | `height` constrains the outer box, not internal row tracks. Use `grid-template-rows: <value>` to fix row sizes. |
| **Buttons taller than expected** | An emoji or icon with `display:block` inside a button adds its full line-height. Check actual rendered height in devtools. |
| **Small shifts (< 2px)** | Often caused by row/column auto-sizing changes, not layout bugs. Measure the tallest visible and hidden items to find the mismatch. |
| **`min-height` vs `height` on flex/grid parents** | `min-height` allows growth; `height` is a fixed constraint. If the goal is "never change height", use `height` — but also fix the internal tracks. |

### Real example (OsrsGame1 — the 1mm vertical shift)

In `index.html`, the `topBar` grid had `height:60px` but no `grid-template-rows`. The Complete button's actual rendered height (~64px) made the auto row 64px. When buttons hid, the row shrank to ~58px, causing a tiny upward jump of dice and points.

**Fix:** Added `grid-template-rows:64px; height:64px` to the topBar.

Reference: [`OsrsGame1/index.html`](c:\administratie\git\OsrsGame1\index.html) line 91.

## Variable-width content shifting adjacent grid items

When an `auto`-sized grid column contains content whose width changes (e.g., dice result text going from `= 5` to `= 12`), the column expands/shrinks. In a grid with mixed `auto` and `fr` columns, this shifts the **entire adjacent `fr` column** — causing seemingly unrelated elements to move.

### Why this is sneaky

The shift is most visible when the variable-width content is in an `auto` column and the affected element is in the next `fr` or `auto` column. You notice "Current points moved!" but the root cause is "the dice result text got wider". Because `auto` columns size to their content, any width change propagates through the entire grid.

### How to prevent it

| Technique | When to use |
|-----------|-------------|
| **`min-width` on variable-width elements** | The content width changes (e.g., numbers in text). Set `min-width` to accommodate the widest possible value. Works best when the max width is predictable. |
| **Fixed-width column instead of `auto`** | The column has no reason to resize. Replace `auto` with a fixed width like `90px` in `grid-template-columns`. |
| **`max-width` with `overflow:hidden`** | The content can be truncated or clipped. Less common for game UIs but useful for text labels. |
| **Put variable content in a `fr` column** | `fr` columns only change when the total grid width changes, not when inner content changes. |

### Real example (OsrsGame1)

In `index.html`, the topBar grid was `auto 1fr auto` (after refactoring). Column 1 (auto) contained the dice wrapper with `#diceResult` showing `= X`. When the dice sum changed from 5 (`= 5`) to 12 (`= 12`), the text width grew by ~20px. Column 1 expanded, pushing the points display in column 2 (1fr) to the right — even though the points text hadn't changed at all.

**Fix:** Increased `#diceResult` `min-width` from `50px` to `90px` so column 1 never changes width regardless of the dice value.

Reference: [`OsrsGame1/index.html`](c:\administratie\git\OsrsGame1\index.html) line 54 (`#diceResult` CSS).
