// 3D: pals as real 3D models, built on the voxel engine in src/elements/vox.js.
// Rendered by scripts/docs.mjs into components/3d.html, and into the shadcn registry.
//
// Each entry: id, tag, accent, desc, attrs [[name, what]], api, events, hab (live demo), code, tall.

const LOOKS = 'glossy | clay | toon | wire | holo | halftone | dither | ascii';
const center = (inner, bg = '') => `<div class="h3d"${bg ? ` style="background:${bg}"` : ''}>${inner}</div>`;

export const STUDIO = [
  {
    id: 'voxel', tag: 'piix-voxel', accent: 'var(--lime)', tall: true,
    desc: 'Any pal as a 3D toy you can spin. Its pixel art is puffed up into real voxels, thick in the middle and thin at the edges like a soft vinyl figure. Drag it to spin it, the light follows your pointer, a tap makes it hop, and it plays its animation in 3D. Eight looks: glossy, clay, cel-shaded toon, wireframe, hologram, and three print styles drawn live from the 3D model: halftone dots, ordered dither and ASCII.',
    attrs: [['pal', 'any pal or sprite name (default bitbug)'], ['look', LOOKS + ' (default glossy)'], ['size', 'width in px (default 200)'], ['spin', 'turns a minute when nobody holds it, 0 to stay still (default 6)'], ['depth', 'how puffy, 1–6 (default 3)'], ['clip', 'which animation to play'], ['tilt', 'how far you look down on it, in degrees (default 22)'], ['light', 'pointer or fixed (default pointer)'], ['floor', '"none" hides the shadow']],
    events: 'piix:poke',
    hab: center('<piix-voxel pal="bitbug" size="150"></piix-voxel><piix-voxel pal="frog" look="toon" size="150"></piix-voxel><piix-voxel pal="whale" look="halftone" size="150"></piix-voxel><piix-voxel pal="penguin" look="dither" size="150"></piix-voxel>'),
    code: '<piix-voxel pal="bitbug"></piix-voxel>\n<piix-voxel pal="frog" look="toon"></piix-voxel>\n<piix-voxel pal="whale" look="halftone"></piix-voxel>'
  },
  {
    id: 'card', tag: 'piix-card', accent: 'var(--coral)', tall: true,
    desc: 'A holographic trading card for any pal. It tilts toward your pointer, a rainbow foil slides across it as it turns, and the pal stands in 3D in front of the card, slowly turning. Each card has its number in the set, a type, a line about what that pal does, and a rarity. Drag the pal to spin it.',
    attrs: [['pal', 'any pal or sprite name (default bitbug)'], ['rarity', 'common, rare or holo; holo has the foil (default holo)'], ['look', 'how the pal is drawn: ' + LOOKS], ['size', 'card width in px; it is 1.4 times as tall (default 240)'], ['color', 'the card colour (default: picked from the pal)']],
    events: 'piix:poke',
    hab: center('<piix-card pal="frog" size="160"></piix-card><piix-card pal="whale" size="160" rarity="rare"></piix-card>'),
    code: '<piix-card pal="frog"></piix-card>\n<piix-card pal="whale" rarity="rare"></piix-card>'
  },
  {
    id: 'planet', tag: 'piix-planet', accent: 'var(--sky)', tall: true,
    desc: 'A tiny voxel world with pals walking round it: seas, beaches, grass, hills with snow on top and little trees, with a soft atmosphere round the edge. The pals walk over the horizon and come back round. Every seed is a different world. Drag to spin it.',
    attrs: [['pals', 'comma-separated pal names (default bitbug,frog,penguin)'], ['seed', 'a number: a different world for each (default 7)'], ['size', 'width in px (default 260)'], ['spin', 'turns a minute when idle (default 3)'], ['look', LOOKS]],
    hab: center('<piix-planet size="330"></piix-planet>', '#17121f'),
    code: '<piix-planet pals="bitbug,frog,penguin"></piix-planet>'
  },
  {
    id: 'globe', tag: 'piix-globe', accent: 'var(--violet)', tall: true,
    desc: 'A pal in a snow globe. Drag it about or tap it to shake it: the snow flies up, swirls round the 3D pal inside and settles back on the drift. Night, dusk or day sky.',
    attrs: [['pal', 'any pal or sprite name (default penguin)'], ['sky', 'night, dusk or day (default night)'], ['snow', 'how many flakes, 20–300 (default 140)'], ['size', 'width in px (default 220)'], ['look', 'how the pal is drawn']],
    api: 'el.shake()', events: 'piix:poke',
    hab: center('<piix-globe size="160"></piix-globe><piix-globe pal="frog" sky="dusk" size="160"></piix-globe>'),
    code: '<piix-globe pal="penguin"></piix-globe>'
  },
  {
    id: 'holo', tag: 'piix-holo', accent: 'var(--mint)', tall: true,
    desc: 'A pal projected as a hologram. A little puck throws a cone of light and the pal hangs in it in scanlines, turning slowly, bobbing, flickering and glitching sideways now and then. Best on a dark background.',
    attrs: [['pal', 'any pal or sprite name (default astronaut)'], ['color', 'cyan, lime, pink or amber (default cyan)'], ['size', 'width in px (default 220)'], ['look', 'how the pal is drawn (default holo)']],
    hab: center('<piix-holo size="160"></piix-holo><piix-holo pal="bitbug" color="lime" size="160"></piix-holo>', '#100c16'),
    code: '<piix-holo pal="astronaut"></piix-holo>'
  },
  {
    id: 'room', tag: 'piix-room', accent: 'var(--sun)', tall: true,
    desc: 'A little isometric voxel diorama with a pal living in it: a desk with a glowing monitor, a pond island, a bedroom at night with the lamp on. It leans toward your pointer and the light follows it. Lovely for empty states, 404 pages and about sections.',
    attrs: [['scene', 'desk, pond or night (default desk)'], ['pal', 'who lives there (default termi, frog or shibe)'], ['size', 'width in px (default 300)'], ['look', 'glossy, clay, toon, wire, halftone, dither or ascii (default clay)']],
    hab: center('<piix-room scene="desk" size="160"></piix-room><piix-room scene="pond" size="160"></piix-room><piix-room scene="night" size="160"></piix-room>'),
    code: '<piix-room scene="desk"></piix-room>\n<piix-room scene="pond"></piix-room>\n<piix-room scene="night"></piix-room>'
  }
];
