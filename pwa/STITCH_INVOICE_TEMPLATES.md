# Stitch Prompt — Invoice PDF Templates
# EWNexus Invoice Tool

Design **8 printable invoice layouts** for independent tradespeople (plumbers, mechanics,
HVAC techs, handymen). These are PDF/print documents — NOT app screens.
Rendered as A4 / Letter HTML, printed from the browser.

**Primary constraint**: Each template must work well both printed in black & white
AND viewed on screen with a brand color applied. The brand color is user-configurable
(stored separately), so every template must be designed with a color variable in mind —
labeled `[BRAND_COLOR]` in specs below. Default preview color: `#004ac6`.

---

## Blocks present on every invoice (in default order, user can reorder)

1. **Header** — Invoice title, number, date, due date, status badge (PAID/UNPAID/ESTIMATE)
2. **Company block** — Logo (or icon placeholder), company name, phone, email, address
3. **Client block** — "Bill To:" client name, phone, address
4. **Asset/Job details block** — Optional labeled fields (e.g. VIN, address, pet name).
   Appears only when filled. Light tinted box.
5. **Line items table** — Description column + Amount column. Rows alternate slight tint.
6. **Totals block** — Subtotal, Discount (if any), Tax, **Total** (visually dominant)
7. **Payment methods block** — "How to Pay" section with Zelle QR + ACH info
8. **Terms & Notes** — Small text, below a divider
9. **Signature line** — Optional printed name / signature line at bottom

---

## 8 Template Designs

### 1. Modern Blue (default)
- White background, [BRAND_COLOR] header bar full-width at top
- Company name + logo left, invoice title right in header bar (white text on color)
- Client block: left-aligned card with thin left border in [BRAND_COLOR]
- Line items: alternating white / very light blue rows
- Total: right-aligned box with [BRAND_COLOR] background, white text
- Payment block: light gray tinted box, Zelle QR on left, ACH text on right
- Clean, minimal, professional. Think Stripe invoices.

### 2. Classic Black
- Black header bar, white text. No color dependency — works pure B&W.
- Company name bold left, invoice # right
- Double rule line below header (1px + 3px)
- Client block: indented box with thin black left border
- Line items table: black header row (white text), thin horizontal rules between rows
- Total: bold, right-aligned, underlined with double rule
- Payment block: bordered box, no fill
- Serif-adjacent feel — formal, traditional

### 3. Bold Contractor
- Dark charcoal (`#1a1a2e`) header — full bleed
- Large company name, construction-style font weight (very bold)
- Invoice number displayed large in a colored badge in header
- Line items: no alternating fill, just strong dividers. Bold item names.
- Total: full-width colored bar with TOTAL amount in large white text
- Payment block: dark background section with white text, QR code inverted or on white card
- Masculine, high-contrast. Good for roofers, contractors, auto shops.

### 4. Minimal Clean
- No colored header — just the company name in large bold text at top left
- "INVOICE" as a small gray label above the number
- All content in a single left-aligned column with generous whitespace
- Line items: no borders, just horizontal rules. Very light gray alternating fill.
- Totals: right-aligned, the word "Total" in small gray caps above the number
- Payment block: very subtle tinted box, minimal labels
- Terms: italic, small, gray
- Feels like an Apple receipt or Notion export

### 5. Split Header
- Left half header: [BRAND_COLOR] fill with company name/logo in white
- Right half header: white with "INVOICE" + number + date in dark text
- Two-column layout continues into client info (company details left, bill-to right)
- Line items: standard table spanning full width below
- Total: right-side callout box
- Payment block: two columns — Zelle left, ACH right
- Dynamic, modern, good for premium service businesses

### 6. Warm Handyman
- Off-white / cream background (`#faf7f2`)
- Amber/brown accent (`#92400e` suggested, but [BRAND_COLOR] applies)
- Header: no bar — just company name in large serif-style weight, accent color
- Dividers: warm tan `#d4b896`
- Line items: no heavy borders, subtle row tints in cream
- Total box: warm amber-tinted background
- Payment block: hand-drawn style border (rounded, dashed)
- Terms in warm gray italic
- Earthy, approachable. Good for handymen, landscapers, pet groomers.

### 7. Navy Professional
- Deep navy (`#0f172a`) and white with gold accent (`#d4a017`) as secondary
- Header: navy with company name left, invoice details right
- Thin gold rule below header
- Line items: navy header row, alternating very light navy tint on rows
- Total: navy box with gold Total text
- Payment block: navy-bordered card, subtle background
- Footer: gold rule, company tagline area
- Premium, law-firm-like. Good for high-end contractors, fleet services.

### 8. Vibrant Color-First
- The [BRAND_COLOR] is applied aggressively — large colored sidebar on left
- Sidebar contains: logo, company name (white), contact info (white)
- Main content area: white, standard line items
- Invoice number displayed as a large watermark-style number behind the header
- Total: colored pill/badge on the right
- Payment block: colored header row ("How to Pay" in white on [BRAND_COLOR] background)
- Most "branded" template — shows the company's color identity strongly

---

## What to design per template

For each template, produce:
- **Full invoice mockup** at A4 proportions (210mm × 297mm or 794px × 1123px)
- Filled with realistic sample data:
  - Company: "Martinez HVAC & Plumbing" | Phone: (714) 555-0182 | Logo placeholder
  - Client: "Sarah Johnson" | Address: "4821 Oak Street, Austin TX 78701"
  - Asset detail: "AC Unit: Carrier 5-ton, Serial: 4X7B2901"
  - 3 line items: "AC Coil Cleaning — $120", "Refrigerant Recharge — $85", "Filter Replacement × 3 — $45"
  - Tax 8.25%, Total: $270.27
  - Zelle QR placeholder, ACH: Chase | Routing: 021000021 | Acct: ••••4892
  - Terms: "Payment due within 7 days. Thank you for your business."

## Technical notes (for implementation)

- Fonts available: Inter (default), system-serif fallback
- All layouts must be self-contained HTML/CSS — no external CDN at print time
- Brand color injected via inline `style` attributes (Tailwind classes not reliable in print)
- Images (logo, Zelle QR) loaded from PocketBase file API URLs
- `@media print` must hide all app chrome — only `#print-area` visible
- Max width: `210mm` (A4), centered on screen for preview
- Padding: `12mm` sides, `16mm` top/bottom for print-friendly margins
