const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copySupplementsWithEnvLink(src, dest) {
  const affiliateLink = process.env.NEXT_PUBLIC_FIRST_PHORM_LINK;
  if (!affiliateLink) {
    console.error('Missing env var: NEXT_PUBLIC_FIRST_PHORM_LINK');
    console.error('Set it to your Impact affiliate URL before running the build.');
    process.exit(1);
  }

  const html = fs.readFileSync(src, 'utf8');
  const updated = html.replaceAll('__FIRST_PHORM_LINK__', affiliateLink);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, updated, 'utf8');
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

ensureDir(dist);

copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
copySupplementsWithEnvLink(
  path.join(root, 'supplements', 'index.html'),
  path.join(dist, 'supplements', 'index.html')
);
copyDir(path.join(root, 'blog'), path.join(dist, 'blog'));
copyFile(path.join(root, 'gear', 'index.html'), path.join(dist, 'gear', 'index.html'));
copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));

console.log('Build complete: dist/');
