import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";
import formidable from "formidable";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const htmlPath = path.join(__dirname, "public", "index.html");
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading page");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/style.css") {
    const cssPath = path.join(__dirname, "public", "style.css");
    fs.readFile(cssPath, (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
  } else if (req.url === "/upload" && req.method === "POST") {
    const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400);
        return res.end("Upload gagal");
      }

      const nama = fields.nama;
      const gambar = files.gambar;

      if (!gambar || !gambar.filepath) {
        res.writeHead(400);
        return res.end("File tidak valid");
      }

      const oldPath = gambar.filepath;
      const fileName = path.basename(oldPath); // pakai nama dari Formidable
      const newPath = path.join(uploadDir, fileName);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(err);
          return res.end("Gagal memindahkan file");
        }

        const dbPath = `uploads/${fileName}`;
        db.query("INSERT INTO files (nama, path) VALUES (?, ?)", [nama, dbPath], (err) => {
          if (err) {
            res.writeHead(500);
            return res.end("Gagal simpan ke database");
          }

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`<h3>Berhasil upload!</h3><a href="/">Kembali</a>`);
        });
      });
    });
  } else {
    res.writeHead(404);
    res.end("Halaman tidak ditemukan");
  }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
