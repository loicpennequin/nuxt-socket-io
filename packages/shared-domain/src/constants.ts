import { TerrainType } from './enums';

export const TICK_RATE = 20;
export const PING_INTERVAL = 1000;
export const BOTS_COUNT = 0;
export const IDLE_DISCONNECT_TIMEOUT = 1000 * 60 * 10;

export const GRID_SIZE = 100;
export const CELL_SIZE = 32;

export const MAP_SIZE = GRID_SIZE * CELL_SIZE;
export const MAP_NOISE_DETAIL = 0.03;

export const PLAYER_SIZE = 64;
export const PLAYER_SPEED_PER_SECOND = CELL_SIZE * 12;
export const PLAYER_SPEED = PLAYER_SPEED_PER_SECOND / TICK_RATE;
export const PLAYER_HARD_FIELD_OF_VIEW = CELL_SIZE * 12;
export const PLAYER_SOFT_FIELD_OF_VIEW = CELL_SIZE * 20;

export const PROJECTILE_LIFESPAN = 15;
export const PROJECTILE_SIZE = 32;
export const PROJECTILE_SPEED_PER_SECOND = CELL_SIZE * 25;
export const PROJECTILE_SPEED = PROJECTILE_SPEED_PER_SECOND / TICK_RATE;
export const PROJECTILE_HARD_FIELD_OF_VIEW = CELL_SIZE * 8;
export const PROJECTILE_SOFT_FIELD_OF_VIEW = CELL_SIZE * 12;

export const NOISE_TO_TERRAIN_MAP: Record<number, TerrainType> = {
  0: TerrainType.DEEP_WATER,
  5: TerrainType.DEEP_WATER,
  10: TerrainType.DEEP_WATER,
  15: TerrainType.DEEP_WATER,
  20: TerrainType.DEEP_WATER,
  25: TerrainType.WATER,
  30: TerrainType.WATER,
  35: TerrainType.WATER,
  40: TerrainType.SAND,
  45: TerrainType.GRASS,
  50: TerrainType.GRASS,
  55: TerrainType.GRASS,
  60: TerrainType.GRASS,
  65: TerrainType.LOW_MOUNTAIN,
  70: TerrainType.LOW_MOUNTAIN,
  75: TerrainType.HIGH_MOUNTAIN,
  80: TerrainType.HIGH_MOUNTAIN,
  85: TerrainType.SNOW,
  90: TerrainType.SNOW,
  95: TerrainType.SNOW,
  100: TerrainType.SNOW
};
export const WALKABLE_TERRAIN = [TerrainType.GRASS, TerrainType.SAND] as const;
