# Stitch Master Prompts — EWNexus Invoice Tool
# Invoice + Report Visual Templates

---

## SHARED CONTEXT (include in every prompt)

> Every template is an HTML document rendered in a browser/WebView.
> Width: 680px max (letter/A4 feel). Font: system-sans (Inter or system-ui).
> The following data blocks appear in every invoice (can be reordered by user):
>
> - **Header**: company logo + name, invoice title ("INVOICE" or "Work Order"), invoice #, date
> - **Bill To**: client name, phone, address
> - **Job Details**: optional labeled fields (e.g. VIN, property address, unit model)
> - **Line Items Table**: Description | Amount. Alternating row tint. Subtotal/Tax/Total at bottom.
> - **Payment block**: Zelle QR code image + Zelle email/phone, ACH bank info
> - **Terms & Notes**: small text block
> - **Signature**: customer signature line (optional, Pro tier)
>
> Design must be clean when printed black & white.
> All header/accent colors should accept a CSS variable `--brand` for user customization.

---

## HOW TO USE

1. Copy the **Shared Context** block above.
2. Copy any one prompt below.
3. Paste both into Stitch and generate.
4. Keep designs that look great, discard the rest.
5. Export HTML/CSS → hand off to developer.

---

---

# INVOICE TEMPLATES (20 designs)

---

## INV-01 · Ultra-Clean White
**Vibe**: Apple / Notion / Linear — minimal to the extreme
**Palette**: White `#fff`, soft gray `#f5f5f7`, dark text `#1d1d1f`, accent `--brand`
**Design**:
- No header bar. Company name large, bold, top-left. Invoice # top-right in monospace gray.
- Very generous whitespace. Only content, no boxes or frames.
- Line items: just horizontal rules, no table borders. Amounts right-aligned.
- Total: right-side, large. Bold number. Color accent dot next to the word "Total".
- Payment block: two side-by-side pill-shaped cards (Zelle | ACH), very light gray fill.
- Footer: tiny text, no decoration.
**Unique element**: A single 3px vertical color bar on the very left edge of the entire document — the only color on the page.

---

## INV-02 · Bold Full Header
**Vibe**: Construction / Trade / No-nonsense
**Palette**: Brand color fills the entire top 120px, white text. Body white.
**Design**:
- Full-width colored header: logo left, "INVOICE" large right.
- Invoice number in a white rounded badge inside the header.
- Below header: two columns — company info left, client info right. Thin divider between.
- Line items: colored header row (slightly lighter than brand), white/very-light rows alternating.
- Total: full-width accent-colored bar at bottom of table. White bold text "TOTAL: $XXX.XX".
- Payment block: simple bordered rectangle.
**Unique element**: Invoice number displayed as a large monospace "stamp" visible on the header.

---

## INV-03 · Sidebar Layout
**Vibe**: Modern creative agency, architect
**Palette**: Brand color sidebar 200px wide on left, white main area.
**Design**:
- Left sidebar (colored): company logo top, company info vertically stacked, payment QR at bottom.
- Right main: invoice # and title at top, client block, line items, totals, terms.
- Sidebar text in white, icons optional.
- Line items table: full width of right pane, minimal borders.
- Total: large number, right-aligned, accent underline.
**Unique element**: The sidebar color bleeds to the bottom of the page regardless of content length.

---

## INV-04 · Dark Premium
**Vibe**: High-end service, after-hours premium, "Uber Black" feel
**Palette**: `#0f1117` background, `#1e2130` card areas, `#c9a84c` gold accent, white text
**Design**:
- Entire document dark. Light text.
- Header: dark with gold company name + invoice number.
- Gold thin rule separates header from body.
- Client block: rounded card with slightly lighter dark fill.
- Line items: dark rows, gold header row. Monospace amounts.
- Total: gold bold amount on dark.
- Payment block: dark card with thin gold border.
**Unique element**: "INVOICE" text in large faint gold watermark behind the totals area.

---

