/* TEXT: headlines with GPU pixel effects.   @component text
 *
 *   <h1><piix-text effect="shine">Pixel perfect</piix-text></h1>
 *
 * The words are drawn into a texture and run through a shader, on a pixel grid, in the palette:
 * a dithered colour sweep, a mosaic that resolves when it scrolls into view, a glitch with
 * colour split and slipping rows, a wave, a melt that drips, and a scanline. It takes the size,
 * font and weight of wherever you put it, and the real words stay in the page for screen
 * readers, search and copy-paste. One line of text.
 *
 *   effect    shine | reveal | glitch | wave | melt | scan        default: shine
 *   palette   the colours                                       default: lime
 *   pixel     size of one pixel, px                             default: 2 */
const TX_FX = { shine: 0, reveal: 1, glitch: 2, wave: 3, melt: 4, scan: 5 };
const TX_SHADER = `float A(vec2 p){if(p.x<0.||p.y<0.||p.x>1.||p.y>1.)return 0.;return texture2D(u_tex,p).a;}
vec4 effect(vec2 uv,vec2 cell){
  float fx=u_k.x,t=u_time,a,v=fract(uv.x*.7-uv.y*.25-t*.18);vec2 p=uv;
  if(fx==1.){float b=mix(.09,0.,u_intro*u_intro);if(b>.001)p=(floor(uv/vec2(b*u_res.y/u_res.x,b))+.5)*vec2(b*u_res.y/u_res.x,b);}
  if(fx==3.){p.y+=sin(uv.x*9.+t*3.)*.09;p.x+=sin(uv.y*7.+t*2.)*.006;}
  if(fx==4.){float col=floor(uv.x*u_res.x/3.),d=max(0.,sin(t*.7+hash(vec2(col,1.))*6.2831))*hash(vec2(col,7.))*.5;p.y+=d*uv.y;}
  if(fx==2.){float g=step(.8,hash(vec2(floor(t*7.),3.)))+u_hover*.6,row=floor(uv.y*12.);
    p.x+=(hash(vec2(row,floor(t*15.)))-.5)*.08*g;float s=.012*g+.004;
    float r=A(p+vec2(s,0.)),gg=A(p),b=A(p-vec2(s,0.));a=max(r,max(gg,b));if(a<.5)return vec4(0.);
    vec3 c=dpal(.55+.45*gg,cell);return vec4(vec3(r>.5?c.r:.15,gg>.5?c.g:.1,b>.5?c.b:.35)*1.,1.);}
  a=A(p);if(a<.5)return vec4(0.);
  if(fx==5.){float sc=fract(uv.y*.9-t*.35);v=.35+.65*smoothstep(.12,0.,abs(sc-.5)-.02)+.12*step(.5,fract(cell.y*.5));}
  if(fx==1.)v=.55+.45*uv.y;
  v+=.25*exp(-length(aspect(uv)-aspect(u_mouse))*4.)*u_hover;
  return vec4(dpal(.5+.5*v,cell),1.);}`;
