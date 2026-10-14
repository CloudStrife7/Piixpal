/* FX: smooth, realistic GPU shaders: 3D objects, landscapes and light, at full resolution.   @component fx  @needs scene
 *
 *   <piix-fx kind="blob"></piix-fx>
 *   <piix-fx kind="orb" bg="none" height="420px"></piix-fx>
 *
 * The other half of Pixel UI: no pixel grid, no dither. Raymarched liquid chrome, a glass keycap
 * that splits light into colours, a stone podium in a spotlight, marbled ink, reeded glass, a grainy
 * aura, a living orb, satin, a mountain flythrough, a neon tunnel, glowing line landscapes,
 * sunset clouds, pool caustics, a morphing 3D shape, a mesh gradient and a particle galaxy.
 * They all answer the pointer, and with bg="none" the objects float on your own page.
 *
 *   kind      blob | glass | orb | silk | terrain | tunnel | waves | clouds | caustics | morph | gradient | swarm
 *             | ink | podium | reeded | aura | beam | disc | flame | visor | hood | bust | ghost | codehead
 *   palette   tint it: any palette name or your own colours, dark to light   default: the kind's own
 *   bg        "none": no background, just the object (blob, glass, orb, morph, swarm)
 *   quality   1 is full resolution, lower is faster                         default: .75
 *   grain     film grain, 0 to 1                                            default: .35
 *   speed     1 is normal, 0 holds still                                    default: 1
 *   height    when not filling: px or any CSS length                        default: 480px
 *   fill      sit behind the content of the parent element */
const FX_HEAD = `
float AR(){return u_res.x/u_res.y;}
/* centred, with the shorter side spanning one unit, so objects fit tall screens too */
vec2 P(vec2 uv){return (uv-.5)*vec2(AR(),1.)/min(AR(),1.);}
vec2 MS(){return (u_mouse-.5)*vec2(AR(),1.)/min(AR(),1.);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float sn(vec3 p){return sin(p.x*1.3+sin(p.y*1.7))*sin(p.y*1.1+sin(p.z*1.9))*sin(p.z*1.5+sin(p.x*1.2));}
float fb3(vec3 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*sn(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}
float tn(vec2 p){return texture2D(u_tex,(p+.5)/256.).r;}
float tf(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*tn(p);p=m*p;a*=.5;}return v;}
/* figures: a head and shoulders from the front, a hooded figure, and a profile facing right */
float sdE(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}
float sdB(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float figFront(vec2 p){float h=sdE(p-vec2(0.,.26),vec2(.165,.215)),n=sdB(p-vec2(0.,.0),vec2(.085,.12)),s=sdE(p-vec2(0.,-.66),vec2(.6,.55));return smin(smin(h,n,.05),s,.13);}
float figHood(vec2 p){float h=sdE(p-vec2(0.,.24),vec2(.225,.29)),s=sdE(p-vec2(0.,-.66),vec2(.62,.6));return smin(h,s,.2);}
float figSide(vec2 p){
  float sk=sdE(p-vec2(-.04,.3),vec2(.18,.185)),fc=sdE(p-vec2(.06,.22),vec2(.105,.16)),ns=sdE(p-vec2(.16,.23),vec2(.03,.035));
  float ch=sdE(p-vec2(.08,.1),vec2(.07,.05)),nk=sdB((p-vec2(.0,-.02))*mat2(.96,.28,-.28,.96),vec2(.09,.13)),sh=sdE(p-vec2(-.06,-.66),vec2(.56,.52));
  return smin(smin(smin(smin(sk,fc,.05),min(ns,ch),.03),nk,.05),sh,.1);}
/* a studio: a soft sky, a key softbox, a fill light and a bright horizon line for chrome to catch */
vec3 envc(vec3 rd){
  vec3 c=mix(pal(.06),pal(.45),smoothstep(-.6,.9,rd.y));
  c+=pal(1.)*pow(max(dot(rd,normalize(vec3(.5,.8,.4))),0.),30.)*2.4;
  c+=pal(.75)*pow(max(dot(rd,normalize(vec3(-.9,.25,-.2))),0.),10.)*.9;
  c+=vec3(1.)*smoothstep(.035,0.,abs(rd.y-.03))*.45;
  return c;}
`;
const FX_TAIL = `
vec4 effect(vec2 uv,vec2 cell){
  vec4 c=fx(uv);
  c.rgb+=(hash(cell+fract(u_time*7.)*91.)-.5)*u_j.y*.12;
  c.rgb=clamp(c.rgb,0.,1.);
  return vec4(c.rgb,c.a*u_j.x);}`;
/* a raymarch loop and a normal, for the 3D kinds; map() comes from each kind */
const FX_MARCH = `
vec3 nrm(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
float march(vec3 ro,vec3 rd){float t=0.;for(int i=0;i<80;i++){float d=map(ro+rd*t);if(d<.0012||t>12.)break;t+=d;}return t;}
`;

