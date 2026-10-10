/* VOX: a small voxel engine. It puffs any pal's pixel art up into a real 3D model, turns it,
 * lights it from wherever the pointer is, and draws it as glossy cubes, clay, a cel-shaded toy,
 * a wireframe, a hologram, or through a print style: halftone dots, ordered dither or ASCII.
 * The 3D components (voxel, card, planet, globe, holo, room) are all built on it. */

const VOX_LOOKS = ['glossy', 'clay', 'toon', 'wire', 'holo', 'halftone', 'dither', 'ascii'];
const VOX_DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const voxKey = (x, y, z) => ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);
const voxNorm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

/* the pixel rows behind a pal or a sprite, for one frame of one clip */
const voxArt = (name, clip, i = 0) => {
  const s = SPRITES[name], f = FIGURES[name];
  i = Math.max(0, i | 0);
  if (s) {
    const c = s.frames[clip] || s.frames[Object.keys(s.frames)[0]];
    return { rows: c[i % c.length], palette: s.palette, h: s.h, n: c.length, fps: (typeof s.fps === 'object' ? s.fps[clip] : s.fps) || 6 };
  }
  if (f) return { rows: f.frames[i % f.frames.length], palette: figurePalette(f), h: f.h, n: f.frames.length, fps: f.fps || 2 };
  return null;
};

