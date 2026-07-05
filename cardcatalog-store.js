/*
 * CARD CATALOG (FI-066) — storage module
 * IndexedDB persistence. Chosen over localStorage for catalog scale:
 * structured records, no 5MB string ceiling, and async writes that
 * never block a riffle frame. Decision recorded in SPEC.md 5.4.
 *
 * DOM-free but browser-API-dependent. Testable in Node via fake-indexeddb.
 *
 * License: GPL-3.0 (see LICENSE)
 */
(function (root) {
  "use strict";

  const DB_NAME = "card-catalog";
  const DB_VERSION = 1;
  const Store = {};

  let dbPromise = null;

  function idb() {
    return (typeof root.indexedDB !== "undefined") ? root.indexedDB : null;
  }

  Store.open = function () {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const factory = idb();
      if (!factory) return reject(new Error("IndexedDB unavailable"));
      const req = factory.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", { keyPath: "accession" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  };

  function tx(db, store, mode) {
    return db.transaction(store, mode).objectStore(store);
  }
  function wrap(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /* ---- Books ---- */
  Store.getAllBooks = async function () {
    const db = await Store.open();
    return (await wrap(tx(db, "books", "readonly").getAll())) || [];
  };

  Store.putBook = async function (book) {
    const db = await Store.open();
    await wrap(tx(db, "books", "readwrite").put(book));
    return book;
  };

  Store.putBooks = async function (books) {
    const db = await Store.open();
    const os = tx(db, "books", "readwrite");
    await Promise.all(books.map((b) => wrap(os.put(b))));
    return books.length;
  };

  /* ---- Catalog meta ---- */
  const META_DEFAULTS = { key: "catalog", nextAccession: 1, customDrawers: [] };

  Store.getMeta = async function () {
    const db = await Store.open();
    const m = await wrap(tx(db, "meta", "readonly").get("catalog"));
    return Object.assign({}, META_DEFAULTS, m || {});
  };

  Store.putMeta = async function (meta) {
    const db = await Store.open();
    const record = Object.assign({}, meta, { key: "catalog" });
    await wrap(tx(db, "meta", "readwrite").put(record));
    return record;
  };

  /* ---- Import (spec 5.4) ----
   * mode "replace": wipe both stores and load the payload.
   * mode "merge": keep existing records; payload books whose accession
   * already exists are skipped and reported as conflicts.
   * nextAccession always resolves to the max of both sides. */
  Store.importCatalog = async function (payload, mode) {
    if (!payload || payload.schemaVersion !== 1 || !Array.isArray(payload.books)) {
      throw new Error("Not a CARD CATALOG export (schemaVersion 1 required)");
    }
    const db = await Store.open();
    const result = { imported: 0, skipped: 0, conflicts: [] };

    if (mode === "replace") {
      await wrap(tx(db, "books", "readwrite").clear());
      await Store.putBooks(payload.books);
      result.imported = payload.books.length;
      await Store.putMeta({
        nextAccession: payload.nextAccession || 1,
        customDrawers: payload.customDrawers || []
      });
      return result;
    }

    /* merge */
    const existing = await Store.getAllBooks();
    const have = new Set(existing.map((b) => b.accession));
    const fresh = [];
    for (const b of payload.books) {
      if (have.has(b.accession)) {
        result.skipped++;
        result.conflicts.push(b.accession);
      } else {
        fresh.push(b);
      }
    }
    await Store.putBooks(fresh);
    result.imported = fresh.length;

    const meta = await Store.getMeta();
    const maxNext = Math.max(meta.nextAccession, payload.nextAccession || 1);
    await Store.putMeta(Object.assign({}, meta, { nextAccession: maxNext }));
    return result;
  };

  /* Test support: close and delete the database. */
  Store._reset = async function () {
    if (dbPromise) { (await dbPromise).close(); dbPromise = null; }
    const factory = idb();
    if (!factory) return;
    await new Promise((resolve) => {
      const req = factory.deleteDatabase(DB_NAME);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Store;
  }
  root.CardCatalogStore = Store;
})(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : this));
