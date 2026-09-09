// Color assignments validated against the dataviz skill's palette checks
// (node scripts/validate_palette.js), run with --pairs all since a choropleth
// puts every region next to every other region. The documented 8-hue set
// cannot fit "red" alongside 3 other hues under the all-pairs colorblind
// floors, so party colors deliberately break from the red/blue/green folk
// convention in favor of a set that's actually distinguishable for everyone.

export type ThemeMode = "light" | "dark";

const PARTY_COLORS: Record<string, { light: string; dark: string }> = {
  Liberal: { light: "#2a78d6", dark: "#3987e5" }, // blue
  Nationals: { light: "#008300", dark: "#008300" }, // green
  Independent: { light: "#eda100", dark: "#c98500" }, // yellow
  Labor: { light: "#e87ba4", dark: "#d55181" }, // magenta
};
const UNKNOWN_PARTY_COLOR = { light: "#c3c2b7", dark: "#383835" };

export function partyColor(party: string | null, mode: ThemeMode): string {
  if (!party) return UNKNOWN_PARTY_COLOR[mode];
  return (PARTY_COLORS[party] ?? UNKNOWN_PARTY_COLOR)[mode];
}

export const PARTY_LEGEND = Object.entries(PARTY_COLORS).map(([party, color]) => ({
  party,
  color,
}));

// Classification is an urban -> rural gradient, not an arbitrary category, so
// it takes a one-hue ordinal ramp (validated with --ordinal) rather than the
// categorical palette.
const CLASSIFICATION_ORDER = ["Inner-metropolitan", "Outer-metropolitan", "Provincial", "Rural"];
const CLASSIFICATION_RAMP: Record<ThemeMode, string[]> = {
  light: ["#86b6ef", "#3987e5", "#1c5cab", "#0d366b"],
  dark: ["#cde2fb", "#9ec5f4", "#5598e7", "#184f95"],
};
const UNKNOWN_CLASSIFICATION_COLOR = { light: "#c3c2b7", dark: "#383835" };

export function classificationColor(classification: string | null, mode: ThemeMode): string {
  const idx = classification ? CLASSIFICATION_ORDER.indexOf(classification) : -1;
  if (idx === -1) return UNKNOWN_CLASSIFICATION_COLOR[mode];
  return CLASSIFICATION_RAMP[mode][idx];
}

export const CLASSIFICATION_LEGEND = CLASSIFICATION_ORDER.map((classification, i) => ({
  classification,
  color: { light: CLASSIFICATION_RAMP.light[i], dark: CLASSIFICATION_RAMP.dark[i] },
}));

// Sequential ramp for continuous magnitudes (population, income, rent, ...).
// Same hue as the ordinal ramp, full range. On a dark surface the anchor
// flips: the near-zero end should recede toward the surface, so low values
// take the *dark* end of the ramp instead of the light end.
const SEQUENTIAL_RAMP_LIGHT_TO_DARK = [
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
  "#0d366b",
];

export function sequentialRamp(mode: ThemeMode): string[] {
  return mode === "light" ? SEQUENTIAL_RAMP_LIGHT_TO_DARK : [...SEQUENTIAL_RAMP_LIGHT_TO_DARK].reverse();
}

function interpolateRamp(ramp: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (ramp.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  if (i >= ramp.length - 1) return ramp[ramp.length - 1];
  return mixHex(ramp[i], ramp[i + 1], frac);
}

function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `#${[r, g, bl].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function makeSequentialScale(min: number, max: number, mode: ThemeMode) {
  const ramp = sequentialRamp(mode);
  const span = max - min || 1;
  return (value: number) => interpolateRamp(ramp, (value - min) / span);
}
