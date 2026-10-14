/* IMAGE FX: photos that melt, split, ripple, streak and morph under the pointer.   @component image-fx
 *
 *   <piix-image-fx src="portrait.jpg" effect="streak" alt="…"></piix-image-fx>
 *   <piix-image-fx src="day.jpg" src2="night.jpg" effect="morph" alt="…"></piix-image-fx>
 *
 * Smooth, full-resolution GPU image effects, the kind you see on award-winning sites: the image
 * turns to liquid and bulges toward the pointer, splits into red and blue when you move fast,
 * ripples like water, smears into long streaks of light, zooms in a blur, or melts from one
 * picture into a second one through a glowing edge, hides behind hammered glass with a clear window
 * that follows the pointer, or breaks into rows of glitching glyphs. It crops like object-fit: cover.
 * Images must be on your site or served with CORS.
 *
 *   src, src2 the image, and a second one for morph
 *   alt       what it shows
 *   effect    alive | liquid | rgb | morph | ripple | streak | zoom | frosted | code   default: liquid
 *             alive keeps the picture as it is and brings it to life: depth parallax, breathing glow,
 *             heat haze over the hot parts, bloom, a slow light sweep and grain
 *   auto      morph back and forth on its own instead of on hover
 *   palette   the glow colours (morph edge, streak light)      default: sunset
 *   height    any CSS length (default: the image's own shape)  */
