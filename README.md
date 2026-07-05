# CARD CATALOG

**Field Instrument No. 066. Your personal library.**

Books cataloged on virtual 3x5 index cards, filed in the drawers of a card catalog cabinet. Marginalia on the back of every card. Loan tracking with borrower cards, glued-in pockets, and rubber-stamped due dates. Old library card pocket aesthetic throughout.

Part of the Field Instruments series at [mbparks.com](https://mbparks.com).

## Status

**v0.2.0.** The catalog is usable: books can be accessioned (ISBN lookup via Open Library with the typed-card fill, or hand-typing), filed into AUTHOR, TITLE, and SUBJECT drawers with both-with-override subject filing, browsed with the virtualized riffle promoted from the prototype, lifted out to a card detail view, and annotated with dated marginalia on the card back. The catalog persists in IndexedDB with working JSON export and import (replace or merge with accession conflict reporting). First sounds (typewriter keystrikes and the accession thunk) sit behind the mute control. Circulation, batch intake, and withdrawal arrive in v0.3.

## Files

| File | Purpose |
|---|---|
| `index.html` | The instrument. Open it in a browser. No build step, no server. |
| `cardcatalog-core.js` | Pure logic module (seeded rendering, accessions, subject filing, Open Library parsing, drawer building, circulation date math, export envelope). Shared by the app and the test harness. |
| `cardcatalog-store.js` | IndexedDB persistence (books and meta stores, import with replace or merge). |
| `tests.html` | Browser-runnable test harness. All tests must pass before any release. |
| `SPEC.md` | Full specification document, revision 1. |
| `prototypes/riffle.html` | Riffle interaction prototype with DOM virtualization and FPS instrumentation. Open in a browser and drag. |
| `releases/` | Each release saved as its own file. |
| `LICENSE` | GPL-3.0 full text. |

## Running

Open `index.html` in any modern browser. Everything is local. Append `?debug=1` to the URL to enable console logging.

## Testing

Open `tests.html` in a browser. The summary line reports pass count; any failure blocks release.

## Design notes

- **The card is the unit.** Every view is an arrangement of catalog cards. Covers are included but subordinate to the card (a paperclipped thumbnail, never a cover grid).
- **The cabinet is the front door.** Browse-first, atmospheric. The circulation desk is one click away.
- **Subjects file both-with-override.** Open Library headings populate drawers automatically on ISBN intake; any hand-assigned subject takes precedence for filing. OL headings always remain on the card as tracings.
- **Nothing is deleted.** Books are withdrawn with a red stamp and move to the withdrawn drawer with full history intact.

## Data

Local-first. The full catalog exports to a single JSON file you own. External dependencies are limited to the Open Library Books and Covers APIs for intake convenience; both degrade gracefully offline (hand-typing cards is period-correct).

## Known Limitations

- No circulation yet: lending, borrower cards, due-date stamps, and the circulation desk arrive in v0.3, as do batch ISBN intake and the WITHDRAWN workflow (the drawer exists but nothing can be filed into it yet).
- Cards cannot be edited after filing. Correct mistakes by exporting, editing the JSON, and importing in replace mode, or wait for the edit affordance.
- Marginalia entries cannot be edited or removed once penciled in (archive-not-delete will eventually offer strikethrough rather than erasure).
- Import mode selection uses plain browser dialogs. Functional but not diegetic; a proper accessions-desk treatment is planned.
- Cover thumbnails load from Open Library URLs live in the detail view only (never during a riffle, for performance). No local caching yet; a missing cover is a valid state.
- Typewriter and pencil typefaces fall back to system stacks. Font subsetting and embedding is planned for v1.0.
- The riffle technique from `prototypes/riffle.html` is now in the shell. The prototype remains for hardware benchmarking; verify frame numbers on a phone if riffling feels rough.
- The feedback link points at the GitHub issues page; an in-app feedback mechanism is required before v1.0.

## License

GPL-3.0
