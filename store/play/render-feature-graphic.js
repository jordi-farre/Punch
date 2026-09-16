// Regenerates feature-graphic.png from feature-graphic.svg. Pure SVG rendered with `sharp`
// (bundles its own libvips/librsvg) — no browser or screenshot involved, so it's reproducible
// from the command line.
//
//   npm install --no-save sharp
//   node store/play/render-feature-graphic.js
const path = require('node:path');
const sharp = require('sharp');

const dir = __dirname;

sharp(path.join(dir, 'feature-graphic.svg'))
  .flatten({ background: '#1C1B1F' }) // Play Store rejects a feature graphic with alpha
  .png()
  .toFile(path.join(dir, 'feature-graphic.png'))
  .then((info) => console.log('wrote feature-graphic.png', info));
