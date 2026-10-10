/* ROOM: a little isometric voxel diorama with a pal living in it.   @component room
 *
 *   <piix-room scene="desk"></piix-room>
 *
 * A tiny room built out of voxels: a desk with a glowing monitor, a pond island, a bedroom at night.
 * It leans toward your pointer, the light follows it, and things that glow keep glowing. Drag to
 * turn it round a little. Lovely for empty states, 404 pages and "about me" sections.
 *
 *   scene   desk | pond | night                          default: desk
 *   pal     who lives there                              default: termi, frog or kitty
 *   size    width in px                                  default: 300
 *   look    glossy | clay | toon | wire | halftone | dither | ascii   default: clay */
const ROOM_SCENES = {
  desk: { pal: 'termi', walls: true, amb: .5, build(b) {
    for (let x = 0; x < 20; x++) for (let z = 0; z < 20; z++) b(x, x, 0, 1, z, z, x % 4 === 0 ? [176, 118, 66] : [201, 138, 78]);
    b(0, 19, -14, -1, 0, 0, [243, 238, 227]); b(0, 0, -14, -1, 1, 19, [230, 224, 211]);
    b(11, 16, -12, -7, 1, 1, [126, 208, 255], 1); b(10, 17, -13, -13, 1, 1, [255, 253, 247]); b(10, 17, -6, -6, 1, 1, [255, 253, 247]); b(13, 13, -12, -7, 1, 1, [255, 253, 247]);
    b(2, 12, -6, -6, 2, 7, [122, 74, 42]); b(2, 2, -5, -1, 2, 2, [92, 54, 30]); b(12, 12, -5, -1, 2, 2, [92, 54, 30]); b(2, 2, -5, -1, 7, 7, [92, 54, 30]); b(12, 12, -5, -1, 7, 7, [92, 54, 30]);
    b(4, 9, -11, -7, 3, 3, [43, 36, 54]); b(5, 8, -10, -8, 4, 4, [198, 244, 50], 1); b(6, 7, -7, -7, 4, 5, [43, 36, 54]);
    b(10, 11, -8, -7, 3, 4, [255, 107, 74]); b(10, 11, -10, -9, 3, 4, [61, 158, 74]); b(11, 11, -11, -11, 4, 4, [61, 158, 74]);
    b(6, 14, 0, 0, 10, 16, [107, 76, 255]); b(7, 13, 0, 0, 11, 15, [150, 126, 255]);
    b(16, 18, -4, -1, 3, 5, [255, 210, 63]); b(16, 18, -5, -5, 3, 5, [255, 230, 140]);
  }, at: [6, 0, 13] },
  pond: { pal: 'frog', walls: false, amb: .52, build(b) {
    for (let x = 0; x < 20; x++) for (let z = 0; z < 20; z++) {
      const d = Math.hypot(x - 9.5, z - 9.5); if (d > 10.2) continue;
      const pond = Math.hypot(x - 7, z - 8) < 4.6;
      b(x, x, 0, 0, z, z, pond ? [88, 200, 255] : (x + z) % 3 ? [123, 214, 58] : [92, 184, 45], pond ? 1 : 0);
      b(x, x, 1, 3, z, z, d > 9.2 ? [138, 90, 52] : pond ? [47, 151, 214] : [158, 108, 64]);
    }
    b(5, 7, -1, -1, 9, 10, [37, 184, 154]); b(9, 10, -1, -1, 6, 6, [37, 184, 154]);
    b(14, 15, -2, -1, 13, 14, [154, 143, 122]); b(15, 15, -3, -3, 13, 13, [180, 170, 150]);
    for (const [x, z, hgt] of [[3, 12, 5], [4, 13, 4], [11, 5, 6], [12, 5, 4]]) b(x, x, -hgt, -1, z, z, [90, 160, 60]);
    b(15, 15, -5, -1, 6, 6, [138, 90, 52]); b(14, 16, -8, -6, 5, 7, [61, 158, 74]); b(15, 15, -9, -9, 6, 6, [61, 158, 74]);
    b(4, 4, -2, -2, 4, 4, [255, 107, 168]); b(16, 16, -1, -1, 11, 11, [255, 210, 63]);
  }, at: [5, -1, 9] },
  night: { pal: 'shibe', walls: true, amb: .26, build(b) {
    for (let x = 0; x < 20; x++) for (let z = 0; z < 20; z++) b(x, x, 0, 1, z, z, x % 4 === 0 ? [74, 52, 40] : [92, 66, 50]);
    b(0, 19, -14, -1, 0, 0, [53, 44, 84]); b(0, 0, -14, -1, 1, 19, [44, 36, 70]);
    b(10, 16, -12, -6, 1, 1, [28, 34, 90], 1); b(14, 15, -11, -10, 1, 1, [255, 230, 140], 1); b(11, 11, -9, -9, 1, 1, [255, 255, 255], 1); b(12, 12, -7, -7, 1, 1, [255, 255, 255], 1);
    b(2, 10, -3, -2, 2, 11, [255, 253, 247]); b(2, 10, -4, -4, 5, 11, [88, 140, 255]); b(2, 4, -4, -4, 2, 4, [255, 253, 247]); b(2, 10, -6, -1, 1, 1, [122, 74, 42]);
    b(12, 14, -4, -1, 2, 4, [122, 74, 42]); b(13, 13, -7, -5, 3, 3, [60, 50, 40]); b(12, 14, -9, -8, 2, 4, [255, 210, 63], 1);
    b(6, 15, 0, 0, 13, 17, [180, 60, 90]);
  }, at: [4, -4, 6] }
};
class PiixRoomElement extends VoxStage {
  constructor() { super(); this._defSize = 300; this._aspect = .92; this._defSpin = 0; this._defTilt = 32; this._defLook = 'clay'; this._static = true; }
  get scene() { return ROOM_SCENES[this.getAttribute('scene')] || ROOM_SCENES.desk; }
  get palName() { return this.getAttribute('pal') || this.scene.pal; }
  _label() { return `A little voxel ${this.getAttribute('scene') || 'desk'} scene with ${this.palName} in it`; }
  _setup() {
    const sc = this.scene, vox = [];
    sc.build((x0, x1, y0, y1, z0, z1, c, e = 0) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) vox.push([x, y, z, c, e]); });
    /* the pal, as voxels, standing on the floor */
    const art = voxArt(this.palName, roomClip(this.palName));
    if (art) vox.push(...voxCells(art, 2, [sc.at[0], sc.at[1] - (art.h || art.rows.length), sc.at[2]]));
    /* later boxes win where they overlap */
    const map = new Map();
    for (const v of vox) map.set(voxKey(v[0], v[1], v[2]), v);
    this._model = voxModel([...map.values()]);
    this._yaw = -Math.PI / 4;
  }
  _draw(dt, t) {
    const g = this._g, w = this._cv.width, h = this._cv.height, m = this._model, sc = this.scene;
    if (sc.walls) this._yaw = clamp(this._yaw, -1.35, -.22);
    const sway = reduced() ? 0 : this._L[0] * .12;
    const s = Math.min(w, h) * .95 / Math.hypot(m.w, m.d);
    g.clearRect(0, 0, w, h);
    voxPaint(g, m, { yaw: this._yaw + sway, pitch: this._pitch + this._L[1] * .05, s, x: w / 2, y: h * .52 + this._hop(t) * .4, light: this._L, look: this.look, dpr: this._dpr, t, amb: sc.amb });
  }
}
/* which clip to stand a pal in: something calm */
const roomClip = n => { const f = SPRITES[n] ? Object.keys(SPRITES[n].frames) : []; return ['sleep', 'rest', 'sit', 'idle', 'typing'].find(c => f.includes(c)) || f[0]; };
define('piix-room', PiixRoomElement);
ELEMENTS.room = 'piix-room';
