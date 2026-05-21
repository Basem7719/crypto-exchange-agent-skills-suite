#!/usr/bin/env node
// Scaffold a new skill from templates/skill/.
// Usage: node scripts/create-new-skill.js --name foo --category data --mode analysis --purpose "..."
const fs = require("fs");
const path = require("path");

const args = {};
for (let i=2; i<process.argv.length; i++) {
  const k = process.argv[i];
  if (k.startsWith("--")) args[k.slice(2)] = process.argv[i+1];
}

const name = args.name;
const category = args.category || "analysis";
const mode = args.mode || "analysis";
const purpose = args.purpose || "TODO: describe the purpose of this skill in one sentence.";

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Usage: node scripts/create-new-skill.js --name <kebab-case-name> [--category x] [--mode y] [--purpose z]");
  process.exit(2);
}

const root = path.resolve(__dirname, "..");
const dst = path.join(root, "skills", name);
if (fs.existsSync(dst)) {
  console.error(`Skill folder already exists: ${dst}`);
  process.exit(3);
}
fs.mkdirSync(dst, {recursive:true});

const templatePath = path.join(root, "templates","skill","SKILL.template.md");
const tpl = fs.readFileSync(templatePath, "utf8")
  .replace(/{{SKILL_NAME}}/g, name)
  .replace(/{{PURPOSE}}/g, purpose)
  .replace(/{{CATEGORY}}/g, category)
  .replace(/{{MODE}}/g, mode);
fs.writeFileSync(path.join(dst, "SKILL.md"), tpl);

fs.writeFileSync(path.join(dst, "README.md"),
  `# ${name}\n\n> ${purpose}\n\nSee [\`SKILL.md\`](./SKILL.md) for the full spec and [\`examples.md\`](./examples.md) for copy-paste commands.\n`
);
fs.writeFileSync(path.join(dst, "examples.md"),
  `# ${name} — examples\n\n\`\`\`\n/${name} TODO\n\`\`\`\n\nArabic:\n\n\`\`\`\n/${name} TODO\n\`\`\`\n`
);

console.log(`✓ Created skill: skills/${name}/`);
console.log(`  Now run: node scripts/validate-skills.js  &&  node scripts/generate-skill-index.js`);
