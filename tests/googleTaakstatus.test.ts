import { describe, expect, it } from "vitest";
import { beoordeelTaak } from "../src/lib/google-taakstatus";

const basis = { taak: "x", schema_cron: "* * * * *", actief: true, laatste_status: "succeeded", laatste_start: null, laatste_einde: null, mislukt_7d: "0", runs_7d: "7" };
describe("taakstatus-oordeel", () => {
  it("geslaagd zonder mislukkingen", () => expect(beoordeelTaak(basis, "t").oordeel).toBe("ok"));
  it("fout bij mislukte run in 7 dagen", () => expect(beoordeelTaak({ ...basis, mislukt_7d: "1" }, "t").oordeel).toBe("fout"));
  it("fout als laatste run niet geslaagd is", () => expect(beoordeelTaak({ ...basis, laatste_status: "failed" }, "t").oordeel).toBe("fout"));
  it("uitgeschakelde taak", () => expect(beoordeelTaak({ ...basis, actief: false }, "t").oordeel).toBe("inactief"));
});
