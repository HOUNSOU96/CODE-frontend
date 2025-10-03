const fs = require("fs");
const path = require("path");

const basePath = path.resolve(__dirname); // frontend/src/pages/Maths/Test

const targets = [
  {
    folder: path.join(basePath, "Questions"),
    prefix: "Questions",
  },
  {
    folder: path.join(basePath, "Resultats"),
    prefix: "Resultats",
  },
];

for (const { folder, prefix } of targets) {
  if (!fs.existsSync(folder)) {
    console.warn(`⚠️ Dossier introuvable : ${folder}`);
    continue;
  }

  const files = fs.readdirSync(folder)
    .filter((f) => f.endsWith(".tsx") && f.startsWith(prefix));

  const exports = files.map((file) => {
    const name = path.basename(file, ".tsx");
    return `export { default as ${name} } from "./${name}";`;
  });

  const indexPath = path.join(folder, "index.ts");
  fs.writeFileSync(indexPath, exports.join("\n"), "utf8");

  console.log(`✅ index.ts généré dans : ${folder}`);
}
