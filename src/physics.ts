export const TAU = 2 * Math.PI;
export const delay = (d: number, v: number) => d / v;
export const period = (f: number) => 1 / f;
export const wavelength = (v: number, f: number) => v / f;
export const phase = (d: number, lambda: number) => (-TAU * d) / lambda;
export const wave = (x: number, t: number, A: number, f: number, v: number) =>
  A * Math.sin(TAU * f * (t - x / v));
// Smooth compact pulse, emitted from x=0 over 2w/v seconds; strictly causal.
export function pulse(x: number, t: number, A: number, v: number, w: number) {
  const q = (x - v * t + w) / w;
  return Math.abs(q) < 1 ? (A * (1 + Math.cos(Math.PI * q))) / 2 : 0;
}
export function optical(lambda0: number, n: number) {
  return { f: 3e8 / lambda0, v: 3e8 / n, lambda: lambda0 / n };
}
export function diffraction(lambda: number, a: number, D: number) {
  const r = lambda / a;
  const theta = r <= 1 ? Math.asin(r) : null;
  return {
    theta,
    L: theta !== null && theta < Math.PI / 2 ? 2 * D * Math.tan(theta) : null,
    approx: (2 * lambda * D) / a,
  };
}
export function intensity(theta: number, lambda: number, a: number) {
  const b = (Math.PI * a * Math.sin(theta)) / lambda;
  return Math.abs(b) < 1e-8 ? 1 : (Math.sin(b) / b) ** 2;
}
export const wrap = (x: number) =>
  ((((x + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
export function numericAnswer(text: string, expected: number, rel = 0.02) {
  const n = Number(text.trim().replace(",", "."));
  return (
    text.trim() !== "" &&
    Number.isFinite(n) &&
    Math.abs(n - expected) <= Math.max(Math.abs(expected) * rel, 1e-9)
  );
}
