const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const httpProxy = require("http-proxy");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const proxy = httpProxy.createProxyServer({ target: "http://localhost:3001" });

proxy.on("error", (err, _req, res) => {
  console.error("proxy error:", err.message);
  if (res && res.writeHead) {
    res.writeHead(502);
    res.end("Bad Gateway");
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  // WebSocket upgrade → Railsに転送
  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/cable")) {
      proxy.ws(req, socket, head);
    }
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
