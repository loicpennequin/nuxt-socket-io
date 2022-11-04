import { pushPop, circle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { getInterpolatedEntity, state } from '@/gameState';
import { socket } from '@/utils/socket';
import { isPlayerDto } from '@game/shared-domain';
import { pointCircleCollision } from '@game/shared-utils';
import { mousePosition } from '@/utils/mouseTracker';
import type { Camera } from './applyCamera';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Camera;
  handleHover?: boolean;
};

export const drawPlayers = ({
  ctx,
  size,
  camera = { x: 0, y: 0, w: 0, h: 0 },
  handleHover = true
}: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(player => {
    pushPop(ctx, () => {
      const { x, y } = getInterpolatedEntity(player.id);

      const isHovered =
        handleHover &&
        pointCircleCollision(
          {
            x: mousePosition.x + camera?.x,
            y: mousePosition.y + camera?.y
          },
          {
            x,
            y,
            r: size / 2
          }
        );

      pushPop(ctx, () => {
        if (isHovered) ctx.filter = 'saturate(200%)';

        ctx.lineWidth = 0;
        circle(ctx, { x, y, radius: size / 2 });
        ctx.fillStyle = COLORS.player(player.id === socket.id);
        ctx.fill();
      });

      if (isHovered) {
        pushPop(ctx, () => {
          const { width } = ctx.measureText(player.meta.name);
          const padding = 12;
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.rect(x - padding - width / 2, y - 40, width + padding * 2, 25);
          ctx.closePath();
          ctx.fill();

          ctx.font = '12px Helvetica';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(player.meta.name, x, y - 28);
        });
      }
    });
  });
};