const FX_KINDS = {
  blob: ['#05050a,#1a1d2b,#56627f,#c4cfe6,#ffffff', true, `
float map(vec3 p){
  float t=u_time*.5;vec3 q=p;q.xz*=rot(t*.3);q.xy*=rot(t*.2);
  float d=length(q)-.92+.11*fb3(q*1.25+vec3(0.,0.,t));
  vec3 a=vec3(sin(t*1.3)*1.3,cos(t*.9)*.6,sin(t*.7)*.5);
  d=smin(d,length(p-a)-.3,.5);
  d=smin(d,length(p-vec3(MS()*2.4,.7))-.28*(.4+u_hover),.6);
  return d*.75;}` + FX_MARCH + `
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 ro=vec3(0.,0.,5.6),rd=normalize(vec3(p,-2.1));
  vec3 bg=mix(pal(.02),pal(.16),uv.y)+pal(.55)*.22*exp(-length(p)*1.3);
  float t=march(ro,rd);
  if(t>12.)return vec4(bg,u_k.x>.5?0.:1.);
  vec3 pp=ro+rd*t,n=nrm(pp),r=reflect(rd,n);
  float fr=pow(1.-max(dot(n,-rd),0.),3.);
  vec3 col=envc(r)*(.85+.6*fr)+pal(.5)*.08;
  col*=mix(vec3(1.),.6+.6*cos(6.283*(dot(n,vec3(.3,.6,.2))*1.2+u_time*.05+vec3(0.,.33,.67))),.18);
  col+=pal(1.)*fr*.25;
  return vec4(col,1.);}`],

  glass: ['#000000,#120a22,#ff2e88,#3a8bff,#ffd166,#ffffff', true, `
float map(vec3 p){
  p.y-=.05*sin(u_time*1.2);
  p.xz*=rot(u_time*.35+MS().x*1.2);p.yz*=rot(-.55+MS().y*.5);
  float k=clamp(p.y+.45,0.,.9)/.9,w=mix(1.,.74,k);
  vec3 q=abs(p)-vec3(w,.45,w);
  float d=length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-.07;
  d=max(d,-(length(p-vec3(0.,2.15,0.))-1.75));
  return d*.7;}` + FX_MARCH + `
vec3 back(vec2 q){
  float t=u_time*.25;vec3 c=pal(0.);
  c+=pal(.4)*smoothstep(.07,0.,abs(q.x-.35+.25*sin(t)))*exp(-abs(q.y)*2.)*.9;
  c+=pal(.6)*smoothstep(.06,0.,abs(q.y+.25+.2*cos(t*1.3)))*exp(-abs(q.x)*1.6)*.7;
  c+=pal(.85)*smoothstep(.04,0.,abs(q.x+q.y*.5+.45))*.6+pal(1.)*exp(-length(q-vec2(-.15,.4))*7.)*.5;
  return c;}
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 ro=vec3(0.,0.,7.6),rd=normalize(vec3(p,-2.3));
  float t=march(ro,rd);
  if(t>12.)return vec4(pal(0.)*.6,u_k.x>.5?0.:1.);
  vec3 pp=ro+rd*t,n=nrm(pp);
  vec3 rr=refract(rd,n,1./1.4),rg=refract(rd,n,1./1.47),rb=refract(rd,n,1./1.55);
  vec3 col=vec3(back(p+rr.xy*.9).r,back(p+rg.xy*.9).g,back(p+rb.xy*.9).b)*1.3;
  float fr=pow(1.-max(dot(n,-rd),0.),2.2);
  col*=.75;col+=(.5+.5*cos(6.283*(fr*1.8+dot(n,vec3(.4,.2,.6))*1.4+u_time*.05+vec3(0.,.33,.67))))*pow(fr,1.3)*1.25;
  col+=vec3(1.)*pow(max(dot(reflect(rd,n),normalize(vec3(.4,.8,.5))),0.),50.)*1.6;
  col+=vec3(1.)*smoothstep(.85,1.,fr)*.5;
  return vec4(col,1.);}`],

  ink: ['#040506,#2a070b,#c4121d,#ff4436,#f2c49b,#fff2dc', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time*.06;
  vec2 q=p*1.6+vec2(t*2.,t);
  q+=.5*exp(-length(p-m)*3.)*u_hover*vec2(sin(t*40.),cos(t*40.));
  vec2 a=vec2(tf(q*1.3+t),tf(q*1.3+vec2(5.2,1.3)-t));
  vec2 b=vec2(tf(q*1.6+a*3.2+vec2(1.7,9.2)),tf(q*1.6+a*3.2+vec2(8.3,2.8)+t));
  float f=tf(q*1.2+b*3.6),side=smoothstep(-.7,.9,p.x+p.y*.6);
  float v=f*1.25+side*.55-.62;
  vec3 col=pal(0.);
  float streak=smoothstep(.025,0.,abs(fract(v*3.)-.5)-.42)*smoothstep(.1,.35,v);
  col=mix(col,pal(.42),streak*.9);
  col=mix(col,mix(pal(.5),pal(.8),smoothstep(.55,.85,v)),smoothstep(.42,.5,v));
  col=mix(col,pal(1.),smoothstep(.8,1.05,v)*.85);
  col=mix(col,pal(.15),smoothstep(.015,0.,abs(v-.47))*.8);
  col*=.92+.16*tn(uv*u_res*.9);
  return vec4(col,1.);}`],

  podium: ['#030304,#121214,#34343a,#808088,#e4e4ea', false, `
float rockS(vec3 p){
  vec3 q=p-vec3(0.,.15*sin(u_time*.8),0.);q.xz*=rot(.25+MS().x*.3);
  vec3 b=abs(q)-vec3(1.25,.19,.68);
  float d=length(max(b,0.))+min(max(b.x,max(b.y,b.z)),0.)-.12;
  return d+.05*fb3(q*4.)+.02*fb3(q*11.);}
float map(vec3 p){return min(rockS(p)*.7,p.y+1.3);}` + FX_MARCH + `
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 ro=vec3(0.,.9,7.8),rd=normalize(vec3(p.x,p.y-.14,-2.1));
  float beam=smoothstep(.55+.3*(1.-uv.y),0.,abs(p.x-MS().x*.2))*smoothstep(-.2,1.,uv.y)*.6;
  vec3 bg=mix(pal(.02),pal(.12),uv.y)+pal(.85)*beam;
  float t=march(ro,rd);
  if(t>12.)return vec4(bg,1.);
  vec3 pp=ro+rd*t,n=nrm(pp),l=normalize(vec3(-.1,1.,.15));
  bool floor_=pp.y<-1.28;
  float sh=floor_?smoothstep(.1,1.6,length(pp.xz*vec2(.62,1.1)))*.9+.1:1.;
  vec3 col;
  if(floor_){col=pal(.08)*(.55+.45*fb3(pp*vec3(2.,0.,4.)))*sh+pal(.35)*exp(-length(pp.xz)*.5)*.35*sh;
    col+=pal(.5)*pow(max(dot(reflect(rd,n),l),0.),20.)*.15;}
  else{float dif=max(dot(n,l),0.),top=smoothstep(.4,.9,n.y);
    col=mix(pal(.1),pal(.8),dif*.75+top*.55)*(.65+.35*fb3(pp*9.));
    col+=pal(1.)*pow(max(dot(reflect(rd,n),l),0.),10.)*.4*top;}
  col=mix(col,bg,1.-exp(-max(t-5.,0.)*.08))+pal(.85)*beam*.35;
  return vec4(col,1.);}`],

  reeded: ['#05060b,#2a0e09,#d8401a,#ff8a1f,#ffd27a,#fff6e6', false, `
