/* SCENE: whole illustrated places, painted on the GPU in pixels.   @component scene
 *
 *   <piix-scene kind="sakura"></piix-scene>
 *   <piix-scene kind="alps" sky="none" fade="top" height="320px"></piix-scene>
 *
 * Not a texture or a photo: every scene is drawn from nothing in a shader, on a pixel grid,
 * and dithered down to a handful of colours like a pixel-art painting. They move, and they
 * answer the pointer: wind in the blossom, the sun follows you over the lake, the galaxy tilts,
 * the riso rays swing toward you, the train window lets you look around.
 *
 *   sakura    a cherry tree over a misty forest, a lantern, a bench and falling petals
 *   alps      snow peaks behind layers of green hills, pines and valley mist
 *   lake      a flat sunset over a lake, a little boat, the sun follows the pointer
 *   galaxy    a spiral galaxy with planets in orbit; the pointer tilts it
 *   rays      two-ink riso print: light rays bursting from the horizon, a crescent moon
 *   vortex    two-ink riso print: the sky swirling round a lone street lamp
 *   train     a train window, the countryside rushing past, poles flashing by
 *   poppies   a stormy sky over a field of red poppies blowing in the wind
 *   castle    a pixel castle on a hill at night, windows flickering, a flag waving
 *   vista     an anime summer sky, big clouds, a snowy peak and grass in the breeze
 *
 * Mix it into a normal page: sky="none" cuts the sky out so your page shows through behind
 * the mountains (or round the window); fade dissolves an edge into whatever is behind it.
 *
 *   kind      which scene                                       default: sakura
 *   sky       "none" makes the sky see-through
 *   fade      top | bottom | both: dissolve that edge in dithered pixels
 *   palette   repaint it in a palette (lime, sunset, gameboy…) instead of its own colours
 *   levels    colours per channel, 2 to 16 (fewer = more pixel-art)   default: 6
 *   pixel     size of one pixel, px                              default: 4
 *   dither    0 for flat colour, 1 for full dither                default: 1
 *   speed     1 is normal, 0 holds still                          default: 1
 *   height    when not filling: px or any CSS length             default: 480px
 *   fill      sit behind the content of the parent element */
