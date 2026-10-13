/* REVEAL: content that dissolves in, pixel by pixel, when it scrolls into view.   @component reveal
 *
 *   <piix-reveal pattern="rain">
 *     <img src="screenshot.png" alt="The dashboard">
 *   </piix-reveal>
 *
 * Wrap anything. Until it's on screen it hides under a layer the colour of the page; then that
 * layer breaks up into pixels and falls away, with a glowing edge where it's dissolving. Once
 * it's done the layer is gone and the GPU rests. People who prefer less motion just see it.
 *
 *   pattern   dither | rain | scan | spiral                default: dither
 *   color     what it dissolves out of                     default: the background behind it
 *   palette   the glowing edge                             default: lime
 *   duration  seconds                                      default: 1.1
 *   delay     seconds to wait once it's on screen          default: 0
 *   pixel     size of one pixel, px                        default: 6 */
