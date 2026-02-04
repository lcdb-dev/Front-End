# ISR + Build Status Tracker (Updated: 2026-02-04)

## Completed

- [x] Repo cleanup done and pushed to GitHub (`master`, commit `8f5abcd`).
- [x] Astro set to pure static output (`astro.config.mjs` -> `output: 'static'`).
- [x] ISR workflow aligned to Payload dispatch event (`payload-update`).
- [x] Scaleway deploy workflow added (`.github/workflows/deploy-scaleway.yml`).
- [x] JSON prep helper added (`scripts/build-prepared-articles.mjs` + `npm run build:prepared`).
- [x] Safe cleanup checklist added (`SAFE-CLEANUP-DEPLOY-CHECKLIST.md`).

## Pending For Staging Demo

- [ ] Set staging cap: `MAX_SSG_ARTICLES=500`.
- [ ] Add Arabic must-have slugs in `INCLUDE_SLUGS`.
- [ ] Verify GitHub Secrets: `MONGODB_URI`, `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, `SCW_BUCKET` (+ optional `SCW_REGION`, `SCW_ENDPOINT`).
- [ ] Verify GitHub Variables: `MAX_SSG_ARTICLES`, `INCLUDE_SLUGS` (+ optional `USE_LOCAL_JSON`).
- [ ] Verify Payload env (`payload-admin/.env`): `GITHUB_DISPATCH_TOKEN` and `FORCE_WEBHOOKS=true` (for non-prod testing).
- [ ] Make one content update in Payload and confirm `repository_dispatch` (`payload-update`) is received.
- [ ] Confirm ISR workflow runs successfully and uploads `dist/` to Scaleway.
- [ ] Smoke test staging:
  - [ ] Arabic slug pages load (no 404).
  - [ ] Article title/content/excerpt/image render correctly.
  - [ ] Home and article listing pages load.
  - [ ] Search page works with latest index.

## Pending For Production

- [ ] If staging passes, raise cap to 5000 (or final agreed number) and rerun pipeline.
- [ ] Send Leo final message with staging/prod URL and what was included in the 500 test run.

## Optional One-Time Full Static Build (JSON Mode)

- [ ] Set `USE_LOCAL_JSON=1`.
- [ ] Set `MAX_SSG_ARTICLES=6000`.
- [ ] Fill `INCLUDE_SLUGS` from `ar-slugs.csv` (if needed).
- [ ] Run `npm run build`.
- [ ] Set `USE_LOCAL_JSON=0` after build (back to normal Mongo ISR rebuild flow).
