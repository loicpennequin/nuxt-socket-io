import type { Coordinates } from '../types';

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

const scaled_cosine = (i: number) => 0.5 * (1.0 - Math.cos(i * Math.PI));

export const createNoise = () => {
  let perlin_octaves = 4;
  let perlin_amp_falloff = 0.5;
  const perlin = Array.from({ length: PERLIN_SIZE + 1 }, () => Math.random());

  return {
    setDetail: (lod: number, falloff: number) => {
      if (lod > 0) {
        perlin_octaves = lod;
      }
      if (falloff > 0) {
        perlin_amp_falloff = falloff;
      }
    },

    get: ({ x, y }: Coordinates) => {
      const z = 0;

      if (x < 0) {
        x = -x;
      }
      if (y < 0) {
        y = -y;
      }

      let xi = Math.floor(x),
        yi = Math.floor(y),
        zi = Math.floor(z);
      let xf = x - xi;
      let yf = y - yi;
      let zf = z - zi;
      let rxf, ryf;

      let r = 0;
      let ampl = 0.5;

      let n1, n2, n3;

      for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);

        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);

        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);

        n1 += scaled_cosine(zf) * (n2 - n1);

        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;

        if (xf >= 1.0) {
          xi++;
          xf--;
        }
        if (yf >= 1.0) {
          yi++;
          yf--;
        }
        if (zf >= 1.0) {
          zi++;
          zf--;
        }
      }
      return r;
    }
  };
};

// const noiseDetail = function (lod, falloff) {
//   if (lod > 0) {
//     perlin_octaves = lod;
//   }
//   if (falloff > 0) {
//     perlin_amp_falloff = falloff;
//   }
// };
