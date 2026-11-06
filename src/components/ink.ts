import { Color } from 'three';

/**
 * Colour for faint text over the stage: the cover's accent, darkened over a light background and lightened
 * over a dark one, so it reads against a gradient of the same hues.
 */
export function inkColor(accent: string, background: string): Color {
  const light = isLight(background);
  return new Color(accent).lerp(new Color(light ? '#000' : '#fff'), light ? 0.55 : 0.6);
}

/** HSL lightness, read in sRGB (Color keeps linear components, which would call most pastels dark) */
export const isLight = (color: string): boolean => new Color(color).getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
