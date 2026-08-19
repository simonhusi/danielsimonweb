// Proves every same-origin src/href in the site's HTML resolves to something
// that actually ships, so a page never renders a broken image or a dead link
// to a file we forgot to add.
//
// External URLs (http, mailto, tel, data, protocol-relative) are out of scope:
// they are not ours to verify offline.
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { projectRoot } from "./dev-server.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const skippedDirs = new Set([".git", "node_modules", "_local"]);
const externalRef = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

async function htmlFiles(dir, found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skippedDirs.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(path, found);
    else if (/\.html?$/i.test(entry.name)) found.push(path);
  }
  return found;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// Turns a markup reference into the file it must resolve to, or null when the
// reference is external, empty, or a bare fragment.
function referenceTarget(htmlFile, rawRef) {
  const ref = rawRef.trim();
  if (!ref || externalRef.test(ref)) return null;
  const withoutFragment = ref.split("#")[0].split("?")[0];
  if (!withoutFragment) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    return null; // malformed encoding is the dev server's problem, not ours
  }
  return decoded.startsWith("/")
    ? join(projectRoot, decoded)
    : resolve(dirname(htmlFile), decoded);
}

const pages = await htmlFiles(projectRoot);
assert(pages.length > 0, "No HTML pages were found to check.");

const broken = [];
for (const page of pages) {
  const markup = await readFile(page, "utf8");
  for (const match of markup.matchAll(/(?:src|href)\s*=\s*"([^"]*)"/gi)) {
    const target = referenceTarget(page, match[1]);
    if (target === null) continue;
    if (await exists(target)) continue;
    // A directory reference is satisfied by its index document.
    if ((await exists(join(target, "index.html"))) || (await exists(join(target, "index.htm")))) continue;
    broken.push(`${page.slice(projectRoot.length)} -> ${match[1]}`);
  }
}

assert(broken.length === 0, `Broken local references:\n  ${broken.join("\n  ")}`);

// Exactly one default document per directory, so a server's index preference
// cannot decide which version of a page the public sees.
const byDirectory = new Map();
for (const page of pages) {
  const name = page.slice(dirname(page).length + 1).toLowerCase();
  if (name !== "index.html" && name !== "index.htm") continue;
  const dir = dirname(page);
  byDirectory.set(dir, (byDirectory.get(dir) || 0) + 1);
}
const ambiguous = [...byDirectory].filter(([, count]) => count > 1).map(([dir]) => dir.slice(projectRoot.length));
assert(ambiguous.length === 0, `Directories with both index.html and index.htm:\n  ${ambiguous.join("\n  ")}`);

console.log(`danielsimon.hu local reference test passed (${pages.length} pages).`);
