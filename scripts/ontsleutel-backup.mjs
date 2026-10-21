// Gebruik: node scripts/ontsleutel-backup.mjs backup-....json.enc "uw wachtzin" > backup.json
import { readFileSync } from "node:fs";
import { webcrypto as c } from "node:crypto";
const [, , bestand, wachtzin] = process.argv;
const e = JSON.parse(readFileSync(bestand, "utf8"));
const d = (s) => Buffer.from(s, "base64");
const basis = await c.subtle.importKey("raw", new TextEncoder().encode(wachtzin), "PBKDF2", false, ["deriveKey"]);
const k = await c.subtle.deriveKey({ name: "PBKDF2", salt: d(e.zout), iterations: e.iteraties, hash: "SHA-256" }, basis, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
process.stdout.write(new TextDecoder().decode(await c.subtle.decrypt({ name: "AES-GCM", iv: d(e.iv) }, k, d(e.data))));
