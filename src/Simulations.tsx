import { useEffect, useRef, useState } from "react";
import {
  Button,
  Panel,
  ParameterControl,
  SelectControl,
  Toggle,
  MetricGrid,
  SimulationCard,
} from "./shared/lab-ui";
import {
  TAU,
  delay,
  phase,
  wave,
  pulse,
  optical,
  diffraction,
  intensity,
  wrap,
} from "./physics";
export const simNames = [
  "Impulsion sur une corde",
  "Onde longitudinale",
  "Deux microphones · impulsion",
  "Onde périodique synchronisée",
  "Phase et deux points",
  "Microphones · signal périodique",
  "Diffraction mécanique",
  "Stroboscope sans flash",
  "Lumière et changement de milieu",
  "Banc de diffraction lumineuse",
  "Prisme et dispersion",
];
const descriptions = [
  "Une impulsion causale part de x=0 ; les points repérés gardent leur abscisse. Déplacez la sonde et comparez la photo de la corde au signal reçu. Pourquoi la sonde ne suit-elle pas la bosse ?",
  "Chaîne longitudinale en régime établi : chaque particule oscille autour de sa position de repos. Les petits espacements signalent une compression, les grands une dilatation. Quelle direction suit la particule repérée ?",
  "Géométrie : source en x=0, M1 puis M2 sur +x. Tension proportionnelle à la pression acoustique ; les deux pics correspondent à la même impulsion. Placez les curseurs sur leurs maxima. La mesure retrouve-t-elle 340 m·s⁻¹ ?",
  "Régime sinusoïdal déjà établi dans tout le domaine, non dispersif : la source a commencé avant la fenêtre observée. Figez le temps puis mesurez la distance entre deux crêtes ; fixez x pour mesurer une période. Que devient λ quand f double à v fixé ?",
  "Convention stable : y=A sin(2πft−2πx/λ). Δφ=φ₂−φ₁ est négatif pour le point aval. Les cercles représentent la phase ; la projection verticale donne y/A. Un tour de plus change-t-il le retard ?",
  "Source en x=0, M1 fixe à 20 cm, M2 en aval. Tension proportionnelle à la pression, pas au déplacement des particules. Le gain optionnel r₁/r₂ représente l’atténuation de pression en champ libre. Combien de retours en phase observez-vous ?",
  "Illustration de Huygens simplifiée : fronts plans incidents, fronts étalés derrière une ouverture ou les bords d’un obstacle. Ce dessin ne résout pas l’équation des ondes et ne prédit pas les amplitudes. Comparez λ/a=0,2 et λ/a=2. La fréquence change-t-elle ?",
  "Approfondissement facultatif. À gauche : position réelle ; à droite : positions échantillonnées aux instants jTe, numérotées. Aucune lumière clignotante. Le saut apparent est réduit à [−π,π[. Pourquoi Te>T ne suffit-il pas à prédire une inversion ?",
  "Incidence normale entre deux milieux stationnaires : champ électrique schématique, sans vibration de matière. La phase est continue à l’interface. Le temps est ralenti ; les valeurs en femtosecondes sont physiques. Comptez les cycles de chaque côté : f change-t-elle ?",
  "Fente simple : modèle de Fraunhofer, éclairage uniforme monochromatique en air. Le profil est une intensité, toujours positive. Géométrie exacte L=2D tan(arcsin(λ/a)) ; comparaison avec les petits angles. Couleur et luminosité de l’écran illustratives. Que produit une diminution de a ?",
  "Schéma qualitatif de dispersion normale du verre, sans calcul des angles par Snell-Descartes ni modèle quantitatif d’indice. La séparation des rayons est illustrative. Un laser conserve sa fréquence ; la lumière blanche contient plusieurs composantes. Comparer au banc de diffraction.",
];
type Param = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};
const configs: Param[][] = [
  [
    { key: "v", label: "Célérité", unit: "m/s", min: 0.5, max: 4, step: 0.1 },
    { key: "A", label: "Amplitude", unit: "cm", min: 1, max: 5, step: 0.5 },
    {
      key: "w",
      label: "Demi-largeur",
      unit: "m",
      min: 0.1,
      max: 0.6,
      step: 0.05,
    },
    {
      key: "x",
      label: "Position de la sonde",
      unit: "m",
      min: 0.2,
      max: 3.8,
      step: 0.1,
    },
  ],
  [
    {
      key: "A",
      label: "Déplacement maximal",
      unit: "cm",
      min: 0.5,
      max: 2,
      step: 0.1,
    },
    { key: "f", label: "Fréquence", unit: "Hz", min: 0.5, max: 2, step: 0.1 },
  ],
  [
    { key: "x1", label: "Position M1", unit: "cm", min: 10, max: 60, step: 1 },
    { key: "x2", label: "Position M2", unit: "cm", min: 70, max: 180, step: 1 },
    {
      key: "base",
      label: "Base de temps",
      unit: "ms/div",
      min: 0.5,
      max: 2,
      step: 0.25,
    },
    { key: "c1", label: "Curseur 1", unit: "ms", min: 0, max: 20, step: 0.05 },
    { key: "c2", label: "Curseur 2", unit: "ms", min: 0, max: 20, step: 0.05 },
  ],
  [
    { key: "A", label: "Amplitude", unit: "cm", min: 1, max: 5, step: 0.5 },
    { key: "f", label: "Fréquence", unit: "Hz", min: 0.5, max: 3, step: 0.1 },
    { key: "v", label: "Célérité", unit: "m/s", min: 1, max: 4, step: 0.1 },
    { key: "x", label: "Position fixe", unit: "m", min: 0, max: 4, step: 0.05 },
    {
      key: "s1",
      label: "Règle spatiale 1",
      unit: "m",
      min: 0,
      max: 4,
      step: 0.02,
    },
    {
      key: "s2",
      label: "Règle spatiale 2",
      unit: "m",
      min: 0,
      max: 4,
      step: 0.02,
    },
    {
      key: "c1",
      label: "Curseur temporel 1",
      unit: "s",
      min: 0,
      max: 4,
      step: 0.02,
    },
    {
      key: "c2",
      label: "Curseur temporel 2",
      unit: "s",
      min: 0,
      max: 4,
      step: 0.02,
    },
  ],
  [
    { key: "f", label: "Fréquence", unit: "Hz", min: 0.5, max: 2, step: 0.1 },
    { key: "v", label: "Célérité", unit: "m/s", min: 1, max: 3, step: 0.1 },
    { key: "x1", label: "Position 1", unit: "m", min: 0, max: 1, step: 0.05 },
    {
      key: "d",
      label: "Distance entre points",
      unit: "m",
      min: 0,
      max: 3,
      step: 0.025,
    },
  ],
  [
    {
      key: "f",
      label: "Fréquence sonore",
      unit: "Hz",
      min: 500,
      max: 2000,
      step: 50,
    },
    {
      key: "d",
      label: "Déplacement M2",
      unit: "cm",
      min: 0,
      max: 140,
      step: 0.5,
    },
    {
      key: "base",
      label: "Base de temps",
      unit: "ms/div",
      min: 0.1,
      max: 0.5,
      step: 0.05,
    },
  ],
  [
    { key: "a", label: "Largeur a", unit: "cm", min: 0.5, max: 10, step: 0.5 },
    {
      key: "lam",
      label: "Longueur d’onde",
      unit: "cm",
      min: 0.5,
      max: 5,
      step: 0.5,
    },
  ],
  [
    {
      key: "T",
      label: "Période réelle",
      unit: "s",
      min: 0.5,
      max: 2,
      step: 0.05,
    },
    {
      key: "Te",
      label: "Période des observations",
      unit: "s",
      min: 0.1,
      max: 3,
      step: 0.05,
    },
  ],
  [
    {
      key: "lam",
      label: "Longueur d’onde dans le vide",
      unit: "nm",
      min: 400,
      max: 750,
      step: 10,
    },
    {
      key: "n1",
      label: "Indice du milieu 1",
      unit: "",
      min: 1,
      max: 2,
      step: 0.05,
    },
    {
      key: "n2",
      label: "Indice du milieu 2",
      unit: "",
      min: 1,
      max: 2,
      step: 0.05,
    },
  ],
  [
    {
      key: "lam",
      label: "Longueur d’onde",
      unit: "nm",
      min: 400,
      max: 750,
      step: 10,
    },
    {
      key: "a",
      label: "Largeur de la fente",
      unit: "µm",
      min: 10,
      max: 200,
      step: 5,
    },
    { key: "D", label: "Distance écran", unit: "m", min: 1, max: 3, step: 0.1 },
  ],
  [
    {
      key: "spread",
      label: "Séparation illustrative",
      unit: "×",
      min: 0.5,
      max: 1.5,
      step: 0.1,
    },
  ],
];
function initial(id: number): Record<string, number> {
  return [
    { v: 2, A: 3, w: 0.3, x: 2 },
    { A: 1.5, f: 1 },
    { x1: 34, x2: 102, base: 1, c1: 1.4, c2: 3.4 },
    { A: 3, f: 1, v: 2, x: 1, s1: 0.5, s2: 2.5, c1: 0.25, c2: 1.25 },
    { f: 1, v: 2, x1: 0.5, d: 0.5 },
    { f: 1000, d: 34, base: 0.25 },
    { a: 2, lam: 2 },
    { T: 1, Te: 0.95 },
    { lam: 600, n1: 1, n2: 1.5 },
    { lam: 600, a: 100, D: 2 },
    { spread: 1 },
  ][id - 1];
}
const fmt = (n: number, d = 3) =>
  n.toLocaleString("fr-FR", { maximumFractionDigits: d });