vec3 lightbg(vec2 q){
  vec2 m=MS();vec2 c=vec2(.35+m.x*.4+.15*sin(u_time*.3),-.1+m.y*.3);
  float r=length((q-c)*vec2(.7,1.));
  vec3 col=mix(pal(.95),pal(.6),smoothstep(0.,.5,r));col=mix(col,pal(.35),smoothstep(.4,.95,r));
  col=mix(col,pal(0.),smoothstep(.85,1.6,r));
  return col*(1.-smoothstep(-.3,.9,-q.x)*.92);}
vec4 fx(vec2 uv){
  vec2 p=P(uv);float N=20.,cx=p.x*N/AR()*1.2,u=fract(cx)-.5;
  float bend=u*u*sign(u)*2.6/N*AR();
  vec3 col=vec3(lightbg(p+vec2(bend,0.)).r,lightbg(p+vec2(bend*1.18,0.)).g,lightbg(p+vec2(bend*1.36,0.)).b);
  col*=.7+.45*smoothstep(.5,.05,abs(u));
  col+=pal(1.)*smoothstep(.47,.5,abs(u))*.18*length(col);
  return vec4(col,1.);}`],

  aura: ['#06050c,#162a5e,#1e6db4,#ff6a1f,#c2241a', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time*.22;
  float y=p.y+.18*sin(p.x*1.7+t*2.)+.1*sin(p.x*3.1-t*1.4)+.12*m.y*exp(-pow((p.x-m.x)*1.5,2.))*u_hover;
  vec3 col=pal(0.);
  col=mix(col,pal(.45),smoothstep(.4,.05,abs(y-.28))*.95);
  col=mix(col,pal(.75),smoothstep(.32,.0,abs(y+.02+.06*sin(p.x*2.4+t*3.)))*.95);
  col=mix(col,pal(1.),smoothstep(.22,.0,abs(y+.3+.08*sin(p.x*1.6-t*2.)))*.8);
  col=mix(col,pal(.2),smoothstep(.25,.0,abs(y-.55))*.6);
  col*=1.-.35*smoothstep(.4,1.,length(p*vec2(.7,1.)));
  return vec4(col,1.);}`],
  beam: ['#050100,#2a0700,#8a1d00,#ff4d00,#ff9a3c,#fff0c8', false, `
float map(vec3 p){
  vec3 q=p-vec3(0.,-1.75,0.);q.xz*=rot(.4+MS().x*.2);
  float d=length(q*vec3(.62,1.05,.75))-1.35;
  d+=.2*fb3(q*2.3)+.06*fb3(q*6.5);
  return min(d*.65,p.y+1.9);}` + FX_MARCH + `
float laser(vec2 p){
  float s=0.;
  for(int i=0;i<16;i++){float fi=float(i),h=fract(sin(fi*12.9898)*43758.5);
    float x=(h-.5)*.36+.012*sin(u_time*(1.+h)+fi)+MS().x*.06;
    float fl=.55+.45*sin(u_time*(6.+h*9.)+fi*3.1);
    float w=abs(p.x-x);s+=(exp(-w*1300.)*1.8+exp(-w*90.)*.3+exp(-w*14.)*.05)*fl;}
  return s;}
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 ro=vec3(0.,.35,6.),rd=normalize(vec3(p.x,p.y-.05,-2.));
  vec3 bg=mix(pal(.04),pal(.3),smoothstep(-.6,.8,p.y))+pal(.55)*exp(-abs(p.x)*2.4)*smoothstep(-.3,.6,p.y)*.55;
  float t=march(ro,rd);
  vec3 col=bg;
  if(t<12.){vec3 pp=ro+rd*t,n=nrm(pp);
    float lit=exp(-length(pp.xz-vec2(MS().x*.4,0.))*1.3)*(max(n.y,0.)+.25);
    col=mix(pal(.02),pal(.18),max(n.y,0.)*.5)+pal(.7)*lit*1.4+pal(.45)*pow(1.-max(dot(n,-rd),0.),3.)*.35;
    col=mix(col,bg,1.-exp(-max(t-5.,0.)*.12));
  }
  if(t>=12.){float L=laser(p);col+=mix(pal(.75),pal(1.),clamp(L*.4,0.,1.))*L;}
  return vec4(col,1.);}`],

  disc: ['#000000,#0b0b10,#3a3d48,#c9ccd6,#ffffff', true, `
vec3 spec(float x){return clamp(abs(fract(x+vec3(0.,.67,.33))*6.-3.)-1.,0.,1.);}
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();
  float ax=-.75+m.y*.5+.06*sin(u_time*.5),ay=.55+m.x*.6+.08*cos(u_time*.4);
  vec3 n=vec3(0.,0.,1.);n.yz*=rot(ax);n.xz*=rot(ay);
  vec3 u=normalize(cross(n,vec3(0.,1.,0.)+vec3(.0001))),v=cross(n,u);
  vec3 ro=vec3(0.,0.,4.2),rd=normalize(vec3(p,-2.));
  float dn=dot(rd,n);vec3 bg=pal(0.);
  if(abs(dn)<.001)return vec4(bg,u_k.x>.5?0.:1.);
  float t=-dot(ro,n)/dn;vec3 q=ro+rd*t;vec2 l=vec2(dot(q,u),dot(q,v));
  float r=length(l),a=atan(l.y,l.x)+u_time*.6;
  if(r>1.25||r<.17||t<0.)return vec4(bg,u_k.x>.5?0.:1.);
  vec3 refl=reflect(rd,n);
  float la=atan(refl.y,refl.x),sweep=pow(abs(cos(atan(l.y,l.x)-la*1.3-1.)),26.);
  vec3 col=vec3(.03)+pal(.3)*.12*(.5+.5*sin(r*900.));
  col+=spec(r*1.6-.25+dot(refl,vec3(.3,.5,.2)))*sweep*1.25;
  col+=spec(r*2.3+.4)*.06*(.5+.5*sin(r*640.+a*2.));
  col+=vec3(.6)*pow(max(dot(refl,normalize(vec3(.3,.7,.6))),0.),30.)*.6;
  if(r<.34){col=vec3(.02)+vec3(.8)*(smoothstep(.006,0.,abs(r-.2))+smoothstep(.004,0.,abs(r-.27))*.6+smoothstep(.003,0.,abs(r-.33))*.4);}
  col+=vec3(.9)*smoothstep(.012,0.,abs(r-1.24))*.8+spec(a*.3)*smoothstep(.01,0.,abs(r-1.235))*.4;
  return vec4(col,1.);}`],

  flame: ['#03040a,#0c1530,#ff2e9a,#ff8a1f,#ffe08a,#ffffff', false, `
vec3 spec(float x){return clamp(abs(fract(x+vec3(0.,.67,.33))*6.-3.)-1.,0.,1.);}
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec3 col=mix(pal(0.),pal(.12),uv.y*.6)+pal(.2)*.15*exp(-abs(p.x-m.x*.3)*2.);
  vec2 q=vec2((p.x-m.x*.35)*1.5,p.y);
  float f=tf(vec2(q.x*2.,q.y*.9-t*1.5)*2.2)*.65+tf(vec2(q.x*4.6+3.,q.y*2.2-t*2.4)*2.2)*.35;
  float wisp=tf(vec2(q.x*7.+1.,q.y*3.5-t*3.2)*2.);
  float body=f*1.5+wisp*.25-(p.y+.62)*1.05-abs(q.x)*1.05;
  float a=smoothstep(-.08,.45,body),hot=smoothstep(.35,.9,body);
  float ht=clamp((p.y+.5)*1.05-hot*.25,0.,1.);
  vec3 c=ht<.3?mix(pal(.95),pal(.8),ht/.3):ht<.6?mix(pal(.8),pal(.62),(ht-.3)/.3):mix(pal(.62),pal(.43),(ht-.6)/.4);
  c=mix(c,spec(fract(f*1.6+p.y*.5-t*.08)),.1*(1.-hot))*1.15;
  col=col*(1.-a*.85)+c*a*(.7+hot*.35);
  col+=pal(.6)*.18*exp(-max(-body,0.)*6.)*smoothstep(-.7,.1,p.y);
  for(int i=0;i<24;i++){float fi=float(i),h=fract(sin(fi*91.3)*4375.5),y=fract(h*7.+t*(.15+h*.2))*1.6-.6;
    vec2 sp=vec2((h-.5)*.9+sin(t+fi)*.05+m.x*.3,y);col+=spec(h+t*.1)*exp(-length(p-sp)*260.)*(1.-y*.5);}
  return vec4(col,1.);}`],
  visor: ['#0a0a0c,#3a3a40,#9a9aa2,#d4d4d8,#ff5a1f,#ffb27a', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 q=p*1.15+vec2(0.,.02);
  vec2 hb=uv*u_res*.055;float h0=tn(hb)+.5*tn(hb*2.1+3.);
  vec2 g=vec2(h0-tn(hb+vec2(.25,0.))-.5*tn((hb+vec2(.25,0.))*2.1+3.),h0-tn(hb+vec2(0.,.25))-.5*tn((hb+vec2(0.,.25))*2.1+3.));
  vec2 w=q+g*.09;
  float d=figFront(w-vec2(m.x*.02,0.)),k=smoothstep(.06,-.05,d);
  vec3 bg=mix(pal(.75),pal(.55),smoothstep(-.2,.9,length(p*vec2(.8,1.))))+vec3(.08)*(h0-.75);
  vec3 col=mix(bg,pal(0.)+pal(.2)*.3*(h0-.4),k);
  vec2 vp=q+g*.012-vec2(m.x*.03,.27+m.y*.02);
  float band=smoothstep(.04,.0,abs(vp.y)-.032)*smoothstep(.02,-.02,abs(vp.x)-.205);
  float pulse=.82+.18*sin(t*2.2)+.06*sin(t*13.)*sin(t*7.);
  vec3 hot=mix(pal(.8),pal(1.),smoothstep(.02,0.,abs(vp.y)));
  col=mix(col,hot*pulse*1.25,band);
  col+=pal(.8)*exp(-max(abs(vp.y)-.03,0.)*14.)*smoothstep(.45,.15,abs(vp.x))*.35*pulse;
  col+=vec3(.05)*smoothstep(.9,1.3,h0);
  return vec4(col,1.);}`],

  hood: ['#120402,#3a1206,#c23a0a,#ff5a12,#ff9a4a,#ffd9b0', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 q=p*1.1+vec2(.08,.06);
  vec2 hb=uv*u_res*.055;float n0=tn(hb)+.5*tn(hb*2.1+3.);
  vec2 g=vec2(n0-tn(hb+vec2(.25,0.))-.5*tn((hb+vec2(.25,0.))*2.1+3.),n0-tn(hb+vec2(0.,.25))-.5*tn((hb+vec2(0.,.25))*2.1+3.));
  vec2 w=q+g*.1+vec2(sin(t*.4),cos(t*.3))*.006;
  float d=figHood(w),k=smoothstep(.07,-.06,d);
  vec3 bg=mix(pal(.68),pal(.5),smoothstep(-.4,.9,p.y*.5+length(p)*.6))+pal(.85)*.1*(n0-.75);
  vec3 col=mix(bg,pal(.04)+pal(.3)*.3*(n0-.4),k*.95);
  vec2 c=m*.9+vec2(-.05,.12);vec2 dd=abs(q-c);float s=max(dd.x,dd.y),R=.13;
  if(s<R){float k2=smoothstep(.004,-.004,figHood(q));
    vec3 sharp=mix(bg*1.05,pal(.02),k2);
    float face=smoothstep(.1,0.,length((q-vec2(.03,.2))*vec2(1.25,1.)))*k2*smoothstep(-.02,.08,q.x+.04);
    sharp=mix(sharp,mix(pal(.35),pal(.95),smoothstep(-.05,.08,q.x-.0)),face*.8);
    col=sharp;}
  col=mix(col,vec3(.95),smoothstep(.002,0.,abs(s-R))*step(s,R+.003));
  return vec4(col,1.);}`],

  bust: ['#0d1014,#2a323c,#5b6672,#b8c2cc,#eef2f4', false, `
vec3 spec(float x){return clamp(abs(fract(x+vec3(0.,.67,.33))*6.-3.)-1.,0.,1.);}
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 q=p*1.05+vec2(.05,.12);
  vec3 col=mix(pal(.12),pal(.32),smoothstep(-.8,.9,p.x*.4+p.y*.5+.3))*(.85+.15*sin(p.x*9.)*.3);
  col*=1.-.2*smoothstep(.3,1.2,length(p));
  float cut=.36+.05*sin(q.x*14.+1.)+.03*sin(q.x*31.);
  float d=figSide(q),k=smoothstep(.006,-.006,d)*step(q.y,cut);
  vec3 stone=pal(0.)+pal(.2)*.25*tf(q*30.)+pal(.35)*.25*smoothstep(.02,-.02,d+.01)*smoothstep(-.1,.2,q.x-q.y*.3);
  float drape=smoothstep(.01,-.01,length((q-vec2(.12,-.6))*vec2(.8,1.1))-.4)*smoothstep(-.02,.08,q.x+q.y*.9+.2);
  vec3 cloth=mix(pal(.5),pal(1.),.6+.4*sin(q.x*15.+q.y*10.+sin(q.y*9.+q.x*4.)*2.2))*.92;
  col=mix(col,stone,k);col=mix(col,cloth,drape*step(q.y,-.1));
  float ember=smoothstep(.05,0.,abs(q.y-cut))*smoothstep(.006,-.03,figSide(q-vec2(0.,.02)))*1.;
  col+=mix(vec3(1.,.55,.15),spec(q.x*2.+t*.2),.4)*ember*1.3;
  vec2 fq=vec2((q.x-.0-m.x*.15)*1.6,q.y-cut);
  float fn=tf(vec2(fq.x*3.+2.,fq.y*1.8-t*1.6)*1.8)*.7+tf(vec2(fq.x*6.,fq.y*3.5-t*2.5)*1.8)*.35;
  float body=fn*1.45-fq.y*1.1-abs(fq.x-.12)*.95-.12;
  float a=smoothstep(-.06,.5,body)*smoothstep(-.03,.03,fq.y);
  float hu=fract(fn*1.2+fq.y*.7-t*.08);
  vec3 warm=mix(vec3(1.,.42,.08),vec3(1.,.18,.62),smoothstep(.2,.8,fq.y*1.4+hu*.4));
  vec3 fc=mix(mix(warm,spec(hu),.35),vec3(1.,.9,.7),smoothstep(.5,1.,body));
  col=col*(1.-a*.8)+fc*a*1.15;
  for(int i=0;i<14;i++){float fi=float(i),h=fract(sin(fi*71.3)*4375.5),y=fract(h*5.+t*(.12+h*.15));
    vec2 sp=vec2(.05+(h-.3)*.6+y*.2,cut+y*.7);float s=exp(-length((q-sp)*vec2(1.,1.6))*90.);col+=spec(h+t*.1)*s*(1.-y);}
  return vec4(col,1.);}`],

  ghost: ['#1a0b3a,#4a2a96,#8a5cf0,#c9a8ff,#ff7a8a,#ffd7a0', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 q=p*1.05+vec2(-.05,.12);
  vec3 col=mix(pal(.55),pal(.3),smoothstep(-.6,.9,length(p*vec2(.7,1.))))+pal(.85)*.12*exp(-length(p-vec2(.15,.35))*3.);
  float sp=.08+.08*u_hover+.04*sin(t*.7);
  float acc=0.;
  for(int i=0;i<18;i++){float f=float(i)/17.;float off=f*f*(.5+.4*sin(q.y*40.+t*.5+f*3.)*.2);
    vec2 s=q+vec2(off*(1.2+m.x*.5)*sp*6.,0.);acc+=smoothstep(.01,-.01,figSide(s))*(1.-f*.85);}
  acc/=6.;
  float core=smoothstep(.006,-.006,figSide(q+vec2(sin(t*.8)*.004,0.)));
  col=mix(col,pal(.12),clamp(acc,0.,1.)*.75);
  col=mix(col,pal(.04),core*.85);
  float rim=smoothstep(.012,0.,abs(figSide(q-vec2(-.006,0.))))*step(0.,q.x+.02)*core;
  float rimH=smoothstep(.0,.03,figSide(q))*smoothstep(.06,0.,figSide(q))*step(-.05,q.x-q.y*.2);
  col+=mix(pal(.85),pal(1.),.5)*(rimH*.9+rim*.6)*(.85+.15*sin(t*2.));
  float streak=pow(tn(vec2(uv.y*u_res.y*.25,floor(t*2.)))*1.,6.)*smoothstep(.0,.6,acc);
  col+=pal(.9)*streak*.6+pal(.8)*smoothstep(.02,0.,abs(fract(uv.y*13.+t*.1)-.5)-.47)*acc*.08;
  return vec4(col,1.);}`],

  codehead: ['#000000,#141428,#2e5cff,#ff3d9a,#ffd23a,#ffffff', false, `
