// Root PostCSS configuration to ensure local builds don't pick up a broken global K:\ postcss.config.mjs
// We rely on Tailwind v4 via @tailwindcss/vite and Lightning CSS for transforms.
// Keep PostCSS plugins empty to avoid invalid plugin errors.
module.exports = {
  plugins: []
};
