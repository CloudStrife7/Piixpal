/* CHART: small dithered charts, drawn on the GPU.   @component chart
 *
 *   <piix-chart values="12,18,9,24,30,28,35" labels="Mon,Tue,Wed,Thu,Fri,Sat,Sun"></piix-chart>
 *   <piix-chart kind="bars" values="4,7,5,9,12" palette="sunset"></piix-chart>
 *
 * An area chart's fill fades out in a dither instead of a gradient, the line sits on top in the
 * brightest colour, and bars are stepped columns shaded from the top. It sweeps in from the left
 * the first time it's on screen. Hover it and a crosshair snaps to the nearest point and shows
 * its label and value. Screen readers get the numbers as a table.
 *
 *   values    the numbers, comma separated (up to 256)
 *   labels    a label for each, comma separated
 *   kind      area | line | bars                            default: area
 *   suffix    after each value, like % or ms
 *   min       where the axis starts                         default: 0 (or the lowest value, if below 0)
 *   palette   its colours                                   default: lime
 *   height    px or any CSS length                          default: 220px
 *   pixel     size of one pixel, px                         default: 3 */
const CH_SHADER = `vec4 effect(vec2 uv,vec2 cell){
  float n=u_k.x,g=u_k.y,hov=u_k.z,kind=u_k.w,pad=6./u_res.y;
  float y=(uv.y-pad)/(1.-pad*2.),grow=clamp(g*1.7-uv.x*.7,0.,1.);
  grow=1.-pow(1.-grow,3.);
  vec4 c=vec4(0.);
  for(int k=1;k<4;k++){if(abs(y-float(k)*.25)*u_res.y<.6&&mod(cell.x,4.)<1.)c=vec4(dpal(.18,cell),1.);}
  if(kind>1.5){
    float i=floor(uv.x*n),fx=fract(uv.x*n),v=texture2D(u_tex,vec2((i+.5)/n,.5)).r*grow;
    float gap=clamp(1.5/(u_res.x/n),.08,.3);
    if(fx>gap&&fx<1.-gap&&y<v&&y>0.){float top=(v-y)*u_res.y;
      float lit=i==hov?1.:.0;
      c=vec4(dpal(top<2.?1.:mix(.75,.35,clamp((v-y)/max(v,.01),0.,1.))+lit*.2,cell),1.);}
  }else{
    float tx=(uv.x*(n-1.)+.5)/n,v=texture2D(u_tex,vec2(tx,.5)).r*grow;
    float e=1./u_res.x,v1=texture2D(u_tex,vec2(((uv.x+e)*(n-1.)+.5)/n,.5)).r*grow;
    float slope=abs(v1-v)*u_res.y,th=(1.1+slope*.5)/u_res.y;
    if(kind<.5&&y<v&&y>0.){float k=(v-y)/max(v,.01);if(1.-k*1.15>bayer8(cell))c=vec4(dpal(.25+.45*(1.-k),cell),1.);}
    if(abs(y-v)<th*1.)c=vec4(dpal(1.,cell),1.);
    if(hov>=0.){float hxp=hov/(n-1.),hv=texture2D(u_tex,vec2((hov+.5)/n,.5)).r*grow;
      if(abs(uv.x-hxp)*u_res.x<.6&&mod(cell.y,3.)<1.&&y>0.)c=vec4(dpal(.6,cell),1.);
      vec2 dp=vec2((uv.x-hxp)*u_res.x,(y-hv)*u_res.y*(1.-pad*2.));
      if(max(abs(dp.x),abs(dp.y))<2.5)c=vec4(dpal(1.,cell),1.);
      if(max(abs(dp.x),abs(dp.y))<1.5)c=vec4(dpal(0.,cell),1.);}
  }
  if(y<=0.&&y>-1./u_res.y)c=vec4(dpal(.4,cell),1.);
  return c;}`;
