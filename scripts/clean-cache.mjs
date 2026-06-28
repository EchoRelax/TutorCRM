import { rmSync } from "node:fs";
import { resolve } from "node:path";

const targets = [".next", ".tsbuildinfo"];
for (const target of targets) {
  rmSync(resolve(process.cwd(), target), { recursive: true, force: true });
}
console.log("✓ Кэш .next очищен");
