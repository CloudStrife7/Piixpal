/* CHECKBOX: a pixel checkbox whose tick is drawn in, pixel by pixel.   @component checkbox
 *
 *   <piix-checkbox checked>Send me updates</piix-checkbox>
 *
 * A chunky pixel box. Tick it and the check mark draws itself in, block by block, with a puff
 * of pixels; untick and it un-draws. A real checkbox: it focuses, Space ticks it, screen readers
 * hear it, and it sends its value with the form it's in.
 *
 *   checked   ticked
 *   tone      the box colour when ticked                   default: lime
 *   name      the form field name
 *   value     sent when ticked                             default: on
 *   disabled  can't be ticked
 *
 *   events: change */
const CHECK_PX = [[1, 4], [2, 5], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2]];
