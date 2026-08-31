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

# INVOICE TEMPLATES — BATCH 3 (new styles, 10 designs)

> Fresh directions not covered in Batch 1 or 2. Targets: photography, food service, luxury,
> timeline-based, handwritten, and more creative/distinctive aesthetics.

---

## INV-35 · Photography Studio
**Vibe**: Creative professional, photo-forward, modern studio
**Palette**: Near-black `#161616`, warm off-white `#FAF9F6`, accent gold `#C9A84C` or brand
**Design**:
- Header: full-width near-black. Company name in elegant thin-weight sans (200 weight), white.
- Below header: a thin horizontal film-strip decoration (5 small squares in a row, partially filled).
- Body: off-white warm background throughout.
- Line items: borderless rows, items in italic describe the shoot/session. Amounts right-aligned in monospace.
- Section labels in small all-caps with generous letter-spacing.
- Total: gold-colored large amount, subtle rule above.
- Payment block: thin bordered card, minimal.
**Unique element**: Film strip / frame strip accent is the only graphic decoration — simple, elegant, on-brand.

---

## INV-36 · Restaurant / Food Service
**Vibe**: Premium dining, catering, food truck, restaurant supply
**Palette**: Deep burgundy `#5C1E1E`, cream `#FFF8F0`, warm gold `#D4A853`, charcoal text
**Design**:
- Header: deep burgundy. Company name in an elegant serif or script-adjacent sans. Logo circle-cropped.
- Decorative thin gold horizontal rule below header.
- Body: cream/warm-white. Section headers in burgundy small-caps.
- Line items: description includes item count + unit. Price right-aligned.
- Subtotal area: bordered soft-cream box.
- Total: gold bold amount on burgundy strip.
- "Thank you for your business" in italic at bottom.
**Unique element**: Gold thin rules as section dividers — gives the feel of a fine dining menu layout.

---

## INV-37 · Real Estate / Property
**Vibe**: Professional real estate agent, property management, high-end renovation
**Palette**: Charcoal `#2C2C2C`, slate gray `#607D8B`, white, light gray `#ECEFF1`
**Design**:
- Header: white background with bold charcoal company name (left) and a property address block (right).
- A dedicated "Property Address" field prominently styled near the top — different from "Bill To".
- Line items: scope of work per property item. Clean, minimal table.
- Service type badges: small pill labels (e.g. "REPAIR", "INSPECTION", "MAINTENANCE") before item names.
- Total: large charcoal bold, right-side.
- Footer: agent license # field displayed subtly.
**Unique element**: Dual address display — "Bill To" (owner) and "Property Address" (job site) in two clear columns.

---

## INV-38 · Gold Foil Luxury
**Vibe**: Ultra-premium service — high-end cleaning, executive detailing, luxury home service
**Palette**: Black `#0A0A0A`, gold `#B8953F`, warm white `#FAFAF8`, subtle warm gray
**Design**:
- Entire document: dark luxury. Body background `#0d0d0d`.
- Header: company name in thin-weight uppercase, gold text. Very large vertical spacing.
- Thin gold rule top and bottom of header area.
- Body: `#141414` card containers for each section, gold border-left accents.
- Line items: dark table, gold header row text. Monospace amounts.
- Total: large gold amount on black. "AMOUNT DUE" in gold small-caps.
- Signature: gold-outlined box.
**Unique element**: The entire dark document feels like a luxury product box — the gold type is the only light source.

---

## INV-39 · Retro 70s / Vintage
**Vibe**: Retro-trendy brand, funky craft service, organic market, vintage restoration
**Palette**: Mustard `#D4A017`, burnt orange `#C4500A`, cream `#F7F0E3`, warm brown `#3B2A1A`
**Design**:
- Header: mustard fill. Large serif or display-style company name. Groovy dividing element.
- Section dividers: bold wavy line (CSS SVG wave path) in burnt orange.
- Line items: slightly distressed table borders (dashed/dotted combination).
- Labels in a retro slab-serif style.
- Total: burnt orange rounded rectangle, cream text.
- Footer: vintage-feel "EST. YEAR" line with circular badge.
**Unique element**: Wavy divider lines instead of straight rules — the entire document has a soft organic movement.

---

## INV-40 · Timeline / Progress Invoice
**Vibe**: Multi-phase project, remodeling, staged construction, IT implementation
**Palette**: White, teal `#00796B`, light teal `#E0F2F1`, dark gray text
**Design**:
- After the line items table, there is a vertical timeline section showing project phases.
- Timeline: vertical line in teal, milestone dots (●) at each phase. Completed = filled, upcoming = outline.
- Phase labels: "Phase 1 — Demolition ✓", "Phase 2 — Framing ✓", "Phase 3 — Finishing ..." etc.
- This invoice covers only the current phase — highlighted in bold on the timeline.
- Line items: standard for the current phase only.
- Total: "THIS INVOICE" amount, plus a subtotal for "Total Contract Value" context.
**Unique element**: The project timeline section transforms the invoice into a project status update — clients see the big picture.

