/* IMAGE FX: photos that melt, split, ripple, streak and morph under the pointer.   @component image-fx
 *
 *   <piix-image-fx src="portrait.jpg" effect="streak" alt="…"></piix-image-fx>
 *   <piix-image-fx src="day.jpg" src2="night.jpg" effect="morph" alt="…"></piix-image-fx>
 *
 * Smooth, full-resolution GPU image effects, the kind you see on award-winning sites: the image
 * turns to liquid and bulges toward the pointer, splits into red and blue when you move fast,
 * ripples like water, smears into long streaks of light, zooms in a blur, or melts from one
 * picture into a second one through a glowing edge. It crops like object-fit: cover.
 * Images must be on your site or served with CORS.
 *
 *   src, src2 the image, and a second one for morph
 *   alt       what it shows
 *   effect    liquid | rgb | morph | ripple | streak | zoom      default: liquid
 *   auto      morph back and forth on its own instead of on hover
 *   palette   the glow colours (morph edge, streak light)      default: sunset
 *   height    any CSS length (default: the image's own shape)  */
const IFX = {
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
