/* SCENE: whole illustrated places, painted on the GPU in pixels.   @component scene
 *
 *   <piix-scene kind="sakura"></piix-scene>
 *   <piix-scene kind="alps" sky="none" fade="top" height="320px"></piix-scene>
 *
 * Not a texture or a photo: every scene is drawn from nothing in a shader, on a pixel grid,
 * and dithered down to a handful of colours like a pixel-art painting. They move, and they
 * answer the pointer: wind in the blossom, the sun follows you over the lake, the galaxy tilts,
 * the riso rays swing toward you, the train window lets you look around.
 *
 *   sakura    a cherry tree over a misty forest, a lantern, a bench and falling petals
 *   alps      snow peaks behind layers of green hills, pines and valley mist
 *   lake      a flat sunset over a lake, a little boat, the sun follows the pointer
 *   galaxy    a spiral galaxy with planets in orbit; the pointer tilts it
 *   rays      two-ink riso print: light rays bursting from the horizon, a crescent moon
 *   vortex    two-ink riso print: the sky swirling round a lone street lamp
 *   train     a train window, the countryside rushing past, poles flashing by
 *   poppies   a stormy sky over a field of red poppies blowing in the wind
 *   castle    a pixel castle on a hill at night, windows flickering, a flag waving
 *   vista     an anime summer sky, big clouds, a snowy peak and grass in the breeze
 *
 * Mix it into a normal page: sky="none" cuts the sky out so your page shows through behind
 * the mountains (or round the window); fade dissolves an edge into whatever is behind it.
 *
 *   kind      which scene                                       default: sakura
 *   sky       "none" makes the sky see-through
 *   fade      top | bottom | both: dissolve that edge in dithered pixels
 *   palette   repaint it in a palette (lime, sunset, gameboy…) instead of its own colours
 *   levels    colours per channel, 2 to 16 (fewer = more pixel-art)   default: 6
 *   pixel     size of one pixel, px                              default: 4
 *   dither    0 for flat colour, 1 for full dither                default: 1
 *   speed     1 is normal, 0 holds still                          default: 1
 *   height    when not filling: px or any CSS length             default: 480px
 *   fill      sit behind the content of the parent element */
const SC_HEAD = `
/* noise read from one shared random texture: a single lookup, so even big scenes compile fast */
float tnoise(vec2 p){return texture2D(u_tex,(p+u_seed*3.7+.5)/256.).r;}
float tfbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*tnoise(p);p=m*p;a*=.5;}return v;}
float h2(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ridged(vec2 q){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*(1.-abs(noise(q)*2.-1.));q*=2.03;a*=.5;}return v;}
vec3 rgb(float r,float g,float b){return vec3(r,g,b)/255.;}
float box(vec2 p,vec2 a,vec2 b){return step(a.x,p.x)*step(p.x,b.x)*step(a.y,p.y)*step(p.y,b.y);}
float tri(vec2 p,vec2 b,float hw,float h){float k=(p.y-b.y)/h;return step(0.,k)*step(k,1.)*step(abs(p.x-b.x),hw*(1.-k));}
float rbox(vec2 p,vec2 c,vec2 hs,float r){vec2 d=abs(p-c)-hs+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}
float crescent(vec2 p,vec2 c,float r){return step(length(p-c),r)*step(r*.92,length(p-c-vec2(r*.45,r*.25)));}
float W(){return u_res.x/u_res.y;}
`;
/* the end of every scene: colour it down to pixel art, then cut the sky / fade an edge */
const SC_TAIL = `
vec4 effect(vec2 uv,vec2 cell){
  vec2 p=vec2((uv.x-.5)*u_res.x/u_res.y,uv.y),m=u_mouse-.5;
  vec4 s=scene(uv,p,cell,m);
  vec3 c=clamp(s.rgb,0.,1.);float b=bayer8(cell);
  if(u_j.x>.5)c=dpal(dot(c,vec3(.299,.587,.114)),cell);
  else{float L=max(u_j.y-1.,1.);c=floor(c*L+mix(.5,b*.999,u_dither))/L;}
  float a=1.;
  if(u_k.x>.5&&s.a>b*.999+.0005)a=0.;
  float f=1.;
  if(u_k.y==1.||u_k.y==3.)f=min(f,(1.-uv.y)/u_k.w);
  if(u_k.y>=2.)f=min(f,uv.y/u_k.w);
  if(f<b)a=0.;
  return vec4(c,a);}`;

