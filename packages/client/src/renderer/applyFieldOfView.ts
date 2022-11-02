import { pushPop } from '@/utils/canvas';
import { prevState, state } from '@/gameState';
import {
  interpolateEntity,
  type Boundaries,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import { TICK_RATE, type EntityDto } from '@game/domain';

export type ApplyFieldOfViewOptions = {
  ctx: CanvasRenderingContext2D;
  entityId: string;
  fieldOfView: number;
};

export type FieldOfViewBoundaries = Boundaries<Coordinates> & Dimensions;

export const applyFieldOfView = (
  { ctx, entityId, fieldOfView }: ApplyFieldOfViewOptions,
  cb: (boundaries: FieldOfViewBoundaries) => void
) => {
  const player = state.entitiesById[entityId];
  if (!player) return;

  pushPop(ctx, () => {
    interpolateEntity<EntityDto>(
      { value: player, timestamp: state.timestamp },
      // prettier-ignore
      { value: prevState.entitiesById[player.id],timestamp: prevState.timestamp },
      {
        tickRate: TICK_RATE,
        cb: entity => {
          ctx.beginPath();
          ctx.arc(
            entity.x,
            entity.y,
            fieldOfView,
            fieldOfView,
            Math.PI * 2,
            true
          );
          ctx.clip();

          const boundaries: FieldOfViewBoundaries = {
            min: { x: entity.x - fieldOfView, y: entity.y - fieldOfView },
            max: { x: entity.x + fieldOfView, y: entity.y + fieldOfView },
            w: fieldOfView * 2,
            h: fieldOfView * 2
          };
          cb(boundaries);
        }
      }
    );
  });
};
