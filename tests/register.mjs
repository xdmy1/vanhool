// Preloaded by `npm test` (--import) so every test process resolves "@/..."
// and extensionless TypeScript imports — see loader.mjs.
import { register } from "node:module";

register("./loader.mjs", import.meta.url);
