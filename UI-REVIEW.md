# UI review — Saanjh: एक लौ

Reviewed November 10, 2026.

## Improvements

- Reframed the hero artwork with a lavender inset, gold edge, contained badge, and a separate collection caption.
- Added a secondary link to the brand story and refined spacing, button treatment, and type hierarchy.
- Increased body, catalog, and cart text sizes for readability.
- Gave product images rounded arch frames and aligned card actions; mobile controls now use the card's full width.
- Rebuilt responsive rules for the tablet layout, phone navigation, product headings, and cart quantity controls.
- Preserved cream as the main surface, lavender accents, and gold trims.

## Issues found and corrected

1. The rotated hero badge extended outside its artwork container at every tested width. The badge now sits inside the frame.
2. The small tagline in all eight candle illustrations exceeded its label boundary. Reduced its size and letter spacing, then measured the rendered result again.
3. The narrow cart needed wrapping controls and flexible detail widths. Quantity, remove, and price controls now wrap without forcing the panel wider.

## Browser verification

| Viewport width | Page/text overflow | Open cart overflow |
| --- | --- | --- |
| 320 px | None found | None found |
| 390 px | None found | None found |
| 650 px | None found | None found |
| 768 px | None found | None found |
| 1024 px | None found | None found |
| 1440 px | None found | None found |

Page measurements checked rendered text ranges against their containing elements, element scroll widths, and viewport boundaries. The browser reserves some width for its scrollbar. Hidden controls and deliberately offscreen accessibility links were excluded.

Individually rendered and measured the hero, ritual, and all six product SVG illustrations: no label overflow remained. Visually reviewed desktop hero, phone hero, phone collection, and the populated cart at 320 px.

All eight existing automated cart and WhatsApp-order checks pass. Test products added during browser review were removed. No WhatsApp message was sent.

These checks cover the current sample content and browser; future catalog changes and other browsers may need a fresh review.

## Three-color palette update

Updated the visual target to lavender 30%, cream 38%, and dark navy 32%, with gold used for trims. The proportions guide the overall composition rather than an exact pixel count, and vary by viewport. Navy (#111e38) now anchors the hero, story, footer, and controls. Cream (#fff8ed) remains the catalog and ordering surface; lavender appears in imagery, accents, and the closing panel. Light cream and pale lavender text replace dark lettering on navy surfaces.

Reviewed the rendered desktop and phone hero. Rechecked page overflow at 320, 390, 768, and 1440 px: none found.

## Phone interface test — November 13, 2026

Tested all eight pages (home, collection, five individual products, checkout) at simulated viewport widths of 320, 390, and 430 px. All 24 page/width combinations passed the element-boundary and horizontal-overflow scan.

Verified collection filtering; opening product pages; choosing Mango by its photo; adding two units; navigating into checkout; changing quantity; saving a gift note through refresh; and the correct prefilled WhatsApp URL and recipient. Verified two Bubble boba sets produce ₹160 in the mobile side panel. Empty-cart recovery also worked. Test products and notes were removed. No browser errors were reported at the end of the session.

The preview is left at 390 × 844 px for user review. This is browser viewport simulation, not a physical iOS/Android test. Native WhatsApp app handoff, mobile keyboard behavior, and touch/gesture behavior still need an actual phone check before launch. No WhatsApp message was sent.
