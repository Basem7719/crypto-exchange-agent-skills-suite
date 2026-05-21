#!/usr/bin/env node
// Regenerate skills.json from filesystem.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const skillsDir = path.join(root, "skills");

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx+1).trim();
    if (v.startsWith("[") && v.endsWith("]")) {
      v = v.slice(1,-1).split(",").map(s => s.trim().replace(/['"]/g,""));
    }
    fm[k] = v;
  }
  return fm;
}

const skills = [];
for (const name of fs.readdirSync(skillsDir).sort()) {
  const p = path.join(skillsDir, name, "SKILL.md");
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, "utf8");
  const fm = parseFrontmatter(src);
  skills.push({
    name,
    version: fm.version || "1.0.0",
    category: fm.category || "unknown",
    mode: fm.mode || "analysis",
    exchanges: Array.isArray(fm.exchanges) ? fm.exchanges : ["binance","okx"],
    path: `skills/${name}/`,
    description: (fm.description || "").slice(0, 300)
  });
}

const out = {
  project: "crypto-exchange-agent-skills-suite",
  version: "1.0.0",
  skill_count: skills.length,
  generated_by: "scripts/generate-skill-index.js",
  skills
};
fs.writeFileSync(path.join(root,"skills.json"), JSON.stringify(out, null, 2));
console.log(`skills.json regenerated — ${skills.length} skills.`);
