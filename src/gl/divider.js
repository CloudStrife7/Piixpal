/* DIVIDER: a moving pixel edge between two sections.   @component divider
 *
 *   <section style="background:#17121f">…</section>
 *   <piix-divider from="#17121f" to="#f3eee3" kind="wave"></piix-divider>
 *   <section style="background:#f3eee3">…</section>
 *
 * Instead of a hard line, one section's colour flows into the next across a living pixel edge:
 * rolling waves, a mountain ridge, stepped stairs, drips, or a dithered fade. A thin line of
 * light runs along the edge, and it lifts a little under the pointer.
 *
 *   kind      wave | mountains | stairs | drip | dissolve      default: wave
 *   from      the colour above                                default: #17121f
 *   to        the colour below                                default: #f3eee3
 *   palette   the line of light along the edge                default: lime
 *   height    px or any CSS length                            default: 120px
 *   pixel     size of one pixel, px                           default: 6
 *   flip      turn it upside down */
