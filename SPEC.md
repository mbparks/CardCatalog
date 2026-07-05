# CARD CATALOG
## Field Instrument No. 066 — Specification Document
**Revision 2**
**Author:** M.B. Parks
**Status:** Pre-development, v1.0 scope locked

---

## 1. Overview

CARD CATALOG is a personal library management instrument. Every book in the collection is represented as a virtual 3x5 catalog card, filed in the drawers of a card catalog cabinet. The instrument covers cataloging (with ISBN lookup and manual typing), marginalia (personal notes on the reverse of each card), and circulation (loan tracking with borrower cards, date-due slips, and rubber stamps).

The design language is the mid-century American library: typed catalog cards, oak cabinets with brass pulls, glued-in card pockets, ruled borrower cards, and rubber date stamps. The instrument is an interactive painting first and a database second. Atmosphere, tactility, and narrative take precedence over feature density.

**North star:** owning your data and understanding your tools is worth the learning curve. Your library, cataloged your way, stored in a file you control.

---

## 2. Identity

| Field | Value |
|---|---|
| Instrument | CARD CATALOG |
| Number | FI-066 |
| Tagline | Your personal library |
| Category | Library / Reference / Archival |
| License | GPL-3.0 |
| Repository | GitHub from day one |
| Deployment | Static HTML, mbparks.com Field Instruments catalog |

---

## 3. Design pillars

1. **The card is the unit.** Not a row, not a tile, not a record. Every book is a catalog card with a front (formal bibliographic record) and a back (marginalia). All views are arrangements of cards.
2. **The cabinet is the front door.** The primary view is a cabinet of drawers. Browsing is pulling a drawer and riffling. The circulation desk is one click away but is never the landing view.
3. **Typography carries the aesthetic.** Typewriter face for the formal record, pencil-texture face for marginalia. Cover thumbnails are present but subordinate, tucked into the card like a paperclipped photo, never a cover-first grid.
4. **Nothing is deleted.** Books are withdrawn, not erased. The red WITHDRAWN stamp moves a card to the withdrawn drawer with its full history intact.
5. **Ceremony over efficiency, within reason.** Intake types the card in front of you. The stamp comes down with a kachunk. But batch intake exists because cataloging five hundred books by hand is misery, not charm.

---

## 4. Aesthetic specification

### 4.1 The card

- 3x5 proportions, rendered at fluid sizes but always 3:5 aspect.
- **Front face layout (top to bottom):**
  - Call number, top-left, typed.
  - Author line (surname first, dates if known).
  - Title line with statement of responsibility.
  - Imprint line (place : publisher, year).
  - Physical description line (pagination ; height, e.g. "xii, 340 p. ; 22 cm.").
  - Tracings at the bottom (subject headings, numbered).
  - Hole punch, bottom center. Non-negotiable. Rendered as a die-cut circle showing the drawer interior color behind it.
- **Back face:** ruled lightly, marginalia entries in pencil-texture handwriting face, each auto-dated. Multiple entries accrete chronologically (continuation-card model). Rereads build visible stratigraphy.
- **Cover thumbnail:** small, tucked under a rendered paperclip or into a corner pocket on the card front. Sourced from Open Library covers API when available. Never enlarged into a grid view. Absence of a cover is not an error state; the card is complete without it.
- **Per-card render variation:** baseline jitter, ink density variation, and slight rotation seeded deterministically from the accession number. Each card is unique but stable across sessions.

### 4.2 The cabinet

- Landing view: a card catalog cabinet, oak texture, brass label holders and pulls.
- Standard drawers: AUTHOR, TITLE, SUBJECT. Custom drawers user-definable.
- Drawer labels typed on paper slips behind brass frames.
- Pull interaction: drawer slides out with easing, cards visible edge-on inside.
- Riffle browsing: fast scroll tilts cards past the viewer; releasing settles the nearest card upright. This interaction is the soul of the instrument and must feel right before anything else ships.
- Selecting a card lifts it out of the drawer to full view; flip control reveals the back.

### 4.3 The circulation desk

- Secondary view, one click from the cabinet.
- Shows: currently reading (future hook for Reading Room), books currently lent, overdue items surfaced with red OVERDUE stamps, recent returns.
- Desk blotter layout, ruled ledger aesthetic.

### 4.4 The rubber stamp

- Interactive: user positions the stamp over the date-due slip, commits, and the stamp comes down with slight skew and uneven ink coverage (randomized per stamping, seeded and stored so the stamped result is permanent and reproducible).
- Sound: muffled kachunk. Behind the global mute button per standards.
- Stamp variants: date-due (black), OVERDUE (red), WITHDRAWN (red), RETURNED (black).

### 4.5 Sound inventory (all behind mute)

- Drawer pull and close (wood slide, soft stop).
- Card riffle (paper flutter, velocity-scaled).
- Stamp kachunk.
- Typewriter keystrikes during intake card fill.

---

## 5. Data model

All data local-first, persisted to browser storage, with full-catalog JSON export/import. The export file is the source of truth the user owns.

### 5.1 Book (card)

