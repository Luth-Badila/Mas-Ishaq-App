import http from "http";
import fs from "fs";
import path from "path";
import { db } from "./data/db.js";
import { fileURLToPath } from "url";
import formidable from "formidable";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

function serveFile(filePath, contentType, res) {
  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found: " + fullPath);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

// function serveFile(filePath, contentType, res) {
//   fs.readFile(path.join(__dirname, filePath), (err, data) => {
//     if (err) {
//       res.writeHead(404);
//       return res.end("File not found");
//     }
//     res.writeHead(200, { "Content-Type": contentType });
//     res.end(data);
//   });
// }

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  // Static file handling
  if (url === "/" || url === "/public/index.html") {
    serveFile("public/index.html", "text/html", res);
  } else if (url === "/add.html" || url === "/public/add.html") {
    serveFile("public/add.html", "text/html", res);
  } else if (url === "/edit.html" || url === "/public/edit.html") {
    serveFile("public/edit.html", "text/html", res);
  } else if (url === "../public/style.css") {
    serveFile("public/style.css", "text/css", res);
  } else if (url.startsWith("/uploads/")) {
    const ext = path.extname(url);
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
      }[ext.toLowerCase()] || "application/octet-stream";

    serveFile("." + url, contentType, res);
  } else if (url === "/api/products" && method === "GET") {
    db.query("SELECT * FROM products", (err, result) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  } else if (url === "/api/products" && method === "POST") {
    const form = formidable({ multiples: false, uploadDir: "./uploads", keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      const { name, price, description } = fields;
      const image = files.image?.newFilename;

      db.query("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)", [name, price, description, image], () => {
        res.writeHead(302, { Location: "/" });
        res.end();
      });
    });
  }
  // GET: ambil satu produk untuk edit
  else if (url.startsWith("/api/products/") && method === "GET") {
    const id = url.split("/").pop();
    db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result[0]));
    });
  }

  // POST: update produk
  // else if (url.startsWith("/api/products/") && method === "POST") {
  //   const id = url.split("/").pop();
  //   const form = formidable({ multiples: false, uploadDir: "./uploads", keepExtensions: true });

  //   form.parse(req, (err, fields, files) => {
  //     const { name, price, description, img } = fields;
  //     let image = null;
  //     if (files.image && files.image.size > 0) {
  //       image = files.image.newFilename;
  //     }

  //     const query = image ? "UPDATE products SET name=?, price=?, description=?, image=? WHERE id=?" : "UPDATE products SET name=?, price=?, description=? WHERE id=?";

  //     const values = image ? [name, price, description, img, id] : [name, price, description, id];

  //     db.query(query, values, () => {
  //       res.writeHead(302, { Location: "/" });
  //       res.end();
  //     });
  //   });
  // }
  else if (url.startsWith("/api/products/") && method === "POST") {
    const id = url.split("/").pop();
    const form = formidable({ uploadDir: "./uploads", keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500);
        return res.end("Form error: " + err.message);
      }

      const { name, price, description } = fields;
      let image = null;

      // 🔍 Cek isi files.image
      const fileImage = files.image;
      if (fileImage && fileImage[0] && fileImage[0].newFilename) {
        image = fileImage[0].newFilename;
      } else if (fileImage && fileImage.newFilename) {
        image = fileImage.newFilename;
      }

      console.log("Nama gambar yang akan dimasukkan ke DB:", image);

      const query = image ? "UPDATE products SET name=?, price=?, description=?, image=? WHERE id=?" : "UPDATE products SET name=?, price=?, description=? WHERE id=?";

      const values = image ? [name, price, description, image, id] : [name, price, description, id];

      db.query(query, values, (err) => {
        if (err) {
          console.error("SQL error:", err);
          res.writeHead(500);
          return res.end("Database error.");
        }
        res.writeHead(302, { Location: "/" });
        res.end();
      });
    });
  } else if (url.startsWith("/api/products/") && method === "DELETE") {
    const id = url.split("/").pop();
    db.query("DELETE FROM products WHERE id = ?", [id], () => {
      res.writeHead(200);
      res.end("Deleted");
    });
  } else {
    res.writeHead(404);
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
