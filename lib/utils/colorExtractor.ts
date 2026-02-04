/**
 * Extracts the average color from an image URL
 * @param imageUrl - The URL of the image to sample
 * @param sampleCorner - If true, samples from top-right corner (for dog-ear). If false, samples entire image.
 * @param darken - Factor to darken the color (0 = no change, 1 = completely black)
 */
export async function getAverageColor(
  imageUrl: string,
  sampleCorner = false,
  darken = 0
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('rgb(82, 82, 82)'); // fallback to neutral-600
        return;
      }

      if (sampleCorner) {
        // Sample from top-right corner where dog-ear will be
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        // Draw top-right corner of image
        ctx.drawImage(
          img,
          img.width - sampleSize,
          0,
          sampleSize,
          sampleSize,
          0,
          0,
          sampleSize,
          sampleSize
        );
      } else {
        // Sample entire image at reduced resolution for performance
        const sampleWidth = 50;
        const sampleHeight = Math.floor((img.height / img.width) * sampleWidth);
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      // Apply darkening if requested
      if (darken > 0) {
        r = Math.floor(r * (1 - darken));
        g = Math.floor(g * (1 - darken));
        b = Math.floor(b * (1 - darken));
      }

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => {
      resolve('rgb(82, 82, 82)'); // fallback to neutral-600
    };

    img.src = imageUrl;
  });
}

/**
 * Boost color saturation to make colors more vibrant
 */
function boostSaturation(r: number, g: number, b: number, factor: number = 1.3): { r: number, g: number, b: number } {
  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { r, g, b }; // Achromatic, no saturation boost needed
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }

  // Boost saturation
  const sBoosted = Math.min(1, s * factor);

  // Convert back to RGB
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  const q = l < 0.5 ? l * (1 + sBoosted) : l + sBoosted - l * sBoosted;
  const p = 2 * l - q;

  const rOut = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const gOut = Math.round(hue2rgb(p, q, h) * 255);
  const bOut = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return { r: rOut, g: gOut, b: bOut };
}

/**
 * Extracts two complementary colors from an image to create a gradient
 * @param imageUrl - The URL of the image to sample
 * @param darken - Factor to darken the colors (0 = no change, 1 = completely black)
 */
export async function getComplementaryGradient(
  imageUrl: string,
  darken = 0
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('rgb(82, 82, 82)'); // fallback to neutral-600
        return;
      }

      // Sample at reduced resolution
      const sampleWidth = 50;
      const sampleHeight = Math.floor((img.height / img.width) * sampleWidth);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample two regions: top-left quadrant and bottom-right quadrant
      const topLeftColors = { r: 0, g: 0, b: 0, count: 0 };
      const bottomRightColors = { r: 0, g: 0, b: 0, count: 0 };

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;

          // Top-left quadrant
          if (x < canvas.width / 2 && y < canvas.height / 2) {
            topLeftColors.r += data[i];
            topLeftColors.g += data[i + 1];
            topLeftColors.b += data[i + 2];
            topLeftColors.count++;
          }
          // Bottom-right quadrant
          else if (x >= canvas.width / 2 && y >= canvas.height / 2) {
            bottomRightColors.r += data[i];
            bottomRightColors.g += data[i + 1];
            bottomRightColors.b += data[i + 2];
            bottomRightColors.count++;
          }
        }
      }

      // Calculate averages
      let r1 = Math.floor(topLeftColors.r / topLeftColors.count);
      let g1 = Math.floor(topLeftColors.g / topLeftColors.count);
      let b1 = Math.floor(topLeftColors.b / topLeftColors.count);

      let r2 = Math.floor(bottomRightColors.r / bottomRightColors.count);
      let g2 = Math.floor(bottomRightColors.g / bottomRightColors.count);
      let b2 = Math.floor(bottomRightColors.b / bottomRightColors.count);

      // Boost saturation for more vibrant colors
      const boosted1 = boostSaturation(r1, g1, b1, 1.3);
      r1 = boosted1.r;
      g1 = boosted1.g;
      b1 = boosted1.b;

      const boosted2 = boostSaturation(r2, g2, b2, 1.3);
      r2 = boosted2.r;
      g2 = boosted2.g;
      b2 = boosted2.b;

      // Apply darkening
      if (darken > 0) {
        r1 = Math.floor(r1 * (1 - darken));
        g1 = Math.floor(g1 * (1 - darken));
        b1 = Math.floor(b1 * (1 - darken));

        r2 = Math.floor(r2 * (1 - darken));
        g2 = Math.floor(g2 * (1 - darken));
        b2 = Math.floor(b2 * (1 - darken));
      }

      resolve(`linear-gradient(135deg, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`);
    };

    img.onerror = () => {
      resolve('rgb(82, 82, 82)'); // fallback to neutral-600
    };

    img.src = imageUrl;
  });
}
