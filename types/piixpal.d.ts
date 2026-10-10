/* Types for Piixpal's custom elements and global API. */
type Bool = boolean | '' | undefined;

export interface PiixPalAttributes {
  pal?: string; do?: string; on?: string; box?: string; at?: number | string; scale?: number | string; hue?: number | string;
  edge?: 'text' | 'box'; speed?: number | string; energy?: number | string; length?: number | string;
  count?: number | string; bpm?: number | string; land?: string; silk?: string; 'fixed-scale'?: Bool;
}
export interface PiixSpriteAttributes {
  name?: string; size?: number | string; scale?: number | string; hue?: number | string; color?: string; eye?: string;
  render?: 'pixel' | 'dots' | 'halftone' | 'dither' | 'ascii' | 'voxel'; depth?: number | string;
  look?: 'mouse' | 'wander' | 'none'; shy?: Bool; tilt?: Bool; still?: Bool; 'no-shy'?: Bool; 'no-tilt'?: Bool; 'sleep-after'?: number | string;
}
export interface PiixTypeAttributes {
  text?: string; rows?: number | string; cell?: number | string; fit?: Bool; color?: string; shade?: string; depth?: number | string;
  gap?: number | string; font?: string; weight?: number | string; align?: 'left' | 'center' | 'right';
  shape?: 'square' | 'dot' | 'round' | 'plus' | 'diamond'; intro?: 'none';
}
export type PiixLook = 'glossy' | 'clay' | 'toon' | 'wire' | 'holo' | 'halftone' | 'dither' | 'ascii';
export interface PiixVoxelAttributes { pal?: string; look?: PiixLook; size?: number | string; spin?: number | string; depth?: number | string; clip?: string; tilt?: number | string; light?: 'pointer' | 'fixed'; floor?: 'none'; }
export interface PiixCardAttributes { pal?: string; rarity?: 'common' | 'rare' | 'holo'; look?: PiixLook; size?: number | string; color?: string; }
export interface PiixPlanetAttributes { pals?: string; seed?: number | string; size?: number | string; spin?: number | string; look?: PiixLook; }
export interface PiixGlobeAttributes { pal?: string; sky?: 'night' | 'dusk' | 'day'; snow?: number | string; size?: number | string; look?: PiixLook; }
export interface PiixHoloAttributes { pal?: string; color?: 'cyan' | 'lime' | 'pink' | 'amber'; size?: number | string; look?: PiixLook; }
export interface PiixRoomAttributes { scene?: 'desk' | 'pond' | 'night'; pal?: string; size?: number | string; look?: PiixLook; }
export type PiixPrintLook = 'ascii' | 'dither' | 'halftone' | 'pixel';
export interface PiixBackdropAttributes { kind?: 'aurora' | 'sunburst' | 'plasma' | 'rain' | 'stars' | 'clouds' | 'tunnel' | 'synthwave' | 'fire' | 'waves'; look?: PiixPrintLook; palette?: string; ink?: string; paper?: string; cell?: number | string; ramp?: string; edges?: string | number; speed?: number | string; height?: number | string; fill?: boolean | ''; }
export interface PiixSceneAttributes { scene?: 'kiss' | 'heartbreak' | 'umbrella' | 'stargaze' | 'alone' | 'hug' | 'heart' | 'campfire'; look?: PiixPrintLook; ink?: string; paper?: string; cell?: number | string; ramp?: string; edges?: string | number; speed?: number | string; size?: number | string; }
export interface PiixWeatherAttributes { kind?: 'snow' | 'rain' | 'leaves' | 'petals'; amount?: number | string; land?: string; box?: string; }
export interface PiixStickersAttributes { names?: string; box?: string; }
export interface PiixAvatarAttributes extends Omit<PiixSpriteAttributes, 'name'> { seed?: string; }
export interface PiixToastOptions { type?: 'ok' | 'error' | 'info'; title?: string; time?: number; }
export interface PiixCrowdAttributes { mode?: 'crowd' | 'swarm' | 'form'; count?: number | string; text?: string; height?: number | string; scale?: number | string; }

export interface PiixpalAPI {
  version: string;
  add(name: string, where?: string | Element, attrs?: Record<string, string | number | boolean>): HTMLElement;
  list(): { pals: string[]; sprites: string[]; behaviors: string[]; elements: string[] };
  /** a toast notification, delivered by pigeon */
  toast(message: string, options?: PiixToastOptions): void;
  /** send the fetch dog off while a promise is pending */
  busy<T>(work: Promise<T>): Promise<T>;
  clear(): void;
  advance(seconds?: number, fps?: number): void;
  readonly reducedMotion: boolean;
}
declare global {
  interface Window { Piixpal: PiixpalAPI; }
  namespace JSX {
    interface IntrinsicElements {
      'piix-pal': PiixPalAttributes & Record<string, unknown>;
      'piix-sprite': PiixSpriteAttributes & Record<string, unknown>;
      'piix-type': PiixTypeAttributes & Record<string, unknown>;
      'piix-crowd': PiixCrowdAttributes & Record<string, unknown>;
      'piix-weather': PiixWeatherAttributes & Record<string, unknown>;
      'piix-voxel': PiixVoxelAttributes & Record<string, unknown>;
      'piix-card': PiixCardAttributes & Record<string, unknown>;
      'piix-planet': PiixPlanetAttributes & Record<string, unknown>;
      'piix-globe': PiixGlobeAttributes & Record<string, unknown>;
      'piix-holo': PiixHoloAttributes & Record<string, unknown>;
      'piix-room': PiixRoomAttributes & Record<string, unknown>;
      'piix-backdrop': PiixBackdropAttributes & Record<string, unknown>;
      'piix-scene': PiixSceneAttributes & Record<string, unknown>;
      'piix-stickers': PiixStickersAttributes & Record<string, unknown>;
      'piix-avatar': PiixAvatarAttributes & Record<string, unknown>;
    }
  }
}