const IFX = {
  alive: `float L(vec2 c){return dot(IMG(c,0.),vec3(.3,.59,.11));}
    float soft(vec2 c){float s=0.;for(int i=0;i<8;i++){float a=float(i)*.785;s+=L(c+vec2(cos(a),sin(a))*.03);}return s/8.;}
    vec3 shade(vec2 c){float t=u_time;
    float d=soft(c);
    vec2 m=(u_mouse-.5)*u_hover+vec2(sin(t*.23),cos(t*.19))*.35;
    vec2 cp=.5+(c-.5)*(.97+.012*sin(t*.31))+vec2(sin(t*.17),cos(t*.13))*.006;
    cp-=m*(d-.25)*.05;
    float hot=smoothstep(.45,.95,soft(cp-vec2(0.,.04)));
    cp+=vec2(sin(cp.y*60.-t*5.)+sin(cp.y*23.+cp.x*9.-t*3.),0.)*.0016*hot;
    cp.y+=sin(cp.x*40.+t*2.)*.0008*hot;
    vec3 col=IMG(cp,0.);
    float lum=dot(col,vec3(.3,.59,.11)),glow=smoothstep(.55,1.,lum);
    float flick=.85+.15*sin(t*7.+cp.y*30.)*sin(t*3.3+cp.x*17.)+.1*sin(t*1.3);
    col+=col*glow*(flick-.85)*1.8;
    vec3 bloom=vec3(0.);for(int i=0;i<10;i++){float a=float(i)*.628;vec3 s=IMG(cp+vec2(cos(a),sin(a))*.02,0.);bloom+=max(s-.6,0.);}
    col+=bloom/10.*mix(vec3(1.),pal(.8),.5)*(.9+.4*sin(t*2.1));
    float sw=smoothstep(.12,0.,abs(fract(t*.05)*2.4-.7-(c.x+c.y*.4)));
    col+=pal(1.)*sw*.06*(.5+d);
    col*=1.-.3*smoothstep(.45,.95,length((c-.5)*vec2(1.2,1.)));
    col+=(hash(c*u_res+fract(t*7.)*91.)-.5)*.06;
    return col;}`,
  frosted: `float bump(vec2 c){return tn(c*u_res*.35)*.6+tn(c*u_res*.8+7.)*.4;}
    vec3 shade(vec2 c){float ar=u_res.x/u_res.y;vec2 e=vec2(1.5,0.)/u_res;float b0=bump(c);
    vec2 g=vec2(bump(c+e.xy)-b0,bump(c+e.yx)-b0);vec2 cc=c+g*.06;
    vec3 col=vec3(0.);
    for(int i=0;i<12;i++){float a=float(i)*.5236,rr=.006+.012*fract(float(i)*.37);col+=IMG(cc+vec2(cos(a),sin(a))*rr,0.);}
    col=col/12.;col=mix(col,vec3(dot(col,vec3(.33))),.15)*(.9+.25*(b0-.5))+vec3(.06)*smoothstep(.55,.9,b0);
    vec2 d=(c-u_mouse)*vec2(ar,1.);float sq=max(abs(d.x),abs(d.y)),w=.2*smoothstep(0.,.6,u_hover);
    if(w>.01&&sq<w)return IMG(c,0.);
    return col+vec3(.9)*step(w,sq)*step(sq,w+.0025)*step(.01,w);}`,
  code: `vec3 spec(float x){return clamp(abs(fract(x+vec3(0.,.67,.33))*6.-3.)-1.,0.,1.);}
    vec3 shade(vec2 c){vec2 px=c*u_res;float rh=8.,cw=6.;float row=floor(px.y/rh);
    float burst=step(.82,hash(vec2(row*.13,floor(u_time*2.5))));
    float near=exp(-pow((c.y-u_mouse.y)*9.,2.))*u_hover;
    float x=px.x+(hash(vec2(row,floor(u_time*3.)))-.5)*120.*burst+(hash(vec2(row,7.))-.5)*90.*near;
    float ch=floor(x/cw);vec2 f=vec2(mod(x,cw),mod(px.y,rh));
    vec3 im=IMG(vec2((ch+.5)*cw,(row+.5)*rh)/u_res,0.);float lum=dot(im,vec3(.3,.59,.11));
    float gx=floor(f.x/(cw/3.)),gy=floor(f.y/((rh-2.)/4.));
    float on=step(.45,hash(vec2(ch*3.+gx,row*5.+gy+floor(u_time*5.+ch*.13))))*step(f.x,cw-1.5)*step(f.y,rh-2.5);
    float vis=step(.12,lum)*step(hash(vec2(ch,row*3.1)),lum*1.6);
    vec3 col=mix(im*1.5,spec(fract(lum*.8+row*.006-u_time*.04)),.35);
    return col*on*vis;}`,
  liquid: `vec3 shade(vec2 c){vec2 m=u_mouse,d=c-m;float t=u_time;
    c+=.02*(.5+u_hover)*vec2(sin(c.y*11.+t*1.2),cos(c.x*9.-t*1.1));
    c-=d*exp(-dot(d,d)*28.)*.22*u_hover;
    return IMG(c,0.);}`,
  rgb: `vec3 shade(vec2 c){float o=.003+.045*u_j.w;vec2 dir=vec2(1.,.15);
    vec3 col=vec3(IMG(c+dir*o,0.).r,IMG(c,0.).g,IMG(c-dir*o,0.).b);
    return col*(.94+.06*sin(c.y*u_res.y*1.5));}`,
  morph: `vec3 shade(vec2 c){float p=u_j.z,n=.55*sin(c.x*7.+sin(c.y*5.)*1.6)*.5+.5*(.5+.5*sin(c.y*13.+c.x*4.+u_time*.4))*.45+.1*sin(c.x*31.)*sin(c.y*27.);
    float e=p*1.3-.15,k=smoothstep(e-.06,e+.06,n);
    vec2 w=vec2(sin(c.y*20.+u_time),cos(c.x*20.))*.02*(1.-abs(k*2.-1.));
    vec3 col=mix(IMG(c+w,1.),IMG(c-w,0.),k);
    return col+pal(.85)*smoothstep(.07,0.,abs(n-e))*1.4;}`,
  ripple: `vec3 shade(vec2 c){vec2 d=c-u_mouse;float r=length(d*vec2(u_res.x/u_res.y,1.));
    c+=normalize(d+.0001)*sin(r*70.-u_time*9.)*.016*exp(-r*3.)*(.35+u_hover);
    return IMG(c,0.)+vec3(.08)*sin(r*70.-u_time*9.)*exp(-r*5.)*u_hover;}`,
  streak: `vec3 shade(vec2 c){vec3 acc=vec3(0.),hi=vec3(0.);float amt=.04+.12*u_hover+.1*u_j.w;
    for(int i=0;i<16;i++){float f=float(i)/15.;vec3 s=IMG(c-vec2(f*amt,0.),0.);acc+=s;hi+=max(s-.55,0.)*(1.-f);}
    acc/=16.;vec3 base=mix(IMG(c,0.),acc,.65);
    return base*mix(vec3(1.),pal(.55)*1.4,.25)+hi*pal(.9)*.35+pal(1.)*pow(max(dot(hi,vec3(.33))-.4,0.),2.)*.4;}`,
  zoom: `vec3 shade(vec2 c){vec3 acc=vec3(0.);float s=.015+.12*u_hover;vec2 o=u_mouse;
    for(int i=0;i<14;i++){float f=float(i)/13.;acc+=IMG(o+(c-o)*(1.-f*s),0.);}
    return acc/14.;}`
};
const IFX_HEAD = `
float tn(vec2 p){return hash(floor(p))*.5+hash(floor(p*.5))*.3+hash(floor(p*.25))*.2;}
vec3 IMG(vec2 c,float which){c=clamp(c,.001,.999);return texture2D(u_tex,vec2(c.x*.5+which*.5,c.y)).rgb;}
`;
const IFX_TAIL = `
vec4 effect(vec2 uv,vec2 cell){
  vec2 c=(uv-.5)*u_j.xy+.5;
  return vec4(shade(c),u_k.x);}`;
