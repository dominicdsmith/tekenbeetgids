import { beforeEach, describe, expect, it, mock } from "bun:test";

type Row = { ip_hash: string; window_start: string; aantal: number };
const rows = new Map<string, Row>();
mock.module("../src/lib/bridgeHeaders.server", () => ({ bridgeHeader: () => "scan-test-ip" }));
mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: (_key: string, hash: string) => ({ maybeSingle: async () => ({ data: rows.get(hash) ?? null }) }) }),
      upsert: async (row: Row) => { rows.set(row.ip_hash, row); return { error: null }; },
    }),
  },
}));
const { fotoscanToegestaan } = await import("../src/lib/beveiliging.server");

describe("Personal allowance for each photo scan type", () => {
  beforeEach(() => rows.clear());
  it("allows one tick and one bite-site scan consecutively from the same IP", async () => {
    expect(await fotoscanToegestaan("teek")).toBe(true);
    expect(await fotoscanToegestaan("beetplek")).toBe(true);
    expect(await fotoscanToegestaan("teek")).toBe(false);
    expect(await fotoscanToegestaan("beetplek")).toBe(false);
  });
  it("also allows the bite-site scan first without consuming the tick allowance", async () => {
    expect(await fotoscanToegestaan("beetplek")).toBe(true);
    expect(await fotoscanToegestaan("teek")).toBe(true);
  });
});