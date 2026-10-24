# Security review — 24 October 2026

## Scope and evidence

Read-only deep source review of public functions, authenticated administration, signed Cloud Run bridge, Google mirror/migration, withdrawal, photo processing and quotas. This is an assistant-assisted code review, not an independent penetration test or a fresh persisted `agent_security_v2` scan. The platform's last deep scan remains dated 19 October and stale. No exploit traffic, new participation, private record export or destructive test was used.

Production dependency advisory scan initially found DOMPurify and Zod vulnerabilities. Updated DOMPurify to 3.4.17 and all Zod resolutions to 4.6.7; repeat scan of 65 production dependencies found no known advisories. These changes are in the project, not verified as deployed to Cloud Run. Relevant behavior tests: 34 passing tests, including photos, quotas, bridge signatures, migration, mirror, PDF and update dates.

## Open findings

1. **High: public participation abuse.** `onderzoek.server.ts` has no server-enforced quota or consent validation and accepts unbounded `gegevens`. Repeated valid requests amplify source writes, Google copies and mail. Add bounded input, consent validation and atomic abuse limits before writes.
2. **High: raceable, fail-open quotas.** `beveiliging.server.ts` reads counters separately from upsert and ignores read/write errors. Parallel calls can exceed personal/global scan and assistant limits. Reserve quotas atomically and fail closed; cover other counters using the same pattern.
3. **Medium: bridge caller provenance.** `cloudBridge.server.ts` signs requests without validating caller origin, then synthesizes matching origin/host headers. Downstream same-origin checks do not establish the original caller's origin. Validate before signing; verify Google ingress IP header normalization. Browser cross-origin exploitability is not established.
4. **High: withdrawal cleanup is not durable.** `optout.server.ts` deletes source rows before best-effort Google cleanup; repeated withdrawal exits on absent source records before retrying cleanup. A failed connector can leave copies behind. Persist a withdrawal outbox/tombstone and track/retry completion per destination.
5. **Medium: stale migration/mirror writes.** Unconditional snapshot copies can recreate withdrawn data or overwrite newer state during concurrent processing. Use durable withdrawal tombstones and version checks; do not run bulk copying concurrently with live writes until protected.
6. **Medium: migration completeness.** Unpaginated source reads can hit the response row cap and compare two incomplete counts. Add deterministic pagination, independent exact counts, and ID/content verification before cutover.

These are source-level risks, not evidence that data was leaked or that a live withdrawal failed. The existing automatic database check also reports an isolated table without policies; its message states the table is fully closed, not publicly readable. Its technical identity was not exposed by the public log, so retain the warning pending privileged review.

## Confirmed protections

- HMAC binds action, body, timestamp, nonce and IP; atomic nonce claim precedes execution and protects replay.
- Bridge action allowlist, bounded body stream and filtered errors.
- Administrator checks on protected record readers, trial and migration functions.
- Secret-validated cron routes; public route placement is not the authorization boundary.
- Valid withdrawal code required for automatic deletion; registration requires participation.
- App photos are not persisted by reviewed scan paths; this does not verify provider retention.

## Data actualisation

Existing RIVM sync returned HTTP 200 and refreshed 12 province classes and 132 disease/province rows. Source check returned HTTP 200: 16 sources checked, four changed fingerprints, five unavailable (`stz`, `tekenradar`, `wur`, `cbs`, `artemis`). Source dates remain factual; fingerprint changes do not independently validate changed medical figures. The existing source checker uses UTC dates, so its check date is 23 October while the Amsterdam website update date is 24 October. TBE request initially timed out at the caller; the single retry with extended timeout returned HTTP 200, with the existing annual figures 25 (2025), 22 (2024), 8 (2023). No usable monthly figures were found, so existing monthly figures remain unchanged.

## Limitations

No independent review of deployed Google IAM/Firestore rules, ingress behavior, provider agreements, live exploit resistance or full migration correctness. Do not label the project fully secure. Pending Google single-writer cutover and external medical/MDR assessment remain separate work.