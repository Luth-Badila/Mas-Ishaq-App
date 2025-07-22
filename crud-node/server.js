// const http = require("http");
// const fs = require("fs");
import http from "node:http";
import fs from "node:fs";
const PORT = 3000;

// Untuk membaca file JSON
function getData() {
  const data = fs.readFileSync("data.json");
  return JSON.parse(data);
}

// Untuk menyimpan ke file JSON
function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// Untuk mengambil body request
function getRequestBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    callback(JSON.parse(body));
  });
}

// Server
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = req.url;
  const method = req.method;

  // GET all
  if (url === "/items" && method === "GET") {
    const items = getData();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(items));
  }

  // POST create
  else if (url === "/items" && method === "POST") {
    getRequestBody(req, (body) => {
      const items = getData();
      //   const newItem = { id: Date.now(), name: body.name };
      const newItem = { id: body.id, name: body.name };
      items.push(newItem);
      saveData(items);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newItem));
    });
  }

  // PUT update
  else if (url.startsWith("/items/") && method === "PUT") {
    const id = parseInt(url.split("/")[2]);
    getRequestBody(req, (body) => {
      let items = getData();
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        items[index].name = body.name;
        saveData(items);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(items[index]));
      } else {
        res.writeHead(404);
        res.end("Item not found");
      }
    });
  }

  // DELETE
  else if (url.startsWith("/items/") && method === "DELETE") {
    const id = parseInt(url.split("/")[2]);
    let items = getData();
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      const deleted = items.splice(index, 1)[0];
      saveData(items);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(deleted));
    } else {
      res.writeHead(404);
      res.end("Item not found");
    }
  }

  // Route tidak ditemukan
  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Jalankan server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