## INV-05 · Newspaper / Editorial
**Vibe**: Old-school credibility, bold typography, newspaper
**Palette**: Black, white, and one accent color (for headings only)
**Design**:
- Masthead-style header: company name in large serif (or heavy sans) like a newspaper title.
- Thin rule below, then date + invoice # in small caps.
- Client block in a boxed sidebar on the right, invoice details in main column.
- Line items: no alternating fill. Just bold dividers. Item names in bold sans, amounts serif monospace.
- Total: boxed, centered, like a pull-quote.
- Terms: small caption-style text.
**Unique element**: Invoice number styled like a "Vol. X No. Y Issue" reference.

---

## INV-06 · Blueprint / Technical Drawing
**Vibe**: Engineer, contractor, precision work
**Palette**: White or very light gray `#f8fafc`, dark navy text `#0f2744`, blue accent `#1a6ef5`
**Design**:
- Grid dot background (very faint, like graph paper) behind the entire document.
- Header: navy rule top and bottom, company name and invoice # in monospace.
- Line items: grid-style table with clear column dividers, technical feel.
- Labels all-caps, small letter-spacing.
- Total box: thick bordered rectangle, "TOTAL DUE" in caps.
- Use small triangle/arrow markers before section labels.
**Unique element**: Title area says "PROJECT INVOICE" with a reference line that looks like a technical spec callout.

---

## INV-07 · Warm Craft / Handmade
**Vibe**: Small business, personal touch, warm and friendly
**Palette**: Warm cream `#fdf6ec`, tan `#d4a96a`, dark brown `#3d2b1f`, soft orange accent
**Design**:
- Slightly off-white warm background overall.
- Header: company name in a rounded, friendly font. Small warm badge for invoice status.
- Subtle texture hint (CSS: very faint diagonal lines or dots pattern at low opacity).
- Line items: rounded-row style, warm tinted alternating rows.
- Total: warm amber background box, brown bold text.
- Payment block: bordered with dashed line (friendly feel).
- Signature: large blank box with dotted border.
**Unique element**: A small decorative banner/ribbon at top for the company name area.

---

## INV-08 · Neon Night
**Vibe**: After-hours service, electric energy, Vegas/nightlife
**Palette**: `#0d0d1a` deep navy-black, neon cyan `#00f5ff` or neon pink `#ff2d78`, white text
**Design**:
- Dark background. Neon glow effects (CSS box-shadow with neon color on key elements).
- Header: company name with subtle neon text-shadow. Invoice # in neon monospace.
- Thin neon line separates header from body.
- Line items: very dark rows. Neon underlines on totals.
- Total: neon-glowing bordered box.
- Payment block: neon icon placeholders for Zelle/ACH.
**Unique element**: A thin horizontal neon gradient rule separating every major section.

---

## INV-09 · Sports / High Energy
**Vibe**: Energetic, bold diagonal elements, like a sports jersey or team graphic
**Palette**: Team-feel — try navy `#003087` + gold `#ffd700`, or red + black
**Design**:
- Header: diagonal slash divides the header into brand color left, darker shade right.
- Company name large in white on the left half. Invoice # right half.
- Large number in background at low opacity (jersey number style).
- Line items: striped rows (team colors).
- Total: bold "FINAL SCORE" style block at bottom.
**Unique element**: A diagonal divider element that cuts across the header corner.

---

## INV-10 · Gradient Mesh
**Vibe**: Modern SaaS, tech startup, 2025 design trend
**Palette**: Soft gradient mesh — brand color + purple + cyan blended in header
**Design**:
- Header: soft CSS gradient mesh (brand color to adjacent hue). White text.
- Body: pure white, very clean.
- Line items: thin horizontal dividers only, no fill. Pill-shaped total box.
- Total: floating card with subtle drop shadow, brand-colored accent strip on left.
- Payment block: two white cards side-by-side with soft shadow.
**Unique element**: The gradient mesh header bleeds slightly into the body with a soft fade (gradient-to-white).

---

