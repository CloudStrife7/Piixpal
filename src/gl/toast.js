/* TOAST: notifications with a pixel fuse that burns down while they're up.   @component toast
 *
 *   Piixpal.toast('Saved');
 *   Piixpal.toast('Deploy finished', { tone: 'ok', title: 'Production', action: { label: 'Open', onClick } });
 *   Piixpal.toast('Card declined', { tone: 'error' });
 *
 * Toasts slide in from the corner in a few chunky steps. Along the bottom, a thin pixel fuse
 * burns down with a flickering spark at its tip; when it runs out the toast wipes away. Hover
 * (or focus) one and the fuse stops. They stack, newest nearest the corner, and screen readers
 * hear them (errors straight away, the rest politely).
 *
 * Put a <piix-toaster> on the page to choose where and how they appear; one is added for you
 * otherwise.
 *
 *   options   tone: info | ok | warn | error      title      duration (seconds, 0 = stay)
 *             action: { label, onClick }
 *   toaster   position: bottom-right | bottom-left | top-right | top-left | bottom | top
 *             theme: dark | light
 *
 *   returns   { close() } */
