<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the dedicated alpha-gal treatment dataset with existing record fields; exclude infection-treatment questions without breaking records.
- Subdirectories have their own AGENTS.md; read it before changing files there.
- Keep species-confirmed tick findings in a source-linked dataset separate from TBE and tick-bite counts; preserve historical dates and approximate location labels because public monitoring sources do not provide a live species-level feed.
- Photo comparisons use reviewed IDs/labels only and the server-only Gemini helper with completion checks, provider blocks and versioned caches. Scan steps hold pending results; ScanOvername gates answer adoption and invalidation clears derived species.
- Skin comparisons use separate reviewed templates for described features, unusable photos, absent matching features and non-skin/unreadable images, shared with reports; invalidate old caches when outcome semantics change.
- Legal pages, including the disclaimer, use JuridischPagina and React translation only, opting out of DOM translation to keep bilingual rendering stable. Keep legal source lists and automatic-check limitations in the shared bilingual BronnenToelichting component, and storage, AI-provider and contract-status disclosures in the shared VerwerkersToelichting component; this prevents differing provenance claims and divergent NL/EN explanations.
- Photos remain local until an optional Scan; keep interim snapshot photos for both report views and repeat exports until wizard reset, without durable storage. Skin photo scans require a separate per-scan confirmation naming the active AI provider before transmission; opening or cancelling confirmation never uploads a photo.
- Keep reviewed disease figures and method notes authoritative over legacy rows; national samples cannot establish provincial disease rankings. Use published local TBE evidence, never residence counts, in province-class weighting.
- Display weighted province inputs and live class thresholds through the shared KlasseUitleg component so legend, Help and province panels explain it consistently.
- Keep the published TBE area list in TBE_LOCATIES_LIJST, shown only once per disease card, so map and disease descriptions cannot drift apart.
- Display every visible content-update date and the Imprint "Update ddmmjjjj" code from the generated website-change date (PEILDATUM_AUTO / LAATSTE_UPDATE_AUTO, written by scripts/bump-assets.mjs) or the shared live data status (LAATST_BIJGEWERKT) — never the visitor's current date, never the newest changelog entry and never a hand-typed date; dates recording a real event (assessment, audit, source selection, review deadline) stay fixed.
- Keep interim guide output a fixed factual record independent of clinical answer branches, with plain time labels and score-free photo summaries; this prevents implicit triage in the logbook and its exports.
- Keep legal-document PDF controls in JuridischPagina and generate the currently rendered language locally with the shared PDF helper, without the report watermark; this keeps all legal exports consistent.
- Use the shared prescription dataset and AntibioticaKeuze for all antibiotic questions, preserving identifiers and separating other medicines; this keeps recording consistent.
- Working copies go to the shared Drive via werkkopie.server.ts; match columns by header title and delete opt-outs by participant number.
- Firebase trials use fixed server-only paths, admin checks, synthetic input and atomic commits; never call production writes, mail, AI, Drive or cron. Existing login is temporary, not migrated storage.
- Google migration: preserve writes/cron until verified cutover. Mirrors fail without blocking; log to migratie_log. Compare ID pages/counts/content; block bulk re-import. Mirrors check withdrawal markers transactionally; cleanup marks first, status requires existing rows. Google admin reads verify roles/no-store; exports use one snapshot including markers and AES-GCM/PBKDF2 100000. Replacement backup stays disabled until cutover/restore proof; neither markers nor exports authorize cutover.
- Record comparison computes complete field equality server-side and exposes only record IDs, presence and field statuses to authenticated admins, never values or secret field names; this permits diagnosis without copying sensitive records into browser state.
- Independent Google administration uses a separate Firebase in-memory session and dedicated bearer-verifying API, requiring a server-provisioned UID plus verified approved Google identity; editable Firebase profiles never grant roles and existing Cloud login stays untouched.
- Recovery drills require admin and two confirmations, upload encrypted snapshots without retention/deletion, restore create-only into unique nested herstelproeven paths, compare every row and erase/read-back-check trial records; never target live collections or the synthetic trial database, and never treat data recovery as proof of auth/code/task cutover readiness.
- Withdrawal-code migration derives legacy codes only inside the old server, stores number-bound SHA-256 fingerprints in Google after transactional participant/marker checks and admin confirmation, never exports codes/keys, and does not activate Google-only validation until verified cutover and new-code issuance are ready.
- Keep the map header in an opaque isolated layer and reserve a minimum top status-bar inset in standalone mode; iPadOS can report zero safe-area while its status bar still overlaps fixed content.
- Assistant AI selects reviewed NL/EN answer IDs only; filter its stream into AI Elements, never expose generated prose. Clear chat on close; no storage, record access or internet tools.
- TekenbeetGids share tags use its domain and public/og-image-tekenbeetgids.jpg, avoiding map-image overwrites.
- PDFs use rapportPdf.ts DOM text rendering and jsPDF, never canvas screenshots. Skip decorative layers except .disclaimer. Prepare proof Blobs before enabling export; iOS shares locally, desktop downloads, avoiding hidden-frame printing on iPhones.

- Use aiVerwerking.ts; distinguish AI/storage contracts and owner/audit evidence.
- Personal photo limits are keyed by scan type; global cost limits remain shared. Only reviewed scan-limit errors cross the bridge; other errors stay private; never auto-retry.
- Cloud Run CI uses NITRO_PRESET=node-server and ships Bun/Vite .output in a non-root Node container; secrets stay in Secret Manager, never browser builds/images.
- Pin patched transitive dependencies with root overrides; verify advisories and tests.
- Cloud Run forwards only allowlisted public actions to the Lovable-hosted cloud-backend endpoint using signed, expiring, atomically single-use requests; user-scoped admin reads remain authenticated and RLS-protected, and cron/connector execution stays on Lovable to preserve existing keys and withdrawal-code compatibility.
- Bridge actions pass rewritten origin/IP headers via request-scoped AsyncLocalStorage (bridgeHeaders.server.ts, read with bridgeHeader); never mutate immutable edge request.headers. Same-origin checks compare host (zelfdeOorsprong), never full origin URLs (Cloud Run sees http://). Cloud Run CI bundles .asset.json files into public/__l5e (scripts/cloud-run-assets.mjs); missing ones redirect to tekenrisicokaart.lovable.app, never an own domain (loop risk).
