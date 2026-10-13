/* TOGGLE: a pixel switch, and a pal walks across to flip it.   @component toggle
 *
 *   <piix-toggle checked>Dark mode</piix-toggle>
 *
 * The knob is a pal standing in the track. Switch it and the pal walks to the other end, turns,
 * and the track lights up behind it. It's a real switch: it focuses, Space and Enter flip it,
 * screen readers hear on and off, and it sends its value with the form it's in.
 *
 *   checked   on
 *   pal       who flips it (bitbug, pinch, penguin…)       default: bitbug
 *   tone      the colour when on                          default: lime
 *   name      the form field name
 *   value     sent when on                                default: on
 *   disabled  can't be flipped
 *
 *   events: change, piix:toggle { checked } */
