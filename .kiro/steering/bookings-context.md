---
inclusion: manual
---

# Petrus Bookings — Project Context

## Overview
Internal tool for Petrus restaurant (London) to process OpenTable CSV exports into printable briefing sheets for different departments. Lives at `bookings.html` within the Petrus FOH website.

## Site Details
- **Live URL:** https://fatencioj-rgb.github.io/fiorella-petrus-foh/
- **Repo:** github.com/fatencioj-rgb/fiorella-petrus-foh (public)
- **Hosting:** GitHub Pages (files in repo root)
- **Working folder:** `C:\Users\fiore\OneDrive - Le Cordon Bleu International BV\CMS 206\petrus-site\`

## Security
- Page protected with `guard-admin.js` (only admin sees content, others see "Coming Soon")
- Additional upload key lock (`fiorella2026`) — even after Firebase auth, need key to access upload/data
- Firebase project: `petrus-foh`

## Design System
- Red dark: `#5c1a1a` / `#2d0a0a`
- Gold: `#b89650`
- Cream: `#faf7f1`
- Fonts: 'Cormorant Garamond' (serif titles) + 'Inter' (sans body)

## OpenTable CSV Format
Filename pattern: `Dinner-Reservations-XXXXX-YYYY-MM-DD.csv` or with date as first groups.
Columns: `TIME, PARTY SIZE, GUEST, PHONE, TABLE, NOTES AND TAGS, PAYMENT STATUS, TABLE STATUS, MADE`

The `NOTES AND TAGS` field contains unstructured text with:
- `VISIT NOTES:` — diet info, occasion details, confirmation notes
- `SPECIAL EVENTS:` — Birthday, Anniversary, Special Occasion, etc.
- `GUEST REQUESTS:` — specific guest asks
- `FOOD & DRINK PREFERENCES:` — Allergy tag
- `GENERAL NOTES:` — Michelin notes, etc.
- Voucher codes (long alphanumeric 7+ chars with 5+ digits)
- Menu references ("Menu Discovery at Pétrus - £380/checked")

## Date Handling
- Filename format: `Dinner-Reservations-XXXXX-DD-MM-YYYY.csv` (e.g. `15-07-2026`)
- Regex: `(\d{2})-(\d{2})-(\d{4})` → captures DD-MM-YYYY, converts to YYYY-MM-DD for input field
- Display: `en-GB` locale (e.g., "Tue, 15 Jul 2026")

## Extraction Logic

### Menu Detection
- `Prestige` / `PST` → Prestige
- `Discovery` → Discovery
- `ALC` / `A la carte` / `à la carte` / `ALC Menu` / `A la carte Menu` → ALC
- `LM` / `Lunch Menu` → Lunch Menu
- Also detects "Menu [Name] at Pétrus" pattern from voucher lines

