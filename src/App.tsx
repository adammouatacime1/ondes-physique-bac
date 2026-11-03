import { useEffect, useState } from "react";
import katex from "katex";
import {
  Moon,
  Sun,
  Printer,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Check,
} from "lucide-react";
import {
  LabRoot,
  LabHeader,
  WorkspaceHeading,
  Button,
  Panel,
  Badge,
  Callout,
} from "./shared/lab-ui";
import { chapters, glossary, confusions, type Lesson } from "./content";
import { exercises, exam, type Exercise } from "./exercises";
import Simulation, { simNames } from "./Simulations";
import { numericAnswer } from "./physics";
function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function Formula({ tex }: { tex: string }) {
  return (
    <div
      className="formula"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, {
          throwOnError: false,
          displayMode: true,
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}
function ExerciseCard({ e, show = true }: { e: Exercise; show?: boolean }) {
  const [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState("");
  return (
    <article className="exercise" id={e.id}>
      <div className="row">
        <h3>{e.title}</h3>
        <Badge>
          {e.level} · {e.kind}
          {e.points ? ` · ${e.points} pts` : ""}
        </Badge>
      </div>
      <p>{e.statement}</p>
      {show && (
        <>
          <div className="hints">
            {e.hints.map((hint, i) => (
              <details key={i}>
                <summary>Indice {i + 1}</summary>
                <p>{hint}</p>
              </details>
            ))}
          </div>
          {e.expected !== undefined ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const n = Number(answer.trim().replace(",", "."));
                setFeedback(
                  !answer.trim() || !Number.isFinite(n)
                    ? "Entrez un nombre, avec une virgule ou un point."
                    : numericAnswer(answer, e.expected!)
                      ? "Résultat correct (tolérance 2 %). Comparez votre démarche au corrigé."
                      : "À reprendre : vérifiez les conversions et la relation. Les indices peuvent vous aider.",
                );
              }}
            >
              <label htmlFor={`answer-${e.id}`}>
                Votre résultat ({e.unit})
              </label>
              <div className="row">
                <input
                  id={`answer-${e.id}`}
                  inputMode="decimal"
                  value={answer}
                  onChange={(ev) => {
                    setAnswer(ev.target.value);
                    setFeedback("");
                  }}
                  autoComplete="off"
                />
                <Button type="submit">Vérifier</Button>
              </div>
              <p role="status">{feedback}</p>
            </form>
          ) : (
            <div className="rubric">
              <p>Autoévaluation : cochez après avoir rédigé votre réponse.</p>
              {e.rubric?.map((r, i) => (
                <label key={i}>
                  <input type="checkbox" /> {r}
                </label>
              ))}
            </div>
          )}
          <details className="correction">
            <summary>Afficher la correction détaillée</summary>
            <Solution e={e} />
          </details>
          <p className="pitfall">
            <strong>Erreur fréquente :</strong> {e.error}
          </p>
        </>
      )}
    </article>
  );
}
function Solution({ e }: { e: Exercise }) {
  return (
    <div>
      <ol>
        {e.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p>
        <strong>Sens physique :</strong> {e.comment}
      </p>
    </div>
  );
}
function MiniDiagram({ sim }: { sim: number }) {
  return (
    <svg
      className="lesson-diagram"
      viewBox="0 0 560 125"
      role="img"
      aria-label={
        sim >= 9
          ? "Schéma de propagation lumineuse à une interface ou par une ouverture"
          : "Schéma du signal allant de la source vers un point retardé"
      }
    >
      <title>{sim >= 9 ? "Modèle lumineux" : "Source et point aval"}</title>
      <text x="25" y="25">
        {sim >= 9
          ? "Modèle : fronts / rayons, pas de vibration de matière"
          : "Source S → propagation vers les x croissants → point M"}
      </text>
      <line x1="45" x2="510" y1="65" y2="65" className="axis" />
      {[65, 115, 165, 215, 265, 315, 365, 415, 465].map((x, i) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={48 + (i % 2) * 8}
          y2={82 - (i % 2) * 8}
          className="wavefront"
        />
      ))}
      <text x="25" y="112">
        {sim >= 9
          ? "Consulter le laboratoire lié pour les paramètres et la géométrie."
          : "La perturbation avance ; les particules restent proches de leur équilibre."}
      </text>
    </svg>
  );
}
function LessonCard({
  lesson,
  index,
  chapter,
  checked,
  onCheck,
}: {
  lesson: Lesson;
  index: number;
  chapter: number;
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <article className="lesson" id={`notion-${index + 1}`}>
      <div className="row">
        <span className="section-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2>{lesson.title}</h2>
        <Badge>
          {lesson.extra ? "Approfondissement facultatif" : "Essentiel"}
        </Badge>
      </div>
      <div className="situation">
        <strong>1 · Partir du réel</strong>
        <p>{lesson.question}</p>
      </div>
      <h3>2 · Construire l’intuition</h3>
      <p>{lesson.intuition}</p>
      <h3>3 · Observer le modèle</h3>
      <MiniDiagram sim={lesson.sim} />
      <a className="text-link" href={`#labo/${lesson.sim}`}>
        Manipuler : {simNames[lesson.sim - 1]} →
      </a>
      <h3>4 · Définir précisément</h3>
      <p>{lesson.definition}</p>
      <h3>5 · Relier les grandeurs</h3>
      <Formula tex={lesson.formula} />
      <p className="symbols">{lesson.symbols}</p>
      <p>
        <strong>Conditions :</strong> {lesson.conditions}
      </p>
      <h3>6 · Comprendre la démonstration</h3>
      <p>{lesson.proof}</p>
      <h3>7 · Exemple entièrement corrigé</h3>
      <p className="worked">{lesson.example}</p>
      <h3>8 · À vous de chercher</h3>
      <p>{lesson.challenge}</p>
      <details>
        <summary>Un indice</summary>
        <p>{lesson.hint}</p>
      </details>
      <details className="correction">
        <summary>Vérifier le raisonnement</summary>
        <p>{lesson.answer}</p>
      </details>
      <h3>9 · Éviter le piège</h3>
      <p className="pitfall">{lesson.error}</p>
      <label className="understood">
        <input type="checkbox" checked={checked} onChange={onCheck} />{" "}
        <Check size={17} /> J’ai compris cette notion
      </label>
      <div className="row lesson-nav">
        {index > 0 && (
          <a href={`#cours/${chapter}/${index}`}>← Notion précédente</a>
        )}
        {index < chapters[chapter].lessons.length - 1 ? (
          <a href={`#cours/${chapter}/${index + 2}`}>Notion suivante →</a>
        ) : (
          <a href={`#exercices/${chapter}`}>Passer aux exercices →</a>
        )}
      </div>
    </article>
  );
}
function Resources() {
  return (
    <>
      <WorkspaceHeading
        eyebrow="OUTILS POUR APPRENDRE"
        title="Relier les notions"
        description="Glossaire, conversions et confusions fréquentes."
      />
      <div className="resource-grid">
        <Panel title="Glossaire">
          {glossary.map(([word, def]) => (
            <dl key={word}>
              <dt>{word}</dt>
              <dd>{def}</dd>
            </dl>
          ))}
        </Panel>
        <Panel title="Unités et conversions">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Grandeur</th>
                  <th>Unité SI</th>
                  <th>Conversions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Distance", "m", "1 cm = 10⁻² m ; 1 mm = 10⁻³ m"],
                  ["Petites longueurs", "m", "1 µm = 10⁻⁶ m ; 1 nm = 10⁻⁹ m"],
                  ["Temps", "s", "1 ms = 10⁻³ s ; 1 µs = 10⁻⁶ s"],
                  ["Fréquence", "Hz", "1 kHz = 10³ Hz ; Hz = s⁻¹"],
                  ["Célérité", "m·s⁻¹", "1 m/s = 3,6 km/h"],
                  ["Phase", "rad", "2π rad = 360° ; π/2 rad = 90°"],
                  ["Indice", "sans unité", "n = c/v"],
                  ["Intensité relative", "sans unité", "I/I₀ ≥ 0"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((c) => (
                      <td key={c}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <div className="content-width">
        <h2>Je confonds souvent…</h2>
        {confusions.map(([title, text]) => (
          <details key={title}>
            <summary>{title}</summary>
            <p>{text}</p>
          </details>
        ))}
        <Callout title="Périmètre et provenance">
          <p>
            Contenus et exercices originaux, conçus pour un travail de 2e Bac
            Sciences Mathématiques A au Maroc. Aucune conformité officielle au
            programme n’est revendiquée : aucun document officiel ni document
            personnel de cours n’était fourni. Les expressions de phase, la
            stroboscopie et certaines hypothèses optiques explicitent le modèle
            ou proposent un approfondissement.
          </p>
          <p>
            Interface issue du design kit de{" "}
            <a href="https://github.com/adammouatacime1/diffraction-lab-3d/tree/livraison-diffraction-lab-3d/design-kit">
              Diffraction Lab 3D
            </a>
            . Les modèles de référence sont l’onde progressive sans déformation,
            la diffraction de Fraunhofer d’une fente et la réfraction à une
            interface stationnaire.
          </p>
        </Callout>
      </div>
    </>
  );
}
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "accueil");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    load("ondes-theme", "light"),
  );
  const [progress, setProgress] = useState<Record<string, boolean>>(() =>
    load("ondes-progression-v1", {}),
  );
  const [persist, setPersist] = useState(true);
  const [examCorrection, setExamCorrection] = useState(false);
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || "accueil");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    save("ondes-theme", theme);
  }, [theme]);
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = Array.from(
        document.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
      );
      opened.forEach((e) => (e.open = true));
    };
    const after = () => {
      opened.forEach((e) => (e.open = false));
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  const toggle = (key: string) => {
    const next = { ...progress, [key]: !progress[key] };
    setProgress(next);
    setPersist(save("ondes-progression-v1", next));
  };
  const [page, arg, sub] = route.split("/");
  const ci = Math.min(2, Math.max(0, Number(arg) || 0)),
    chapter = chapters[ci];
  const lessonIndex = Math.min(
    chapter.lessons.length - 1,
    Math.max(0, (Number(sub) || 1) - 1),
  );
  const count = Object.values(progress).filter(Boolean).length,
    total = chapters.reduce((n, c) => n + c.lessons.length, 0);
  useEffect(() => {
    document.title =
      page === "cours"
        ? `${chapter.lessons[lessonIndex].title} · Ondes`
        : page === "labo"
          ? `${simNames[Math.min(11, Math.max(1, Number(arg) || 1)) - 1]} · Ondes`
          : "Ondes · Atelier de physique";
  }, [route, page, arg, chapter, lessonIndex]);
  let content;
  if (page === "accueil") {
    content = (
      <>
        <section className="hero">
          <div className="hero-copy">
            <span className="lk-eyebrow">
              PHYSIQUE · 2e BAC SCIENCES MATHÉMATIQUES A
            </span>
            <h1>
              Comprendre les ondes,
              <br />
              <em>une expérience à la fois.</em>
            </h1>
            <p>
              Du mouvement d’une corde à la lumière d’un laser : observez,
              mesurez et construisez votre raisonnement.
            </p>
            <div className="hero-actions">
              <a className="action primary" href="#cours/0/1">
                <BookOpen size={18} /> Comprendre depuis le début
              </a>
              <a className="action" href="#revision/0">
                Réviser avant un devoir <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-stats">
              <span>
                <strong>3</strong> chapitres
              </span>
              <span>
                <strong>11</strong> laboratoires
              </span>
              <span>
                <strong>27</strong> exercices corrigés
              </span>
            </div>
          </div>
          <svg
            className="hero-wave"
            viewBox="0 0 500 320"
            role="img"
            aria-label="Une onde se propage ; les points vibrent localement"
          >
            <defs>
              <pattern
                id="grid"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M25 0H0V25"
                  fill="none"
                  stroke="currentColor"
                  opacity=".12"
                />
              </pattern>
            </defs>
            <rect width="500" height="320" fill="url(#grid)" />
            <text x="25" y="30">
              OBSERVER · MESURER · COMPRENDRE
            </text>
            {[0, 1, 2].map((j) => (
              <path
                key={j}
                d={Array.from(
                  { length: 101 },
                  (_, i) =>
                    `${i ? "L" : "M"}${i * 5},${150 + j * 28 - 55 * Math.sin((i / 100) * 3 * Math.PI - j * 0.7)}`,
                ).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth={j === 0 ? 3 : 1.5}
                opacity={1 - j * 0.28}
              />
            ))}
            <circle
              cx="250"
              cy={150 - 55 * Math.sin(1.5 * Math.PI)}
              r="7"
              className="probe"
            />
            <text x="25" y="285">
              La forme avance. Le milieu oscille localement.
            </text>
          </svg>
        </section>
        <div className="content-width">
          <div className="section-heading">
            <div>
              <span className="lk-eyebrow">VOTRE PARCOURS</span>
              <h2>Trois regards sur un même phénomène</h2>
            </div>
            <span>
              {count}/{total} notions comprises
            </span>
          </div>
          <div className="chapter-grid">
            {chapters.map((c, i) => (
              <a className="chapter-card" href={`#cours/${i}/1`} key={c.id}>
                <span className="chapter-index">
                  0{i + 1} <span>COURS & LABORATOIRES</span>
                </span>
                <h2>{c.title}</h2>
                <p>{c.intro}</p>
                <div className="card-bottom">
                  <span>{c.lessons.length} notions · 9 exercices</span>
                  <ArrowRight size={20} />
                </div>
              </a>
            ))}
          </div>
          <Callout
            icon={<FlaskConical />}
            eyebrow="APPRENDRE EN EXPÉRIMENTANT"
            title="La même relation, plusieurs façons de la voir"
          >
            <p>
              Une courbe spatiale, un signal temporel et un calcul doivent
              raconter la même histoire. Les laboratoires vous permettent de
              modifier un paramètre et de vérifier ce qui change.
            </p>
            <a href="#laboratoires" className="text-link">
              Ouvrir les laboratoires →
            </a>
          </Callout>
          <div className="home-links">
            <a href="#devoir">Devoir blanc transversal · 60 min · /20 →</a>
            <a href="#ressources">Glossaire, unités et confusions →</a>
            <a href="#chimie">À propos du cours de chimie →</a>
          </div>
        </div>
      </>
    );
  } else if (page === "cours") {
    const l = chapter.lessons[lessonIndex];
    content = (
      <>
        <WorkspaceHeading
          eyebrow={`CHAPITRE 0${ci + 1} · ${lessonIndex + 1}/${chapter.lessons.length}`}
          title={chapter.title}
          description={chapter.intro}
        />
        <div className="course-layout">
          <aside className="course-menu">
            <Panel title="Sommaire du chapitre">
              <nav aria-label="Notions">
                {chapter.lessons.map((l, i) => (
                  <a
                    key={l.title}
                    href={`#cours/${ci}/${i + 1}`}
                    aria-current={i === lessonIndex ? "page" : undefined}
                  >
                    <span>
                      {progress[`${ci}-${i}`]
                        ? "✓"
                        : String(i + 1).padStart(2, "0")}
                    </span>
                    {l.title}
                    {l.extra ? " *" : ""}
                  </a>
                ))}
              </nav>
              <a className="text-link" href={`#revision/${ci}`}>
                Fiche de révision →
              </a>
              <a className="text-link" href={`#exercices/${ci}`}>
                9 exercices corrigés →
              </a>
            </Panel>
          </aside>
          <div>
            <LessonCard
              key={`${ci}-${lessonIndex}`}
              lesson={l}
              index={lessonIndex}
              chapter={ci}
              checked={!!progress[`${ci}-${lessonIndex}`]}
              onCheck={() => toggle(`${ci}-${lessonIndex}`)}
            />
            <div className="chapter-relations">
              {ci > 0 && (
                <a href={`#cours/${ci - 1}/1`}>← Chapitre précédent</a>
              )}
              {ci < 2 && <a href={`#cours/${ci + 1}/1`}>Chapitre suivant →</a>}
              <a href="#ressources">
                Relier les notions : glossaire et confusions →
              </a>
            </div>
          </div>
        </div>
      </>
    );
  } else if (page === "labo") {
    const id = Math.min(11, Math.max(1, Number(arg) || 1));
    content = (
      <>
        <WorkspaceHeading
          eyebrow="LABORATOIRES INTERACTIFS"
          title={simNames[id - 1]}
          description="Choisissez un paramètre, faites une prédiction, puis vérifiez-la."
        />
        <div className="content-width wide">
          <a href="#laboratoires" className="text-link">
            ← Toutes les expériences
          </a>
          <Simulation key={id} id={id} />
          <div className="row">
            <a href={`#cours/${id <= 3 ? 0 : id <= 8 ? 1 : 2}/1`}>
              Revenir au cours
            </a>
            {id > 1 && <a href={`#labo/${id - 1}`}>← Expérience précédente</a>}
            {id < 11 && <a href={`#labo/${id + 1}`}>Expérience suivante →</a>}
          </div>
        </div>
      </>
    );
  } else if (page === "laboratoires") {
    content = (
      <>
        <WorkspaceHeading
          title="Les laboratoires"
          description="Les animations démarrent en pause. Tous les réglages restent disponibles au toucher et au clavier."
        />
        <div className="content-width lab-list">
          {simNames.map((name, i) => (
            <a href={`#labo/${i + 1}`} key={name}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h2>{name}</h2>
              <Badge>
                {i === 7
                  ? "Facultatif"
                  : i < 3
                    ? "Chapitre 1"
                    : i < 8
                      ? "Chapitre 2"
                      : "Chapitre 3"}
              </Badge>
              <ArrowRight />
            </a>
          ))}
        </div>
      </>
    );
  } else if (page === "exercices") {
    content = (
      <>
        <WorkspaceHeading
          eyebrow="ENTRAÎNEMENT · EXERCICES ORIGINAUX"
          title={chapter.short}
          description="Cherchez avant d’ouvrir les indices. Les corrigés sont masqués au départ."
        />
        <div className="content-width exercises">
          <div className="row">
            {chapters.map((c, i) => (
              <a
                key={c.id}
                href={`#exercices/${i}`}
                aria-current={ci === i ? "page" : undefined}
              >
                {c.short}
              </a>
            ))}
          </div>
          {exercises[ci].map((e) => (
            <ExerciseCard key={e.id} e={e} />
          ))}
          <a href="#devoir">Poursuivre avec le devoir blanc →</a>
        </div>
      </>
    );
  } else if (page === "revision") {
    content = (
      <>
        <WorkspaceHeading
          eyebrow="PARCOURS · RÉVISER AVANT UN DEVOIR"
          title="Les idées, puis les relations"
          description="Lisez la fiche, faites une mesure dans le laboratoire, puis traitez un exercice sans correction."
        />
        <div className="content-width">
          <div className="row">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#revision/${i}`}>
                {c.short}
              </a>
            ))}
          </div>
          <h2 className="revision-title">{chapter.title}</h2>
          {chapter.lessons
            .filter((l) => !l.extra)
            .map((l, i) => (
              <article className="revision-card" key={l.title}>
                <h3>{l.title}</h3>
                <p>{l.definition}</p>
                <Formula tex={l.formula} />
                <p>{l.symbols}</p>
                <p>
                  <strong>Conditions :</strong> {l.conditions}
                </p>
                <p>
                  <strong>À éviter :</strong> {l.error}
                </p>
                <a href={`#cours/${ci}/${i + 1}`}>
                  Reprendre la démonstration →
                </a>
              </article>
            ))}
          <div className="row">
            <a className="action primary" href={`#exercices/${ci}`}>
              M’entraîner
            </a>
            <a className="action" href="#devoir">
              Faire le devoir blanc
            </a>
          </div>
        </div>
      </>
    );
  } else if (page === "devoir") {
    content = (
      <>
        <WorkspaceHeading
          eyebrow="SUJET ORIGINAL · AUCUNE ATTRIBUTION À UN EXAMEN OFFICIEL"
          title="Devoir blanc transversal"
          description="Durée conseillée : 60 minutes · Calculatrice autorisée · Barème total : 20 points."
        />
        <div className="content-width">
          <p>
            Rédigez sur papier : données en SI, relation littérale, calcul,
            unité et interprétation. Les parties sont indépendantes. Le corrigé
            se trouve dans un panneau séparé sous le sujet.
          </p>
          {exam.map((e) => (
            <ExerciseCard key={e.id} e={e} show={false} />
          ))}
          <Button
            onClick={() => setExamCorrection((v) => !v)}
            aria-expanded={examCorrection}
          >
            {examCorrection
              ? "Masquer le corrigé séparé"
              : "Ouvrir le corrigé et le barème"}
          </Button>
          {examCorrection && (
            <section className="exam-correction">
              <h2>Corrigé séparé · /20</h2>
              {exam.map((e) => (
                <article key={e.id}>
                  <h3>
                    {e.title} · {e.points} points
                  </h3>
                  <Solution e={e} />
                </article>
              ))}
              <p>
                Attribuez les points annoncés pour chaque étape ; une erreur de
                calcul ne retire pas les points d’une relation correcte. Total :
                5+5+6+4=20.
              </p>
            </section>
          )}
        </div>
      </>
    );
  } else if (page === "ressources") content = <Resources />;
  else if (page === "chimie")
    content = (
      <div className="content-width">
        <WorkspaceHeading
          title="Le cours de chimie n’est pas dans ce dépôt"
          description="Le dépôt fourni ne contenait qu’un README avant cette réalisation."
        />
        <Callout title="Contenu préservé, intégration en attente">
          <p>
            Aucun fichier de chimie, lien vers ce cours ou ancienne progression
            n’a été trouvé. Aucun contenu existant n’a été supprimé. La
            progression de physique utilise ses propres clés locales ; elle ne
            remplace pas celle d’un autre site. Pour intégrer réellement la
            chimie dans cette navigation, il faut disposer de ses fichiers ou de
            son adresse.
          </p>
        </Callout>
        <a className="text-link" href="#accueil">
          Retour à l’accueil →
        </a>
      </div>
    );
  else
    content = (
      <div className="content-width">
        <h1>Page introuvable</h1>
        <a href="#accueil">Retour à l’accueil</a>
      </div>
    );
  return (
    <LabRoot theme={theme} className="site">
      <a
        className="skip"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Aller au contenu
      </a>
      <LabHeader
        title="Ondes"
        subtitle="ATELIER DE PHYSIQUE · 2e BAC"
        badge="SCIENCES MATHÉMATIQUES A"
        actions={
          <>
            <Button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={
                theme === "light"
                  ? "Activer le thème sombre"
                  : "Activer le thème clair"
              }
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Button
              onClick={() => {
                if (page === "devoir") setExamCorrection(true);
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => window.print()),
                );
              }}
              aria-label="Imprimer la page"
            >
              <Printer size={18} />
            </Button>
          </>
        }
      />
      <nav className="site-nav" aria-label="Navigation principale">
        <a
          href="#accueil"
          aria-current={page === "accueil" ? "page" : undefined}
        >
          Accueil
        </a>
        {chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#cours/${i}/1`}
            aria-current={page === "cours" && ci === i ? "page" : undefined}
          >
            {c.short}
          </a>
        ))}
        <a href="#laboratoires">Laboratoires</a>
        <a href="#devoir">Devoir blanc</a>
        <a href="#ressources">Ressources</a>
      </nav>
      {!persist && (
        <p role="alert">
          Le stockage local est indisponible : la progression restera uniquement
          dans cette session.
        </p>
      )}
      <main id="main-content" tabIndex={-1}>
        {content}
      </main>
      <footer>
        <span>
          Ondes · Apprendre sans compte · Progression locale : {count}/{total}
        </span>
        <a href="#ressources">Modèles, unités et provenance</a>
        <span>
          Impression : page en cours, schémas figés et corrections ouvertes.
        </span>
      </footer>
    </LabRoot>
  );
}
