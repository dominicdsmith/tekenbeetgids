import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");

describe("requested Cloud Run deployment rules", () => {
  it("automatically deploys pushes only on main", () => {
    expect(workflow).toMatch(/push:\s+branches: \[main\]/);
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
  });
  it("targets the requested Google project", () => {
    expect(workflow).toMatch(/^  GCP_PROJECT_ID: tekenbeetgids-vertex-ai$/m);
    expect(workflow).toContain("project_id: ${{ env.GCP_PROJECT_ID }}");
  });
  it("deploys in europe-west4", () => {
    expect(workflow).toContain("GCP_REGION: europe-west4");
    expect(workflow).toContain("region: ${{ env.GCP_REGION }}");
  });
});