vec3 spec(float x){return clamp(abs(fract(x+vec3(0.,.67,.33))*6.-3.)-1.,0.,1.);}
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 px=uv*u_res;float rh=7.,cw=5.;float row=floor(px.y/rh);
  float burst=step(.8,hash(vec2(row*.13,floor(t*2.5))));
  float near=exp(-pow((uv.y-u_mouse.y)*9.,2.))*u_hover;
  float x=px.x+(hash(vec2(row,floor(t*3.)))-.5)*70.*burst+(hash(vec2(row,7.))-.5)*60.*near;
  float ch=floor(x/cw);vec2 cc=vec2((ch+.5)*cw,(row+.5)*rh)/u_res;
  vec2 q=(cc-.5)*vec2(AR(),1.)/min(AR(),1.)*1.05+vec2(.02,.1);
  float d=figSide(q),inside=smoothstep(.04,-.02,d);
  float trail=smoothstep(.06,-.3,figSide(q+vec2(.25+.15*sin(row*.7+t*.3),0.)))*.6*step(q.x,.1);
  float dens=max(inside*(.55+.45*tf(q*6.+t*.05)),trail*hash(vec2(row,3.)));
  float shoulder=smoothstep(.0,-.15,q.y+.25)*smoothstep(.0,-.2,q.x-.1)*.9;
  dens=max(dens,shoulder*(.5+.5*hash(vec2(ch,row))));
  vec2 f=vec2(mod(x,cw),mod(px.y,rh));
  float gx=floor(f.x/(cw/3.)),gy=floor(f.y/((rh-2.)/4.));
  float on=step(.42,hash(vec2(ch*3.+gx,row*5.+gy+floor(t*4.+ch*.11))))*step(f.x,cw-1.2)*step(f.y,rh-2.2);
  float vis=step(hash(vec2(ch*1.7,row*3.1)),dens);
  float lum=.35+.65*tf(q*4.-t*.03);
  vec3 c=mix(vec3(.85),spec(fract(q.y*.8+q.x*.3+lum*.4-t*.03)),smoothstep(.2,.7,lum)*.85);
  c=mix(c,vec3(1.),shoulder*.6);
  vec3 col=c*on*vis*(.5+.6*lum);
  return vec4(col,1.);}`],
  orb: ['#04030a,#1d1452,#4f46e5,#22d3ee,#f0abfc,#ffffff', true, `