## INV-11 · Texas Lone Star
**Vibe**: Texas pride, patriotic American Southwest, blue-collar Texas
**Palette**: Texas blue `#002868`, Texas red `#BF0A30`, burnt orange `#BF5700`, white
**Design**:
- Header: navy blue. Texas state flag vertical stripe on left (red third, white star, blue two-thirds).
- Company name and invoice # in white on blue area.
- A single bold burnt-orange rule below the header.
- Body: white with navy accents.
- Line items: navy header row, white/very-light-blue alternating rows.
- Total: burnt orange background box.
- Payment: clean bordered area, Lone Star icon watermark at 5% opacity in background.
**Unique element**: A white 5-pointed star (★) used as a bullet/decoration next to section headers.

---

## INV-12 · American Flag
**Vibe**: Patriotic, Fourth of July, red-white-and-blue American contractor
**Palette**: US red `#B22234`, US blue `#3C3B6E`, white, cream
**Design**:
- Header: horizontal stripes — alternating red/white thin bands at top (3-4 stripes), then full navy band with company name + invoice # in white.
- Star field: small star pattern (CSS) in corner at very low opacity.
- Body: clean white. Section headers in navy or red.
- Line items: alternating white/very-light-red rows.
- Total: navy background, white text.
- Signature area labeled "Customer Approval" with a small US flag icon.
**Unique element**: The page has a thin red-white-blue border frame around the entire document.

---

## INV-13 · Forest / Outdoors
**Vibe**: Landscaping, tree service, outdoor work, earthy organic
**Palette**: Forest green `#1B5E20`, mid green `#2E7D32`, light mint `#F1F8E9`, earthy tan
**Design**:
- Header: deep forest green. Subtle leaf/branch silhouette at very low opacity in background.
- Logo area: circle crop with white background, green border.
- Body: mint white. Clean and fresh.
- Line items: alternating mint/white rows. Green header.
- Total: forest green box.
- Payment block: rounded card with green left border.
- Signature: dashed-border area.
**Unique element**: A small fern or leaf SVG icon (simple, 2-3 path) decorates section dividers.

---

## INV-14 · Plumbing Blue
**Vibe**: Clean water, reliable, blue-collar professional plumber
**Palette**: Navy `#0d3461`, blue `#1565C0`, light blue `#E3F2FD`, white
**Design**:
- Header: navy with subtle pipe/drop silhouette in background (very faint white).
- Water drop (💧) motif used as accent bullet near company name.
- Body: clean white with light-blue accents.
- Line items: light blue header row, alternating white/very-light-blue.
- Total: navy box.
- At bottom: a thin wave-like CSS border-bottom decoration before the payment section.
**Unique element**: Water droplet icon (✦ or CSS circle drop shape) next to section labels.

---

## INV-15 · HVAC Ice
**Vibe**: Climate control, precise, cool efficiency, technical service
**Palette**: Deep navy `#0a1929`, ice blue `#4FC3F7`, frost white `#E1F5FE`, silver
**Design**:
- Header: dark navy. Large snowflake (❄) watermark at 8% opacity behind invoice # area.
- Ice blue gradient line separates header from body.
- Body: white with very subtle cool-toned tint.
- Line items: alternating frost-white/white rows, ice blue header.
- Totals: cool blue right-side box.
- Service fields area: shows model number, serial number fields prominently.
- Payment: bordered card.
**Unique element**: "HVAC SERVICE INVOICE" label uses thin letter spacing in all-caps ice blue.

---

## INV-16 · Electrical Amber
**Vibe**: Power, intensity, certified electrical contractor
**Palette**: Black `#1a1a1a`, amber `#FFC107`, warm white `#FFF8E1`, dark gray
**Design**:
- Header: jet black. Single amber horizontal rule below.
- Lightning bolt (⚡) watermark in header at 10% opacity.
- Company name in white, invoice # in amber monospace.
- Body: white.
- Line items: black header row in amber text. Alternating warm-white/white rows.
- Total: amber box with black bold amount.
- "License #" and "Permit #" labeled fields shown prominently at top (trade requirement).
**Unique element**: Hazard-stripe corner decoration (diagonal black/amber) on one corner of the header.

