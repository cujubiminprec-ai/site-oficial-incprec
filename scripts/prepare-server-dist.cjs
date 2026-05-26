const fs = require("fs");
const path = require("path");

const root = process.cwd();
const distDir = path.join(root, "dist");
const srcMigrations = path.join(root, "src", "db", "migrations");
const distMigrations = path.join(distDir, "db", "migrations");

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "package.json"), JSON.stringify({ type: "commonjs" }, null, 2));

if (fs.existsSync(srcMigrations)) {
  fs.mkdirSync(distMigrations, { recursive: true });
  for (const file of fs.readdirSync(srcMigrations)) {
    if (file.endsWith(".sql")) {
      fs.copyFileSync(path.join(srcMigrations, file), path.join(distMigrations, file));
    }
  }
}
