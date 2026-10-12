# Twin Shooter — Precision Editorial homepage

## Intent
The homepage is an athlete archive (2021–2023), not a sports-game landing page. Editorial composition, authentic athlete photography and a clear evidence hierarchy take precedence over novelty animation.

## Design system
- Off-white page, ink-navy headings and featured-results panel, restrained teal accent.
- Two real athlete WebP photos, always identified by name and competition discipline. No generated portraits, stock photography, decorative crosshairs, noise, or extraneous gradients.
- Large but readable names, compact labels, substantial whitespace, consistent rectangular edges, and fine separators.
- Featured results repeat two documented achievements already present in the static achievement list: Clarisa (POPNAS XVI, Juara 2, Multi Range Women, 2023) and Aurellia (Jabar Open, Juara 1, Multi Range Women Junior, 2023).
- Links and navigation retain their original href values; 25 result/selection entries, filters and source-specific facts remain intact.
- Existing brief hero and timeline motion stays unchanged. No autoplay video or extra JS dependencies.

## QA
Check 320, 360, 375, 390, 768, 900, 1024, 1280 and 1440 px widths:
1. No horizontal overflow; keep names and photo captions legible and do not crop away athlete identity.
2. The mobile header retains all four links and does not obscure jump anchors.
3. Motion plays only once; reduced-motion disables it; content stays visible without JS.
4. Filter changes result cards immediately; status + aria-pressed remain correct.
5. IMSSU page, canonical/structured metadata, Google Drive URL and downloadable PDF remain unchanged.
6. Confirm the small source photos remain visually acceptable at the rendered size; replace only with authentic higher-resolution portraits if supplied.
7. Validate with `node --test tests/*.test.mjs` and perform real-browser visual QA before a production release.

## Reference use
Use MotionSites editorial photography and sports-portfolio structures as **direction**, not copied templates or assertions about their underlying implementation.
