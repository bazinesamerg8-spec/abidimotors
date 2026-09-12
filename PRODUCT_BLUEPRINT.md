# Abidi Motors — Website Product Blueprint

## 1. Product vision

Abidi Motors should be a multilingual digital showroom and managed vehicle marketplace. Visitors can discover, compare, inspect, and enquire about vehicles; staff can control the complete catalogue, pricing, media, enquiries, content, and publishing workflow from an admin dashboard.

The visual identity should use the existing premium black-and-gold Abidi Motors branding, but the interface must stay readable, fast, mobile-first, and accessible.

## 2. Initial scope and assumptions

### Phase-one business model

- Abidi Motors is the only seller.
- Vehicles are catalogue entries with one or more saleable stock units.
- Customers submit enquiries, request a quote, reserve a vehicle, or contact the showroom through WhatsApp/phone.
- The website does not collect the full vehicle price at launch.
- Admin users approve all public content and can change every customer-facing record.

### Future marketplace option

The data model should allow third-party dealers or private sellers later, but seller onboarding, commissions, payouts, moderation, and disputes should not complicate the first release.

### Items requiring business confirmation

- Meaning and display of prices such as `559M`: preserve the source value during import, then store a normalized DZD amount after confirmation.
- Whether listed prices include freight, customs, registration, warranty, or delivery.
- Whether each model is physically in stock, available to order, or only advertised.
- Reservation policy: refundable deposit, offline confirmation, or enquiry only.
- Supported launch languages. Recommended: Arabic and French first, English-ready.

## 3. Users and permissions

### Public visitor

- Browse and search inventory.
- Filter by brand, body type, price, transmission, fuel/energy, seats, year, and availability.
- Open a vehicle detail page, inspect media/3D, compare cars, save favourites, and share a listing.
- Send an enquiry, request a quotation/test drive, or start a WhatsApp conversation.

### Sales agent

- View and manage assigned leads.
- Add notes, update lead status, schedule follow-ups, and create/share quotations.
- View inventory without changing protected commercial settings.

### Inventory manager

- Create vehicles and variants, manage stock units, specifications, prices, availability, photos, videos, documents, and 3D assets.
- Save drafts and submit changes for publishing.

### Administrator

- Full access to inventory, leads, users, roles, homepage content, navigation, translations, SEO, integrations, and audit history.
- Publish/unpublish listings, archive data, restore records, and configure site-wide settings.

## 4. Customer-facing information architecture

1. **Home**
   - Premium hero with featured car or lightweight 3D preview.
   - Search by brand/model.
   - Featured vehicles, new arrivals, brands, services, and strong contact actions.
2. **Inventory**
   - Grid/list views, filters, sorting, result count, pagination, and mobile filter drawer.
   - Availability badges: in stock, arriving, on order, reserved, sold.
3. **Vehicle details**
   - Name, grade/trim, verified price status, availability, key specifications, gallery, video, and 360°/3D viewer.
   - Exterior colour selector when assets exist.
   - Equipment grouped by safety, comfort, technology, exterior, and interior.
   - Finance/import notes, warranty, delivery estimate, downloadable spec sheet, related cars, and enquiry actions.
4. **Compare**
   - Side-by-side comparison for up to three vehicles, highlighting differences.
5. **Brands**
   - Brand landing pages with model families and active stock.
6. **Services**
   - Import/order assistance, trade-in if offered, delivery, registration, and after-sales/warranty information.
7. **About and contact**
   - Showroom story, location/map, hours, telephone, WhatsApp, social links, and enquiry form.
8. **Legal/content pages**
   - Privacy, terms, cookies, reservation/refund terms, and price disclaimer.

## 5. Vehicle detail and 3D experience

### Viewer levels

Use progressive enhancement so every listing works even without an expensive 3D model.

1. **Standard:** optimized photo gallery and video.
2. **360° spin:** 24–72 exterior frames, often cheaper and more realistic than custom 3D.
3. **Interactive 3D:** optimized GLB/glTF model with orbit, zoom, hotspots, colour/material variants, full-screen mode, and optional interior camera positions.

### Performance rules

