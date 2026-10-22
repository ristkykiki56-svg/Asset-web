# Mobile Lab Implementation Plan

> Execute task by task in the current isolated checkout. Verify each boundary before continuing.

**Goal:** implement the approved mobile experiment workspace for all five lessons.
**Architecture:** a reversible mobile DOM adapter moves original visuals and controls into scoped workspace hosts. Existing renderer/state functions stay authoritative. Separate workspace CSS handles layout; desktop restores the original DOM.
**Tech Stack:** existing static HTML, CSS and native JavaScript, native details/dialog.
**Spec:** `docs/superpowers/specs/2026-10-22-mobile-lab-design.md`.

## Constraints

No dependencies or new visual assets. Keep original IDs and handlers. No clone of live controls. Below 768 px only. Paper/ink palette and labelled model values remain. Source/reference content stays accessible. Target area 44 px. Test actual layout and interaction, not stylesheet strings.

## Tasks

- [x] 1. Add `tests/lab-workspace.html`: iframe fixtures at 320/375/390, assert workspace exists, stage and active primary controls fit the viewport, optical parameter switching updates original inputs, completion action works, desktop/mobile round trip preserves unique IDs. Run before implementation and record failure.
- [x] 2. Add `lab-workspace.js` and `lab-workspace.css`, linked after existing Lab resources. Create reversible node moves, a compact common shell, native details and source dialog, five lesson adapters, original navigation integration and real completion navigation. Keep extra controls in the panel's own scroll area.
- [x] 3. Adjust `positionBiomechPins()` in `lab.js` to keep mobile labels off the figure with leader cues. Correct detail zoom focus in `optics-poster-artwork.js`. Preserve desktop behavior and fallback renderers.
- [x] 4. Run `node --test tests/*.test.mjs`, the workspace browser fixture and existing accessibility fixture. Click through the five lessons, native keyboard controls and both themes; inspect screenshots and console. Fix regressions, review independently, write follow-up verification and update PR #26 without merging.

The existing audit fixtures are supporting regression checks; desktop-only legacy selectors may need to be exercised at their original breakpoint rather than interpreted as the new mobile composition.