vec4 fx(vec2 uv){
  vec2 p=P(uv)-MS()*.06;float t=u_time;
  float R=.32+.015*sin(t*1.6)+.03*u_hover,r=length(p);
  vec3 bg=mix(pal(0.),pal(.12),uv.y);
  vec3 glow=pal(.6)*exp(-max(r-R,0.)*7.)*.55+pal(.85)*exp(-max(r-R,0.)*22.)*.4;
  if(r>R){float a=clamp(length(glow)*1.2,0.,1.);return vec4(bg+glow,u_k.x>.5?a:1.);}
  vec2 q=p/R;float z=sqrt(max(1.-dot(q,q),0.));
  vec2 w=q*2.2/(z*.6+.4);
  for(int i=0;i<4;i++){w+=vec2(sin(w.y*1.6+t*(.7+u_hover)),cos(w.x*1.4-t*.8))*.38;}
  float f=.5+.5*sin(w.x*1.2+w.y*.9);
  vec3 col=mix(pal(.35),pal(.8),f)*(.35+.75*z)+mix(pal(.6),pal(1.),f)*pow(1.-z,2.5)*1.3;
  col+=vec3(1.)*pow(max(dot(normalize(vec3(q,z)),normalize(vec3(-.4,.5,.75))),0.),40.)*.8;
  return vec4(col+glow*.3,1.);}`],

  silk: ['#12060e,#4a0f2a,#9b2348,#e8576b,#ffc2a8,#fff1e6', false, `