- Do not load the 3D asset until the viewer becomes visible or the visitor opens it.
- Show a poster image and gallery fallback on slow/unsupported devices.
- Use compressed meshes and textures (Draco/Meshopt and KTX2 where supported).
- Define mobile and desktop asset budgets and test on average Android devices.
- Keep 3D files in object storage/CDN, not in the application repository or database.
- Require licensing/provenance information for every uploaded 3D asset.

### Suggested implementation

- Three.js through React Three Fiber for controlled custom interactions.
- A simpler `<model-viewer>` implementation is acceptable for the MVP if only orbit/zoom/hotspots are required.
- 3D is an optional media type attached to a vehicle variant, never a requirement for publishing a listing.

## 6. Admin dashboard

### Dashboard

- Counts for active/reserved/sold stock, new leads, response time, popular listings, and stale inventory.
- Alerts for missing prices/specifications/media, expiring promotions, and unassigned leads.

### Catalogue and inventory

- Brand → model → variant/trim → physical stock unit hierarchy.
- Draft, review, published, hidden, sold, and archived states.
- Bulk CSV import/export and bulk status/price updates.
- Specification templates by category while allowing model-specific fields.
- Media ordering, alt text, primary image, 360 sequence, video, GLB upload, and processing status.
- Scheduled publishing and price history.

### Lead management

- Enquiry types: general question, quote, test drive, reservation, trade-in.
- Pipeline: new, contacted, qualified, appointment, negotiating, won, lost, spam.
- Assignment, internal notes, follow-up date, contact history, source/UTM tracking, and CSV export.

### Content and configuration

- Homepage sections, banners, promotions, services, FAQs, testimonials, contact information, social links, and SEO defaults.
- Arabic/French/English fields with independent publication completeness checks.
- Role-based access control, session management, optional two-factor authentication, and immutable audit log for sensitive changes.

## 7. Core data model

| Entity | Purpose | Important fields |
| --- | --- | --- |
| Brand | Manufacturer | name, slug, logo, country, status |
| Model | Model family | brand, name, body type, generation |
| Variant | Marketable trim | model, year, trim, specifications, features, seats, transmission, drivetrain, fuel/energy |
| StockUnit | A saleable vehicle | variant, VIN/internal ref, colour, mileage, condition, location, availability, arrival date |
| Price | Commercial value/history | stock/variant, amount, currency, display label, validity dates, price type, visibility |
| MediaAsset | All visual/document assets | owner, type, URL, order, alt text, metadata, processing status, licence/source |
| Listing | Publication record | variant/stock, slug, localized copy, status, featured, SEO, publish dates |
| Enquiry | Customer lead | listing, contact details, channel, type, message, consent, status, assignee |
| User/Role | Staff access | identity, role, permissions, active state, last login |
| AuditEvent | Traceability | actor, action, entity, before/after summary, timestamp, IP/device metadata |
| SiteContent | Editable pages/sections | key, locale, structured content, status, schedule |

Important distinction: a **variant** describes a car configuration, while a **stock unit** represents one actual car. This prevents a sold vehicle from deleting the model’s reusable catalogue information.

## 8. Inventory transcribed from the supplied image

This is a draft import list and must be verified against an original spreadsheet or admin entry. `M` is retained exactly as shown; no currency conversion is assumed.

| Brand | Model/variant as shown | Display price |
| --- | --- | ---: |
| Volkswagen | Golf 8.5 | 559M |
| Volkswagen | Golf 8.6 Fimi | 564M |
| Volkswagen | Tharu XR | Not shown |
| Volkswagen | T-Roc Grenardo | 539M |
| Volkswagen | Jetta VS5 | 379M |
| Volkswagen | Jetta VS8 | 445M |
| Audi | A3 | 610M |
| Audi | Q3 | 645M |
| Changan | X5 Manual | 255M |
| Changan | X5 Plus | 280M |
| Roewe | i5 | 202M |
| Geely | Coolray Manual | 260M |
| Geely | Coolray Battle | 332M |
| Geely | Coolray Full | 320M |
| Livan | GX3 Pro Manual (image labels it “Geely”) | 235M |
| Livan | GX3 Pro Automatic (image labels it “Geely”) | 250M |
| GAC | GS3 Base | 265M |
| GAC | GS3 Medium | 290M |
| GAC | GS3 Full | 320M |
| GAC | GS3 R Style | 345M |
| GAC | GS4 Max | 398M |
| Kaiyi | X3 Pro | 255M |
| Kaiyi | X7 | Not shown |
| Lynk & Co | 06 | 385M |
| Jetour | X70 5 Seat | 440M |
| Jetour | Dashing 7 Seat | 455M |
| Jetour | Dashing | 395M |
| Jetour | T1 1.5 | 490M |
| Jetour | T2 1.5 | 595M |
| Kia | K3 | Not shown |
| Kia | KX1 | Not shown |

