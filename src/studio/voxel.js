/* VOXEL: any pal as a 3D toy you can spin.   @component voxel
 *
 *   <piix-voxel pal="bitbug"></piix-voxel>
 *
 * The pal's pixel art is puffed up into real voxels: thick in the middle, thin at the edges, like a
 * soft vinyl figure. Drag it sideways to spin it (it keeps turning when you let go), the light follows
 * your pointer, and a tap makes it hop. It plays its animation in 3D too.
 *
 *   pal     any pal or sprite name                                        default: bitbug
 *   look    glossy | clay | toon | wire | holo | halftone | dither | ascii  default: glossy
 *   size    width in px                                                    default: 200
 *   spin    turns per minute when nobody is holding it, 0 to stay still    default: 6
 *   depth   how puffy, 1–6                                                 default: 3
 *   clip    which of its animations to play                                default: its first
 *   tilt    how far you look down on it, in degrees                        default: 22
 *   light   pointer | fixed                                                default: pointer
 *   floor   "none" hides the soft shadow underneath
 *
 *   events: piix:poke */
class PiixVoxelElement extends VoxStage {
  _draw(dt, t) {
    const g = this._g, w = this._cv.width, h = this._cv.height, dpr = this._dpr;
    const first = voxArt(this.palName, this.getAttribute('clip'));
    if (!first) return;
    const art = reduced() ? first : voxArt(this.palName, this.getAttribute('clip'), Math.floor(t / 1000 * first.fps));
    const m = voxFromArt(art, clamp(+this.getAttribute('depth') || 3, 1, 6));
    const s = Math.min(w, h) * .74 / Math.max(Math.hypot(m.w, m.d), m.h), hop = this._hop(t);
    g.clearRect(0, 0, w, h);
    if (this.getAttribute('floor') !== 'none') {
      const fy = h / 2 + (m.bottom - m.cy) * s * Math.cos(this._pitch) + s * .6, k = 1 + hop / (60 * dpr);
      const gr = g.createRadialGradient(w / 2, fy, 0, w / 2, fy, m.r * s * .9 * k);
      gr.addColorStop(0, 'rgba(23,18,31,.28)'); gr.addColorStop(1, 'rgba(23,18,31,0)');
      g.save(); g.translate(w / 2, fy); g.scale(1, .28); g.translate(-w / 2, -fy); g.fillStyle = gr; g.fillRect(0, fy - m.r * s, w, m.r * s * 2); g.restore();
    }
    voxPaint(g, m, { yaw: this._yaw, pitch: this._pitch, s, x: w / 2, y: h / 2 + hop, light: this._L, look: this.look, dpr, t, persp: .012 });
  }
}
define('piix-voxel', PiixVoxelElement);
ELEMENTS.voxel = 'piix-voxel';