float H(vec2 p){float t=u_time*.25;
  return sin(p.x*1.4+sin(p.y*1.1+t)*1.6+t)*.6+sin(p.y*2.2+sin(p.x*.8-t*1.3))*.35+sin((p.x+p.y)*3.1+t*1.7)*.1;}
vec4 fx(vec2 uv){
  vec2 p=P(uv)*1.7+MS()*.3;float e=.004,h=H(p);
  vec3 n=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*1.15,-(H(p+vec2(0.,e))-h)/e*1.15,1.));
  vec3 l=normalize(vec3(-.4,.6,.7)+vec3(MS(),0.)*.6);
  float dif=max(dot(n,l),0.),spe=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),26.),sh=pow(1.-n.z,1.5);
  vec3 col=pal(.18+.5*(.5+.5*h))*(.22+.85*dif)+pal(1.)*spe*.75+pal(.75)*sh*.45;
  return vec4(col,1.);}`],

  terrain: ['#140a26,#3b1d4a,#a8456b,#f2845c,#ffc38a,#fff4dc', false, `
float H(vec2 x){float h=0.,a=1.;vec2 q=x*.32;
  for(int i=0;i<4;i++){h+=a*(1.-abs(sin(q.x)*cos(q.y)));q=rot(.7)*q*2.1;a*=.45;}return h*1.05;}
