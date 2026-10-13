/* SHADER: GPU pixel backgrounds.   @component shader
 *
 *   <section>
 *     <piix-shader kind="mesh" fill></piix-shader>
 *     <h2>Your content sits on top</h2>
 *   </section>
 *
 * Ten shaders running on the GPU, drawn on a pixel grid and dithered into the theme's colours:
 * a drifting mesh gradient, domain-warped marble, an aurora, glowing crystal cells, liquid metal,
 * a synthwave horizon, a nebula, topographic contour lines, a dot matrix that ripples from your
 * pointer, and fire. The pointer bends each of them. With "fill" it sits behind the content of
 * the element it's in.
 *
 *   kind      mesh | warp | aurora | crystal | liquid | horizon | nebula | topo | dots | fire
 *   palette   lime | aurora | sunset | ocean | candy | violet | fire | gameboy | paper | mono,
 *             or your own colours, dark to light: "#000,#6b4cff,#fff"
 *   pixel     size of one pixel, in px                     default: 4
 *   dither    0 for smooth bands, 1 for full dither         default: 1
 *   speed     1 is normal, 0 holds still                    default: 1
 *   height    when not filling: px or any CSS length       default: 360px
 *   fill      sit behind the content of the parent element */