### Allergy Detection
- Searches entire NOTES AND TAGS field
- Handles abbreviations: pesci/pesce/pesc → Pescatarian, veggy/veggie/veg → Vegetarian, GF → Gluten Free, DF → Dairy Free, vgn → Vegan
- Preserves compound expressions: "Pescatarian (Halal)" stays intact
- Detects "Nx [allergy]" patterns: "1x shellfish and peanuts allergy"
- Detects "does not eat X", "no beef/lamb/pork/etc."
- "no diet" with no allergy keywords = empty (no allergies)
- Full list: Shellfish, Peanut, Nut, Gluten Free, Dairy Free, Vegan, Vegetarian, Pescatarian, Halal, Kosher, Lactose, Egg, Soy, No Pork, Prawn, Crab, Lobster, Sesame, Mustard, Sulphite, Lupin, Mollusc, Wheat, Fish Allergy
- Print styling: red background (#5c1a1a) with white text, with `print-color-adjust:exact`

### Special Occasion Detection
- Checks VISIT NOTES first for specific details (e.g., "Keiko's birthday", "5-year wedding anniversary")
- If SPECIAL EVENTS is generic ("Birthday") but VISIT NOTES has detail, uses the detail
- Detects: Birthday, Anniversary, Engagement, Promotion, Graduation, Retirement, Proposal, Reunion, Farewell, Hen Party, Stag Party, Baby Shower, Welcome, Congratulations
- "Congratulations Sarah" → "Congrats Sarah"
- Title Case applied

### Voucher Detection
- Finds strings 7+ chars with 5+ digits mixed with letters (no need for "Voucher" keyword)
- If voucher code found + `£XX/checked` nearby → "CODE - £XX"
- Prices without voucher code are NOT captured (e.g., "lunch menu 59" is ignored)

### Notes Extraction
- Extracts GUEST REQUESTS content (e.g., "Please include a birthday message with dessert")

## Table Structure (Edit Form)
Columns: ☰ (drag) | Time | Pax | Name | Table | Menu | Special Occasion | Allergy/Req | Notes | Voucher | Visits | × (delete)

- Drag handle (☰) for reorder rows
- 3 empty rows added at end of print for manual fill

## Restaurant Table Sections
- **Section 1:** Tables 1, 2, 3, 4, 5, 6, 7, 8, 18
- **Section 2:** Tables 9, 10, 11, 12, 14, 15, 16, 17

## Print Formats

### Individual Buttons
- **Kitchen:** Time | Pax | Name | Tbl | Menu | Allergy | Notes (NO Occasion)
- **Pastry:** Time | Pax | Name | Tbl | Menu | Occasion | Allergy | Notes (ALL rows, same as Kitchen + Occasion)
- **Section 1:** Filtered by section 1 tables. Time | Pax | Name | Tbl | Menu | Occasion | Allergy | Notes | Voucher | Visits
- **Section 2:** Filtered by section 2 tables. Same columns as Section 1.
- **Reception:** All rows. Same columns as Section 1/2.

### Combined Buttons
- **Print All:** Statement paper (5.5×8.5in), each section on its own page: Kitchen×2, Pastry, Section 1, Section 2, Reception
- **Print A5 BOH:** Statement paper. If ≤5 reservations: Kitchen×2 share page 1, Pastry on page 2. If >5: each on own page.
- **Print A5 FOH:** Statement paper. If ≤5 reservations: Section 1 + Section 2 share page 1, Reception on page 2. If >5: each on own page.

### Print Details
- Paper size: Statement (5.5 × 8.5 in) — closest standard to actual paper (13.7 × 21.8 cm)
- Section headers: Tables shows COUNT of tables that day (not which tables)
- Menu summary at bottom (Prestige: X, Discovery: Y, etc.)
- Allergy summary box at bottom listing guests with allergies
- Table row borders: 1px solid #999 (visible when printed)
- Table headers (th): black text bold with border-bottom (no dark background — prints better)

## Save/Load System
- Uses **Firebase Firestore** (collection `bookings`, document ID: `YYYY-MM-DD_SERVICE`)
- Accessible from any computer where user is logged in
- Button shows "Save" (green) for new, "Update" (gold) for existing
- Auto-loads today's booking after unlock
- Saved bookings list (last 20) with load + delete (×) buttons pulled from Firestore
- Everything behind key lock — nothing visible without entering key
- Firestore Rules: `match /bookings/{doc} { allow read, write: if request.auth != null; }`

## Print Layout Updates
- **Print A5 FOH**: landscape orientation (`@page size: 8.5in 5.5in`)
- **Print A5 BOH**: portrait Statement (`@page size: 5.5in 8.5in`)
- **Print All**: portrait Statement, each section on own page
- FOH sections (Salon, Reception) include Notes column
- Allergy cells: red background (#5c1a1a) white text with `print-color-adjust:exact`
- Table row borders: `1px solid #999` (visible when printed)
- Table headers (th): black bold text with border-bottom (no dark background)
- If >5 reservations: each section on its own page. If ≤5: two sections share a page

## Files
- `bookings.html` — main page (all logic in single file)
- `kitchen-print.html` — legacy standalone mockup (can be deleted)
- `index.html` — has "Bookings" button in navigation
- `guard-admin.js` — admin-only protection
- `auth.js` — Firebase config

## Known Considerations
- Browser must have "Background graphics" enabled to print the red allergy highlight
- `@page size` landscape may not work on all browsers — FOH uses `8.5in 5.5in` which should force it
- Paper size for printing: Statement (5.5 × 8.5 in) — closest standard to actual paper (13.7 × 21.8 cm)
- The `printAreaAll` quad layout (A4) HTML container still exists but Print All now uses Statement per-page format
- Firebase Firestore used for persistence — requires internet connection to save/load
- Firestore rules must include `bookings` collection with read/write for authenticated users

## Implemented Features (completed)

### Column Order (Print & Edit Table)
☰ | Time | Pax | ★ | Name | Table | Sec | Menu | Occasion | OPos | Allergy | APos | Voucher Code | Voucher £ | Visits | Notes | ×

### Features Completed
- ★ (Star/VIP) column — toggle click between Pax and Name
- Occasion highlight — coral/peach background (#ffe4c4)
- Allergy highlight — pink (#f8d7da) background
- Compact layout with `table-layout: auto`
- KT (Kitchen Table = table 800) with gold badge, toggle cycle S1 → S2 → KT → S1
- KT tables only appear in Kitchen/Pastry prints, not in Section 1/2

### Print Column Layout by Department
**Kitchen:** Time | Pax | ★Name | Tbl | Menu | Allergy | APos | Notes
**Pastry:** Time | Pax | ★Name | Tbl | Menu | Occasion | OPos | Allergy | APos | Notes
**Salon (S1/S2):** Time | Pax | ★Name | Tbl | Menu | Occasion | OPos | Allergy | APos | Voucher Code | Voucher £ | Visits | Notes
**Reception:** Same as Salon

### Column Data Model (gatherRows output)
```
{
  time, pax, name, table, menu, occasion, occasionPos,
  allergy, allergyPos, notes, voucherCode, voucherValue,
  visits, section (S1/S2/KT/—), star
}
```

### Architecture
- Individual print functions delegate to build functions (buildKitchenHTML, buildPastryHTML, buildSalonHTML, buildReceptionHTML)
- All layout logic is in the `build` functions
- Firestore stores full row objects — backward compatible with older saves

### CSS Print Styles
- `.print-table`: `font-size:6.5pt; table-layout:auto; border-collapse:collapse`
- `.print-table th`: black bold text, `border-bottom:1.5px solid #333`, no dark background
- `.print-table td`: `border-bottom:1px solid #999`, `padding:2px 3px`
- `.allergy-cell`: `background:#f8d7da; color:#5c1a1a`
- `.occasion-cell`: `background:#ffe4c4; color:#5c1a1a`
- Both use `print-color-adjust:exact; white-space:normal`
- Grouped headers use `colspan="2"` for Occasion, Allergy, Voucher
