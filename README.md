# CARD CATALOG

**Field Instrument No. 066. Your personal library.**

Books cataloged on virtual 3x5 index cards, filed in the drawers of a card catalog cabinet. Marginalia on the back of every card. Loan tracking with borrower cards, glued-in pockets, and rubber-stamped due dates. Old library card pocket aesthetic throughout.

Part of the Field Instruments series at [mbparks.com](https://mbparks.com).

## Status

**v0.1.0 scaffold.** The cabinet shell stands: night-default theming (with day and High Contrast), collapsible side menu, mute control, version display, export envelope, and the drawer front-door view. Drawers are empty. Intake, cards, marginalia, and circulation arrive next per the spec.

## Files

| File | Purpose |
|---|---|
| `index.html` | The instrument. Open it in a browser. No build step, no server. |
| `cardcatalog-core.js` | Pure logic module (seeded rendering, accessions, subject filing, circulation date math, export envelope). Shared by the app and the test harness. |
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

- v0.1.0 is a shell. No cards can be cataloged yet; drawers open to an empty state.
- Import is a stub; the storage layer (IndexedDB vs. localStorage decision pending) arrives in v0.2.
- Typewriter and pencil typefaces currently fall back to system stacks. Font subsetting and embedding is planned for v1.0.
- No sounds are implemented yet; the mute control ships ahead of the audio it governs.
- The riffle-browse interaction, identified in the spec as the number one performance risk, now has a prototype at `prototypes/riffle.html` with built-in FPS, 1% low, and long-frame counters. It virtualizes to a fixed pool of 19 DOM nodes regardless of drawer size (tested up to 20,000 synthetic cards). Verify the numbers on your own hardware, especially a phone, before the technique is promoted into the shell.
- The feedback link points at the GitHub issues page; an in-app feedback mechanism is required before v1.0.

## License

GPL-3.0
