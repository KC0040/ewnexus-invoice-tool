# Stitch Prompts — BATCH 2（新增，未做過）
# Invoice INV-35~44 + Report RPT-06~20

> **狀態說明：**
> - 你之前做過的（已傳 bot5）：INV-01~34 + RPT-01~05 = 39 個
> - 這個文件：全是新的，沒做過 ← **從這裡繼續**
>
> 做完這批以後，再看 STITCH_PROMPTS_MASTER.md 更新主文件狀態。

---

## SHARED CONTEXT（每個 prompt 都要貼這段）

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

---

# INVOICE TEMPLATES — BATCH 2（INV-35 ~ INV-44，共 10 個）

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

# REPORT TEMPLATES — BATCH 2（RPT-06 ~ RPT-20，共 15 個）

> Report 用途：施工完成報告 / 工地現場報告
> Header 要跟同系列的 Invoice 視覺一致（顏色、Logo 排版）
> 內容區塊：照片、工作說明、材料清單、技師簽名、客戶簽名

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

# 進度追蹤

| 批次 | 內容 | 狀態 |
|------|------|------|
| Batch 1（主文件） | INV-01~34 + RPT-01~05 = 39 個 | ✅ 已傳 bot5，你做過了 |
| **Batch 2（本文件）** | INV-35~44 + RPT-06~20 = 25 個 | ⬜ 待做 |
