// Pixel UI: one entry per docs page. scripts/ui-docs.mjs turns these into ui/*.html.
//
//   slug      the page: ui/<slug>.html
//   name      its title
//   tag       the element it's built from
//   file      the single-file build in dist/c (and the @component name)
//   brief     one line, for the sidebar search, the overview grid and the page head
//   about     a paragraph under the preview
//   demo      the main preview's markup (also its code, unless `code` is given)
//   stage     how the preview box looks: { h: px, light, top, pad: px }
//   controls  live controls on the main preview: [attr, label, kind, options]
//             kind: seg (buttons), palette (swatches), range ([min, max, step])
//   examples  [{ name, note, demo, code, stage }]
//   props     [attribute, what it does, default]
//   events    [name, when]
//   a11y      notes on keyboard, screen readers and reduced motion

