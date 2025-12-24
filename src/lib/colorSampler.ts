function createGradientSampler(vars: string): (t: number) => string {
  const colors = getComputedStyle(document.documentElement)
    .getPropertyValue(vars)
    .split(",")
    .map((c) => c.trim());

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, 1);

  return (t: number) => {
    const x = Math.max(
      0,
      Math.min(canvas.width - 1, Math.round(t * (canvas.width - 1)))
    );
    const [r, g, b] = ctx.getImageData(x, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
}

export function createColorSampler(vars: string) {
  let cachedSampler: ((t: number) => string) | null = null;
  return (t: number): string => {
    if (!cachedSampler) {
      cachedSampler = createGradientSampler(vars);
    }
    return cachedSampler(Math.max(0, Math.min(1, t)));
  };
}