---

## INV-17 · Auto Repair Garage
**Vibe**: Automotive, mechanical precision, industrial
**Palette**: Charcoal `#212121`, steel blue `#455A64`, red `#EF5350`, light gray `#ECEFF1`
**Design**:
- Header: dark charcoal. Gear (⚙) silhouette watermark at 6% opacity.
- Red accent line at the very top (like a racing stripe).
- Company name in white. Invoice # in steel gray monospace.
- Body: light gray/white alternating.
- Line items: steel blue header row. Includes columns for Labor Hours and Parts if available.
- Vehicle info block: Year / Make / Model / Mileage In / Mileage Out — prominent at top.
- Total: charcoal box with red accent.
**Unique element**: "RO #" (Repair Order number) field styled like a classic auto shop job ticket.

---

## INV-18 · Roofing Brick
**Vibe**: Solid, reliable, built to last — roofing contractor
**Palette**: Brick red `#4E342E`, terracotta `#FF7043`, cream `#FBE9E7`, warm white
**Design**:
- Header: brick red-brown. Subtle roof/triangle silhouette in background.
- A faint brick pattern (CSS repeating-linear-gradient) at 4% opacity behind header.
- Company name in white, invoice # in terracotta.
- Body: warm white/cream.
- Line items: terracotta header row, alternating cream/white rows.
- Includes: square footage, material type, warranty field near header.
- Total: brick-colored box.
**Unique element**: Triangle/roof gable shape as a decorative divider between sections.

---

## INV-19 · Sunset Gradient
**Vibe**: Warm, energetic, modern — works for any trade
**Palette**: Amber `#F57F17`, orange `#E65100`, golden yellow `#F9A825`, white
**Design**:
- Header: CSS linear-gradient from amber to deep orange (135deg). White text.
- Soft warm glow (box-shadow) on header.
- Gradient carries over as a thin 4px stripe below header, fading from orange to transparent.
- Body: pure white with warm-tinted section labels.
- Line items: orange header row, alternating very-light-amber/white rows.
- Total: deep orange bold amount right-aligned, underlined.
- Payment: two cards side-by-side, rounded corners, warm shadow.
**Unique element**: Sun flare decorative element (CSS radial gradient glow) in top-right of header.

---

## INV-20 · Minimal Monochrome
**Vibe**: Timeless, letterpress, sophisticated
**Palette**: Pure black `#000`, white `#fff`, single accent color optional
**Design**:
- Header: thick black bottom border only — no fill. Company name large left, invoice details right.
- No background colors anywhere except one accent line.
- Line items: thin black borders, no fill. Very clean table.
- Totals: right-side alignment, bold, separated by double rule.
- Everything achieves hierarchy through SIZE and WEIGHT only, not color.
- Terms: small italic.
**Unique element**: Company name printed large as a "stamp" in 1px border stroke only (outline text).

---

---

# INVOICE TEMPLATES — BATCH 2 (from real-world design research)

> These 14 designs are based on analysis of real invoice templates from Dribbble, InvoiceBus,
> DesignShack, and trade-specific invoice sites. Use as Stitch prompts same way as Batch 1.

---

## INV-21 · Geometric Corner Accent
**Vibe**: Creative agency meets contractor — bold but uncluttered
**Palette**: White background, brand color geometric shapes in corners, dark text
**Design**:
- Rotated rectangles (20deg) in top-left and bottom-right corners — top-left full opacity, bottom-right 30% opacity.
- Content area is pure white, wide open.
- Company info and invoice # in a clean two-column header row.
- Line items: standard clean table, brand color header row.
- Total: right-aligned large amount, colored underline only.
**Unique element**: Two overlapping rotated rectangles in corners — only decorative color on the page.

---

