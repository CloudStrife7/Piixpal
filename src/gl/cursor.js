/* CURSOR: a pixel trail, or a glow, that follows the pointer across the whole page.   @component cursor
 *
 *   <piix-cursor></piix-cursor>
 *   <piix-cursor kind="glow" palette="candy"></piix-cursor>
 *
 * One tag anywhere on the page. "trail" leaves a comet of dithered pixels behind the pointer
 * that fade as they fall away; "glow" is a soft pixel halo round it. It never gets in the way
 * of clicks, rests the GPU when the pointer is still, and stays off on touch screens and for
 * people who prefer less motion.
 *
 *   kind      trail | glow                                default: trail
 *   palette   its colours                                 default: lime
 *   size      how big, 0.5 to 3                           default: 1
 *   pixel     size of one pixel, px                       default: 4 */
const CR_N = 40;
const CR_SHADER = `uniform vec4 u_tr[${CR_N}];
vec4 effect(vec2 uv,vec2 cell){
  vec2 q=aspect(uv);float v=0.,sz=u_k.y;
  if(u_k.x==1.){vec4 p=u_tr[0];if(p.w<=0.)return vec4(0.);float d=length(q-aspect(p.xy));v=p.w*smoothstep(.16*sz,0.,d);}
  else for(int i=0;i<${CR_N};i++){vec4 p=u_tr[i];if(p.w<=0.)continue;float d=length(q-aspect(p.xy));v=max(v,p.w*smoothstep(.028*sz*(.4+.6*p.w),0.,d));}
  if(v<.04)return vec4(0.);
  return vec4(dpal(.35+.65*v,cell),step(bayer8(cell)*.95,v*1.4));}`;
