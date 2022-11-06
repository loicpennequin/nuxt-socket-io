import { TerrainType } from './enums';

export const TICK_RATE = 20;
export const PING_INTERVAL = 1000;
export const BOTS_COUNT = 0;

export const GRID_SIZE = 250;
export const CELL_SIZE = 32;

export const MAP_SIZE = GRID_SIZE * CELL_SIZE;
export const MAP_NOISE_DETAIL = 0.05;

export const PLAYER_SIZE = 64;
export const PLAYER_SPEED_PER_SECOND = CELL_SIZE * 15;
export const PLAYER_SPEED = PLAYER_SPEED_PER_SECOND / TICK_RATE;
export const PLAYER_HARD_FIELD_OF_VIEW = CELL_SIZE * 12;
export const PLAYER_SOFT_FIELD_OF_VIEW = CELL_SIZE * 24;

export const PROJECTILE_LIFESPAN = 15;
export const PROJECTILE_SIZE = 12;
export const PROJECTILE_SPEED_PER_SECOND = CELL_SIZE * 55;
export const PROJECTILE_SPEED = PROJECTILE_SPEED_PER_SECOND / TICK_RATE;
export const PROJECTILE_HARD_FIELD_OF_VIEW = CELL_SIZE * 8;
export const PROJECTILE_SOFT_FIELD_OF_VIEW = CELL_SIZE * 12;

export const WALKABLE_TERRAIN = [TerrainType.GRASS, TerrainType.SAND] as const;
