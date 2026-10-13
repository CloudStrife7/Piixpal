// Pixel UI docs: the Scenes and Layouts pages (merged into ui-data.mjs).
const PX_PROP = def => ['pixel', 'size of one pixel, in px', String(def)];

/* ---------- scenes: one page per illustrated place ---------- */
const SCENES = [
  ['sakura', 'sakura', 'Sakura grove', 'A cherry tree in full bloom over a misty forest, with a lantern and a bench.',
    'Pink canopy, a dark twisting trunk, a teal forest dissolving into fog, and petals drifting down in pixel flakes. The lantern flickers and lights the bench. Move the pointer across it and the falling petals lean into the wind.'],
  ['alps', 'alps', 'Alpine hills', 'Snow peaks behind rolling green hills, pines and valley mist.',
    'A vintage travel-poster landscape: a jagged snow range, a low bank of cloud, and four layers of rolling hills, each lit on one side and shaded on the other, with mist pooling in the valleys and a scatter of pines. The layers slide apart as the pointer moves, so it feels deep.'],
  ['lake', 'lake', 'Sunset lake', 'A flat-colour sunset over a lake, with a boat drifting across.',
    'Vector-poster style: a huge sun, two layers of soft green hills and a lake that mirrors all of it through gentle ripples. A tiny rower crosses the water. Move the pointer up and down and the sun rises and sets with you.'],
  ['galaxy', 'galaxy', 'Galaxy', 'A spiral galaxy with planets in orbit; the pointer tilts it.',
    'A golden core, spiral arms of dust and light, six planets on their orbits (two with rings, all lit from the core) and the odd shooting star. The pointer tilts the whole disk toward you.'],
  ['rays', 'riso-rays', 'Riso rays', 'A two-ink riso print: light bursting from the horizon under a crescent moon.',
    'Only two colours, blue ink on warm paper, like a risograph print. Rays of light burst up from a vanishing point on the horizon while the ground streams toward you. The vanishing point follows the pointer.'],
  ['vortex', 'riso-vortex', 'Riso vortex', 'A two-ink riso print of the sky swirling round a lone street lamp.',
    'The same two inks: the night sky spirals round a single street lamp, and the ground fans out beneath it. The swirl drifts toward the pointer.'],
  ['train', 'train-window', 'Train window', 'A train window with the countryside rushing past.',
    'Look out of a train: clouds and far mountains crawl, the hills roll by faster, a fence whips past and telegraph poles flash through the frame with their wires sagging between them. The carriage sways and bumps over every rail joint. Move the pointer to look around. With <code>sky="none"</code> the carriage wall disappears and the window floats on your own page.'],
  ['poppies', 'poppies', 'Poppy field', 'A stormy sky over a field of red poppies blowing in the wind.',
    'A painterly storm, a bright band of light on the horizon and a field of poppies that sway and shed petals across the sky. The pointer sets the wind.'],
  ['castle', 'castle', 'Castle', 'A pixel castle on a hill at night, windows flickering and a flag waving.',
    'Towers, battlements and a flag in the wind, under a full moon and drifting clouds. Windows flicker on and off as people move about inside; hover near them and more of them light up. Fireflies drift over the hill.'],
  ['vista', 'vista', 'Anime vista', 'A summer sky with towering clouds, a snowy peak and grass in the breeze.',
    'Big sunlit cumulus clouds with warm undersides, a snowy peak in the haze, and long grass waving in the foreground. Everything slides a little with the pointer.']
];
