/* PIXEL IMAGE: any picture, pixelated and dithered on the GPU, with a lens.   @component pixel-image
 *
 *   <piix-pixel-image src="photo.jpg" alt="Our team"></piix-pixel-image>
 *
 * Shows your image as dithered pixels in the palette, as a mosaic, or as halftone dots. Move the
 * pointer over it and a lens shows the real picture underneath; hover a mosaic and it resolves.
 * It crops to fill its box like object-fit: cover, and keeps the image's own shape if you don't
 * give it a height. The image needs to be on your site or served with CORS.
 *
 *   src       the image
 *   alt       what it shows, for screen readers
 *   effect    dither | mosaic | halftone                    default: dither
 *   palette   the colours for dither and halftone           default: mono
 *   pixel     size of one pixel, px                         default: 3
 *   lens      "none" turns the lens off
 *   height    any CSS length (default: the image's shape) */
