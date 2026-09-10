// Jest runs in Node, not Metro, so it can't process the real Tailwind CSS output — the actual
// styling only matters for the bundled app. This stub lets `import '@/global.css'` resolve to
// nothing during tests.
module.exports = {};