---

## INV-41 · Handwritten Style
**Vibe**: Personalized craft service, small local business, artisan feel
**Palette**: Lined cream `#FFFEF5`, pen-blue `#2B3A67` or dark navy text, red accents for totals
**Design**:
- Background: very faint horizontal ruled lines (like notebook paper) at 2% opacity.
- Company name in a rounded, slightly casual font (not a script, but not corporate).
- Section borders: hand-drawn-style (slightly imperfect CSS box, or a background SVG squiggle).
- Line items: two-column lined format. Amounts slightly right-shifted.
- Total circled with a pen-drawn circle (CSS: border-radius + slight rotation skew).
- Signature area: genuine lined paper boxes.
**Unique element**: The lined paper background + circular total creates the unmistakable feel of a personal handwritten bill — endearing and memorable.

---

## INV-42 · Map / Job Site
**Vibe**: Field service with multiple locations, delivery, HVAC route, landscaping fleet
**Palette**: White, map-blue `#4285F4`, soft gray `#E8EAED`, dark text
**Design**:
- Below the client "Bill To" block, a small map area (placeholder for embed or static image) showing the job site.
- A map pin icon (●) and address label beneath the map tile.
- Line items follow below with standard table layout.
- Job address field prominent and styled like a location card.
- Total: map-blue accent, right-aligned.
- "Service Radius" or "Job Location" field shown with a distance/address note.
**Unique element**: The map/location pin section makes the invoice feel like a GPS dispatch record — reassuring for clients.

---

## INV-43 · Swiss Typographic
**Vibe**: Design studio, branding agency, tech consultancy, ultra-modern
**Palette**: Pure white, black, and exactly ONE accent color (strict Swiss design rules)
**Design**:
- No decorative elements whatsoever. Only typography.
- Company name: Helvetica or system-sans, 48px bold, black, top-left.
- "Invoice" word: same size as company name but in the accent color, top-right.
- Grid: strict 12-column invisible grid controls all element alignment.
- Line items: no table borders. Only column alignment creates the table structure.
- Total: extreme right alignment, large, single accent color for the number.
- Terms: footnote-style tiny text.
**Unique element**: No borders, no fills, no rules, no icons. Pure typographic hierarchy does ALL the work — radical restraint.

---

## INV-44 · Neon Cyberpunk
**Vibe**: Tech repair shop, gaming setup service, DJ/AV, after-hours tech support
**Palette**: Black `#000000`, neon green `#00FF41` or cyan `#00FFFF`, dark gray `#1A1A1A`
**Design**:
- Full black document. Terminal/code aesthetic.
- Company name: monospace, neon green, slightly glowing (text-shadow).
- "INVOICE" styled like a system command: `> INVOICE_2042.EXE`
- Line items: monospace throughout. Items look like command-line output.
- ASCII-style borders: `+---+---+` style table using monospace characters.
- Total: neon green on black, extra glow.
- Footer: scrolling terminal-style line of gibberish characters at 10% opacity.
**Unique element**: The entire invoice reads like a terminal printout — authentically cyberpunk, deeply memorable for tech clients.

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

# REPORT TEMPLATES — BATCH 2 (15 new designs, RPT-06 to RPT-20)

> Expanded report formats covering photo-heavy, certificate, timeline, trade-specific,
> and mobile-first layouts. All reports share the same header system as invoices.

---

## RPT-06 · Photo Grid Report
**Vibe**: Visual proof — electrician, plumber, HVAC, pest control showing completed work
**Design**:
- Header: same as matching invoice template.
- After the work description block, a 2×3 or 3×2 photo grid.
- Each photo cell: rounded corner, caption below (e.g. "Before — Main Breaker Panel").
- Photos labeled by the technician (auto-numbered 1–6).
- Materials list: pill tags (e.g. "PVC 3/4\"", "Capacitor 45/5 MFD") after photos.
- Sign-off at bottom: tech + customer side by side.
**Unique element**: The photo grid is the hero — multiple photos feel like a professional documentation package, not just a note.

---

## RPT-07 · Before / After Hero Report
**Vibe**: Transformation-focused — renovations, cleaning, painting, landscaping
**Design**:
- Large "BEFORE" and "AFTER" labels over two full-width stacked (or side-by-side) photos.
- A bold arrow or "→" between them if side-by-side, or a heavy divider if stacked.
- Work description below the photo pair.
- Customer testimonial quote block (optional): dashed border, italic text.
- Sign-off: two-column, Tech left / Customer right.
**Unique element**: The before/after pairing IS the report — the visual contrast tells the whole story at a glance.