## INV-22 · Diagonal Slash Header
**Vibe**: Energetic, bold, design-forward — premium print feel
**Palette**: Brand color left wedge, white right, dark text on white side
**Design**:
- Header: CSS clip-path diagonal cut. Left 50% filled with brand color (company info, white text). Right 50% white (invoice number, large dark text).
- The diagonal line cuts from top-right of color area to bottom-left at 45deg.
- Body: standard white layout below.
- Line items: clean minimal table.
- Total: colored accent box, right-aligned.
**Unique element**: The diagonal cut is the entire design statement — nothing else needs to be dramatic.

---

## INV-23 · Brutalist / High Contrast
**Vibe**: Unforgettable — industrial, electric, welding shop, underground credibility
**Palette**: Pure black `#000`, pure white `#fff`, single accent (red `#D32F2F` or amber `#FFC107`)
**Design**:
- Outer border: 3px solid black framing entire document.
- Header: full black fill, white company name in monospace uppercase. Invoice # right, white monospace.
- Single accent-color 4px horizontal rule below header.
- Line items table: black header row (white text), black borders between rows, monospace throughout.
- Totals block: section bg `#f2f2f2`. Final total: accent color full-width fill, white bold.
- No softness, no gradients, no rounded corners.
**Unique element**: Every font is monospace. Entire document reads like a typewriter output.

---

## INV-24 · Receipt / Thermal Paper
**Vibe**: Auto repair shop ticket, old-school trade authenticity, immediate trust
**Palette**: Cream/off-white `#f9f7f5`, near-black, optional single red or blue accent
**Design**:
- Narrow format (480px, centered). Monospace font throughout.
- Centered company name at top, dashed border below.
- Line items: dashed rules between rows, two columns (Description | Amount).
- Section separators: `- - - - - - - - - - - - -` style dashed rules.
- Total: centered, large, surrounded by dashed box.
- Footer: centered text with row of asterisks `* * * * * *` as decoration.
**Unique element**: The entire invoice reads like it was printed on a receipt printer — authentic, immediate, familiar.

---

## INV-25 · Bold Color Blocks (Sectioned)
**Vibe**: Modern SaaS / product company invoice — structured, confident
**Palette**: Header = brand color. Client block = light gray. Items = white. Total block = dark brand.
**Design**:
- No border lines — section background color changes ARE the visual dividers.
- Header block: brand color, white text.
- Client "Bill To" block: light gray fill `#f5f5f5`.
- Line items block: white.
- Total block: darkened brand color (mix with black 20%), white bold total.
- Payment block: very light tint.
**Unique element**: Remove ALL borders and rules. Color blocks alone create document structure.

---

## INV-26 · Watercolor Wash Header
**Vibe**: Premium personal service — high-end home renovation, luxury cleaning, wedding/event
**Palette**: Soft brand-color radial gradient wash bleeding into white, earth/pastel tones
**Design**:
- Header area: CSS radial-gradient — brand color (30% opacity max) at top, fully transparent by 30% down the page. No hard edges anywhere.
- Company name in a refined light-weight sans (300 weight). Logo floats in the wash.
- Below the wash: pure white. Extremely clean.
- Line items: thin horizontal rules only, no fills.
- Total: soft colored pill shape (rounded, lightly tinted).
- Payment: light card with very soft shadow.
**Unique element**: There is no defined "header box" — the color just washes out of the top naturally.

---

## INV-27 · Graph Paper / Dashed Grid
**Vibe**: Surveyor, engineering inspector, technical precision trades
**Palette**: White/light gray with grid dot pattern, navy text, orange or yellow accent
**Design**:
- Full document background: CSS `radial-gradient` dot pattern (3% opacity dots on white).
- Company section: sits inside a dashed-border box.
- Every major section in its own dashed-border container.
- Line items: dashed column dividers instead of solid.
- Total: double-lined dashed box, larger text.
- Section labels all-caps, small letter-spacing, like field survey notation.
**Unique element**: The dashed grid creates an "engineering field notes" feel across the entire doc.

---

