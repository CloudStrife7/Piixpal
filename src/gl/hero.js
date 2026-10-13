/* HERO: a whole hero section on a GPU pixel background.   @component hero  @needs shader  @needs scene
 *
 *   <piix-hero kind="horizon">
 *     <p class="eyebrow">New · v1.0</p>
 *     <h1>Build something loud</h1>
 *     <p>One line of HTML and your landing page glows.</p>
 *     <piix-glow-button>Get started</piix-glow-button>
 *   </piix-hero>
 *
 * The background is any of the shader kinds. It dissolves in pixel by pixel when the hero scrolls
 * into view, then the content rises in after it. Scanlines and a soft vignette sit over the top;
 * the pointer bends the background. Put anything inside: it's laid out centred, and headings,
 * paragraphs and buttons get hero-sized type.
 *
 *   kind      mesh | warp | aurora | crystal | liquid | horizon | nebula | topo | dots | fire   default: mesh
 *   scene     use an illustrated scene instead: sakura | alps | lake | galaxy | rays | vortex | train | poppies | castle | vista
 *   palette   any palette name or your own colours        default: the kind's own
 *   pixel     size of one background pixel, px             default: 5
 *   align     center | left                                default: center
 *   height    any CSS length                               default: min(88vh, 780px) */
