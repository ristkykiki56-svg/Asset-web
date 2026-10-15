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

## Verification of published technical claims (16 October 2026)

The available primary rules reference is IMSSU Official Sporting Rules **2025**, Airgun Rules, https://imssu.org/wp-content/uploads/2025/04/IMSSU-Rules-English-2025.pdf . The site should not describe a new 2026 rules release without a newer official source.

**Officially supported:** Production Rifle .177 (4.5 mm), lead pellets, standing position, airgun silhouette targets at chicken 18m/pig 27m/turkey 33m/ram 41m, 1/10 full-size targets, +/- 2.5% range tolerance. The HTML identifies these as grounded rules and links the primary document.

**Not verified:** the alleged original anatomical poster, its locations/ref codes, athlete-specific posture and equipment, force ratios (60/40 or 65/35), 12-degree back arch, 80% sway reduction, 85mm ideal eye relief, 110gf trigger, exact muzzle sway, 200 bar rifle, particular pellet aerodynamic superiority, and 14 clicks/6.8cm drop. The uploaded HTML prototype was the only source for those values. These have been removed, replaced with non-quantitative demonstrations, or labelled as unmeasured model parameters. The trajectory view does not compute external ballistics or live click adjustments. SVG animals are not official cutout templates.

**Provenance unresolved:** Without the purported v14 source poster or measured athlete/equipment data, diagram accuracy cannot be certified. Athlete labels on schematic views are not evidence of actual stance or specific models. Any subsequent claim requires a retrievable source and citation. The distinction between IMSSU rules and coaching guidance from other organizations must be maintained.
