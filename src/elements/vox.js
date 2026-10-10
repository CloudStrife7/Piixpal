/* VOX: a small voxel engine. It puffs any pal's pixel art up into a real 3D model, turns it,
 * lights it from wherever the pointer is, and draws it as glossy cubes, clay, a cel-shaded toy,
 * a wireframe, a hologram, or through a print style: halftone dots, ordered dither or ASCII.
 * The 3D components (voxel, card, planet, globe, holo, room) are all built on it. */

const VOX_LOOKS = ['glossy', 'clay', 'toon', 'wire', 'holo', 'halftone', 'dither', 'ascii'];
const VOX_DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const voxKey = (x, y, z) => ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);
const voxNorm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

