import { createFileRoute } from "@tanstack/react-router";

/** Prepared replacement; deliberately not scheduled until cutover and recovery proof. */
export const Route = createFileRoute("/api/public/hooks/google-backup-export")({
  server: { handlers: { POST: async ({ request }) => {
    const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
    if (!(await isGeldigeCronAanroep(request))) return Response.json({ ok: false }, { status: 401 });
    if (process.env["GOOGLE_BACKUP_ENABLED"] !== "verified-cutover") return Response.json({ ok: false, message: "Google-back-up nog niet geactiveerd" }, { status: 409 });
    try {
      const wachtzin = process.env["BACKUP_WACHTZIN"] ?? "";
      if (wachtzin.length < 12) throw new Error("Back-upsleutel ontbreekt");
      const { maakMigratieTransport } = await import("@/lib/firebase-migratie.server");
      const { leesGoogleMomentopname, versleutelGoogleExport } = await import("@/lib/google-administratie");
      const snapshot = await leesGoogleMomentopname(maakMigratieTransport());
      const gemaakt = new Date().toISOString();
      const bestand = await versleutelGoogleExport({ gemaakt_op: gemaakt, ...snapshot }, wachtzin);
      const naam = `backup-${gemaakt.slice(0, 16).replace(/[:T]/g, "-")}.json.enc`;
      const { uploadBackup } = await import("@/lib/werkkopie.server");
      await uploadBackup(naam, bestand, 12);
      const { verstuurBeheerMelding } = await import("@/lib/contact-mail.server");
      const gemeld = await verstuurBeheerMelding("Google-back-up opgeslagen", [naam]);
      return Response.json({ ok: true, bestand: naam, aantallen: snapshot.aantallen, gemeld }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      console.error("Google-back-up niet afgerond");
      return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});