## INV-28 · Large Watermark Number
**Vibe**: Confident and minimal — Stripe-adjacent, works for any premium trade
**Palette**: White background, brand color small accents, giant faded invoice number
**Design**:
- Center of document: invoice number `#0042` printed at ~200px font size, 4% opacity — fills the entire page as wallpaper.
- Normal layout sits on top: company info top-left, invoice details top-right.
- Line items: clean table, no fills.
- Total: right-aligned, brand color amount only.
- Footer: small text.
**Unique element**: The invoice NUMBER itself becomes the decorative element — large, soft, ever-present.

---

## INV-29 · Pastel Soft / Friendly
**Vibe**: Home cleaning, pet grooming, childcare, personal services — approachable and warm
**Palette**: Pastel lavender `#E8E4F5` or peach `#FFE8D6` header, white body, soft shadow accents
**Design**:
- All corners: 16px+ border-radius. Everything round and soft.
- Header: pastel fill, brand-color company name, soft drop shadow.
- Section labels: small pill badges in pastel fill.
- Line items: rounded rows, alternating pastel/white.
- Total: pastel-filled rounded box, deeper accent for the number.
- Signature area: dashed border, friendly "Your Signature:" label.
**Unique element**: Every element feels "huggable" — rounded, soft, approachable. No sharp edges anywhere.

---

## INV-30 · Industrial Stamp
**Vibe**: Classic American trade shop — plumbing, electrical, auto, roofing, old-school credibility
**Palette**: Aged cream/warm white `#F5F0E8`, dark navy or black, rust red `#B94030`
**Design**:
- Large "WORK ORDER" or "JOB TICKET" text at top — styled like a rubber stamp (slightly distressed, monospace or stencil font).
- Invoice number in a red rectangle badge, positioned like a priority sticker.
- Sections in bordered boxes with typewriter-style labels.
- Line items: old receipt style, monospace amounts.
- Footer: large circular stamp outline with company name curving around inside it.
**Unique element**: The rubber stamp circle in the footer — company name + established year, like a professional seal.

---

## INV-31 · Gradient Corner Glow
**Vibe**: Modern smart-home installer, premium HVAC, tech-forward trade services
**Palette**: White background, brand color radial glow from top-right corner only
**Design**:
- CSS radial-gradient from top-right corner: brand color at 25% opacity → fully transparent by 35% into the document.
- The glow creates atmosphere without a defined header.
- Company name and invoice # float in the glow area.
- A thin gradient line (brand to transparent) separates the soft header from the body.
- Body: pure white, light typography.
- Total: small colored dot or accent line next to large amount.
**Unique element**: There's no "header" — just a soft glow that establishes the brand area.

---

## INV-32 · Split Page (Full-Height Sidebar)
**Vibe**: Architecture firm, premium contractor, bold brand identity
**Palette**: Left 35% = brand color full-height. Right 65% = white content.
**Design**:
- Left column (brand color, full page height): company logo top, company name vertical, Zelle QR in center, phone/email stacked. All white text.
- Right column: client block, line items, totals, payment, signature. Clean white.
- Left column bleeds to page bottom regardless of content length.
- The visual weight of the colored sidebar makes even a short invoice look substantial.
**Unique element**: Left sidebar carries ALL company info + QR. Right is purely for this invoice's content.

---

## INV-33 · Dual Theme — Dark Mode
**Vibe**: Premium after-hours service, sophisticated, "dark mode" desktop feel
**Palette**: `#111827` deep blue-gray, brand color as accent, light gray text `#d1d5db`
**Design**:
- Same layout as a light template — but dark background throughout.
- Company name in white, invoice # in brand color.
- Line items: `#1f2937` alternating rows on `#111827`.
- Total: brand color large amount, white label.
- Payment block: `#1f2937` card, brand-colored icon/label accents.
- Status badge: PAID glows in green, UNPAID glows in red.
**Unique element**: The status badge has a CSS glow (box-shadow) effect — the only decorative touch in an otherwise minimal layout.