vec4 fx(vec2 uv){
  vec2 p=P(uv);float z=u_time*1.4;
  vec3 ro=vec3(MS().x*2.,2.4+MS().y*.8,z),rd=normalize(vec3(p.x,p.y-.16,1.));
  vec3 sd=normalize(vec3(0.,.1,1.));
  vec3 sky=mix(pal(.78),pal(.28),smoothstep(-.05,.5,rd.y))+pal(1.)*pow(max(dot(rd,sd),0.),400.)*3.+pal(.9)*pow(max(dot(rd,sd),0.),6.)*.45;
  float t=.1;bool hit=false;
  for(int i=0;i<90;i++){vec3 q=ro+rd*t;float d=q.y-H(q.xz);if(d<.004*t){hit=true;break;}t+=d*.42;if(t>70.)break;}
  if(!hit)return vec4(sky,1.);
  vec3 q=ro+rd*t;float e=.02;
  vec3 n=normalize(vec3(H(q.xz-vec2(e,0.))-H(q.xz+vec2(e,0.)),2.*e,H(q.xz-vec2(0.,e))-H(q.xz+vec2(0.,e))));
  vec3 col=mix(pal(.08),pal(.32),smoothstep(.3,.9,n.y))*(.35+.9*max(dot(n,sd),0.))+pal(.85)*pow(1.-max(dot(n,-rd),0.),4.)*.25;
  col=mix(col,pal(.72),1.-exp(-t*.04));
  return vec4(col,1.);}`],

  tunnel: ['#04020c,#1a0b3d,#6d28d9,#ec4899,#22d3ee,#ffffff', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv)-MS()*.35;float a=atan(p.y,p.x),r=length(p);
  vec2 tc=vec2(.35/max(r,.001)+u_time*.7,a/3.14159);
  float fr=fract(tc.x*2.),rings=smoothstep(.43,.5,abs(fr-.5)),spokes=smoothstep(.45,.5,abs(fract(tc.y*12.+tc.x*.15)-.5));
  float dep=smoothstep(0.,.6,r);
  vec3 col=pal(.4+.5*fract(floor(tc.x*2.)*.13))*rings*1.4+pal(.8)*spokes*.7;
  col+=pal(.3)*(.5+.5*sin(tc.x*3.+tc.y*6.283*2.))*.18;
  col*=dep*1.4;col+=pal(1.)*exp(-r*10.)*.7+pal(.55)*exp(-r*3.)*.2;
  return vec4(col,1.);}`],

  waves: ['#05030c,#1e1b4b,#7c3aed,#f472b6,#fde68a', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();vec3 col=pal(.02);
  for(int i=0;i<46;i++){
    float fi=float(i)/45.,y0=.46-fi*.92,x=p.x,env=exp(-x*x*2.6);
    float y=y0+env*.2*(.5+.5*sin(x*6.+fi*13.+u_time*1.1)+.45*sin(x*13.+u_time*.7+fi*7.))*(.55+.45*sin(fi*9.+u_time*.4));
    y+=.14*exp(-pow((x-m.x)*3.5,2.))*exp(-pow((y0-m.y)*2.5,2.))*(.3+u_hover);
    if(p.y<y)col=pal(.02);
    float d=abs(p.y-y);col+=pal(.4+.6*fi)*smoothstep(.0045,0.,d)+pal(.9)*exp(-d*90.)*.12;}
  return vec4(col,1.);}`],

  clouds: ['#1a0f2e,#5b2a5c,#c2546f,#f59e6c,#ffd59e,#fffaf0', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time;
  vec2 sp=vec2(.25,.12);
  vec3 col=mix(pal(.82),pal(.18),smoothstep(-.3,.6,p.y));
  col+=pal(1.)*exp(-length(p-sp)*5.)*.8+pal(.95)*exp(-length(p-sp)*1.4)*.35;
  for(int i=0;i<3;i++){float fi=float(i),s=1.4+fi*.9;
    vec2 q=p*s*vec2(.8,1.6)+vec2(t*(.04+fi*.03)+fi*7.,fi*3.)+m*(.05+fi*.06);
    float d=tf(q*.9)-.52+fi*.04-p.y*.45;
    if(d>0.){float lit=clamp((tf(q*.9)-tf(q*.9+(sp-p)*.25))*5.+.5,0.,1.);
      vec3 cc=mix(pal(.3+fi*.1),pal(.95),lit);col=mix(col,cc,smoothstep(0.,.12,d)*(.75+fi*.1));}}
  return vec4(col,1.);}`],

  caustics: ['#021422,#04385f,#0e7490,#22d3ee,#a5f3fc,#ffffff', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv)*6.283-250.+MS()*.6;float t=u_time*.45+23.;vec2 i=p;float c=1.,inten=.005;
  for(int n=0;n<5;n++){float tt=t*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}
  c/=5.;c=1.17-pow(c,1.4);float v=pow(abs(c),8.);
  vec3 col=mix(pal(.15),pal(.55),uv.y)+pal(1.)*clamp(v,0.,1.2)*.9;
  col+=pal(.85)*.12*smoothstep(.4,1.,sin(p.x*.4+p.y*.2+u_time*.3))*uv.y;
  return vec4(col,1.);}`],

  morph: ['#0a0612,#2a1449,#7c4dff,#ff7ab6,#ffd27a,#ffffff', true, `
float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float shape(vec3 p,float k){
  if(k<.5)return length(p)-1.1;
  if(k<1.5)return sdBox(p,vec3(.78))-.12;
  if(k<2.5)return length(vec2(length(p.xz)-.95,p.y))-.38;
  return (abs(p.x)+abs(p.y)+abs(p.z)-1.3)*.577;}
