# Safe Cleanup + Final Deploy Checklist

## A) Safe Cleanup (Before Push)

- [ ] Ensure no credentials are committed (`.env`, tokens, passwords, private keys).
- [ ] Keep local-only assets ignored (`All Articles/`, `prepared-articles.json`, caches).
- [ ] Confirm only required workflows are tracked in `.github/workflows/`.
- [ ] Confirm deleted API routes are intentional for static hosting.
- [ ] Run `git status` and verify only expected files are modified.

## B) Final Git Push

- [ ] `git add -A`
- [ ] `git commit -m "chore: clean repo and finalize scaleway ssg/isr workflows"`
- [ ] `git push lcdb-dev master`

## C) GitHub Setup (One Time)

- [ ] Secrets: `MONGODB_URI`, `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, `SCW_BUCKET`.
- [ ] Optional secrets: `SCW_REGION`, `SCW_ENDPOINT`.
- [ ] Variables: `MAX_SSG_ARTICLES`, `INCLUDE_SLUGS`, optional `USE_LOCAL_JSON`.

## D) ISR-like Rebuild Flow (Payload -> Scaleway)

- [ ] Payload `afterChange` dispatch event type is `payload-update`.
- [ ] Workflow `isr-rebuild.yml` listens to `repository_dispatch: payload-update`.
- [ ] Workflow builds static site and syncs `dist/` to Scaleway bucket.

## E) Deploy Verification

- [ ] Trigger one Payload content update.
- [ ] Verify GitHub Action run succeeds.
- [ ] Verify updated page appears on Scaleway URL.
- [ ] Verify Arabic slug pages and search page.

## F) One-Time Full Build (Optional)

- [ ] Set `USE_LOCAL_JSON=1`.
- [ ] Set `MAX_SSG_ARTICLES=6000`.
- [ ] Build and deploy once.
- [ ] Set `USE_LOCAL_JSON=0` afterward.
