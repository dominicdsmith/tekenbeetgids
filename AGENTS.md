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

- Route alpha-gal treatment recording through its dedicated option dataset and existing treatment-record fields; this excludes infection-treatment questions without changing stored record compatibility.
- Municipality boundaries live in src/data/gemeentePaths.ts and figures in src/data/gemeenteCijfers.ts, both generated from CBS open data (boundaries 2025, figures via scripts/gemeente-cijfers.py); regenerate paths and nlPaths together so layers stay aligned, and rerun the figures script on yearly CBS releases instead of a nightly sync.
- Keep species-confirmed tick findings in a source-linked dataset separate from TBE and tick-bite counts; preserve historical dates and approximate location labels because public monitoring sources do not provide a live species-level feed.
- Photo comparisons return only reviewed identifiers and labels, never medical prose. Use the shared server-only Gemini SDK helper with completion checks, provider-specific access blocks and versioned caches.
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
- Weekly backup: pg_cron calls /api/public/hooks/backup-export to export the source tables as JSON encrypted to the shared Drive Back-up folder (last 12 kept); Lovable Cloud stays the source of record. Keep server-side key derivation at or below the runtime's PBKDF2 ceiling of 100,000 iterations and store the count used inside each encrypted export, so older files stay openable.
- Keep the map header in an opaque isolated layer and reserve a minimum top status-bar inset in standalone mode; iPadOS can report zero safe-area while its status bar still overlaps fixed content.
- Assistant AI selects reviewed NL/EN answer IDs only; filter its stream into AI Elements, never expose generated prose. Clear chat on close; no storage, record access or internet tools.
- TekenbeetGids leaf share tags use its own domain and public/og-image-tekenbeetgids.jpg; a separate filename avoids overwriting the map image.
- PDFs are generated by the DOM-walking text renderer in src/lib/rapportPdf.ts (real selectable text, document language, document-order reading sequence, jsPDF only); never reintroduce canvas-screenshot PDFs (html2canvas), because they are inaccessible to screen readers. Purely visual layers (watermark, .tijdbalk, aria-hidden, absolute/fixed except .disclaimer) are skipped.

- Share AI disclosures via aiVerwerking.ts; AI and storage contracts are separate.
