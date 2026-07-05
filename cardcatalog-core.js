/*
 * CARD CATALOG (FI-066) — core logic module
 * Pure functions only. No DOM access. Shared by index.html and tests.html.
 *
 * Per development standards: modular internally, no build step.
 * Single-file HTML is aspirational; release builds may inline this module.
 *
 * License: GPL-3.0 (see LICENSE)
 */
(function (root) {
  "use strict";

  const CC = {};

  CC.APP_VERSION = "0.1.0";
  CC.SCHEMA_VERSION = 1;
  CC.INSTRUMENT = "CARD CATALOG";
  CC.FI_NUMBER = "FI-066";

  /* ---------------------------------------------------------------
   * Seeded PRNG (mulberry32).
   * Used for per-card render variation and stamp impressions.
   * Same seed must always produce the same sequence (spec 4.1, 4.4).
   * --------------------------------------------------------------- */
  CC.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* Derive stable render variation for a card from its seed. */
  CC.cardVariation = function (seed) {
    const rng = CC.mulberry32(seed);
    return {
      rotateDeg: (rng() - 0.5) * 1.6,        // -0.8 to 0.8 degrees
      baselineJitterPx: (rng() - 0.5) * 1.0, // -0.5 to 0.5 px
      inkDensity: 0.82 + rng() * 0.18        // 0.82 to 1.00 opacity
    };
  };

  /* ---------------------------------------------------------------
   * Accession numbers (spec 5.1, 5.3).
   * Monotonic, never reused, assigned at intake.
   * --------------------------------------------------------------- */
  CC.allocateAccession = function (catalogMeta) {
    const n = catalogMeta.nextAccession;
    return { accession: n, meta: Object.assign({}, catalogMeta, { nextAccession: n + 1 }) };
  };

  /* ---------------------------------------------------------------
   * Subject filing, both-with-override (spec 5.2).
   * If any user subject exists, file under user subjects only.
   * Otherwise file under Open Library headings.
   * OL headings always remain as tracings regardless.
   * --------------------------------------------------------------- */
  CC.effectiveSubjects = function (book) {
    const user = Array.isArray(book.subjectsUser) ? book.subjectsUser.filter(Boolean) : [];
    const ol = Array.isArray(book.subjectsOL) ? book.subjectsOL.filter(Boolean) : [];
    if (user.length > 0) return { source: "user", subjects: user.slice() };
    if (ol.length > 0) return { source: "ol", subjects: ol.slice() };
    return { source: "none", subjects: [] };
  };

  /* Promote an OL heading into the user subject list (spec 5.2). */
  CC.promoteSubject = function (book, heading) {
    const ol = Array.isArray(book.subjectsOL) ? book.subjectsOL : [];
    if (!ol.includes(heading)) return book;
    const user = Array.isArray(book.subjectsUser) ? book.subjectsUser.slice() : [];
    if (!user.includes(heading)) user.push(heading);
    return Object.assign({}, book, { subjectsUser: user });
  };

  /* ---------------------------------------------------------------
   * Filing sort keys.
   * Title filing ignores leading articles (spec 6.1).
   * Author filing uses the author line as typed (surname first).
   * --------------------------------------------------------------- */
  const LEADING_ARTICLES = /^(the|a|an)\s+/i;

  CC.titleSortKey = function (title) {
    return String(title || "").trim().replace(LEADING_ARTICLES, "").toLowerCase();
  };

  CC.authorSortKey = function (author) {
    return String(author || "").trim().toLowerCase();
  };

  /* ---------------------------------------------------------------
   * Circulation date math (spec 6.3, 12).
   * Dates are ISO strings (YYYY-MM-DD). Comparisons are string-safe
   * for that format, but day arithmetic uses UTC to avoid DST drift.
   * --------------------------------------------------------------- */
  CC.addDays = function (isoDate, days) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const t = Date.UTC(y, m - 1, d) + days * 86400000;
    const dt = new Date(t);
    const pad = (n) => String(n).padStart(2, "0");
    return dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate());
  };

  CC.daysOverdue = function (loan, todayIso) {
    if (loan.returnedDate) return 0;
    if (!loan.dueDate || !todayIso) return 0;
    const toUTC = (iso) => {
      const [y, m, d] = iso.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };
    const diff = Math.floor((toUTC(todayIso) - toUTC(loan.dueDate)) / 86400000);
    return diff > 0 ? diff : 0;
  };

  CC.activeLoan = function (book) {
    const circ = Array.isArray(book.circulation) ? book.circulation : [];
    return circ.find((l) => !l.returnedDate) || null;
  };

  /* ---------------------------------------------------------------
   * Withdrawal (spec 3.4): archive, never delete.
   * --------------------------------------------------------------- */
  CC.withdraw = function (book, dateIso) {
    return Object.assign({}, book, { status: "withdrawn", withdrawnDate: dateIso });
  };

  CC.restore = function (book) {
    return Object.assign({}, book, { status: "active", withdrawnDate: null });
  };

  /* ---------------------------------------------------------------
   * Export envelope (spec 5.3).
   * --------------------------------------------------------------- */
  CC.buildExport = function (catalogMeta, books, nowIso) {
    return {
      schemaVersion: CC.SCHEMA_VERSION,
      instrument: CC.INSTRUMENT,
      fiNumber: CC.FI_NUMBER,
      appVersion: CC.APP_VERSION,
      nextAccession: catalogMeta.nextAccession,
      customDrawers: catalogMeta.customDrawers || [],
      exportedAt: nowIso,
      books: books
    };
  };

  /* ---------------------------------------------------------------
   * Debug logging behind a flag (standards).
   * Enable with ?debug=1 or CC.setDebug(true).
   * --------------------------------------------------------------- */
  let DEBUG = false;
  CC.setDebug = function (on) { DEBUG = !!on; };
  CC.log = function () {
    if (DEBUG && typeof console !== "undefined") {
      console.log.apply(console, ["[CARD CATALOG]"].concat(Array.from(arguments)));
    }
  };

  /* UMD-lite export: browser global plus CommonJS for any future tooling. */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CC;
  }
  root.CardCatalog = CC;
})(typeof self !== "undefined" ? self : this);
