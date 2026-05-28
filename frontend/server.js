const { createServer } = require("http");
const { parse } = require("url");
const net = require("net");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  // WebSocket upgrade を /cable だけ Rails(3001)にTCPリレー
  server.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith("/cable")) return;

    const upstream = net.connect(3001, "localhost");

    upstream.on("connect", () => {
      // HTTPアップグレードリクエストをそのままRailsに流す
      let raw = `${req.method} ${req.url} HTTP/1.1\r\n`;
      for (const [k, v] of Object.entries(req.headers)) {
        raw += `${k}: ${v}\r\n`;
      }
      raw += "\r\n";
      upstream.write(raw);
      if (head.length > 0) upstream.write(head);

      socket.pipe(upstream);
      upstream.pipe(socket);
    });

    upstream.on("error", (err) => {
      console.error("[proxy] Rails接続失敗:", err.message);
      socket.destroy();
    });

    socket.on("error", () => upstream.destroy());
  });

  server.listen(3000, () => {
    console.log("> http://localhost:3000");
  });
});
