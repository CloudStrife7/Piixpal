// 3D: pals as real 3D models, built on the voxel engine in src/elements/vox.js.
// Rendered by scripts/docs.mjs into components/3d.html, and into the shadcn registry.
//
// Each entry: id, tag, accent, desc, attrs [[name, what]], api, events, hab (live demo), code, tall.

const LOOKS = 'glossy | clay | toon | wire | holo | halftone | dither | ascii';
const center = (inner, bg = '') => `<div class="h3d"${bg ? ` style="background:${bg}"` : ''}>${inner}</div>`;

