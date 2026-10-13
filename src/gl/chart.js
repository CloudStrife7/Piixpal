/* CHART: small dithered charts, drawn on the GPU.   @component chart
 *
 *   <piix-chart values="12,18,9,24,30,28,35" labels="Mon,Tue,Wed,Thu,Fri,Sat,Sun"></piix-chart>
 *   <piix-chart kind="bars" values="4,7,5,9,12" palette="sunset"></piix-chart>
 *
 * An area chart's fill fades out in a dither instead of a gradient, the line sits on top in the
 * brightest colour, and bars are stepped columns shaded from the top. It sweeps in from the left
 * the first time it's on screen. Hover it and a crosshair snaps to the nearest point and shows
 * its label and value. Screen readers get the numbers as a table.
 *
 *   values    the numbers, comma separated (up to 256)
 *   labels    a label for each, comma separated
 *   kind      area | line | bars                            default: area
 *   suffix    after each value, like % or ms
 *   min       where the axis starts                         default: 0 (or the lowest value, if below 0)
 *   palette   its colours                                   default: lime
 *   height    px or any CSS length                          default: 220px
 *   pixel     size of one pixel, px                         default: 3 */
