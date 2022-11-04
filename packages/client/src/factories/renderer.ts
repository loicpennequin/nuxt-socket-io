import { createCanvas } from '@/utils/canvas';
import type { Dimensions } from '@game/shared-utils';

export type RenderContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export type CreateRendererOptions = {
  render: (renderContext: RenderContext) => void;
  getDimensions: () => Dimensions;
  pauseOnDocumentHidden?: boolean;
  id: string;
};

export const createRenderer = ({
  render,
  getDimensions,
  pauseOnDocumentHidden = true
}: CreateRendererOptions) => {
  let isRunning = false;
  let rafId: null | number = null;

  const { canvas, ctx } = createCanvas(getDimensions());

  const resizeCanvas = () => {
    const dimensions = getDimensions();
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    render({ canvas, ctx });
  };

  window.addEventListener('resize', resizeCanvas, false);

  if (pauseOnDocumentHidden) {
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : start();
    });
  }

  const loop = () => {
    if (!isRunning) return;

    render({ canvas, ctx });
    rafId = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  };

  const pause = () => {
    isRunning = false;
    if (rafId != null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return {
    canvas,
    isRunning,
    pause,
    start
  };
};

export type Renderer = ReturnType<typeof createRenderer>;