function path(
  fn: (x: number) => number,
  min: number,
  max: number,
  X: number,
  Y: number,
  W: number,
  H: number,
  scale = 1,
) {
  return Array.from({ length: 241 }, (_, i) => {
    const x = min + ((max - min) * i) / 240;
    return `${i ? "L" : "M"}${X + (i / 240) * W},${Y - (H * fn(x)) / scale}`;
  }).join(" ");
}
function Graph({
  fn,
  fn2,
  max = 4,
  label,
  unit = "m",
  yunit = "cm",
  cursor,
  mark,
  mark2,
  scale = 5,
  positive = false,
}: {
  fn: (x: number) => number;
  fn2?: (x: number) => number;
  max?: number;
  label: string;
  unit?: string;
  yunit?: string;
  cursor?: number[];
  mark?: number;
  mark2?: number;
  scale?: number;
  positive?: boolean;
}) {
  return (
    <svg viewBox="0 0 560 210" className="plot" role="img" aria-label={label}>
      <title>{label}</title>
      <text x="25" y="20">
        {label}
      </text>
      <g className="grid">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={45 + i * 48} x2={45 + i * 48} y1="35" y2="165" />
        ))}
        <line
          x1="45"
          x2="525"
          y1={positive ? 165 : 100}
          y2={positive ? 165 : 100}
        />
      </g>
      <text x="4" y="55">
        {yunit}
      </text>
      <text x="3" y={positive ? 168 : 104}>
        0
      </text>
      <text x="8" y="40">
        {fmt(scale)}
      </text>
      {!positive && (
        <text x="3" y="163">
          −{fmt(scale)}
        </text>
      )}
      {[0, 0.25, 0.5, 0.75, 1].map((q) => (
        <text key={q} x={45 + q * 480} y="185" textAnchor="middle">
          {fmt(q * max, 2)}
        </text>
      ))}
      <text x="520" y="205">
        {unit}
      </text>
      <path
        d={path(
          fn,
          0,
          max,
          45,
          positive ? 165 : 100,
          480,
          positive ? 127 : 62,
          scale,
        )}
        className="curve"
      />
      {fn2 && (
        <path
          d={path(
            fn2,
            0,
            max,
            45,
            positive ? 165 : 100,
            480,
            positive ? 127 : 62,
            scale,
          )}
          className="curve second"
        />
      )}
      {cursor?.map((c, i) => (
        <g key={i}>
          <line
            className={`cursor c${i}`}
            x1={45 + (c / max) * 480}
            x2={45 + (c / max) * 480}
            y1="35"
            y2="165"
          />
          <text
            x={Math.min(505, Math.max(50, 45 + (c / max) * 480))}
            y={48 + i * 18}
          >
            C{i + 1}
          </text>
        </g>
      ))}
      {mark !== undefined && (
        <circle
          cx={45 + (mark / max) * 480}
          cy={
            (positive ? 165 : 100) - ((positive ? 127 : 62) * fn(mark)) / scale
          }
          r="7"
          className="probe"
        />
      )}
      {mark2 !== undefined && (
        <rect
          x={40 + (mark2 / max) * 480}
          y={95 - (62 * fn(mark2)) / scale}
          width="10"
          height="10"
          className="micro2"
        />
      )}
      {mark !== undefined && fn2 && (
        <rect
          x={40 + (mark / max) * 480}
          y={95 - (62 * fn2(mark)) / scale}
          width="10"
          height="10"
          className="micro2"
        />
      )}
    </svg>
  );
}
function PhaseCircle({
  phi,
  label,
  x,
}: {
  phi: number;
  label: string;
  x: number;
}) {
  return (
    <g transform={`translate(${x},70)`}>
      <circle r="38" className="axis" />
      <line
        x2={38 * Math.cos(phi)}
        y2={-38 * Math.sin(phi)}
        className="curve"
      />
      <circle
        cx={38 * Math.cos(phi)}
        cy={-38 * Math.sin(phi)}
        r="5"
        className="probe"
      />
      <text y="65" textAnchor="middle">
        {label}
      </text>
      <text y="88" textAnchor="middle">
        {fmt(wrap(phi))} rad
      </text>
    </g>
  );
}
export default function Simulation({ id }: { id: number }) {
  const [p, setP] = useState(() => initial(id)),
    [t, setT] = useState(0),
    [running, run] = useState(false),
    [mode, setMode] = useState("opening"),
    [atten, setAtten] = useState(false),
    [white, setWhite] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const timeUnit =
    id === 3 || id === 6 ? "ms" : id === 9 || id === 10 ? "fs" : "s";
  const end = id === 3 ? 20 : id === 6 ? 10 : id === 9 ? 10 : 8;
  useEffect(() => {
    if (!running) return;
    let raf = 0,
      prev = 0,
      inView = false,
      disposed = false;
    const tick = (now: number) => {
      if (disposed || !inView || document.hidden) {
        raf = 0;
        prev = 0;
        return;
      }
      if (prev) {
        const dt = Math.min((now - prev) / 1000, 0.05);
        setT((x) => Math.min(end, x + dt * (id === 3 ? 2 : 1)));
      }
      prev = now;
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      prev = 0;
      if (inView && !document.hidden && !disposed)
        raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    });
    const scene = root.current?.querySelector(".simulation-scene");
    if (scene) observer.observe(scene);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [running, end, id]);
  useEffect(() => {
    if (t >= end) run(false);
  }, [t, end]);
  const update = (key: string, value: number) => {
    setP((q) => {
      const next = { ...q, [key]: value };
      if (id === 3 && key === "base") {
        next.c1 = Math.min(next.c1, value * 10);
        next.c2 = Math.min(next.c2, value * 10);
      }
      return next;
    });
  };
  const reset = () => {
    setT(0);
    run(false);
  };
  const restore = () => {
    reset();
    setP(initial(id));
    setMode("opening");
    setAtten(false);
    setWhite(true);
  };
  const v = p.v || 2,
    f = p.f || 1,
    A = p.A || 3,
    lam = v / f;
  let scene: React.ReactNode;
  let metrics: {
    label: string;
    value: string;
    unit?: string;
    hint?: string;
  }[] = [];
  if (id === 1) {
    scene = (
      <>
        <Graph
          label="Profil spatial · t fixé"
          fn={(x) => pulse(x, t, A, v, p.w)}
          scale={5}
          mark={p.x}
        />
        <svg
          viewBox="0 0 560 55"
          className="plot"
          role="img"
          aria-label="Points matériels repérés : abscisses fixes"
        >
          <text x="20" y="18">
            Propagation → ; vibration ↑↓
          </text>
          {[0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((x) => (
            <g key={x}>
              <circle
                className="probe"
                cx={45 + (x / 4) * 480}
                cy={40 - pulse(x, t, A, v, p.w) * 4}
                r="4"
              />
              <text x={45 + (x / 4) * 480} y="54" textAnchor="middle">
                {fmt(x, 1)}
              </text>
            </g>
          ))}
        </svg>
        <Graph
          label={`Signal à x=${fmt(p.x)} m · temps`}
          fn={(tt) => pulse(p.x, tt, A, v, p.w)}
          unit="s"
          max={8}
          mark={t}
          scale={5}
        />
      </>
    );
    metrics = [
      { label: "Célérité", value: fmt(v), unit: "m/s" },
      { label: "Début à la sonde", value: fmt(p.x / v), unit: "s" },
      { label: "Durée du signal", value: fmt((2 * p.w) / v), unit: "s" },
      { label: "Temps", value: fmt(t), unit: "s" },
    ];
  } else if (id === 2) {
    scene = (
      <svg
        viewBox="0 0 560 310"
        className="plot"
        role="img"
        aria-label="Chaîne de particules longitudinales"
      >
        <text x="20" y="35">
          Propagation → ; vibration ↔
        </text>
        <text x="20" y="65">
          Compression : particules proches ; dilatation : espacées
        </text>
        <line x1="20" x2="540" y1="150" y2="150" className="axis" />
        {Array.from({ length: 55 }, (_, i) => {
          const x = i / 54;
          const displacement = 0.01 * A * Math.sin(TAU * f * (t - x / 0.5));
          return (
            <g key={i}>
              <line
                x1={25 + x * 500}
                x2={25 + x * 500}
                y1="180"
                y2="187"
                className="axis"
              />
              <circle
                cx={25 + (x + displacement) * 500}
                cy="150"
                r={i === 25 ? 8 : 4}
                className={i === 25 ? "probe" : "particle"}
              />
              {i === 25 && (
                <text x={25 + x * 500} y="215" textAnchor="middle">
                  Particule repère ↔
                </text>
              )}
            </g>
          );
        })}
        <text x="20" y="260">
          Traits : positions de repos fixes · x de 0 à 1 m
        </text>
        <text x="20" y="290">
          Déplacements agrandis ? Non : A est convertie en mètres.
        </text>
      </svg>
    );
    metrics = [
      { label: "Amplitude locale", value: fmt(A), unit: "cm" },
      { label: "Célérité fixée", value: "0,5", unit: "m/s" },
      { label: "Période", value: fmt(1 / f), unit: "s" },
      { label: "Longueur d’onde", value: fmt(0.5 / f), unit: "m" },
    ];
  } else if (id === 3 || id === 6) {
    const periodic = id === 6;
    const x1 = periodic ? 0.2 : p.x1 / 100,
      x2 = periodic ? x1 + p.d / 100 : p.x2 / 100;
    const d = x2 - x1,
      dt = (d / 340) * 1000,
      base = p.base,
      max = base * 10;
    const signal = (x: number, tt: number) =>
      periodic
        ? Math.sin(TAU * p.f * (tt / 1000 - x / 340)) * (atten ? x1 / x : 1)
        : pulse(x, tt / 1000, 1, 340, 0.136);
    scene = (
      <>
        <svg
          viewBox="0 0 560 100"
          className="plot"
          role="img"
          aria-label="Source et deux microphones alignés"
        >
          <text x="15" y="20">
            Source → M1 → M2 ; distances en cm
          </text>
          <line x1="30" x2="530" y1="55" y2="55" className="axis" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line
                x1={30 + i * 50}
                x2={30 + i * 50}
                y1="50"
                y2="60"
                className="axis"
              />
              <text x={30 + i * 50} y="92" textAnchor="middle">
                {i * 20}
              </text>
            </g>
          ))}
          <text x="20" y="45">
            S
          </text>
          <circle cx={30 + (x1 / 2) * 500} cy="55" r="6" className="probe" />
          <text x={30 + (x1 / 2) * 500} y="40">
            M1
          </text>
          <rect
            x={25 + (x2 / 2) * 500}
            y="49"
            width="12"
            height="12"
            className="micro2"
          />
          <text x={30 + (x2 / 2) * 500} y="40">
            M2
          </text>
        </svg>
        <Graph
          label={
            periodic
              ? "Oscilloscope · t courant + Δt · M1 plein / M2 pointillé"
              : "Oscilloscope · M1 plein / M2 pointillé"
          }
          fn={(tt) => signal(x1, tt + (periodic ? t : 0))}
          fn2={(tt) => signal(x2, tt + (periodic ? t : 0))}
          max={max}
          unit="ms"
          yunit="V"
          scale={1}
          cursor={periodic ? undefined : [p.c1, p.c2]}
          mark={periodic ? undefined : t}
        />
        <p className="sim-note">
          10 divisions × {fmt(base)} ms/div = {fmt(max)} ms. Tension normalisée
          : 1 V de référence. Curseurs affichés seulement dans la fenêtre.
        </p>
        {!periodic && (
          <svg
            viewBox="0 0 560 80"
            className="plot"
            role="img"
            aria-label="Propagation sonore au temps courant"
          >
            <text x="20" y="20">
              À t={fmt(t)} ms : front →
            </text>
            <line x1="30" x2="530" y1="45" y2="45" className="axis" />
            <circle
              cx={Math.min(530, 30 + ((340 * t) / 1000 / 2) * 500)}
              cy="45"
              r="9"
              className="probe"
            />
            <text x="20" y="75">
              M1 : {fmt(signal(x1, t))} V · M2 : {fmt(signal(x2, t))} V
            </text>
          </svg>
        )}
      </>
    );
    metrics = [
      { label: "Séparation", value: fmt(d * 100), unit: "cm" },
      { label: "Retard géométrique", value: fmt(dt), unit: "ms" },
      periodic
        ? {
            label: "Longueur d’onde",
            value: fmt((340 / p.f) * 100),
            unit: "cm",
          }
        : {
            label: "Curseurs : |Δt|",
            value: fmt(Math.abs(p.c2 - p.c1)),
            unit: "ms",
          },
      periodic
        ? {
            label: "Déphasage signé",
            value: fmt(phase(d, 340 / p.f)),
            unit: "rad",
          }
        : {
            label: "v mesurée",
            value:
              p.c2 === p.c1
                ? "indéfinie"
                : fmt(d / (Math.abs(p.c2 - p.c1) / 1000), 1),
            unit: "m/s",
            hint: "Curseurs aux pics pour retrouver 340.",
          },
    ];
  } else if (id === 4 || id === 5) {
    const ph = id === 5,
      x1 = ph ? p.x1 : p.x,
      x2 = ph ? p.x1 + p.d : p.x;
    scene = (
      <>
        <Graph
          label="Profil y(x) · propagation →"
          fn={(x) => wave(x, t, A, f, v)}
          max={Math.max(4, ph ? x2 + lam / 4 : 2 * lam)}
          scale={5}
          mark={x1}
          mark2={ph ? x2 : undefined}
          cursor={ph ? [x1, x2] : [p.s1, p.s2]}
        />
        <Graph
          label={
            ph
              ? "Signaux : M1 plein / M2 pointillé"
              : "Signal y(t) · position fixée"
          }
          fn={(tt) => wave(x1, tt, A, f, v)}
          fn2={ph ? (tt) => wave(x2, tt, A, f, v) : undefined}
          unit="s"
          scale={5}
          max={4}
          mark={t <= 4 ? t : undefined}
          cursor={ph ? undefined : [p.c1, p.c2]}
        />
        {ph && (
          <svg
            viewBox="0 0 560 175"
            className="plot"
            role="img"
            aria-label="Cercles de phase : projection verticale cohérente avec les signaux"
          >
            <PhaseCircle phi={TAU * f * (t - x1 / v)} x={150} label="M1" />
            <PhaseCircle phi={TAU * f * (t - x2 / v)} x={400} label="M2" />
          </svg>
        )}
      </>
    );
    metrics = ph
      ? [
          { label: "Distance", value: fmt(p.d), unit: "m" },
          { label: "Retard", value: fmt(p.d / v), unit: "s" },
          { label: "Δφ = φ₂−φ₁", value: fmt(phase(p.d, lam)), unit: "rad" },
          {
            label: "d/λ",
            value: fmt(p.d / lam),
            hint: `Modulo : ${fmt(wrap(phase(p.d, lam)))} rad`,
          },
        ]
      : [
          { label: "Période calculée", value: fmt(1 / f), unit: "s" },
          { label: "Longueur calculée", value: fmt(lam), unit: "m" },
          { label: "Règle |Δx|", value: fmt(Math.abs(p.s2 - p.s1)), unit: "m" },
          {
            label: "Curseurs |Δt|",
            value: fmt(Math.abs(p.c2 - p.c1)),
            unit: "s",
          },
        ];
  } else if (id === 7) {
    const ratio = p.lam / p.a,
      gap = p.a * 15,
      spacing = p.lam * 15,
      spread = Math.min(1, ratio);
    scene = (
      <svg
        viewBox="0 0 560 360"
        className="plot"
        role="img"
        aria-label="Fronts plans et fronts diffractés illustratifs"
      >
        <text x="20" y="28">
          Incidents → | {mode === "opening" ? "Ouverture" : "Obstacle"} | fronts
          illustratifs
        </text>
        {Array.from({ length: 45 }, (_, i) => {
          const x = 260 - i * spacing + ((t * 30) % spacing);
          return x > 10 && x < 250 ? (
            <line
              key={i}
              x1={x}
              x2={x}
              y1="50"
              y2="315"
              className="wavefront"
            />
          ) : null;
        })}
        {mode === "opening" ? (
          <>
            <line
              x1="260"
              x2="260"
              y1="45"
              y2={180 - gap / 2}
              className="wall"
            />
            <line
              x1="260"
              x2="260"
              y1={180 + gap / 2}
              y2="320"
              className="wall"
            />
          </>
        ) : (
          <line
            x1="260"
            x2="260"
            y1={180 - gap / 2}
            y2={180 + gap / 2}
            className="wall"
          />
        )}
        {Array.from({ length: 45 }, (_, i) => {
          const r = i * spacing + ((t * 30) % spacing);
          if (r < 10 || r > 320) return null;
          const centers =
            mode === "opening" ? [180] : [180 - gap / 2, 180 + gap / 2];
          return centers.map((cy, j) => {
            const angle = 0.12 + spread * 1.3;
            const x = 260 + r * Math.cos(angle),
              dy = r * Math.sin(angle);
            return (
              <path
                key={`${i}-${j}`}
                d={`M${x},${cy - dy} A${r},${r} 0 0 1 ${x},${cy + dy}`}
                className="wavefront"
              />
            );
          });
        })}
        <text x="20" y="345">
          a={fmt(p.a)} cm ; λ={fmt(p.lam)} cm ; v illustrative=2 cm/s
        </text>
      </svg>
    );
    metrics = [
      {
        label: "Rapport λ/a",
        value: fmt(ratio),
        hint: ratio >= 0.5 ? "Étalement marqué" : "Étalement faible",
      },
      { label: "Fréquence conservée", value: fmt(2 / p.lam), unit: "Hz" },
      { label: "Célérité fixée", value: "2", unit: "cm/s" },
      {
        label: "Modèle",
        value: "Huygens",
        hint: "Fronts illustratifs ; amplitudes non calculées.",
      },
    ];
  } else if (id === 8) {
    const angle = (TAU * t) / p.T,
      j = Math.floor(t / p.Te);
    scene = (
      <svg
        viewBox="0 0 560 330"
        className="plot"
        role="img"
        aria-label="Rotation réelle et positions observées numérotées"
      >
        <text x="100" y="35">
          Rotation réelle ↺
        </text>
        <text x="325" y="35">
          Échantillons jTe
        </text>
        <g transform="translate(145,170)">
          <circle r="80" className="axis" />
          <line
            x2={80 * Math.cos(angle)}
            y2={-80 * Math.sin(angle)}
            className="curve"
          />
          <circle
            cx={80 * Math.cos(angle)}
            cy={-80 * Math.sin(angle)}
            r="8"
            className="probe"
          />
        </g>
        <g transform="translate(410,170)">
          <circle r="80" className="axis" />
          {Array.from({ length: Math.min(8, j + 1) }, (_, i) => {
            const index = Math.max(0, j - 7) + i,
              a = (TAU * index * p.Te) / p.T;
            return (
              <g key={index}>
                <circle
                  cx={80 * Math.cos(a)}
                  cy={-80 * Math.sin(a)}
                  r="6"
                  className="probe"
                />
                <text
                  x={100 * Math.cos(a)}
                  y={-100 * Math.sin(a)}
                  textAnchor="middle"
                >
                  {index}
                </text>
              </g>
            );
          })}
        </g>
        <text x="20" y="310">
          Aucun flash : uniquement les positions observées, au plus 8.
        </text>
      </svg>
    );
    const delta = wrap((TAU * p.Te) / p.T);
    metrics = [
      {
        label: "Saut principal",
        value: fmt((delta * 180) / Math.PI, 1),
        unit: "°",
      },
      {
        label: "Sens apparent",
        value:
          Math.abs(Math.abs(delta) - Math.PI) < 1e-6
            ? "ambigu"
            : Math.abs(delta) < 1e-6
              ? "immobile"
              : delta > 0
                ? "direct"
                : "inverse",
      },
      { label: "Observations", value: String(j + 1) },
      { label: "Avancée réelle", value: fmt(p.Te / p.T), unit: "tour/obs." },
    ];
  } else if (id === 9) {
    const o1 = optical(p.lam * 1e-9, p.n1),
      o2 = optical(p.lam * 1e-9, p.n2),
      tt = t * 1e-15;
    const field = (x: number) =>
      Math.sin(
        TAU *
          (o1.f * tt - ((x - 1.5) * 1e-6) / (x < 1.5 ? o1.lambda : o2.lambda)),
      );
    scene = (
      <>
        <svg
          viewBox="0 0 560 100"
          className="plot"
          role="img"
          aria-label="Interface à incidence normale"
        >
          <text x="25" y="25">
            Champ électrique (schéma) ; propagation →
          </text>
          <rect x="25" y="40" width="250" height="45" className="medium1" />
          <rect x="275" y="40" width="250" height="45" className="medium2" />
          <text x="40" y="68">
            n₁={fmt(p.n1)}
          </text>
          <text x="300" y="68">
            n₂={fmt(p.n2)}
          </text>
        </svg>
        <Graph
          label="E/E₀ · interface en x=1,5 µm"
          fn={field}
          max={3}
          scale={1}
          unit="µm"
          yunit="E/E₀"
          cursor={[1.5]}
        />
      </>
    );
    metrics = [
      {
        label: "Fréquence des deux côtés",
        value: fmt(o1.f / 1e12, 1),
        unit: "THz",
      },
      {
        label: "Milieu 1",
        value: fmt(o1.lambda * 1e9, 1),
        unit: "nm",
        hint: `v₁=${fmt(o1.v / 1e8)}×10⁸ m/s`,
      },
      {
        label: "Milieu 2",
        value: fmt(o2.lambda * 1e9, 1),
        unit: "nm",
        hint: `v₂=${fmt(o2.v / 1e8)}×10⁸ m/s`,
      },
      {
        label: "Temps physique",
        value: fmt(t),
        unit: "fs",
        hint: "1 fs = 10⁻¹⁵ s ; temps fortement ralenti.",
      },
    ];
  } else if (id === 10) {
    const lambda = p.lam * 1e-9,
      a = p.a * 1e-6,
      result = diffraction(lambda, a, p.D),
      L = result.L!,
      theta = result.theta!,
      span = Math.max(0.015, L * 2.5);
    const max = span * 2;
    const error = ((L - result.approx) / L) * 100,
      N = (a * a) / (lambda * p.D);
    scene = (
      <>
        <svg
          viewBox="0 0 560 225"
          className="plot"
          role="img"
          aria-label="Laser, fente et écran avec demi-angle"
        >
          <text x="20" y="25">
            Banc · géométrie des rayons exagérée pour être lisible
          </text>
          <rect
            x="20"
            y="98"
            width="80"
            height="35"
            rx="6"
            className="medium1"
          />
          <text x="29" y="120">
            Laser
          </text>
          <path
            d={path(
              (x) => Math.sin(TAU * ((3e8 / lambda) * t * 1e-15 - x / 40)),
              0,
              80,
              100,
              115,
              80,
              8,
            )}
            className="laser"
          />
          <line x1="180" x2="180" y1="45" y2="108" className="wall" />
          <line x1="180" x2="180" y1="122" y2="190" className="wall" />
          <text x="155" y="210">
            fente a
          </text>
          <line x1="180" x2="480" y1="115" y2="115" className="axis" />
          <path d="M180 115 L480 55 M180 115 L480 175" className="laser" />
          <path d="M230 115 A50 50 0 0 0 229 105" className="curve" />
          <text x="237" y="101">
            θ
          </text>
          <line x1="480" x2="480" y1="35" y2="195" className="wall" />
          <text x="490" y="120">
            L
          </text>
          <text x="290" y="150">
            D={fmt(p.D)} m
          </text>
          <text x="440" y="218">
            Écran
          </text>
        </svg>
        <Graph
          label="Intensité I/I₀ · centre au milieu de l’axe"
          fn={(z) => intensity(Math.atan((z / 1000 - span) / p.D), lambda, a)}
          max={max * 1000}
          unit="mm*"
          yunit="I/I₀"
          scale={1}
          positive
        />
        <svg
          viewBox="0 0 560 75"
          className="plot"
          role="img"
          aria-label="Aspect de l’écran, luminosité illustrative"
        >
          {Array.from({ length: 240 }, (_, i) => {
            const z = (i / 239 - 0.5) * max,
              I = intensity(Math.atan(z / p.D), lambda, a);
            return (
              <rect
                key={i}
                x={40 + i * 2}
                y="10"
                width="2.2"
                height="38"
                fill={`hsl(${p.lam < 490 ? 230 : p.lam < 570 ? 130 : p.lam < 610 ? 45 : 5} 85% 55%)`}
                opacity={Math.pow(I, 0.45)}
              />
            );
          })}
          <text x="25" y="72">
            * Axe décalé : z = abscisse − {fmt(span * 1000, 1)} mm
          </text>
        </svg>
        <p className="sim-note">
          Centre : z=0 ; premiers minima : z=±{fmt(L * 500, 2)} mm. Écran et
          intensité moyenne stationnaires. Lecture anime le champ du laser au
          ralenti ; sa longueur dessinée n’est pas à l’échelle du banc.
        </p>
        <p className="sim-note">
          Écart petits angles : {fmt(error, 3)} %. Nombre de Fresnel a²/(λD)=
          {fmt(N, 4)}.{" "}
          {N > 0.1
            ? "Attention : régime lointain insuffisant sans optique adaptée."
            : "Régime lointain cohérent."}
        </p>
      </>
    );
    // Graph uses millimetres on its horizontal axis, convert back to metres.
    scene = <>{scene}</>;
    metrics = [
      { label: "Demi-angle exact", value: fmt(theta * 1000, 2), unit: "mrad" },
      { label: "Largeur exacte", value: fmt(L * 1000, 2), unit: "mm" },
      {
        label: "Petits angles",
        value: fmt(result.approx * 1000, 2),
        unit: "mm",
      },
      {
        label: "Premier minimum",
        value: fmt(L * 500, 2),
        unit: "mm",
        hint: "Distance du centre à un minimum.",
      },
    ];
  } else {
    const colors = [
      "#774bcc",
      "#4867c8",
      "#218dba",
      "#32925a",
      "#d2a227",
      "#c26a46",
      "#d44b40",
    ];
    scene = (
      <svg
        viewBox="0 0 560 330"
        className="plot"
        role="img"
        aria-label="Prisme, dispersion qualitative"
      >
        <text x="20" y="30">
          Schéma qualitatif · angles non calculés
        </text>
        <path d="M215 60 L135 260 L330 260 Z" className="prism" />
        <line x1="20" x2="175" y1="160" y2="160" className="axis" />
        {(white ? colors : ["#d44b40"]).map((color, i) => (
          <path
            key={color}
            d={`M20 160 L175 160 L280 180 L530 ${200 + (white ? 6 - i : 0) * 12 * p.spread}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="12 3"
            strokeDashoffset={-t * 20}
          />
        ))}
        <text x="20" y="300">
          {white
            ? "Blanc → composantes ; violet généralement plus dévié"
            : "Monochromatique → une seule composante"}
        </text>
        <text x="20" y="325">
          La fréquence de chaque composante est conservée.
        </text>
      </svg>
    );
    metrics = [
      { label: "Source", value: white ? "blanche" : "rouge" },
      { label: "Phénomène", value: "dispersion" },
      {
        label: "Indice",
        value: "n(λ₀)",
        hint: "Dépendance qualitative, pas de valeurs déduites.",
      },
      { label: "Fréquence", value: "conservée" },
    ];
  }
  return (
    <div className="laboratory" ref={root}>
      <SimulationCard
        title={simNames[id - 1]}
        eyebrow={`EXPÉRIENCE ${String(id).padStart(2, "0")}${id === 8 ? " · FACULTATIVE" : ""}`}
        toolbar={
          <span>
            {running ? "Lecture" : "En pause"} ·{" "}
            {timeUnit === "fs"
              ? "Temps ralenti"
              : id === 11
                ? "Temps illustratif"
                : "Modèle pédagogique"}
          </span>
        }
      >
        <div className="simulation-scene">{scene}</div>
        <div className="play-controls">
          <Button
            onClick={() => {
              if (t >= end) setT(0);
              run(!running);
            }}
            primary
          >
            {running ? "Pause" : "Lecture"}
          </Button>
          <Button onClick={reset}>Recommencer</Button>
          <Button
            onClick={() => {
              run(false);
              setT((q) => Math.min(end, q + 0.05));
            }}
          >
            Pas +
          </Button>
          <output aria-label="Temps de la simulation">
            t={fmt(t)} {timeUnit}
          </output>
        </div>
        <div className="manual-time">
          <ParameterControl
            label="Temps manuel"
            unit={timeUnit}
            min={0}
            max={end}
            step={0.01}
            value={t}
            onChange={(value) => {
              run(false);
              setT(value);
            }}
          />
        </div>
      </SimulationCard>
      <MetricGrid metrics={metrics} />
      <Panel
        title="Paramètres contrôlés · mesures calculées ci-dessus"
        className="sim-settings"
      >
        <div className="parameter-grid">
          {configs[id - 1].map((c) => (
            <ParameterControl
              key={c.key}
              label={c.label}
              unit={c.unit}
              min={c.min}
              max={
                id === 3 && (c.key === "c1" || c.key === "c2")
                  ? p.base * 10
                  : id === 5 && c.key === "d"
                    ? Math.max(3, 2 * lam)
                    : id === 4 && (c.key === "s1" || c.key === "s2")
                      ? Math.max(4, 2 * lam)
                      : c.max
              }
              step={c.step}
              value={p[c.key]}
              onChange={(value) => update(c.key, value)}
            />
          ))}
        </div>
        {id === 5 && (
          <div className="presets">
            {[
              ["Même phase", 1],
              ["Opposition", 0.5],
              ["Quadrature", 0.25],
            ].map(([label, q]) => (
              <Button key={label} onClick={() => update("d", lam * Number(q))}>
                {label}
              </Button>
            ))}
          </div>
        )}
        {id === 6 && (
          <Toggle
            label="Atténuation de pression 1/r (gain r₁/r₂)"
            checked={atten}
            onChange={setAtten}
          />
        )}{" "}
        {id === 7 && (
          <SelectControl
            label="Géométrie"
            value={mode}
            onChange={setMode}
            options={[
              { id: "opening", label: "Ouverture" },
              { id: "obstacle", label: "Obstacle" },
            ]}
          />
        )}{" "}
        {id === 11 && (
          <Toggle
            label="Lumière blanche (sinon laser rouge)"
            checked={white}
            onChange={setWhite}
          />
        )}
        <Button onClick={restore}>Paramètres initiaux</Button>
      </Panel>
      <p className="observe">
        <strong>À observer et à discuter.</strong> {descriptions[id - 1]}
      </p>
    </div>
  );
}