---

## INV-34 · Botanical / Organic
**Vibe**: Landscaping, organic pest control, garden service, farm-to-table catering
**Palette**: Sage green `#87A878`, cream `#FAF7F2`, warm white, earth brown accents
**Design**:
- Background: very faint botanical line-art (fern fronds, thin leaf branches) as CSS pattern or SVG path at 5% opacity.
- Section dividers: thin "hand-drawn" style rule (slightly wavy CSS border).
- Company name in a slightly organic font (or just a light serif).
- Line items: alternating cream/white, no strong borders — just light rules.
- Total: sage green rounded box.
- Footer: a row of small leaf glyphs `✦ ✦ ✦` as decoration.
**Unique element**: The faint botanical watermark background that makes the document feel rooted in nature.

---

---

# REPORT TEMPLATES (Job Completion Report / Site Report)

> **Shared with Invoice templates**: YES — use the same header/color system.
> The header (company name, colors, logo placement) should visually match the invoice.
> Content is different: photos, work description, before/after, customer sign-off.

---

## Report data blocks (always present):
- Header: same as invoice (company logo, name, date, report #)
- Job address / site location
- Work performed description (rich text, multi-paragraph)
- Before & After photos (2-4 images, captioned)
- Materials used (optional list)
- Technician name + signature
- Customer signature + printed name + date
- Notes / warranty info

---

## RPT-01 · Clean Report (matches INV-01 Ultra-Clean)
- Minimal white. Section headers in small caps with a colored rule.
- Photo grid: 2 per row, rounded corners, caption below each.
- Work description: generous line-height, clean typography.
- Sign-off section: two equal columns — Tech left, Customer right. Dashed signature line.
- Footer: report # + page number.

---

## RPT-02 · Field Report (matches INV-06 Blueprint)
- Technical/engineer feel. Grid-dot background very faint.
- Header: navy, monospace reference numbers.
- Sections labeled with callout arrows, like a technical diagram.
- Photos in bordered boxes with label + dimensions/caption below.
- Materials table: item name | quantity | unit | notes.
- Sign-off: formal — "I certify the above work was completed to satisfaction" legal-style.
- Page number in corner: "Page 1 of 1 — Report #XXXX".

---

## RPT-03 · Trade Work Order Report (matches INV-02 Bold Header)
- Full-width colored header matching the invoice.
- Body split: left 60% for work description + photos, right 40% for summary checklist.
- Checklist style: ☑ items with labels (e.g. "Area cleaned up", "System tested", "Materials disposed").
- Before/After side-by-side: large images, 50/50 split with a center divider "→".
- Bottom: wide signature box spanning full width. Two fields: Customer + Tech.

---

## RPT-04 · Photo-First Report
- Design that puts photos as heroes — 2 large images (Before/After) prominently at the top.
- Below photos: work description in card with a light shadow.
- Materials section: simple pill-tag list instead of table.
- Sign-off cards: each in a rounded bordered card.
- Color accent only on headers and sign-off buttons.

---

## RPT-05 · Minimal Sign-Off Report (matches INV-20 Monochrome)
- Just the facts. Work description. Date. Who did what.
- Large signature boxes — dominant element.
- No photos section (or optional collapsed).
- Looks like a legal acknowledgment form.
- Customer sees clear "I agree the job is complete" language.

---

---

# STITCH USAGE TIPS

1. **One template per Stitch session** — don't request all at once.
2. Start prompt with: "Design a printable HTML invoice, 680px wide, no interactivity."
3. Paste the Shared Context block + one template spec.
4. Ask for: "Output only HTML and inline CSS. No JavaScript."
5. If the result has placeholder images, note where `[LOGO_URL]` and `[QR_IMAGE]` go.
6. Ask for a second variation: "Make the header 20% more dramatic."
7. Good outputs: clean table structure, readable in B&W, minimal use of emoji icons.

---

*Last updated: 2026-08-31 — 20 Invoice + 5 Report designs*
