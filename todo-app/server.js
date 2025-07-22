import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Ambil semua todo dari file
function getTodos() {
  const data = fs.readFileSync("./data/todo.json", "utf-8");
  return JSON.parse(data);
}

// Simpan semua todo ke file
function saveTodos(todos) {
  fs.writeFileSync("./data/todo.json", JSON.stringify(todos, null, 2));
}

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  // Serve file statis (html, css, js)
  if (url.startsWith("/public/")) {
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    const contentType =
      {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
      }[ext] || "text/plain";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  }

  // GET /todos
  else if (url === "/todos" && method === "GET") {
    const todos = getTodos();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(todos));
  }

  // POST /todos
  else if (url === "/todos" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const todos = getTodos();
      const newTodo = JSON.parse(body);
      const lastId = todos.length > 0 ? todos[todos.length - 1].id : 0;
      newTodo.id = lastId + 1;
      todos.push(newTodo);
      saveTodos(todos);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newTodo));
    });
  }

  // PUT /todos/:id
  else if (url.startsWith("/todos/") && method === "PUT") {
    const id = Number(url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const update = JSON.parse(body);
      const todos = getTodos().map((todo) => (todo.id === id ? { ...todo, ...update } : todo));
      saveTodos(todos);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(update));
    });
  }

  // DELETE /todos/:id
  else if (url.startsWith("/todos/") && method === "DELETE") {
    const id = Number(url.split("/")[2]);
    const todos = getTodos().filter((todo) => todo.id !== id);
    saveTodos(todos);
    res.writeHead(204);
    res.end();
  }

  // Default handler
  else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
