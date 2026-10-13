/* DIALOG: a modal that dissolves in, pixel by pixel, in any look.   @component dialog
 *
 *   <piix-glow-button data-piix-open="hello">Open</piix-glow-button>
 *   <piix-dialog id="hello">
 *     <h2>Ship it?</h2>
 *     <p>This will deploy to production.</p>
 *     <piix-glow-button data-close>Deploy</piix-glow-button>
 *   </piix-dialog>
 *
 * A real modal (the browser's own <dialog>): it traps focus, Escape closes it, and focus goes
 * back where it came from. The panel is drawn on the GPU and dissolves in when it opens, over
 * a dithered backdrop. Anything with data-piix-open="its id" opens it; anything inside with
 * data-close closes it; so does clicking the backdrop.
 *
 *   open      open it (or call .show() / .close())
 *   look      glow | chrome | glass | riso | crt              default: glow
 *   palette   the colours of the light                    default: violet (or the look's own)
 *   pixel     size of one pixel, px                       default: 3
 *   width     any CSS length                              default: 520px
 *
 *   events: open, close */