Names needing verification include `Golf 8.6 Fimi`, `T-Roc Grenardo`, the brand association displayed for GX3 Pro, and exact capitalization/trims. The source banner also presents a time-limited price period, so these values should enter the system with a validity range rather than overwrite a permanent base price.

## 9. Recommended technical architecture

### Application

- Next.js with TypeScript for storefront and admin in one maintainable codebase.
- Tailwind CSS or a token-based component system for consistent responsive UI.
- PostgreSQL with Prisma for structured catalogue, stock, price history, users, and leads.
- Auth.js or a managed authentication provider, with server-side permission checks.
- S3-compatible object storage plus CDN for images, video, documents, spin frames, and 3D assets.
- Background jobs for media optimization, imports, notifications, and scheduled publishing.
- Transactional email and WhatsApp deep links initially; official WhatsApp Business integration when message automation is required.

### Search and operations

- PostgreSQL search/filtering is sufficient for the initial catalogue; add a dedicated search service only when inventory/traffic justifies it.
- Structured logging, error monitoring, daily database backups, asset versioning, rate limiting, bot protection, and form spam controls.
- Schema.org Vehicle/Product/Offer markup, localized metadata, sitemap, canonical URLs, and share images.

## 10. Delivery stages

### Stage 0 — discovery and content preparation

- Confirm logo/source files, brand rules, languages, domain, contacts, address, services, legal terms, price meaning, and sales workflow.
- Obtain a verified inventory spreadsheet and legally usable vehicle media.
- Decide which launch cars receive full 3D, 360° spins, or standard galleries.

### Stage 1 — UX and design system

- Create sitemap, low-fidelity flows, mobile/desktop layouts, black-and-gold design tokens, reusable components, and a clickable prototype.
- Validate home, inventory, details, compare, enquiry, and admin editing workflows.

### Stage 2 — MVP build

- Multilingual storefront, catalogue filters, vehicle pages, gallery/optional 3D viewer, enquiry/WhatsApp flows, compare/favourites, SEO, and analytics.
- Secure admin for catalogue, stock, prices, media, content, users, and leads.
- Import verified launch inventory and complete acceptance testing.

### Stage 3 — commercial features

- Reservations/deposits, quotation PDFs, appointment calendar, richer CRM automations, trade-in requests, and notification integrations.

### Stage 4 — multi-seller marketplace, only if required

- Seller accounts, organization ownership, listing approval, subscription/commission rules, payouts, moderation, disputes, and seller analytics.

## 11. MVP acceptance criteria

- A visitor can find a suitable car and send an enquiry in Arabic or French on mobile.
- Every published car has an availability state, verified price label or “contact for price,” key specifications, optimized primary image, and contact action.
- A missing/broken 3D asset never blocks the vehicle page or enquiry flow.
- An authorized admin can create, translate, preview, publish, edit, archive, and restore a listing without developer help.
- Price/status changes are logged, and sold stock disappears from default results without deleting its history.
- Forms validate input, capture consent, resist spam, notify staff, and appear in the lead pipeline.
- Core pages meet performance, accessibility, responsive-layout, SEO, backup, and security checks before launch.

## 12. Immediate inputs needed before visual design/build

1. Original logo files and permission to reproduce brand/manufacturer marks.
2. Verified vehicle spreadsheet with brand, model, trim, year, price, currency/price convention, availability, specifications, colours, and arrival date.
3. Photos/video/3D assets, or a decision on how those assets will be produced and licensed.
4. Showroom address, map pin, hours, phone/WhatsApp, social profiles, services, warranty/import terms, and legal business information.
5. Confirmation of Arabic/French/English launch languages and whether the site accepts deposits or only leads.

