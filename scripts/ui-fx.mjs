// Pixel UI docs: the smooth side. One page per <piix-fx> kind, one per image effect.
const FX = [
  ['beam', 'Laser peak', 'A bundle of laser lines striking a rocky peak in a red haze.', false,
    'Thin laser lines flicker down out of a glowing orange fog and strike a raymarched mound of rock, lighting it from above. The beams drift with the pointer. A hero for anything that should feel like an event.'],
  ['disc', 'Disc', 'A spinning disc with a diffraction rainbow sweeping across it.', true,
    'A tilted disc with microscopic grooves, a clear hub and a bright rim. As it turns, a rainbow sweeps across the surface the way light does on a real CD. The pointer tilts it.'],
  ['flame', 'Flame', 'Soft, wispy fire rising out of the dark, with drifting sparks.', false,
    'Layered flames, white-hot at the base and cooling to red at the tips, with a hint of iridescence at the edges and sparks floating up. The pointer leans the fire.'],
  ['blob', 'Liquid chrome', 'A raymarched blob of liquid metal that morphs, with a droplet that follows the pointer.', true,
    'A soft metaball of chrome, reflecting a studio of softboxes and a bright horizon line, with a thin iridescent sheen. A second droplet orbits it and a third one follows your pointer, merging into the surface like mercury.'],
  ['glass', 'Glass keycap', 'A solid-glass keycap, turning in the dark, splitting light into colour.', true,
    'Raymarched glass with real refraction, each colour bending by a slightly different amount, so the edges break into rainbows. It floats, turns, and tilts toward the pointer. Made for product heroes on black.'],
  ['podium', 'Stone podium', 'A slab of rough stone floating in a single spotlight, a stage for your product.', false,
    'A floating slab of textured rock, lit from above by a beam of light, casting a soft shadow on a dark floor. The beam follows the pointer a little. Put your product or headline on it.'],
  ['ink', 'Marbled ink', 'Red ink flowing over black, marbled with cream and gold.', false,
    'Domain-warped noise, layered and banded into thin streaks of red, a black sea and a warm cream bloom, with a paper grain over everything. Hover to stir it.'],
  ['aura', 'Aura', 'Grainy, blurred bands of colour drifting like a long exposure.', false,
    'Soft waves of colour sliding past each other under heavy film grain, the look of a long-exposure photograph. Hover and the waves lean toward the pointer.'],
  ['reeded', 'Reeded glass', 'Light seen through fluted glass: glowing vertical reeds.', false,
    'A bright glow behind a pane of reeded glass: every flute bends the light, splitting it slightly at the edges. The light source follows the pointer.'],
  ['orb', 'Orb', 'A glowing sphere of moving light: the look of an AI that is listening.', true,
    'A breathing orb with colours swirling inside it, a bright rim and a soft halo. Hover it and the colours speed up, as if it is thinking.'],
  ['silk', 'Silk', 'Satin folds that flow and catch the light.', false,
    'A rippling surface lit like satin: soft diffuse folds, a sharp specular sheen, and a glow on the edges. The light moves with the pointer.'],
  ['morph', 'Morphing shape', 'A 3D shape that melts from sphere to box to torus to octahedron.', true,
    'A raymarched solid that morphs between four shapes, lit and rimmed, turning slowly. The pointer turns it.'],
  ['terrain', 'Mountain flight', 'A flight over endless mountains at sunset, with fog.', false,
    'A raymarched landscape that scrolls toward you forever, with a sun on the horizon and haze in the distance. The pointer steers the camera.'],
  ['tunnel', 'Neon tunnel', 'An endless neon wormhole that steers with the pointer.', false,
    'Rings and lines rushing past in perspective, glowing brighter toward the centre. Move the pointer to bend the tunnel.'],
  ['waves', 'Line waves', 'Dozens of glowing lines forming a living landscape.', false,
    'Rows of thin glowing lines, each hiding the ones behind it, rising into hills that breathe. The pointer raises a hill wherever it goes.'],
  ['clouds', 'Clouds', 'Layers of sunset clouds drifting past the sun.', false,
    'Three layers of soft clouds in parallax, lit on the side that faces the sun. The pointer shifts the layers.'],
  ['caustics', 'Caustics', 'Light dancing on the bottom of a swimming pool.', false,
    'The bright, moving web of light you see underwater, over a soft blue gradient. Calm and endlessly watchable.'],
  ['gradient', 'Mesh gradient', 'A smooth, grainy mesh gradient, the clean way.', false,
    'Five colour points drifting and blending, warped gently and finished with film grain. One of them follows the pointer.'],
  ['swarm', 'Particle swarm', 'Hundreds of points of light orbiting in 3D.', true,
    'A galaxy of soft particles orbiting in a tilted disk, with depth and glow. The pointer turns it in 3D.']
];
const LOOKS3 = { blob: '#05050a,#1a1d2b,#56627f,#c4cfe6,#ffffff', glass: '#000000,#120a22,#ff2e88,#3a8bff,#ffd166,#ffffff' };
const fxPage = ([kind, name, brief, floats, about]) => ({
  slug: 'fx-' + kind, name, section: '3D & Shaders', tag: 'piix-fx', file: 'fx', brief, about,
  demo: `<piix-fx kind="${kind}" height="480px"></piix-fx>`,
  stage: { h: 480, pad: 0 },
  controls: [['palette', 'Colours', 'palette', ''], ...(floats ? [['bg', 'Background', 'seg', ['', 'none'], '']] : []), ['quality', 'Quality', 'range', [.3, 1, .05, .75]], ['grain', 'Grain', 'range', [0, 1, .05, .35]]],
  examples: [
    { name: 'As a hero', note: 'Give <a href="hero.html">Hero</a> an <code>fx</code> and your content sits on top.',
      demo: `<piix-hero fx="${kind}" height="460px">\n  <p class="eyebrow">New</p>\n  <h1>Make it real</h1>\n  <p>Smooth, realistic shaders behind your words.</p>\n  <piix-glow-button look="chrome">Get started</piix-glow-button>\n</piix-hero>`, stage: { pad: 0 } },
    ...(floats ? [{ name: 'Floating on your page', note: 'With <code>bg="none"</code> only the object is drawn, so it floats on whatever is behind it.',
      demo: `<piix-fx kind="${kind}" bg="none" height="320px"></piix-fx>`, stage: { pad: 0, light: true } }] : []),
    { name: 'In your colours', demo: `<div class="ex-row">\n  <piix-fx kind="${kind}" palette="sunset" height="200px"></piix-fx>\n  <piix-fx kind="${kind}" palette="ocean" height="200px"></piix-fx>\n  <piix-fx kind="${kind}" palette="#050505,#1f1f24,#5a5a66,#bdbdc7,#ffffff" height="200px"></piix-fx>\n</div>`, stage: { pad: 0 } }
  ],
  props: [
    ['kind', ['beam', 'disc', 'flame', 'blob', 'glass', 'podium', 'ink', 'aura', 'reeded', 'orb', 'silk', 'morph', 'terrain', 'tunnel', 'waves', 'clouds', 'caustics', 'gradient', 'swarm'].map(k => `<code>${k}</code>`).join(' '), 'blob'],
    ['palette', 'tint it: a palette name or your own colours, dark to light', "the kind's own"],
    ['bg', '<code>none</code>: just the object (blob, glass, disc, orb, morph, swarm)', ''],
    ['quality', '1 is full resolution; lower is faster', '.75'],
    ['grain', 'film grain, 0 to 1', '.35'],
    ['speed', '1 is normal, 0 holds still', '1'],
    ['height', 'when not filling: px or any CSS length', '480px'],
    ['fill', 'sit behind the content of the parent element', '']
  ],
  a11y: ['Announced as an image, unless it fills a parent (then it is decoration).', 'With reduced motion it renders one still frame.', 'Compiles in the background and only draws while on screen.']
});

