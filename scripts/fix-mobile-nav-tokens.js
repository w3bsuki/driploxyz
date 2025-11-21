/**
 * Convert all hardcoded colors in MobileNavigationDialog to Tailwind v4 tokens
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'packages', 'ui', 'src', 'lib', 'compositions', 'navigation', 'MobileNavigationDialog.svelte');

let content = fs.readFileSync(filePath, 'utf-8');

// Replacement map: hardcoded → token
const replacements = [
  // Backgrounds
  ['bg-white', 'bg-surface-base'],
  ['bg-gray-50', 'bg-surface-subtle'],
  ['bg-gray-100', 'bg-surface-muted'],
  ['hover:bg-gray-50', 'hover:bg-surface-subtle'],
  ['hover:bg-gray-100', 'hover:bg-surface-muted'],
  ['active:bg-gray-100', 'active:bg-surface-muted'],
  
  // Borders
  ['border-gray-200', 'border-border-subtle'],
  ['border-gray-300', 'border-border-default'],
  ['hover:border-gray-300', 'hover:border-border-default'],
  ['ring-gray-200', 'ring-border-subtle'],
  
  // Text colors
  ['text-gray-900', 'text-text-primary'],
  ['text-gray-700', 'text-text-secondary'],
  ['text-gray-600', 'text-text-tertiary'],
  ['text-gray-500', 'text-text-muted'],
  ['text-gray-400', 'text-text-muted'],
  
  // Red colors (keep as-is for now, but note them)
  ['bg-red-600', 'bg-status-error-solid'],
  ['text-red-600', 'text-status-error-text'],
  ['text-red-700', 'text-status-error-text'],
  ['hover:text-red-700', 'hover:text-status-error-text'],
  ['hover:bg-red-50', 'hover:bg-status-error-bg'],
  ['active:bg-red-100', 'active:bg-status-error-bg'],
  ['border-red-200', 'border-status-error-border'],
  ['hover:border-red-300', 'hover:border-status-error-border'],
  
  // Icon sizes (make more compact)
  ['w-6 h-6', 'w-5 h-5'],
  ['w-12 h-12', 'w-9 h-9'],
  ['w-10 h-10', 'w-9 h-9'],
  
  // Spacing (make more compact)
  ['py-2.5', 'py-2'],
  ['px-3 py-3', 'px-2.5 py-2.5'],
  ['gap-4', 'gap-3'],
  ['space-y-6', 'space-y-4'],
  ['pt-6', 'pt-4'],
  ['min-h-[40px]', 'min-h-[36px]'],
  ['text-base', 'text-sm'],
  ['text-2xl', 'text-xl'],
];

// Apply all replacements
replacements.forEach(([from, to]) => {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, to);
});

// Write back
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Mobile navigation tokens fixed!');
console.log('Changes applied:');
replacements.forEach(([from, to]) => {
  console.log(`  ${from} → ${to}`);
});
