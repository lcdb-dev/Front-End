# ISR + Build Demo Checklist

- [ ] Set staging caps: `MAX_SSG_ARTICLES=500`, add Arabic must-have slugs in `INCLUDE_SLUGS`.
- [ ] Confirm GitHub secrets: `MONGODB_URI`, `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, `SCW_BUCKET`, optional `SCW_REGION`, `SCW_ENDPOINT`.
- [ ] Confirm repo variables: `MAX_SSG_ARTICLES`, `INCLUDE_SLUGS`, optional `USE_LOCAL_JSON`.
- [ ] Verify Payload env (`payload-admin/.env`): `GITHUB_DISPATCH_TOKEN`, and `FORCE_WEBHOOKS=true` for non-prod testing.
- [ ] Make one content update in Payload -> check `repository_dispatch` (`payload-update`) is received.
- [ ] Confirm ISR workflow runs and uploads `dist/` to Scaleway.
- [ ] Smoke test staging:
  - [ ] Arabic slug pages load (no 404).
  - [ ] Article title/content/excerpt/image render correctly.
  - [ ] Home and articles listing pages load.
  - [ ] Search page uses latest index.
- [ ] If staging passes, raise cap to 5000 (or final agreed number) and rerun for production.
- [ ] Send Leo staging URL + summary of what was included in the 500-article run.

## Optional One-Time Full Static Build

- [ ] Set `USE_LOCAL_JSON=1`.
- [ ] Set `MAX_SSG_ARTICLES=6000`.
- [ ] Fill `INCLUDE_SLUGS` from `ar-slugs.csv` (if needed).
- [ ] Run `npm run build`.
- [ ] Set `USE_LOCAL_JSON=0` afterward for normal Mongo-based ISR rebuilds.
