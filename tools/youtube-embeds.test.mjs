// Proves the site never talks to YouTube just because someone opened a page.
//
// The privacy notice tells visitors that embedded third-party content may
// receive technical data about them, so that contact has to be something they
// choose: no page may ship a YouTube player, every video frame has to ship a
// local placeholder the visitor activates, and the player we build on
// activation has to use YouTube's privacy-enhanced host.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { projectRoot } from "./dev-server.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const skippedDirs = new Set([".git", "node_modules", "_local"]);
const youtubeHost = /(?:^|\/\/|\.)(?:youtube\.com|youtube-nocookie\.com|youtube-ui\.l\.google\.com)\//i;

// Frame containers that used to hold an eagerly loaded player, mapped to the
// markup that now has to stand in for one until the visitor asks.
const deferredFrames = [
  { container: "showreel-embed-wrap", activation: "data-yt-consent" },
  { container: "af-youtube-widget__frame-wrap", activation: "data-yt-consent" },
  { container: "ds-feature-media", activation: "ds-feature-media__launch" },
];

async function htmlFiles(dir, found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skippedDirs.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(path, found);
    else if (/\.html?$/i.test(entry.name)) found.push(path);
  }
  return found;
}

// Returns each `<div>` carrying `className`, from its opening tag to its
// matching close, so a check can look inside one frame rather than the page.
function divsWithClass(markup, className) {
  const blocks = [];
  const opening = new RegExp(`<div\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, "gi");
  for (const match of markup.matchAll(opening)) {
    let depth = 1;
    let cursor = match.index + match[0].length;
    const tag = /<div\b[^>]*>|<\/div\s*>/gi;
    tag.lastIndex = cursor;
    for (let next = tag.exec(markup); next && depth > 0; next = tag.exec(markup)) {
      depth += next[0].startsWith("</") ? -1 : 1;
      cursor = tag.lastIndex;
    }
    blocks.push(markup.slice(match.index, cursor));
  }
  return blocks;
}

const pages = await htmlFiles(projectRoot);
assert(pages.length > 0, "No HTML pages were found to check.");

const shippedPlayers = [];
const unguardedFrames = [];
let checkedFrames = 0;

for (const page of pages) {
  const markup = await readFile(page, "utf8");
  const name = page.slice(projectRoot.length);

  // `src` is what the browser fetches on load; `href` links are the visitor's
  // own click and stay allowed.
  for (const match of markup.matchAll(/\bsrc\s*=\s*"([^"]*)"/gi)) {
    if (youtubeHost.test(match[1])) shippedPlayers.push(`${name} -> ${match[1]}`);
  }

  for (const { container, activation } of deferredFrames) {
    for (const block of divsWithClass(markup, container)) {
      checkedFrames += 1;
      if (!block.includes(activation)) {
        unguardedFrames.push(`${name} -> .${container} has no ${activation}`);
      }
    }
  }
}

assert(
  shippedPlayers.length === 0,
  `Pages that load YouTube before the visitor asks:\n  ${shippedPlayers.join("\n  ")}`,
);
assert(
  unguardedFrames.length === 0,
  `Video frames without a placeholder to activate:\n  ${unguardedFrames.join("\n  ")}`,
);
assert(checkedFrames > 0, "No deferred video frames were found, so this test proved nothing.");

// Every placeholder has to be a real button, which is what makes activation
// reachable with Enter and Space rather than a mouse only.
for (const page of pages) {
  const markup = await readFile(page, "utf8");
  for (const match of markup.matchAll(/<(\w+)\b[^>]*\bdata-yt-consent\b/gi)) {
    assert(
      match[1].toLowerCase() === "button",
      `${page.slice(projectRoot.length)} uses <${match[1]}> as a video placeholder; it must be a <button>.`,
    );
  }
}

// Players built at runtime have to use the no-cookie host too.
const script = await readFile(join(projectRoot, "script.js"), "utf8");
const embedHosts = [...script.matchAll(/https:\/\/[\w.-]*youtube[\w.-]*\/embed/gi)].map((m) => m[0]);
assert(
  embedHosts.length === 0,
  `script.js builds embeds on a host other than the no-cookie one:\n  ${embedHosts.join("\n  ")}`,
);
assert(
  script.includes('const YOUTUBE_EMBED_HOST = "https://www.youtube-nocookie.com";'),
  "script.js no longer pins the no-cookie embed host.",
);

console.log(
  `danielsimon.hu YouTube embed privacy test passed (${pages.length} pages, ${checkedFrames} deferred frames).`,
);
