// Checks the website source for the project's banned UI patterns.
// Run with: npm run check:ui   (exits with code 1 if anything is found)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGETS = ['client/src', 'client/index.html', 'client/public', 'server/routes', 'server/services', 'server/models'];

const RULES = [
  { name: 'em/en dash', test: /[–—]/ },
  { name: 'emoji', test: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u },
  { name: 'gradient', test: /gradient\(/ },
  { name: 'purple/violet colour', test: /#(4f46e5|4338ca|6366f1|7c3aed|8b5cf6|a855f7|a78bfa|818cf8|312e81|c7d2fe|eef2ff|1e1b4b|a5b4fc|ec4899)\b|violet|purple/i },
  { name: 'pill radius (99px / 999px / 50% on buttons)', test: /border-radius:\s*9{2,}px/ },
  { name: 'decorative animation', test: /@keyframes (float|fade-up)|animation:\s*(float|fade-up)/ },
  { name: '"Made with" / "Built with" tag', test: /made with|built with/i },
  { name: 'cursor effect', test: /cursor:\s*(none|url\()|mousemove/ },
];

function files(p) {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [full];
  return fs.readdirSync(full).flatMap((f) => files(path.join(p, f)));
}

let problems = 0;
for (const file of TARGETS.flatMap(files)) {
  if (!/\.(js|jsx|css|html|svg)$/.test(file)) continue;
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const rule of RULES) {
        if (rule.test.test(line)) {
          problems++;
          console.log(`${path.relative(ROOT, file)}:${i + 1}  [${rule.name}]  ${line.trim().slice(0, 100)}`);
        }
      }
    });
}

console.log(problems ? `\n${problems} problem(s) found` : 'No banned UI patterns found');
process.exitCode = problems ? 1 : 0;
