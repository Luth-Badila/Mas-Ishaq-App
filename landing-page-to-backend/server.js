const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const DATA_FILE = "data.json";

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    // Jika ke halaman root atau dashboard
    if (req.url === "/") return sendFile(res, path.join(__dirname, "public/index.html"), "text/html");
    if (req.url === "/dashboard") return sendFile(res, path.join(__dirname, "public/dashboard.html"), "text/html");
    if (req.url === "/api/data") {
      fs.readFile(DATA_FILE, "utf-8", (err, data) => {
        const json = err ? [] : JSON.parse(data || "[]");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(json));
      });
      return;
    }

    // Kirim file statis dari folder public
    const extname = path.extname(req.url);
    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
    };

    const filePath = path.join(__dirname, "public", req.url);
    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  } else if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const newData = JSON.parse(body);
      fs.readFile(DATA_FILE, "utf-8", (err, content) => {
        const data = err ? [] : JSON.parse(content || "[]");
        data.push(newData);
        fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), () => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Data disimpan.");
        });
      });
    });
  } else if (req.method === "PUT" && req.url.startsWith("/api/update/")) {
    const index = parseInt(req.url.split("/").pop());
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const updated = JSON.parse(body);
      fs.readFile(DATA_FILE, "utf-8", (err, content) => {
        const data = JSON.parse(content || "[]");
        if (data[index]) data[index] = updated;
        fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), () => {
          res.writeHead(200);
          res.end("Updated");
        });
      });
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/api/delete/")) {
    const index = parseInt(req.url.split("/").pop());
    fs.readFile(DATA_FILE, "utf-8", (err, content) => {
      const data = JSON.parse(content || "[]");
      if (data[index]) data.splice(index, 1);
      fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), () => {
        res.writeHead(200);
        res.end("Deleted");
      });
    });
  } else {
    res.writeHead(404);
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
