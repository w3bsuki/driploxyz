const fs = require('fs');
const path = require('path');

// Function to create an SVG at a specific size
function createSVG(size, content = 'main', bgColor = '#3b82f6') {
  const cornerRadius = Math.round(size / 4);
  
  if (content === 'main') {
    // Main Driplo icon
    return `<svg width="${size}" height="${size}" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="${bgColor}" rx="48"/>
  <g transform="translate(48, 32)">
    <!-- Stylized 'D' for Driplo -->
    <path d="M48 16C70.091 16 88 33.909 88 56V104C88 126.091 70.091 144 48 144H16V16H48ZM48 32H32V128H48C61.255 128 72 117.255 72 104V56C72 42.745 61.255 32 48 32Z" fill="white"/>
    
    <!-- Clothing hanger element -->
    <g transform="translate(8, 48)">
      <circle cx="16" cy="8" r="4" fill="white" opacity="0.8"/>
      <path d="M12 12L20 12" stroke="white" stroke-width="2" opacity="0.8"/>
      <path d="M8 16L24 16C26.209 16 28 17.791 28 20V24C28 26.209 26.209 28 24 28H8C5.791 28 4 26.209 4 24V20C4 17.791 5.791 16 8 16Z" fill="white" opacity="0.6"/>
    </g>
    
    <!-- Fashion/style dots -->
    <circle cx="20" cy="96" r="3" fill="white" opacity="0.7"/>
    <circle cx="32" cy="96" r="3" fill="white" opacity="0.7"/>
    <circle cx="44" cy="96" r="3" fill="white" opacity="0.7"/>
  </g>
</svg>`;
  } else if (content === 'search') {
    // Search icon
    return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="${bgColor}" rx="${Math.round(size / 8)}"/>
  <g transform="translate(20, 20)">
    <circle cx="22" cy="22" r="18" stroke="white" stroke-width="4" fill="none"/>
    <path d="M36 36L48 48" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <circle cx="22" cy="18" r="2" fill="white" opacity="0.6"/>
    <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.4"/>
  </g>
</svg>`;
  } else if (content === 'sell') {
    // Sell/Add icon
    return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="${bgColor}" rx="${Math.round(size / 8)}"/>
  <g transform="translate(20, 20)">
    <circle cx="28" cy="28" r="24" fill="white" opacity="0.1"/>
    <path d="M28 12V44" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <path d="M12 28H44" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <circle cx="28" cy="16" r="2" fill="white" opacity="0.6"/>
    <circle cx="28" cy="40" r="2" fill="white" opacity="0.6"/>
    <circle cx="16" cy="28" r="2" fill="white" opacity="0.6"/>
    <circle cx="40" cy="28" r="2" fill="white" opacity="0.6"/>
  </g>
</svg>`;
  } else if (content === 'messages') {
    // Messages icon
    return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="${bgColor}" rx="${Math.round(size / 8)}"/>
  <g transform="translate(16, 20)">
    <rect x="0" y="0" width="48" height="32" rx="8" fill="white" opacity="0.9"/>
    <rect x="16" y="16" width="32" height="24" rx="6" fill="white"/>
    <circle cx="24" cy="24" r="2" fill="${bgColor}"/>
    <circle cx="32" cy="24" r="2" fill="${bgColor}"/>
    <circle cx="40" cy="24" r="2" fill="${bgColor}"/>
    <path d="M32 40L28 44L36 44Z" fill="white"/>
  </g>
</svg>`;
  }
}

// Function to convert SVG to Canvas and save as PNG (browser-style approach)
function createIconFile(svgContent, filename, size) {
  const outputPath = path.join(__dirname, 'apps/web/static/icons', filename);
  
  // For now, save as SVG since we don't have a canvas library
  // In a real implementation, you'd use sharp, canvas, or similar
  const tempSvgPath = outputPath.replace('.png', '.svg');
  
  // Scale the SVG to the target size
  const scaledSvg = svgContent.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
  
  fs.writeFileSync(tempSvgPath, scaledSvg);
  
  console.log(`Created SVG: ${tempSvgPath}`);
  return tempSvgPath;
}

// Create all required icons
const iconSizes = [72, 96, 128, 152, 384, 512];
const shortcutIcons = [
  { name: 'search-96x96.png', type: 'search' },
  { name: 'sell-96x96.png', type: 'sell' },
  { name: 'messages-96x96.png', type: 'messages' }
];

// Create main app icons
iconSizes.forEach(size => {
  const svgContent = createSVG(size);
  createIconFile(svgContent, `icon-${size}x${size}.png`, size);
});

// Create shortcut icons
shortcutIcons.forEach(icon => {
  const svgContent = createSVG(96, icon.type);
  createIconFile(svgContent, icon.name, 96);
});

console.log('Icon generation complete! Note: SVG files created - convert to PNG using an online converter or image editor.');
console.log('Suggested online converters: convertio.co, cloudconvert.com');