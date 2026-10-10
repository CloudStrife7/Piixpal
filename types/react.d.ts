/* Types for piixpal/react */
import type { FC, HTMLAttributes } from 'react';
import type { PiixPalAttributes, PiixSpriteAttributes, PiixTypeAttributes, PiixCrowdAttributes, PiixWeatherAttributes, PiixStickersAttributes, PiixAvatarAttributes, PiixVoxelAttributes, PiixCardAttributes, PiixPlanetAttributes, PiixGlobeAttributes, PiixHoloAttributes, PiixRoomAttributes } from './piixpal';
type Extra = Omit<HTMLAttributes<HTMLElement>, 'color'> & Record<string, unknown>;
export const PiixPal: FC<PiixPalAttributes & Extra>;
export const PiixSprite: FC<PiixSpriteAttributes & Extra>;
export const PiixType: FC<PiixTypeAttributes & Extra>;
export const PiixCrowd: FC<PiixCrowdAttributes & Extra>;
export const PiixWeather: FC<PiixWeatherAttributes & Extra>;
export const PiixStickers: FC<PiixStickersAttributes & Extra>;
export const PiixAvatar: FC<PiixAvatarAttributes & Extra>;
export const PiixVoxel: FC<PiixVoxelAttributes & Extra>;
export const PiixCard: FC<PiixCardAttributes & Extra>;
export const PiixPlanet: FC<PiixPlanetAttributes & Extra>;
export const PiixGlobe: FC<PiixGlobeAttributes & Extra>;
export const PiixHolo: FC<PiixHoloAttributes & Extra>;
export const PiixRoom: FC<PiixRoomAttributes & Extra>;
export function loadPiixpal(): Promise<unknown>;