class PiixImageFxElement extends GLStage {
  static get observedAttributes() { return [...GLStage.observedAttributes, 'src2', 'alt', 'auto']; }
  constructor() { super(); this._defPal = 'sunset'; this._tex = { owner: {}, src: null, dirty: false }; this._p = 0; this._vel = 0; this._fade = 0; this._lm = [.5, .5]; }
  get effect() { const e = this.getAttribute('effect'); return IFX[e] ? e : 'liquid'; }
  _hostCss() { return 'display:block;width:100%;' + (this.getAttribute('height') ? '' : `aspect-ratio:${this._ar || '16/10'};`); }
  _css() { return 'canvas{image-rendering:auto!important}'; }
  _setup() {
    this.setAttribute('role', 'img');
    this.setAttribute('aria-label', this.getAttribute('alt') || '');
    this._load();
  }
  /* both images side by side in one texture, each scaled to the same box */
  _load() {
    const a = this.getAttribute('src'), b = this.getAttribute('src2') || a;
    if (!a || (this._loaded === a + '|' + b)) return;
    this._loaded = a + '|' + b;
    const get = s => new Promise(ok => { const i = new Image(); i.crossOrigin = 'anonymous'; i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = s; });
    Promise.all([get(a), get(b)]).then(([A, B]) => {
      if (!A) return;
      const w = Math.min(1600, A.naturalWidth), h = Math.round(w * A.naturalHeight / A.naturalWidth);
      const c = document.createElement('canvas'); c.width = w * 2; c.height = h;
      const g = c.getContext('2d');
      g.drawImage(A, 0, 0, w, h); g.drawImage(B || A, w, 0, w, h);
      this._ia = w / h; this._tex = { owner: this._tex.owner, src: c, dirty: true };
      if (!this.getAttribute('height')) { this._ar = `${A.naturalWidth}/${A.naturalHeight}`; this.style.aspectRatio = this._ar; }
    });
  }
  /* smooth, near full resolution: a photo should look like a photo */
  _fit() {
    if (!this._cv) return;
    const r = this.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 1.5);
    this._W = Math.max(2, Math.ceil(r.width * k)); this._H = Math.max(2, Math.ceil(r.height * k)); this._px = 1 / k;
    if (this._cv.width !== this._W || this._cv.height !== this._H) { this._cv.width = this._W; this._cv.height = this._H; }
    this._still = false;
  }
  _texture() { const t = this._tex; if (!t.src) return null; const out = { owner: t.owner, src: t.src, dirty: t.dirty }; t.dirty = false; return out; }
  _shader() { return IFX_HEAD + IFX[this.effect] + IFX_TAIL; }
  _skip() { return !this._tex.src; }
  _uniforms(T, dt) {
    this._load();
    const ea = this._W / this._H || 1, ia = this._ia || ea;
    const s = ea > ia ? [1, ia / ea] : [ea / ia, 1];
    /* how fast the pointer is moving, for the colour split and the streaks */
    const v = Math.hypot(this._m[0] - this._lm[0], this._m[1] - this._lm[1]) / Math.max(dt, .001);
    this._lm = this._m.slice();
    this._vel = lerp(this._vel, Math.min(1, v * .25), Math.min(1, dt * 6));
    const want = this.hasAttribute('auto') ? .5 + .5 * Math.sin(T * .7) : this._hov > .5 ? 1 : 0;
    this._p = reduced() ? want : lerp(this._p, want, Math.min(1, dt * (this.hasAttribute('auto') ? 10 : 2.4)));
    this._fade = Math.min(1, this._fade + dt * 2.5);
    return { u_j: [s[0], s[1], this._p, this._vel], u_k: [this._fade, 0, 0, 0] };
  }
}
define('piix-image-fx', PiixImageFxElement);
ELEMENTS['image-fx'] = 'piix-image-fx';
