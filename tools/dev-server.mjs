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
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = JSON.parse(
  readFileSync(join(projectRoot, "docs/DEV_ENDPOINTS.json"), "utf8"),
).endpoints.dev.port;

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

function resolveFile(pathname) {
  const target = normalize(join(projectRoot, decodeURIComponent(pathname)));
  if (!target.startsWith(projectRoot)) return null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  // directory URL -> its index.html, the way the site is published
  for (const index of ["index.html", "index.htm"]) {
    const candidate = join(target, index);
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://127.0.0.1:${port}`);
  const file = resolveFile(pathname);
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