---

## RPT-08 · Timeline Progress Report
**Vibe**: Multi-day job, renovation, remodel, system installation
**Design**:
- After the header, a horizontal (or vertical) timeline of work phases.
- Each phase has a date, label, and a status indicator (✓ done / ● in progress / ○ upcoming).
- Current phase highlighted with brand color.
- Work description: what was done TODAY within the broader project.
- Parts/materials table for this visit.
- Sign-off: compact, bottom of page.
**Unique element**: Client instantly sees where today's work sits in the overall project — reduces "are you done yet?" calls.

---

## RPT-09 · Certificate of Completion
**Vibe**: Official, formal, proud — given to customer as a "keep" document
**Design**:
- Decorative outer border (double line frame, or classic certificate border pattern).
- Center: large "CERTIFICATE OF COMPLETION" heading in a display/serif font.
- Company seal / stamp circle (company name curved around, established year).
- Body: "This certifies that [work type] has been completed at [address] on [date]."
- Warranty line: "Materials and labor warranted for X days."
- Two signature blocks: Authorized Technician (left) and Customer Acceptance (right).
- Company logo prominently centered above the text.
**Unique element**: Looks like an achievement certificate — customers proudly keep these; great for social sharing.

---

## RPT-10 · Checklist-First Report
**Vibe**: Systematic, methodical — HVAC service, pest control, inspection-based work
**Design**:
- After the header: a prominent checklist section BEFORE the work description.
- Checklist items: ☑ checked items in brand color, ☐ unchecked items in gray.
- Categories: "Inspected", "Cleaned", "Replaced", "Tested", "Recommended for next visit".
- Work description: appears after checklist as a narrative.
- Photo section: 1-2 photos with captions.
- Sign-off at bottom.
**Unique element**: Customers read the checklist first — they see everything done immediately without reading paragraphs.

---

## RPT-11 · HVAC Technical Sheet
**Vibe**: Precision HVAC service record — refrigerant, system specs, test readings
**Design**:
- Header: ice blue / dark navy (matches HVAC invoice style).
- Technical data block near the top: Equipment Model | Serial # | Refrigerant Type | System Age.
- Test readings table: Suction PSI | Discharge PSI | Delta T | Amp Draw — filled in like a form.
- Work performed: narrative below the technical block.
- Recommended services (if any): orange-labeled "ACTION REQUIRED" items.
- Photos: 2 photos with labels ("Unit Before Cleaning" / "Coil After Cleaning").
- Sign-off + next service date field.
**Unique element**: The technical readings section looks like a doctor's chart — authoritative, precise, professional.

---

## RPT-12 · Dark Premium Report
**Vibe**: High-end service — executive home services, security systems, luxury renovation
**Design**:
- Matches the Dark Premium invoice (INV-04): dark background, gold accents.
- Header: dark, gold company name and report # in monospace.
- Work description in a slightly lighter dark card `#1e2130`.
- Photo grid: 2 photos with gold caption labels.
- Checklist: ☑ items in gold.
- Materials: dark card with gold border-left.
- Sign-off: gold rule above two signature boxes on dark.
**Unique element**: The dark premium feel communicates "elite service" — rare for a trade report, highly memorable.

---

## RPT-13 · Split Column Field Report
**Vibe**: Field technician — detailed notes on one side, quick summary on the other
**Design**:
- Two-column layout after the header.
- LEFT column (60%): Work performed description, timeline, materials used.
- RIGHT column (40%): Summary checklist, photos (2 stacked), tech signature.
- A thin brand-color vertical divider between columns.
- Footer: full-width. Customer signature spanning both columns.
**Unique element**: Field technicians naturally work through the left column; managers and customers scan the right — different audiences, one document.

---

## RPT-14 · Receipt-Style Site Report
**Vibe**: Fast, simple, old-school — auto mechanic, quick handyman job, pest control spot treatment
**Design**:
- Narrow 480px format, monospace font throughout (matching INV-24 Receipt).
- Company name centered, dashed separator below.
- "JOB COMPLETION RECORD" as title.
- Items: bullet list of tasks completed, dashed rules between.
- One photo (optional): centered, labeled, dashed border.
- Total time: "LABOR: X.X hrs" centered.
- Sign-off: two monospace boxes "TECH: ___" and "CUST: ___".
- `* * * THANK YOU * * *` footer.
**Unique element**: The compact receipt format can fit on a half-sheet of paper — perfect for quick jobs where a full-page report feels like overkill.

