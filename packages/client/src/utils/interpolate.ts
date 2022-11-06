import { prevState, state } from '@/stores/gameState';
import { TICK_RATE } from '@game/shared-domain';
import { interpolateEntity, type Coordinates } from '@game/shared-utils';

export const interpolate = <T extends Coordinates>(
  newVal: T,
  oldVal: T,
  now = performance.now()
) =>
  interpolateEntity(
    { value: newVal, timestamp: state.timestamp },
    { value: oldVal, timestamp: prevState.timestamp },
    {
      tickRate: TICK_RATE,
      now
    }
  );
