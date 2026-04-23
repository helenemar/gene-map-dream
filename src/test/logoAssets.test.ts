import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const codeExtensions = new Set([".html", ".ts", ".tsx", ".css", ".json", ".xml", ".txt"]);
const ignoredDirs = new Set(["node_modules", "dist", ".git"]);

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return ignoredDirs.has(entry) ? [] : collectFiles(path);
    }

    const extension = entry.slice(entry.lastIndexOf("."));
    return codeExtensions.has(extension) ? [path] : [];
  });
}

describe("logo and favicon assets", () => {
  it("uses only lightweight raster assets for the Genogy logo and favicon", () => {
    expect(existsSync(join(root, "src/assets/genogy-icon.svg"))).toBe(false);
    expect(existsSync(join(root, "public/favicon.svg"))).toBe(false);
    expect(existsSync(join(root, "src/assets/genogy-icon.webp"))).toBe(true);
    expect(existsSync(join(root, "public/icon-192.webp"))).toBe(true);
    expect(existsSync(join(root, "public/favicon-16x16.png"))).toBe(true);
    expect(existsSync(join(root, "public/favicon-32x32.png"))).toBe(true);
    expect(existsSync(join(root, "public/apple-touch-icon.png"))).toBe(true);

    const references = collectFiles(root)
      .filter((path) => !path.endsWith("logoAssets.test.ts"))
      .flatMap((path) => {
        const content = readFileSync(path, "utf8");
        return ["genogy-icon.svg", "favicon.svg"].some((needle) => content.includes(needle)) ? [path] : [];
      });

    expect(references).toEqual([]);
  });
});