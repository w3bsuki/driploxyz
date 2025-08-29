const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all Admin*.svelte files
const adminFiles = glob.sync('packages/ui/src/lib/Admin*.svelte');

adminFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add @reference if not present
  if (content.includes('<style>') && !content.includes('@reference')) {
    content = content.replace('<style>', '<style>\n\t@reference theme();');
  }
  
  // Replace space utilities
  content = content
    .replace(/@apply\s+([^;]*?)space-y-1([^;]*?);/g, '@apply $1flex flex-col gap-1$2;')
    .replace(/@apply\s+([^;]*?)space-y-2([^;]*?);/g, '@apply $1flex flex-col gap-2$2;')
    .replace(/@apply\s+([^;]*?)space-y-3([^;]*?);/g, '@apply $1flex flex-col gap-3$2;')
    .replace(/@apply\s+([^;]*?)space-y-4([^;]*?);/g, '@apply $1flex flex-col gap-4$2;')
    .replace(/@apply\s+([^;]*?)space-y-6([^;]*?);/g, '@apply $1flex flex-col gap-6$2;')
    .replace(/@apply\s+([^;]*?)space-y-8([^;]*?);/g, '@apply $1flex flex-col gap-8$2;')
    .replace(/@apply\s+([^;]*?)space-x-1([^;]*?);/g, '@apply $1flex gap-1$2;')
    .replace(/@apply\s+([^;]*?)space-x-2([^;]*?);/g, '@apply $1flex gap-2$2;')
    .replace(/@apply\s+([^;]*?)space-x-3([^;]*?);/g, '@apply $1flex gap-3$2;')
    .replace(/@apply\s+([^;]*?)space-x-4([^;]*?);/g, '@apply $1flex gap-4$2;');
  
  fs.writeFileSync(file, content);
  console.log('Fixed:', file);
});

console.log('Done!');