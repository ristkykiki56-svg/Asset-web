# Twin Shooter — Laboratorium (separate page)

## Routing and scope
- Homepage / remains Clarisa Azalia and Aurellia Cassandra's profile and achievement archive; /rules remains the same PDF reader.
- /lab is an independent interactive learning page linked in the homepage navigation. Static Vercel cleanUrls maps lab.html to /lab.
- The original uploaded prototype was used as the starting source. Names and broad section structure were retained; misleading official-revision claims removed.

## Changes
- Split into lab.html + lab.js + lab.css + precompiled lab-utilities.css; Tailwind Play CDN removed.
- All nine range inputs labelled, twenty silhouette buttons and dynamic anatomy pins named for screen readers; SVG click points also keyboard-operable.
- Trigger interaction handles primary pointer and keyboard press/release/cancel; thematic audio defaults OFF.
- Pose tab changes keep the selected anatomy dossier and pose consistent.
- Lens animation runs only while on-screen and in the visible tab, capped to approximately 30 fps. Respect reduced motion for loop and tracing.
- Added skip link and section navigation for mobile, responsive header, contrast-adjusted text colors, visible focus indicators.
- Removed unverified status as an official IMSSU technical revision; simulation figures are explicitly described as illustrative.

## Content limitations
This interactive demonstration is not an IMSSU rules edition, training measurement instrument, validated biomechanics model, or calibrated ballistic calculator. Numeric examples and diagrams were provided in the user's source file. Without the underlying poster and source references, these should not be presented as official standards. Do not add unverified technical/athlete facts without corroboration.

## Verification
- Node smoke: node --test tests/*.test.mjs
- Browser QA: homepage profile, /rules, /lab load; at 320/375/768/1280 check no horizontal overflow, navigation, labelled sliders, 20 targets, pose and dossier consistency, trigger keyboard/pointercancel, reduced motion and offline CSS.
- Validate production static delivery before merging. Do not merge if browser checks fail.