const IMG = [
  ['liquid', 'Liquid image', 'The picture turns to liquid and bulges toward the pointer.', 'The image ripples gently all the time; hover and it swells toward your pointer like a drop of water on glass.'],
  ['rgb', 'Colour split', 'Move fast and the picture splits into red, green and blue.', 'The faster the pointer moves across it, the further the colour channels pull apart, with faint scanlines. Still pointer, clean image.'],
  ['morph', 'Image morph', 'One picture melts into another through a glowing edge.', 'Give it two images. Hover and the first dissolves into the second along a flowing, glowing edge. With <code>auto</code> it morphs back and forth on its own.'],
  ['ripple', 'Ripple', 'Water ripples spread from the pointer.', 'Rings ripple out across the picture from wherever the pointer is, like touching the surface of a pond.'],
  ['streak', 'Light streak', 'The picture smears into long streaks of light, like a long exposure.', 'Bright parts of the image stretch into glowing horizontal streaks, tinted by the palette; hover or move fast and the streaks grow.'],
  ['alive', 'Alive', 'Your picture, exactly as it is, brought to life: depth, glow, haze and light.', 'Keeps the image untouched and adds motion on the GPU: brighter parts sit nearer and shift with the pointer, glowing areas breathe and bloom, heat haze ripples over hot parts, the camera breathes and a light sweeps across. Made for hero images.'],
  ['frosted', 'Frosted window', 'The picture behind hammered glass, with a clear window that follows the pointer.', 'Heavily textured glass blurs and bends the image; hover and a sharp, clean square follows your pointer, like wiping a window. Great for portraits and fashion.'],
  ['code', 'Code portrait', 'The picture rebuilt from rows of glitching glyphs.', 'The image turns into lines of tiny coloured glyph blocks that flicker and glitch sideways in bursts; the rows near the pointer slide apart. Dark parts drop out to black.'],
  ['zoom', 'Zoom blur', 'A radial zoom blur that rushes toward the pointer.', 'Hover and the image blurs outward from the pointer, as if the camera is rushing in.']
];
const imgPage = ([effect, name, brief, about]) => ({
  slug: 'image-' + effect, name, section: 'Image effects', tag: 'piix-image-fx', file: 'image-fx', brief, about,
  demo: effect === 'morph' ? `<piix-image-fx src="../site/pixelui-30-poster.jpg" src2="../site/pixelui-launch-poster.jpg" effect="morph" alt="A lake at sunset becoming a launch poster" height="440px"></piix-image-fx>`
    : `<piix-image-fx src="../site/pixelui-30-poster.jpg" effect="${effect}" alt="A lake at sunset" height="440px"></piix-image-fx>`,
  stage: { h: 440, pad: 0 },
  controls: [['effect', 'Effect', 'seg', ['liquid', 'rgb', 'morph', 'ripple', 'streak', 'zoom'], 'liquid'], ['palette', 'Glow', 'palette', 'sunset']],
  examples: effect === 'morph' ? [{ name: 'On its own', note: '<code>auto</code> morphs back and forth without a pointer.', demo: `<piix-image-fx src="day.jpg" src2="night.jpg" effect="morph" auto alt="…"></piix-image-fx>`, show: `<piix-image-fx src="../site/pixelui-30-poster.jpg" src2="../site/launch-poster.jpg" effect="morph" auto alt="" height="300px"></piix-image-fx>`, stage: { pad: 0 } }] : [],
  props: [
    ['src', 'the image (on your site, or served with CORS)', ''], ['src2', 'the second image, for morph', ''], ['alt', 'what it shows', ''],
    ['effect', '<code>liquid</code> <code>rgb</code> <code>morph</code> <code>ripple</code> <code>streak</code> <code>zoom</code>', 'liquid'],
    ['auto', 'morph on its own instead of on hover', ''], ['palette', 'the glow colours', 'sunset'], ['height', 'any CSS length', "the image's own shape"]
  ],
  a11y: ['Announced as an image with your <code>alt</code> text.', 'With reduced motion the image holds still.']
});

export const FX_PAGES = [...FX.map(fxPage), ...IMG.map(imgPage)];
