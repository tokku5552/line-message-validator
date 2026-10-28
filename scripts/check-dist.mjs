// Checks the built Chrome extension after `yarn build`.
// A Next.js update can change the static export in ways that still build but
// break the popup: absolute asset paths, inline scripts blocked by the MV3
// content security policy, or missing files referenced by manifest.json.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const extensionsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "extensions"
);
const manifest = JSON.parse(
  readFileSync(join(extensionsDir, "manifest.json"), "utf8")
);

// Files referenced by manifest.json must exist in the build output.
const popupPath = join(extensionsDir, manifest.action.default_popup);
const iconPath = join(extensionsDir, manifest.action.default_icon);
assert.ok(existsSync(popupPath), `popup not found: ${popupPath}`);
assert.ok(existsSync(iconPath), `icon not found: ${iconPath}`);

const html = readFileSync(popupPath, "utf8");
const popupDir = dirname(popupPath);

// Every asset must be referenced relatively and exist next to the popup.
const assets = [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)].map(
  (match) => match[1]
);
assert.ok(assets.length > 0, "popup references no assets");
for (const asset of assets) {
  assert.ok(
    asset.startsWith("./"),
    `asset is not a relative path (check assetPrefix): ${asset}`
  );
  const assetPath = join(popupDir, asset.split(/[?#]/)[0]);
  assert.ok(existsSync(assetPath), `asset not found: ${assetPath}`);
}

// Manifest V3 forbids inline executable scripts. JSON data blocks are fine.
const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/g)]
  .map((match) => match[1])
  .filter((attributes) => !/type="application\/json"/.test(attributes));
assert.deepEqual(
  inlineScripts,
  [],
  "popup contains inline scripts that MV3 CSP blocks"
);

console.log(`check-dist: OK (${assets.length} assets)`);