float map(vec3 p){
  p.xz*=rot(u_time*.5+MS().x*1.5);p.xy*=rot(u_time*.3+MS().y);
  float ph=u_time*.3,k=mod(floor(ph),4.),b=smoothstep(.55,1.,fract(ph));
  return mix(shape(p,k),shape(p,mod(k+1.,4.)),b)*.85;}` + FX_MARCH + `
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 ro=vec3(0.,0.,4.6),rd=normalize(vec3(p,-2.2));
  vec3 bg=mix(pal(.02),pal(.14),uv.y)+pal(.6)*.18*exp(-length(p)*1.4);
  float t=march(ro,rd);
  if(t>12.)return vec4(bg,u_k.x>.5?0.:1.);
  vec3 n=nrm(ro+rd*t),l=normalize(vec3(.6,.7,.5));
  float fr=pow(1.-max(dot(n,-rd),0.),3.);
  vec3 col=mix(pal(.25),pal(.75),.5+.5*n.y)*(.4+.7*max(dot(n,l),0.))+pal(1.)*pow(max(dot(reflect(-l,n),-rd),0.),40.)+pal(.9)*fr*.6;
  return vec4(col,1.);}`],

  gradient: ['#0f0a1e,#3b1f8f,#e8467c,#ffa45b,#ffe8a3', false, `
vec4 fx(vec2 uv){
  vec2 p=P(uv),m=MS();float t=u_time*.18;
  vec2 q=p*1.1;q+=.35*vec2(sin(q.y*2.1+t*3.),cos(q.x*1.7-t*2.));
  vec3 acc=vec3(0.);float ws=0.;
  for(int i=0;i<5;i++){float fi=float(i);vec2 c=vec2(sin(t*(1.+fi*.3)+fi*2.1),cos(t*(1.2+fi*.2)+fi*1.3))*vec2(.75,.45);
    if(i==4)c=mix(c,m,.6*u_hover);
    float w=1./(pow(length(q-c),2.)*5.+.2);acc+=pal(fi/4.)*w;ws+=w;}
  return vec4(acc/ws,1.);}`],

  swarm: ['#020108,#16103a,#4f46e5,#f472b6,#fbbf24,#ffffff', true, `
vec4 fx(vec2 uv){
  vec2 p=P(uv);vec3 col=mix(pal(0.),pal(.08),uv.y);float a2=0.;
  float rx=MS().y*.8+.35,ry=u_time*.12+MS().x*1.2;
  for(int i=0;i<180;i++){float fi=float(i),h=fract(sin(fi*12.9898)*43758.5),h2=fract(sin(fi*78.233)*12543.1);
    float a=fi*2.39996+u_time*(.15+h*.25),r=.35+1.1*sqrt(h2);
    vec3 q=vec3(cos(a)*r,sin(a*2.+fi)*.12*r+(h-.5)*.25,sin(a)*r);
    q.yz*=rot(rx);q.xz*=rot(ry);
    float z=q.z+3.;vec2 s=q.xy/z*2.4;float sz=(.0035+.007*h)/z*2.4;
    float d=length(p-s);float g=exp(-d*d/(sz*sz))+exp(-d/(sz*5.))*.08;
    col+=pal(.5+.5*h2)*g*(1.2-q.z*.25);a2+=g;}
  return vec4(col,u_k.x>.5?clamp(a2,0.,1.):1.);}`]
};

class PiixFxElement extends GLStage {
  static get observedAttributes() { return [...GLStage.observedAttributes, 'bg', 'quality', 'grain']; }
  constructor() { super(); this._fade = 0; }
  get kind() { const k = this.getAttribute('kind'); return FX_KINDS[k] ? k : 'blob'; }
  get _defPal() { return FX_KINDS[this.kind][0]; }
  _hostCss() { return (this.hasAttribute('fill') ? '' : 'width:100%;') + (this.hasAttribute('fill') || this.getAttribute('height') ? '' : 'height:480px;'); }
  _css() { return 'canvas{image-rendering:auto!important}'; }
  _setup() {
    if (this.hasAttribute('fill')) this.setAttribute('aria-hidden', 'true');
    else if (!this.hasAttribute('aria-label')) { this.setAttribute('role', 'img'); this.setAttribute('aria-label', `An animated ${this.kind} visual`); }
  }
  /* render at a share of the CSS size (raymarching every device pixel would be wasteful) and let the browser smooth it up */
  _fit() {
    if (!this._cv) return;
    const r = (this._box ? this._box() : this).getBoundingClientRect(), q = clamp(+this.getAttribute('quality') || .75, .2, 1);
    this._W = Math.max(2, Math.ceil(r.width * q)); this._H = Math.max(2, Math.ceil(r.height * q)); this._px = 1 / q;
    if (this._cv.width !== this._W || this._cv.height !== this._H) { this._cv.width = this._W; this._cv.height = this._H; }
    this._still = false;
  }
  _texture() { return scNoise(); }
  _shader() { const [, , body] = FX_KINDS[this.kind]; return FX_HEAD + body + FX_TAIL; }
  _uniforms(T, dt) {
    this._fade = reduced() ? 1 : Math.min(1, this._fade + dt * 2.2);
    const g = this.hasAttribute('grain') ? +this.getAttribute('grain') : ({ aura: 1, ink: .7, reeded: .5 }[this.kind] ?? .35);
    return { u_j: [this._fade, g, 0, 0], u_k: [this.getAttribute('bg') === 'none' && FX_KINDS[this.kind][1] ? 1 : 0, 0, 0, 0] };
  }
}
define('piix-fx', PiixFxElement);
ELEMENTS.fx = 'piix-fx';
