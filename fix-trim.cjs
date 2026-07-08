const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let changedFiles = 0;

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/\.trim\(\)/g, '');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    changedFiles++;
    console.log('Fixed: ' + filePath);
  }
});

console.log(`Fixed ${changedFiles} files`);
