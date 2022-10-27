import { Coordinates, createMatrix, Matrix } from '../../utils';
import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_ACTIONS,
  PlayerAction,
  PLAYER_SPEED,
  PLAYER_SIZE,
  TICK_RATE,
  PLAYER_FIELD_OF_VIEW
} from '../../constants';
import { clamp, mapRange, perlinMatrix } from '../../utils/math';
import {
  makeSpatialHashGrid,
  SpatialHashGrid,
  SpatialHashGridItem
} from '../../utils/spatialHashGrid';

export type PlayerMeta = {
  id: string;
};

export type Player = {
  id: string;
  gridItem: SpatialHashGridItem<PlayerMeta>;
  allDiscoveredCells: Map<string, GameMapCell>;
  newDiscoveredCells: Map<string, GameMapCell>;
  ongoingActions: Set<PlayerAction>;
};

export type GameMapCell = Coordinates & {
  lightness: number;
};

export type GameMap = {
  grid: Matrix<GameMapCell>;
};

export type GameState = {
  map: GameMap;
  players: Record<string, Player>;
  grid: SpatialHashGrid<PlayerMeta>;
};

export type StateUpdateCallback = (state: Readonly<GameState>) => void;

const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
const noiseSeed = perlinMatrix(mapDimensions);

let isRunning = false;

const gameState: GameState = {
  players: {},
  map: {
    grid: createMatrix(mapDimensions, ({ x, y }) => {
      const noise = Math.round(noiseSeed[x][y] * 100) / 100;
      return {
        x,
        y,
        lightness: mapRange(noise, { min: 0, max: 1 }, { min: 0.3, max: 0.75 })
      };
    })
  },
  grid: makeSpatialHashGrid<PlayerMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  })
};

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

const getVisibleCells = (point: Coordinates) => {
  const coords = {
    min: {
      x: point.x - PLAYER_FIELD_OF_VIEW,
      y: point.y - PLAYER_FIELD_OF_VIEW
    },
    max: {
      x: point.x + PLAYER_FIELD_OF_VIEW, // why + CELL_SIZE tho
      y: point.y + PLAYER_FIELD_OF_VIEW
    }
  };

  const indices = {
    min: gameState.grid.getCellIndex(coords.min),
    max: gameState.grid.getCellIndex(coords.max)
  };

  const entries: [string, GameMapCell][] = [];
  for (let x = indices.min.x; x <= indices.max.x; x++) {
    for (let y = indices.min.y; y <= indices.max.y; y++) {
      entries.push([`${x}.${y}`, gameState.map.grid[x][y]]);
    }
  }

  return new Map(entries);
};

const makePlayer = (id: string): Player => {
  const position = {
    x: Math.round(Math.random() * GRID_SIZE * CELL_SIZE),
    y: Math.round(Math.random() * GRID_SIZE * CELL_SIZE)
  };

  const dimensions = { w: PLAYER_SIZE, h: PLAYER_SIZE };

  return {
    id,
    allDiscoveredCells: getVisibleCells(position),
    newDiscoveredCells: getVisibleCells(position),
    gridItem: gameState.grid.add(
      {
        position,
        dimensions
      },
      { id }
    ),
    ongoingActions: new Set()
  };
};

const movePlayer = (player: Player, { x = 0, y = 0 }) => {
  if (x === 0 && y === 0) return;

  player.gridItem.position.x = clampToGrid(
    player.gridItem.position.x + x * PLAYER_SPEED
  );
  player.gridItem.position.y = clampToGrid(
    player.gridItem.position.y + y * PLAYER_SPEED
  );

  const visibleCells = getVisibleCells(player.gridItem.position);
  for (const [key, cell] of visibleCells) {
    if (!player.allDiscoveredCells.has(key)) {
      player.allDiscoveredCells.set(key, cell);
      player.newDiscoveredCells.set(key, cell);
    }
  }

  gameState.grid.update(player.gridItem);
};

const updateGameState = () => {
  Object.values(gameState.players).forEach(player => {
    player.ongoingActions.forEach(action => {
      switch (action) {
        case PLAYER_ACTIONS.MOVE_UP:
          return movePlayer(player, { y: -1 });
        case PLAYER_ACTIONS.MOVE_DOWN:
          return movePlayer(player, { y: 1 });
        case PLAYER_ACTIONS.MOVE_LEFT:
          return movePlayer(player, { x: -1 });
        case PLAYER_ACTIONS.MOVE_RIGHT:
          return movePlayer(player, { x: 1 });
      }
    });
  });
};

const cleanupState = () => {
  Object.values(gameState.players).forEach(player => {
    player.newDiscoveredCells.clear();
  });
};

const updateCallbacks = new Set<StateUpdateCallback>();

export const gameController = {
  get gameState() {
    return gameState as Readonly<GameState>;
  },

  getPlayerById: (id: string) => gameState.players[id],

  addPlayer: (socketId: string) => {
    const player = makePlayer(socketId);
    gameState.players[socketId] = player;

    return player;
  },

  removePlayer: (player: Player) => {
    gameState.grid.remove(player.gridItem);
    delete gameState.players[player.id];
  },

  start: () => {
    if (isRunning) return;

    setInterval(() => {
      updateGameState();
      updateCallbacks.forEach(cb => cb(gameState));
      cleanupState();
    }, 1000 / TICK_RATE);
    isRunning = true;
  },

  onStateUpdate: (cb: StateUpdateCallback) => {
    updateCallbacks.add(cb);

    return () => updateCallbacks.delete(cb);
  },

  getPlayerFieldOFView: (player: Player) => {
    return gameState.grid
      .findNearbyRadius(player.gridItem.position, PLAYER_FIELD_OF_VIEW)
      .map(gridItem => ({
        ...gridItem.position,
        id: gridItem.meta.id
      }));
  }
};
