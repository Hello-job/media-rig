import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

it("keeps the reusable editor independent of application features and stores", () => {
  const directory = new URL("../", `file://${__filename}`);
  const files = readdirSync(directory).filter((file) => /\.tsx?$/.test(file));
  for (const file of files) {
    const source = readFileSync(new URL(file, directory), "utf8");
    expect(source, fileURLToPath(new URL(file, directory))).not.toMatch(
      /from\s+["'][^"']*(?:features\/|state\/|zustand|@xyflow)/,
    );
  }
});
