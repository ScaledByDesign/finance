const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon for Finance app
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
  
  <!-- Dollar sign -->
  <g transform="translate(256,256)">
    <!-- Vertical line -->
    <rect x="-8" y="-180" width="16" height="360" fill="white" rx="8"/>
    
    <!-- Top curve -->
    <path d="M -80,-120 Q -80,-160 -40,-160 L 40,-160 Q 80,-160 80,-120 Q 80,-80 40,-80 L -40,-80" 
          stroke="white" stroke-width="16" fill="none" stroke-linecap="round"/>
    
    <!-- Bottom curve -->
    <path d="M 80,120 Q 80,160 40,160 L -40,160 Q -80,160 -80,120 Q -80,80 -40,80 L 40,80" 
          stroke="white" stroke-width="16" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- Chart elements -->
  <g transform="translate(100,350)">
    <rect x="0" y="0" width="20" height="60" fill="white" opacity="0.8" rx="4"/>
    <rect x="30" y="-20" width="20" height="80" fill="white" opacity="0.8" rx="4"/>
    <rect x="60" y="-40" width="20" height="100" fill="white" opacity="0.8" rx="4"/>
    <rect x="90" y="-10" width="20" height="70" fill="white" opacity="0.8" rx="4"/>
  </g>
  
  <!-- Coins -->
  <circle cx="400" cy="150" r="25" fill="white" opacity="0.9"/>
  <circle cx="430" cy="130" r="20" fill="white" opacity="0.7"/>
  <circle cx="450" cy="170" r="15" fill="white" opacity="0.5"/>
</svg>
`;

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');

// For now, we'll create a simple HTML file that can be used to generate icons
const htmlGenerator = `
<!DOCTYPE html>
<html>
<head>
    <title>PWA Icon Generator</title>
    <style>
        canvas { border: 1px solid #ccc; margin: 10px; }
        .icon-container { display: inline-block; text-align: center; margin: 10px; }
    </style>
</head>
<body>
    <h1>Finance PWA Icons</h1>
    <div id="icons"></div>
    
    <script>
        const svgIcon = \`${svgIcon}\`;
        const sizes = ${JSON.stringify(sizes)};
        
        function generateIcon(size) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            const svgBlob = new Blob([svgIcon], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                
                // Create download link
                canvas.toBlob(function(blob) {
                    const link = document.createElement('a');
                    link.download = \`icon-\${size}x\${size}.png\`;
                    link.href = URL.createObjectURL(blob);
                    link.textContent = \`Download \${size}x\${size}\`;
                    
                    const container = document.createElement('div');
                    container.className = 'icon-container';
                    container.appendChild(canvas);
                    container.appendChild(document.createElement('br'));
                    container.appendChild(link);
                    
                    document.getElementById('icons').appendChild(container);
                });
                
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        }
        
        sizes.forEach(generateIcon);
    </script>
</body>
</html>
`;

// Save the HTML generator
fs.writeFileSync(path.join(iconsDir, 'generator.html'), htmlGenerator);

// Create a simple fallback icon (base64 encoded 1x1 pixel)
const fallbackIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create placeholder icon files (these should be replaced with actual icons)
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a simple colored square as placeholder
    const canvas = require('canvas');
    const canvasInstance = canvas.createCanvas(size, size);
    const ctx = canvasInstance.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add simple dollar sign
    ctx.fillStyle = 'white';
    ctx.font = \`bold \${size * 0.6}px Arial\`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', size / 2, size / 2);
    
    // Save as PNG
    const buffer = canvasInstance.toBuffer('image/png');
    fs.writeFileSync(iconPath, buffer);
    
    console.log(\`Generated icon: \${size}x\${size}\`);
  }
});

console.log('PWA icons generated successfully!');
console.log(\`Open \${path.join(iconsDir, 'generator.html')} in a browser to generate high-quality icons.\`);
