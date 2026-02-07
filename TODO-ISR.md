# ISR + Build Status Tracker (Updated: 2026-02-07)

## Completed ✅

- [x] Pure SSG Astro build (`output: 'static'`).
- [x] Payload webhook → GitHub Action (`payload-update`) → Coolify deploy.
- [x] Prepared snapshot moved off Git LFS (no LFS budget issues).
- [x] Snapshot stored as GitHub Release (`prepared-snapshot`).
- [x] Build downloads snapshot via `PREPARED_JSON_URL`.
- [x] Build uses JSON only (`USE_LOCAL_JSON=1`, `BUILD_ONLY_ARTICLE_PAGES=1`).
- [x] Snapshot update uses ID/slug/title matching; snapshot now includes `id` + `_id`.
- [x] Disqus comments integrated (replaced Giscus).
- [x] DeepL translation API working via Astro `/api/translate`.

## Pending / Next (Frontend)

- [ ] Create static pages: MY BOOKS, SAVORY (DIRTY), SUGAR, THE WORKSHOPS, VIDEOS, TRAVEL, NEWS REPORTS, SELECTIONS.
- [ ] Footer pages: Contact, Partnership, Legal Notices, GDPR.
- [ ] My Account link → `https://atelier-lacuisinedebernard.com/mon-compte/`.
- [ ] Confirm form provider (Typeform or open-source) and integrate.
- [ ] Algolia search integration (replace current search) — planned for Monday.

## Pending / Next (Ads + Analytics)

- [ ] (Optional) Mediavine integration (global async script in layout).
- [ ] (Optional) Staging validation: script present in page source, ads load, no console errors.
- [ ] (Optional) ads.txt / privacy / GDPR checks on staging.

## Long‑term (ContentV2 Migration)

- [ ] Build legacy migration tool to convert old HTML → `contentV2` + blocks.
  - [ ] Dry-run mode.
  - [ ] Batch mode.
  - [ ] Rollback-safe logs/snapshots per article.
- [ ] Add migration safety fields: `migrationStatus`, `migrationNotes`, `legacySnapshot`.
- [ ] Migration QA workflow: compare legacy vs V2, validate images + JSON-LD.
