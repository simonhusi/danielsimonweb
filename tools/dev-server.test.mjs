// Proves the dev server cannot serve a file outside its web root, and that
// normal files and directory index resolution still work.
//
// The test listens on an ephemeral port, never on the assigned development
// endpoint, so it never contends with a running dev session.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDevServer, projectRoot, resolveFile } from "./dev-server.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function listen(webRoot) {
  const server = createDevServer({ webRoot });
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

async function close(server) {
  await new Promise((resolveClose) => server.close(resolveClose));
}

// A raw request line, so the traversal is not normalized away by a client.
function rawRequest(baseUrl, target) {
  const port = Number(new URL(baseUrl).port);
  return new Promise((resolveRaw, reject) => {
    const socket = connect({ port, host: "127.0.0.1" }, () => {
      socket.write(`GET ${target} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`);
    });
    let body = "";
    socket.setTimeout(5000, () => socket.destroy(new Error("raw request timed out")));
    socket.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    socket.on("end", () => resolveRaw(body));
    socket.on("error", reject);
  });
}

// 1. The real site still works.
{
  const { server, baseUrl } = await listen(projectRoot);
  try {
    const index = await fetch(`${baseUrl}/`, { cache: "no-store" });
    assert(index.ok, `/ returned HTTP ${index.status}`);
    assert(index.headers.get("content-type")?.includes("text/html"), "/ must be served as HTML.");
    assert((await index.text()).length > 0, "/ must serve the site index.");

    const directory = await fetch(`${baseUrl}/about-me`, { cache: "no-store" });
    assert(directory.ok, `/about-me returned HTTP ${directory.status}`);
    assert(directory.headers.get("content-type")?.includes("text/html"), "A directory URL must serve its index.html.");

    const script = await fetch(`${baseUrl}/script.js`, { cache: "no-store" });
    assert(script.ok, `/script.js returned HTTP ${script.status}`);
    assert(script.headers.get("content-type")?.includes("text/javascript"), "/script.js must be served as JavaScript.");

    const missing = await fetch(`${baseUrl}/no-such-page-here`, { cache: "no-store" });
    assert(missing.status === 404, `A missing path must be 404, got ${missing.status}.`);

    const malformed = await fetch(`${baseUrl}/%zz`, { cache: "no-store" });
    assert(malformed.status === 404, `Malformed percent-encoding must be refused, got ${malformed.status}.`);
  } finally {
    await close(server);
  }
}

// 2. Nothing outside the web root can be reached, including a sibling
//    directory whose name shares the web root's prefix.
{
  const scratch = await mkdtemp(join(tmpdir(), "danielsimonweb-root-"));
  const webRoot = join(scratch, "site");
  const sibling = join(scratch, "site-backup"); // shares the "site" prefix
  await mkdir(join(webRoot, "pages"), { recursive: true });
  await mkdir(sibling, { recursive: true });
  await writeFile(join(webRoot, "index.html"), "<h1>inside</h1>", "utf8");
  await writeFile(join(webRoot, "pages", "index.html"), "<h1>pages index</h1>", "utf8");
  await writeFile(join(sibling, "secret.txt"), "SECRET-OUTSIDE-ROOT", "utf8");
  await writeFile(join(scratch, "above.txt"), "SECRET-ABOVE-ROOT", "utf8");

  const traversals = [
    "/%2e%2e/site-backup/secret.txt",
    "/%2E%2E%2Fsite-backup%2Fsecret.txt",
    "/pages/%2e%2e/%2e%2e/site-backup/secret.txt",
    "/%2e%2e/above.txt",
    "/..%5csite-backup%5csecret.txt",
    "/%2e%2e%2f%2e%2e%2fabove.txt",
    "/pages/..%2f..%2fsite-backup%2fsecret.txt",
  ];

  const { server, baseUrl } = await listen(webRoot);
  try {
    const inside = await fetch(`${baseUrl}/`, { cache: "no-store" });
    assert((await inside.text()).includes("inside"), "The web root index must still be served.");
    const pages = await fetch(`${baseUrl}/pages`, { cache: "no-store" });
    assert((await pages.text()).includes("pages index"), "A directory index inside the root must still be served.");

    for (const target of traversals) {
      const response = await fetch(`${baseUrl}${target}`, { cache: "no-store" });
      const body = await response.text();
      assert(!body.includes("SECRET-"), `${target} escaped the web root.`);
      assert(response.status === 404, `${target} must be 404, got ${response.status}.`);
    }

    for (const target of ["/../site-backup/secret.txt", "/..\site-backup\secret.txt", "/../above.txt"]) {
      const raw = await rawRequest(baseUrl, target);
      assert(!raw.includes("SECRET-"), `Raw request ${target} escaped the web root.`);
    }
  } finally {
    await close(server);
  }

  // Same containment decision at the resolver level, without HTTP in the way.
  assert(resolveFile(webRoot, "/../site-backup/secret.txt") === null, "resolveFile must reject a sibling-prefix escape.");
  assert(resolveFile(webRoot, "/../above.txt") === null, "resolveFile must reject a parent escape.");
  assert(resolveFile(webRoot, "/%zz") === null, "resolveFile must reject malformed percent-encoding.");
  assert(resolveFile(webRoot, "/index.html") !== null, "resolveFile must still resolve a file inside the root.");
  assert(resolveFile(webRoot, "/pages") !== null, "resolveFile must still resolve a directory index inside the root.");

  await rm(scratch, { recursive: true, force: true });
}

console.log("danielsimon.hu dev server containment test passed.");
