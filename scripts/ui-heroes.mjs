// Pixel UI docs: ready-made 3D hero sections. Each one is a <piix-fx> plus a small layout you copy.
const H = [
  ['hero-laser', 'Laser hero', 'beam', 'Lasers strike a rocky peak; the headline sits in the haze above.',
`<section class="hx hx-laser">
  <piix-fx kind="beam" fill></piix-fx>
  <p class="hx-k">Live · 12.09 · Berlin</p>
  <h1>Strike<br>the summit.</h1>
  <piix-glow-button palette="fire" size="lg">Get tickets</piix-glow-button>
</section>`],
  ['hero-disc', 'Disc hero', 'disc', 'A spinning rainbow disc beside the title, for music and launches.',
`<section class="hx hx-disc">
  <div class="hx-copy">
    <p class="hx-k">New album · out Friday</p>
    <h1>Spectrum</h1>
    <p>Eleven songs, pressed on light.</p>
    <piix-glow-button look="chrome">Pre-save</piix-glow-button>
  </div>
  <piix-fx kind="disc" bg="none"></piix-fx>
</section>`],
  ['hero-flame', 'Flame hero', 'flame', 'Soft fire rising behind a big serif statement.',
`<section class="hx hx-flame">
  <piix-fx kind="flame" fill></piix-fx>
  <h1><i>Burn</i> the<br>old playbook.</h1>
  <p class="hx-k">A studio for loud ideas</p>
</section>`],
  ['hero-keycap', 'Glass keycap hero', 'glass', 'A glass keycap splitting light, with the title set huge on black.',
`<section class="hx hx-key">
  <piix-fx kind="glass" bg="none"></piix-fx>
  <h1>Escape<br><b>the ordinary.</b></h1>
  <piix-glow-button look="chrome">Pre-order</piix-glow-button>
</section>`],
  ['hero-podium', 'Podium hero', 'podium', 'A stone slab in a spotlight, with thin wide-spaced type above.',
`<section class="hx hx-pod">
  <piix-fx kind="podium" fill></piix-fx>
  <h1>MONOLITH</h1>
  <p class="hx-k">Edition of 300</p>
</section>`],
  ['hero-orb', 'Orb hero', 'orb', 'A breathing orb with an input underneath: an AI product hero.',
`<section class="hx hx-orb">
  <piix-fx kind="orb"></piix-fx>
  <h1>Meet Nova.</h1>
  <piix-input look="glass" placeholder="Ask anything…">Ask</piix-input>
</section>`],
  ['hero-ink', 'Ink hero', 'ink', 'Marbled red ink behind editorial serif type.',
`<section class="hx hx-ink">
  <piix-fx kind="ink" fill></piix-fx>
  <h1>We make things<br>that <i>burn</i> bright.</h1>
</section>`],
  ['hero-portrait', 'Frosted portrait hero', 'image', 'A photo behind hammered glass with a clear window, beside the title.',
`<section class="hx hx-por">
  <piix-image-fx src="portrait.jpg" effect="frosted" alt="A portrait behind glass"></piix-image-fx>
  <div class="hx-copy"><p class="hx-k">Autumn · Winter</p><h1>Seen,<br>not shown.</h1></div>
</section>`]
];
