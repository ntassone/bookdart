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
        resolve('rgb(75, 85, 99)'); // fallback to gray-600
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
      resolve('rgb(75, 85, 99)'); // fallback to gray-600
    };

    img.src = imageUrl;
  });
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
        resolve('linear-gradient(135deg, rgb(55, 65, 81), rgb(75, 85, 99))');
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
      resolve('linear-gradient(135deg, rgb(55, 65, 81), rgb(75, 85, 99))');
    };

    img.src = imageUrl;
  });
}
