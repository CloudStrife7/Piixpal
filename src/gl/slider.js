/* SLIDER: a range input whose track is lit on the GPU.   @component slider
 *
 *   <piix-slider name="volume" value="40">Volume</piix-slider>
 *
 * The filled part of the track glows through the palette with a slow shimmer; the head is a
 * bright pixel block with a halo, and dragging it fast throws sparks behind it. While you drag
 * (or have it focused) its value floats above the head. Whatever you put inside is its label.
 * A real slider: arrow keys, Page Up/Down, Home and End move it, screen readers hear it, and it
 * sends its value with the form it's in.
 *
 *   value, min, max, step                                  default: 50, 0, 100, 1
 *   name      the form field name
 *   suffix    shown after the value, like % or px
 *   palette   the colours of the light                    default: lime
 *   pixel     size of one pixel, px                       default: 3
 *   disabled
 *
 *   events: input, change */
