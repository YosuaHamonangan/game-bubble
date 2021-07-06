export enum BubbleColors {
  red = 0xff0000,
  green = 0x00ff00,
  blue = 0x0000ff,
  yellow = 0xffff00,
  purple = 0xff00ff,
  cyan = 0x00ffff,
  orange = 0xffa500,
}

const ColorKeys = Object.keys(BubbleColors).filter((n) => isNaN(+n));
export function getRandomColor(): BubbleColors {
  const i = Math.floor(Math.random() * ColorKeys.length);
  const key = ColorKeys[i];
  return BubbleColors[key];
}
