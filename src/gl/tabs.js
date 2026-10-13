/* TABS: tabs whose highlight slides across with a dithered pixel trail.   @component tabs
 *
 *   <piix-tabs>
 *     <div label="Overview">…</div>
 *     <div label="Install">…</div>
 *     <div label="Examples">…</div>
 *   </piix-tabs>
 *
 * Each child with a label becomes a tab. Pick one and the lit block slides over to it on the
 * GPU, leaving a trail of dithered pixels behind. Arrow keys, Home and End move between tabs,
 * and it's announced as a proper tab list.
 *
 *   selected  which tab is open, from 0                     default: 0
 *   palette   the colours of the highlight                 default: lime
 *   pixel     size of one pixel, px                        default: 3
 *
 *   events: change { index, label } */
