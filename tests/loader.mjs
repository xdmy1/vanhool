// Module resolve hook for `npm test` (node --test, no bundler):
//   • maps the tsconfig alias "@/x" onto the repo root,
//   • completes extensionless relative/alias imports to the .ts file,
//   • tags TypeScript files so Node's type stripping handles them.
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXTS = [".ts", ".tsx", ".mts", ".js", ".mjs"];

function findFile(base) {
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of EXTS) if (existsSync(base + ext)) return base + ext;
  for (const ext of EXTS) {
    const idx = path.join(base, "index" + ext);
    if (existsSync(idx)) return idx;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  // The test files themselves arrive as absolute paths / file URLs.
  if (/\.(ts|tsx|mts)$/.test(specifier)) {
    if (specifier.startsWith("file:")) {
      return { url: specifier, shortCircuit: true, format: "module-typescript" };
    }
    if (path.isAbsolute(specifier) && existsSync(specifier)) {
      return { url: pathToFileURL(specifier).href, shortCircuit: true, format: "module-typescript" };
    }
  }
  let base = null;
  if (specifier.startsWith("@/")) {
    base = path.join(ROOT, specifier.slice(2));
  } else if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (base) {
    const file = findFile(base);
    if (file) {
      const ts = /\.(ts|tsx|mts)$/.test(file);
      return {
        url: pathToFileURL(file).href,
        shortCircuit: true,
        ...(ts ? { format: "module-typescript" } : {}),
      };
    }
  }
  return nextResolve(specifier, context);
}