```
{
  "accession": 137,              // sequential integer, assigned at intake, never reused
  "status": "active",            // active | withdrawn
  "isbn": "9780936070377",       // optional, null for pre-ISBN books
  "callNumber": "684.08 KRE",    // string, user-editable
  "author": "Krenov, James, 1920-2009.",
  "title": "The fine art of cabinetmaking / James Krenov.",
  "imprint": "New York : Van Nostrand Reinhold, 1977.",
  "physDesc": "192 p. : ill. ; 29 cm.",
  "subjectsOL": ["Cabinetwork", "Woodwork"],   // from Open Library, read-only
  "subjectsUser": ["Fabrication"],             // hand-assigned, take precedence
  "coverUrl": null,              // Open Library cover URL or null; cached locally when feasible
  "seed": 88213,                 // deterministic render-variation seed
  "addedDate": "2026-07-05",
  "withdrawnDate": null,
  "marginalia": [
    { "date": "2026-07-05", "text": "...", "page": 42 }
  ],
  "circulation": [
    {
      "borrower": "R. Hendricks",
      "lentDate": "2026-06-01",
      "dueDate": "2026-06-22",
      "returnedDate": null,
      "stampSeed": 4471
    }
  ]
}
```

### 5.2 Subject filing rules (both-with-override)

- On intake via ISBN, Open Library subject headings populate `subjectsOL` and file the card into SUBJECT drawer sections automatically.
- User-assigned subjects (`subjectsUser`) always take precedence for filing. If any user subject exists, the card files under user subjects only; OL headings remain on the card as tracings but do not drive drawer placement.
- User may promote an OL heading to a user subject with one action (adopts it into `subjectsUser`).
- OL headings are never editable in place; they are provenance. User subjects are fully editable.

### 5.3 Catalog metadata

```
{
  "schemaVersion": 1,
  "instrument": "CARD CATALOG",
  "fiNumber": "FI-066",
  "appVersion": "1.0.0",
  "nextAccession": 138,
  "customDrawers": [ { "label": "RAILROADING", "filter": {...} } ],
  "exportedAt": "2026-07-05T14:30:00Z"
}
```

### 5.4 Storage and migration

- Primary persistence: IndexedDB (decided at v0.2). Chosen over localStorage for catalog scale: structured records instead of one serialized string, no 5MB ceiling, and async writes that never block a riffle frame. Object stores: "books" (keyPath accession) and "meta".
- `schemaVersion` present from v1.0. No backwards compatibility maintained until requested, per standards, but the version field exists so future migration is possible.
- Export produces a single JSON file: metadata plus full book array. Import replaces or merges (user chooses; merge matches on accession number and warns on conflicts).

---

## 6. Views

### 6.1 Cabinet (landing view)

- Full cabinet render, drawers labeled.
- Drawer contents auto-derived: AUTHOR (alpha by author), TITLE (alpha by title, ignoring leading articles), SUBJECT (grouped by effective subject per 5.2 rules), plus custom drawers.
- Withdrawn drawer, bottom of cabinet, visually distinct (grayed label slip).

### 6.2 Card detail

- Lifted card, front face. Flip to back. Edit affordances kept quiet: pencil icon reveals editable fields; the card never looks like a form until asked.
- Actions from card detail: edit, add marginalia, lend, return, withdraw, promote OL subject.

### 6.3 Circulation desk

- Ledger of active loans with due dates and stamped slips.
- Overdue section, red-stamped, sorted by days overdue.
- Lending history accessible per book (the borrower card, full NAME and DATE columns, permanent).

### 6.4 Intake (accessions)

- Three entry paths: single ISBN, manual typing, batch ISBN paste.
- ISBN path: fetch from Open Library, then the card fills in front of the user character by character with typewriter strikes. User reviews, corrects, confirms. Accession number stamps on confirm.
- Manual path: the form is the card. User types directly into card fields.
- Batch path: paste a list of ISBNs, produce a review stack, confirm one at a time. Failures (no OL record) fall through to manual typing pre-loaded with the ISBN.
- Offline: ISBN and batch paths degrade gracefully to manual typing with a plain notice. No error theatrics; hand-typing is period-correct.

---

## 7. External dependencies

| Dependency | Purpose | Failure mode |
|---|---|---|
| Open Library Books API | ISBN metadata lookup | Degrade to manual typing |
| Open Library Covers API | Cover thumbnails | Card renders without thumbnail; no error state |

No API keys. No other network calls. No analytics. No CDN-critical assets: fonts subset and embedded or system-stacked so the single file stands alone offline.

---

## 8. Theming

| Theme | Character |
|---|---|
| Night (default) | Reading room after hours. Deep shadow, green banker's-lamp glow, warm pools of light on oak and card stock. |
| Day | Sunlit reading room. Oak, brass, cream card stock, high ambient light. |
| High Contrast | Paper textures flattened, pure light-on-dark or dark-on-light, decorative variation suppressed. |

- WCAG AA contrast verified in all three themes, including typed text on card stock textures and red stamp ink on cream.
- Render-variation effects (jitter, ink density) reduced or disabled in High Contrast.
- Respect `prefers-reduced-motion`: riffle and drawer animations replaced with instant transitions.