---

## RPT-15 · Branded Letterhead Report
**Vibe**: Professional / corporate — property management, commercial accounts, B2B service
**Design**:
- Document looks like a formal business letter — letterhead at top with logo, address, phone.
- Date and job reference: positioned like a formal letter header.
- Body text in a letter format: "Dear [Customer name], This report confirms..."
- Work summary as paragraphs (not just bullets).
- Materials section: formal itemized list.
- Closing: "If you have questions, please contact us at..."
- Technician signature at bottom like an official letter sign-off.
**Unique element**: The formal letter format impresses commercial property managers — signals "we're a real business", not a handyman with a notepad.

---

## RPT-16 · Compact Mobile Report
**Vibe**: Quick field report sent via SMS/email — all trades, mobile-first viewing
**Design**:
- Single-column, card-based sections. Max 480px wide.
- Cards have 12px corner radius, light shadow, white fill on light gray background.
- Each section is its own card: [Job Info] [Work Summary] [Parts] [Photos] [Sign-Off].
- Cards stack vertically with clear spacing.
- Photos: single large photo at top of photo card, scrollable.
- Sign-off card: customer signs in the card box.
- CTA button at bottom: "DOWNLOAD PDF" (brand color, full-width, large).
**Unique element**: Designed for a customer to view on their phone — not on paper — with a clear download action.

---

## RPT-17 · Carbon Copy / Job Ticket Style
**Vibe**: Old-school authenticity — auto shop, HVAC dealer, franchise trade
**Design**:
- Appears to look like a multi-part carbonless copy form (but rendered in HTML).
- Light blue header (`#E3F2FD`) for the customer copy, pink for the office copy indicator.
- "Customer Copy" stamped in light blue in the corner.
- Section borders: solid thin black, form-field style.
- Pre-printed labels: boxes for Date, Tech Name, Customer, Address, Work Order #.
- Items table: old printed form style — monospace, lined, minimal.
- Footer: "KEEP THIS COPY FOR YOUR RECORDS" centered.
**Unique element**: The deliberate "old paper form" aesthetic creates immediate trust — it looks official, validated, permanent.

---

## RPT-18 · Plumbing Work Record
**Vibe**: Plumber's detailed job record — pipe types, pressure tests, code compliance
**Design**:
- Matches INV-14 Plumbing Blue color scheme.
- Technical fields block: Pipe Type | Diameter | Test Pressure | Shut-off Location.
- Water pressure readings: "Incoming: X PSI | After Work: Y PSI" in a highlighted row.
- Work description: what was repaired/replaced.
- Code compliance note: "Work performed in accordance with [local plumbing code]."
- Photos: 2 images (location of repair + after repair).
- Sign-off + permits note.
**Unique element**: Pressure readings and code compliance language instantly mark this as from a licensed professional — builds trust.

---

## RPT-19 · Auto Repair Inspection Report
**Vibe**: Auto shop — inspection findings, multipoint check, repair authorization
**Design**:
- Matches INV-17 Auto Repair Garage color scheme.
- Vehicle info block at top: Year | Make | Model | VIN | Mileage In | Mileage Out.
- Multipoint inspection grid: 3 columns (System | Status | Notes), traffic light colors (🟢🟡🔴).
- Systems checked: Brakes, Tires, Fluids, Battery, Lights, Belts, etc.
- Work performed: narrative section.
- Parts replaced table: Part | OEM/Aftermarket | Part # | Warranty.
- Sign-off + "Authorization to Repair" for any recommended future work.
**Unique element**: The multipoint inspection grid with traffic light colors is a proven trust builder — customers feel informed, not upsold.

---

## RPT-20 · Electrical Compliance Certificate
**Vibe**: Licensed electrician — NEC code compliance, panel work, inspection-ready document
**Design**:
- Matches INV-16 Electrical Amber color scheme.
- Official-feel header with "ELECTRICAL WORK COMPLETION CERTIFICATE" title.
- Key fields: Permit # | Inspection Date | Inspector Name | License # | Bond #.
- Work scope: what was installed/replaced, wire gauge, breaker amperage.
- Compliance statement: "All work performed meets NEC [YEAR] standards for [jurisdiction]."
- Photos: before/after of panel or installation.
- Dual signature blocks: Licensed Electrician + Customer.
- Warranty block: "Labor warranty: X year | Materials: Manufacturer warranty."
**Unique element**: Official certificate language + license/permit fields = the document that goes in the homeowner's file permanently.

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

*Last updated: 2026-08-31 — 44 Invoice (Batch 1: 20 + Batch 2: 14 + Batch 3: 10) + 20 Report (RPT-01~20) = 64 total prompts*
