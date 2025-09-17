#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for each size
const createSVGIcon = (size) => {
  const radius = size * 0.15;
  const dollarSize = size * 0.4;
  const chartBarWidth = size * 0.03;
  const chartBarSpacing = size * 0.02;
  
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#grad${size})"/>
  
  <!-- Dollar sign -->
  <text x="${size/2}" y="${size/2 + dollarSize/3}" 
        font-family="Arial, sans-serif" 
        font-size="${dollarSize}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle">$</text>
  
  <!-- Chart bars -->
  <g transform="translate(${size * 0.15}, ${size * 0.8})">
    <rect x="0" y="-${size * 0.1}" width="${chartBarWidth}" height="${size * 0.1}" fill="white" opacity="0.8" rx="2"/>
    <rect x="${chartBarWidth + chartBarSpacing}" y="-${size * 0.15}" width="${chartBarWidth}" height="${size * 0.15}" fill="white" opacity="0.8" rx="2"/>
    <rect x="${2 * (chartBarWidth + chartBarSpacing)}" y="-${size * 0.2}" width="${chartBarWidth}" height="${size * 0.2}" fill="white" opacity="0.8" rx="2"/>
    <rect x="${3 * (chartBarWidth + chartBarSpacing)}" y="-${size * 0.12}" width="${chartBarWidth}" height="${size * 0.12}" fill="white" opacity="0.8" rx="2"/>
  </g>
  
  <!-- Coins decoration -->
  <circle cx="${size * 0.8}" cy="${size * 0.25}" r="${size * 0.04}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.85}" cy="${size * 0.2}" r="${size * 0.03}" fill="white" opacity="0.7"/>
  <circle cx="${size * 0.9}" cy="${size * 0.3}" r="${size * 0.025}" fill="white" opacity="0.5"/>
</svg>`.trim();
};

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Creating Finance PWA Icons...');

const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created SVG icon: ${size}x${size}`);
});

// Create a master SVG icon
const masterSVG = createSVGIcon(512);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), masterSVG);

console.log('🎉 All Finance PWA icons created successfully!');
console.log('📝 Note: For production, convert SVG icons to PNG using an online converter or image processing tool.');
console.log('🌐 You can use the generate-icons.html file in the icons directory to create PNG versions.');

// Create a simple README for the icons
const readme = `# Finance PWA Icons

This directory contains the Progressive Web App icons for the Finance application.

## Icon Sizes
- 72x72px - Small icon
- 96x96px - Standard icon
- 128x128px - Chrome extension
- 144x144px - Windows tile
- 152x152px - iOS touch icon
- 192x192px - Android icon
- 384x384px - Large icon
- 512x512px - Splash screen icon

## Design
- Blue gradient background (#3B82F6 to #1E40AF)
- White dollar sign ($) symbol
- Small chart bars for financial context
- Decorative coins
- Rounded corners for modern look

## Usage
These icons are referenced in the manifest.json file and used by browsers and operating systems when the PWA is installed.

## Converting to PNG
For better compatibility, convert the SVG icons to PNG format:
1. Open generate-icons.html in a browser
2. Click "Generate All Icons" 
3. Download the PNG versions
4. Replace the existing PNG files

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme);
console.log('📚 Created README.md with icon documentation');
