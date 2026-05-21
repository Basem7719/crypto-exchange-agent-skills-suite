#!/usr/bin/env node
// Validate all skills under skills/ have:
//   1. SKILL.md, README.md, examples.md
//   2. Valid YAML frontmatter with required fields
//   3. All 11 required sections (headings) in SKILL.md
//   4. name in frontmatter matches folder name

const fs = require("fs");
const path = require("path");

const REQUIRED_FRONTMATTER = ["name","description","version","category","compatible_with","exchanges","mode","license"];
const REQUIRED_SECTIONS = [
  "Purpose","When to Use","Required Inputs","Optional Inputs","Workflow",
  "Exchange-Specific Handling","Output Format","Handoff","Quality Checks","Edge Cases","Example Commands"
];

const root = path.resolve(__dirname, "..");
const skillsDir = path.join(root, "skills");

let ok = 0, fail = 0;
const errors = [];

for (const name of fs.readdirSync(skillsDir).sort()) {
  const dir = path.join(skillsDir, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  const localErrors = [];

  // 1. Files present
  for (const f of ["SKILL.md","README.md","examples.md"]) {
    if (!fs.existsSync(path.join(dir, f))) localErrors.push(`missing ${f}`);
  }
  if (localErrors.length) {
    errors.push({skill:name, problems:localErrors});
    fail++;
    continue;
  }

  // 2. Frontmatter
  const src = fs.readFileSync(path.join(dir,"SKILL.md"),"utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    localErrors.push("missing frontmatter");
  } else {
    const fm = {};
    for (const line of m[1].split("\n")) {
      const kv = line.split(/:\s*/);
      if (kv.length >= 2) fm[kv[0].trim()] = kv.slice(1).join(": ").trim();
    }
    for (const f of REQUIRED_FRONTMATTER) {
      if (!(f in fm)) localErrors.push(`frontmatter missing: ${f}`);
    }
    // name must match folder
    if (fm.name && fm.name.toLowerCase().replace(/['"]/g,"") !== name) {
      localErrors.push(`frontmatter name "${fm.name}" != folder "${name}"`);
    }
  }

  // 3. Required sections
  for (const sec of REQUIRED_SECTIONS) {
    const re = new RegExp(`^##+\\s+${sec.replace(/[-/]/g,"\\$&")}`, "mi");
    if (!re.test(src)) localErrors.push(`section missing: ${sec}`);
  }

  if (localErrors.length === 0) {
    ok++;
  } else {
    errors.push({skill:name, problems:localErrors});
    fail++;
  }
}

console.log(`\n${ok+fail} skills checked.`);
console.log(`  All required files present:    ${fail===0?"✓":"✗"}`);
console.log(`  All frontmatter valid:         ${fail===0?"✓":"✗"}`);
console.log(`  All 11 sections present:       ${fail===0?"✓":"✗"}`);
console.log(`  PASS: ${ok}   FAIL: ${fail}`);

if (fail > 0) {
  console.log("\nFailures:");
  for (const e of errors) {
    console.log(`  ${e.skill}:`);
    for (const p of e.problems) console.log(`    - ${p}`);
  }
  process.exit(1);
}
