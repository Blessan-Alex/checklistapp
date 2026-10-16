/**
 * Khenbridge brand tokens — extracted from `mvp-frontend-plan/assets/`.
 * @see KHB_ColorPalette.jpg
 * @see Typography/Archivo_SemiCondensed-*.ttf
 *
 * Do not introduce colors or typefaces outside this file / `brand.css`.
 */
export const brandColors = {
  deepPurple: "#4D1B7A",
  warmIvory: "#FBF9E5",
  darkIndigo: "#21173F",
  richViolet: "#621D92",
  softLavender: "#9860C6",
  goldenOchre: "#E3A72E",
} as const;

export type BrandColor = keyof typeof brandColors;

export const brandFontFamily = "Archivo SemiCondensed";
