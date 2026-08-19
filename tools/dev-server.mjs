// danielsimon.hu development server.
//
// The site must be served over HTTP: script.js fetches
// /assets/data/bts-gallery.json with a root-absolute path, which cannot resolve
// from file://. This is a zero-dependency Node server, so the site keeps its
// no-build, no-dependency shape.
//
// It serves the repository root and resolves directory URLs to their
// index.html, matching how the site is actually published (/about-me rather
// than /about-me/index.html). The host-based redirects in web.config and
// .htaccess are production concerns and are deliberately not reproduced here.
//
// docs/DEV_ENDPOINTS.json is the only authority for the port. The server binds
// exactly that port on loopback and fails loudly if it is taken; it never moves
// to another port.
import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const types = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".jar": "application/java-archive",
};

// Real containment, not a string prefix. `<root>-backup` shares the `<root>`
// prefix as text but is not inside the web root, and on Windows the comparison
// also has to be case-insensitive the way the file system is. path.relative
// answers both correctly: a path inside the root has a relative step that is
// neither empty-with-`..` nor absolute.
function isInside(root, target) {
  const step = relative(root, target);
  return step === "" || (!step.startsWith("..") && !isAbsolute(step));
}

function canonical(path) {
  try {
    return realpathSync.native(path);
  } catch {
    return null;
  }
}

// Resolves a request path to a file inside webRoot, or null. The returned path
// is canonical, so a symlink or junction pointing out of the root is rejected
// as well as a `..` segment.
export function resolveFile(webRoot, pathname) {
  const root = resolve(webRoot);
  const canonicalRoot = canonical(root);
  if (!canonicalRoot) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // malformed percent-encoding
  }
  if (decoded.includes("\0")) return null;

  const target = resolve(root, `.${decoded.startsWith("/") ? decoded : `/${decoded}`}`);
  if (!isInside(root, target)) return null;

  // the request itself, then the directory URL -> its index, the way the site
  // is published
  for (const candidate of [target, join(target, "index.html"), join(target, "index.htm")]) {
    if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
    const real = canonical(candidate);
    if (real && isInside(canonicalRoot, real)) return real;
  }
  return null;
}

export function createDevServer({ webRoot = projectRoot } = {}) {
  return createServer((request, response) => {
    let pathname;
    try {
      pathname = new URL(request.url, "http://127.0.0.1").pathname;
    } catch {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("400 bad request");
      return;
    }
    const file = resolveFile(webRoot, pathname);
    if (!file) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`404 ${pathname}`);
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  });
}

// Started directly: bind the assigned development endpoint. Tests import the
// factory above and listen on an ephemeral port instead, so they never touch
// the endpoint assignment.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = JSON.parse(
    readFileSync(join(projectRoot, "docs/DEV_ENDPOINTS.json"), "utf8"),
  ).endpoints.dev.port;
  const server = createDevServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is in use. docs/DEV_ENDPOINTS.json assigns it to this project; ` +
          `the dev server does not move to another port.`,
      );
      process.exit(1);
    }
    throw error;
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`danielsimon.hu dev server: http://127.0.0.1:${port}`);
  });
}
