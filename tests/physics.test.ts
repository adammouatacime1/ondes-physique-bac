import test from "node:test";
import assert from "node:assert/strict";
import {
  delay,
  period,
  wavelength,
  phase,
  wave,
  pulse,
  optical,
  diffraction,
  intensity,
  numericAnswer,
  TAU,
  wrap,
} from "../src/physics.ts";
import { chapters } from "../src/content.ts";
import { exercises, exam } from "../src/exercises.ts";
import katex from "katex";
const close = (a: number, b: number, tol = 1e-10) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
test("retard, unités, période et longueur d’onde", () => {
  close(delay(0.68, 340), 0.002);
  close(period(50), 0.02);
  close(wavelength(2, 5), 0.4);
  close(phase(0.1, 0.4), -Math.PI / 2);
  close(phase(0.1, 0.4), (-TAU * delay(0.1, 2)) / period(5));
});
test("causalité et copie retardée de l’impulsion", () => {
  for (const x of [0, 0.5, 2])
    for (const t of [-1, 0, 0.1, 0.5, 1, 3])
      close(pulse(x, t, 3, 2, 0.3), pulse(0, t - x / 2, 3, 2, 0.3));
  assert.equal(pulse(2, 0.9, 3, 2, 0.3), 0);
  close(pulse(2, 1.15, 3, 2, 0.3), 3);
});
test("propagation vers +x et absence de transport horizontal des particules", () => {
  for (const t of [0.1, 0.3, 0.9])
    close(wave(0.4, t + 0.2, 3, 5, 2), wave(0, t, 3, 5, 2));
  close(wave(0, 0.05, 0.002, 5, 2), 0.002);
});
test("phase, opposition, quadrature et tours complets", () => {
  close(wrap(phase(0.4, 0.4)), 0);
  close(Math.abs(wrap(phase(0.2, 0.4))), Math.PI);
  close(wrap(phase(0.1, 0.4)), -Math.PI / 2);
  close(wrap(TAU * 1.05), 0.1 * Math.PI);
  close(wrap(TAU * 0.95), -0.1 * Math.PI);
});
test("fréquence conservée aux interfaces et longueur d’onde λ0/n", () => {
  const a = optical(600e-9, 1),
    b = optical(600e-9, 1.5);
  assert.equal(a.f, b.f);
  close(b.v, 2e8);
  close(b.lambda, 400e-9);
  close(b.v / b.lambda, a.f, 0.1);
});
test("diffraction exacte, premiers minima et limite au centre", () => {
  const r = diffraction(600e-9, 100e-6, 2);
  close(r.approx, 0.024);
  close(Math.sin(r.theta!), 0.006);
  close(intensity(0, 600e-9, 100e-6), 1);
  close(intensity(r.theta!, 600e-9, 100e-6), 0);
  close(r.L!, 2 * 2 * Math.tan(r.theta!));
  assert.equal(diffraction(2, 1, 1).L, null);
  assert.equal(diffraction(1, 1, 1).L, null);
  for (let j = -50; j <= 50; j++) {
    const i = intensity(j / 100, 600e-9, 100e-6);
    assert.ok(i >= 0 && i <= 1);
  }
});
test("dépendances de la largeur λ,D,a et hypothèse petits angles", () => {
  const L = (l: number, a: number, d: number) => diffraction(l, a, d).L!;
  assert.ok(L(600e-9, 50e-6, 2) > L(600e-9, 100e-6, 2));
  close(L(600e-9, 100e-6, 2), 2 * L(600e-9, 100e-6, 1));
  assert.ok(L(700e-9, 100e-6, 2) > L(500e-9, 100e-6, 2));
  close(diffraction(0.2, 1, 1).L!, 0.408248290463863, 1e-12);
});
test("réponses françaises et tolérance raisonnable", () => {
  assert.ok(numericAnswer("0,30", 0.3));
  assert.ok(numericAnswer("339", 340));
  assert.ok(!numericAnswer("", 0));
  assert.ok(!numericAnswer("abc", 1));
  assert.ok(!numericAnswer("0,4", 0.3));
});
test("structure pédagogique, exercices originaux, barème et rendu des formules", () => {
  assert.deepEqual(
    exercises.map((e) => e.length),
    [9, 9, 9],
  );
  assert.equal(
    exam.reduce((n, e) => n + e.points!, 0),
    20,
  );
  const ids = new Set();
  for (const e of exercises.flat()) {
    assert.ok(!ids.has(e.id));
    ids.add(e.id);
    assert.ok(
      e.hints.length === 2 && e.steps.length >= 2 && e.comment && e.error,
    );
  }
  for (const c of chapters)
    for (const l of c.lessons) {
      assert.ok(l.question && l.proof && l.example && l.answer);
      katex.renderToString(l.formula, { throwOnError: true });
    }
});
test("recalcul indépendant de tous les résultats numériques corrigés", () => {
  const computed: Record<string, number> = {
    m2: 1.8 / 0.6,
    m3: 0.51 / 0.0015,
    m4: (0.8 - 0.2) / 2,
    m5: 3.4 * 0.5,
    m8: 340 * 0.002 * 100,
    m9: 0.85 / (5 * 0.0005),
    p1: (110 - 10) / 5,
    p2: 1 / 25,
    p3: 1.5 / 6,
    p4: (-360 * 5) / 20,
    p6: 0.34 * 1000,
    p8: 3 / 20,
    p9: 1.2 / 3 / (0.8 / 4),
    l1: 3e8 / 500e-9 / 1e14,
    l2: 600 / 1.5,
    l3: ((2 * 600e-9 * 2) / 100e-6) * 1000,
    l4: ((2 * 650e-9 * 1.5) / 0.02) * 1e6,
    l5: (1.8e-6 / (2 * 1.5)) * 1e9,
    l8: 2 * Math.tan(Math.asin(0.2)),
    l9: ((2 * 600e-9 * 2) / 80e-6) * 1000,
  };
  for (const e of exercises.flat())
    if (e.expected !== undefined) {
      assert.ok(e.id in computed, `missing ${e.id}`);
      close(e.expected, computed[e.id], 1e-5);
    }
});