---

## 9. Standards compliance checklist (development standards, revision 3)

- [ ] Local-first with full export/import (JSON)
- [ ] Single-file HTML (aspirational; fonts are the risk, subset aggressively)
- [ ] Modular internally, no build step
- [ ] No server-side component required for v1.0 (Cloudflare Workers not needed; note for future if OL proxying ever required)
- [ ] Night-default theme, day mode, High Contrast, WCAG AA verified in all
- [ ] Dynamic/fluid sizing
- [ ] Collapsible side menu
- [ ] In-app mute button (sound exists, so mandatory)
- [ ] In-app feedback mechanism
- [ ] Auto-increment and display version number (diegetic: "card stock lot number" printed faintly along card edge, plus plain version in the side menu)
- [ ] Each release saved as its own file
- [ ] GitHub repo from day one
- [ ] No backwards compatibility until requested (schemaVersion field present regardless)
- [ ] Rewrite over patch when complexity creeps
- [ ] Browser-runnable test harness passes before release
- [ ] Build to v1.0 MVP then stop for review
- [ ] Archive/soft-delete only (WITHDRAWN stamp, withdrawn drawer)
- [ ] Console logging behind debug flag
- [ ] README updated each revision with Known Limitations section
- [ ] README license section: GPL-3.0 as plain text, no hyperlink
- [ ] Blog post draft with release

---

## 10. v1.0 MVP scope (build to this, then stop for review)

1. **Card model and rendering.** Front and back faces, typewriter and pencil faces, hole punch, seeded per-card variation, paperclipped cover thumbnail.
2. **Cabinet and drawers.** AUTHOR, TITLE, SUBJECT, custom drawers, withdrawn drawer. Pull animation, riffle browsing, card lift and flip.
3. **Intake.** Single ISBN with typed card fill, manual typing, batch accessions, sequential accession numbers, offline degradation.
4. **Marginalia.** Auto-dated entries on the card back, optional page reference, chronological accretion.
5. **Lending.** Card pocket, date-due slip, interactive rubber stamp with sound, borrower card ledger, return workflow, OVERDUE surfacing, circulation desk view.
6. **Subjects.** Both-with-override filing per section 5.2, including one-action promotion of OL headings.
7. **Standards plumbing.** Everything in section 9.

## 11. Deferred (v1.x and beyond)

- **Reading Room mode** (v1.x flagship): dimmed single-card focus, reading lamp, session timer, ambient sound options (rain, radiator), session stamps recording pages and date.
- Custom classification scheme editor with call number generation and shelf-list view.
- Cross-reference SEE ALSO cards.
- Want list drawer (pencil-gray cards, inked on acquisition).
- Annual report statistics (typed onionskin report).
- Spine label printing.
- Cover image local caching strategy hardening.

---

## 12. Test harness (browser-runnable, must pass before release)

Minimum test coverage:

- Card CRUD: create via all three intake paths (OL calls mocked), edit, withdraw, restore.
- Accession sequence: monotonic, never reused, survives export/import round trip.
- Subject filing: OL-only card files under OL headings; adding a user subject refiles under user subjects only; promotion works; removal of last user subject reverts to OL filing.
- Circulation: lend, overdue detection (date math across month and year boundaries), return, history integrity.
- Export/import: full round trip byte-equivalent on data fields; merge conflict detection on accession collision.
- Seeded rendering: same seed produces identical variation output.
- Theme contrast: automated AA check on the core text/background pairs in all three themes.
- Reduced motion: animations suppressed when flag set.
- Offline: intake degrades to manual with OL unreachable (fetch mocked to fail).

---

## 13. Known risks

- **Riffle performance at scale.** A thousand-card drawer must riffle at 60fps. Virtualize the card list inside the drawer; only render cards near the viewport. Prototype this first.
- **Open Library data quality.** Records are inconsistent (missing physical descriptions, messy subject headings). The review step in intake is the mitigation; never auto-commit an OL record unseen.
- **Single-file size.** Two embedded fonts plus wood/paper textures could balloon the file. Prefer CSS-generated texture (gradients, noise via SVG filters) over bitmap textures; subset fonts to used glyph ranges.
- **Cover URL rot.** OL cover URLs can change or vanish. v1.0 accepts this (thumbnail absence is a valid state); local caching is deferred.

---

## 14. Resolved decisions log

| Decision | Resolution | Date |
|---|---|---|
| Front door view | Cabinet of drawers; circulation desk one click away | 2026-07-05 |
| Cover art | Included, subordinate to card (paperclipped thumbnail, no cover grid) | 2026-07-05 |
| Subject filing | Both-with-override: OL headings auto-file, user subjects take precedence | 2026-07-05 |
| FI number | FI-066 | 2026-07-05 |
| v1.0 scope | Cards, cabinet, intake, marginalia, lending; Reading Room deferred to v1.x | 2026-07-05 |
| Storage layer | IndexedDB (books + meta object stores); localStorage retained only for UI preferences | 2026-07-05 |

---

## 15. License

GPL-3.0
