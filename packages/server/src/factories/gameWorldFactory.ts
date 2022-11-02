import {
  ActionPayload,
  createTaskQueue,
  OngoingActionStartPayload,
  PlayerAction,
  TICK_RATE
} from '@game/shared';
import { Entity } from './entityFactory';
import { Player } from './playerFactory';

export type EntityMap = Map<string, Entity>;
export type StateUpdateCallback = (
  state: Readonly<{ entities: EntityMap }>
) => void;

export type OngoingActionKey = `${string}.${string}`;

export type GameAction = ActionPayload & { player: Player };
export type GameOngoingAction = OngoingActionStartPayload & { player: Player };
export const createGameWorld = () => {
  const entities = new Map<string, Entity>();
  const actionsQueue = createTaskQueue();
  const ongoingActions = new Map<string, GameOngoingAction>();
  const updateCallbacks = new Set<StateUpdateCallback>();
  let isRunning = false;

  const update = () => {
    actionsQueue.process();
    entities.forEach(entity => {
      entity.update();
    });
  };

  const tick = () => {
    update();
    updateCallbacks.forEach(cb => cb({ entities }));
  };

  return {
    entities,

    start() {
      if (isRunning) return;

      setInterval(tick, 1000 / TICK_RATE);
      isRunning = true;
    },

    onStateUpdate: (cb: StateUpdateCallback) => {
      updateCallbacks.add(cb);

      return () => updateCallbacks.delete(cb);
    },

    addEntity: (entity: Entity) => {
      entities.set(entity.id, entity);
    },

    addOngoingAction: (action: OngoingActionStartPayload, player: Player) => {
      ongoingActions.set(`${player.id}.${action.action}`, {
        ...action,
        player
      });
    }
  };
};

export type GameWorld = ReturnType<typeof createGameWorld>;