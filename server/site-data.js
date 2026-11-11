/* Reads the bundled content in assets/js/data.js (a browser script) so the
   seed scripts start from exactly what the static site shows today. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const DATA_JS = fileURLToPath(new URL('../assets/js/data.js', import.meta.url));

export function loadSiteData() {
  const src = readFileSync(DATA_JS, 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(`${src}\n;globalThis.__out = { PROGRAMS, SPONSORS, SPORTS };`, ctx, { filename: DATA_JS });
  // Round-trip through JSON to drop the vm realm's prototypes
  return JSON.parse(JSON.stringify(ctx.__out));
}
