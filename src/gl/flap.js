/* FLAP: a split-flap board, like a station departures sign.   @component flap
 *
 *   <piix-flap text="NOW BOARDING"></piix-flap>
 *   <piix-flap countdown="2026-12-31T00:00:00"></piix-flap>
 *
 * Every tile riffles through the alphabet, flap by flap, until it lands on its letter, each a
 * beat after the one before, with that clatter of little cards. Change the text and it flips
 * again. With a countdown it shows days, hours, minutes and seconds and keeps ticking.
 * It sizes from the font size you give it; screen readers just get the words.
 *
 *   text      what it says (letters, digits, spaces and : . - / ! ? ' & +)
 *   length    pad it to this many tiles
 *   countdown a date and time to count down to
 *   theme     dark | light | amber                          default: dark */
const FLAP_SET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/!?'&+";
const FLAP_THEMES = { dark: ['#17121f', '#211a2c', '#f4efe2', '#000'], light: ['#f4efe2', '#e7e0d0', '#17121f', '#b8ae9a'], amber: ['#1a1208', '#24190a', '#ffb43a', '#000'] };
