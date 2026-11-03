import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_URL || "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [],
  errors = [];
await mkdir("artifacts", { recursive: true });
try {
  for (const mobile of [true, false]) {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.getByRole("heading", { name: /Comprendre les ondes/ }).waitFor();
    const check = async (name) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.ok(!overflow, `overflow ${name} ${mobile}`);
      assert.equal(await page.locator(".katex-error").count(), 0);
      results.push(`${mobile ? "mobile" : "desktop"} ${name}`);
    };
    await check("home");
    await page.screenshot({
      path: `artifacts/home-${mobile ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Activer le thème sombre" }).click();
    assert.equal(
      await page.locator(".site").getAttribute("data-lab-theme"),
      "dark",
    );
    await page.screenshot({
      path: `artifacts/dark-${mobile ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Activer le thème clair" }).click();
    for (const [chapter, count] of [
      [0, 7],
      [1, 8],
      [2, 6],
    ])
      for (let lesson = 1; lesson <= count; lesson++) {
        await page.goto(`${base}#cours/${chapter}/${lesson}`);
        await page.locator(".lesson").waitFor();
        await check(`course-${chapter}-${lesson}`);
      }
    await page.goto(`${base}#cours/0/1`);
    const understood = page.getByRole("checkbox", { name: /J’ai compris/ });
    await understood.check();
    await page.reload();
    await understood.waitFor();
    assert.ok(await understood.isChecked());
    results.push("progression persisted");
    await page.goto(`${base}#exercices/0`);
    assert.equal(await page.locator(".correction[open]").count(), 0);
    const ex = page.locator("#m4");
    await ex.locator("input").fill("0,30");
    await ex.getByRole("button", { name: "Vérifier" }).click();
    await ex
      .getByRole("status")
      .filter({ hasText: "Résultat correct" })
      .waitFor();
    await ex.locator("summary").last().click();
    assert.ok(
      (await ex.locator("details.correction").getAttribute("open")) !== null,
    );
    results.push("decimal comma, feedback, hidden correction");
    for (let id = 1; id <= 11; id++) {
      await page.goto(`${base}#labo/${id}`);
      await page.locator(".laboratory").waitFor();
      await check(`lab-${id}`);
      assert.equal(
        await page
          .getByRole("button", { name: "Lecture", exact: true })
          .count(),
        1,
      );
      const scene = await page.locator(".simulation-scene").innerHTML();
      const time = page.getByRole("spinbutton", {
        name: "Temps manuel",
        exact: true,
      });
      await time.fill(id === 3 ? "2" : "0,25");
      await time.press("Enter");
      assert.match(
        await page
          .locator('output[aria-label="Temps de la simulation"]')
          .innerText(),
        /0,25|2/,
      );
      if ([1, 2, 4, 5, 8, 9, 10, 11].includes(id))
        assert.notEqual(
          scene,
          await page.locator(".simulation-scene").innerHTML(),
          `time must change lab ${id}`,
        );
      const range = page.locator(".sim-settings input[type=range]").first();
      const old = await range.inputValue();
      await range.focus();
      await range.press("ArrowRight");
      assert.notEqual(await range.inputValue(), old);
      await page.screenshot({
        path: `artifacts/lab-${id}-state2-${mobile ? "mobile" : "desktop"}.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "Paramètres initiaux" }).click();
      assert.equal(await range.inputValue(), old);
      await page.getByRole("button", { name: "Lecture", exact: true }).click();
      await page.waitForTimeout(250);
      await page.getByRole("button", { name: "Pause", exact: true }).click();
      await page
        .getByRole("button", { name: "Recommencer", exact: true })
        .click();
      assert.match(
        await page
          .locator('output[aria-label="Temps de la simulation"]')
          .innerText(),
        /t=0 /,
      );
      if (id === 4) {
        const m = page.getByRole("group", { name: "Mesures calculées" });
        const before = await m.innerText();
        const amp = page.getByRole("spinbutton", {
          name: "Amplitude",
          exact: true,
        });
        await amp.fill("5");
        await amp.press("Enter");
        assert.equal(await m.innerText(), before);
        const freq = page.getByRole("spinbutton", {
          name: "Fréquence",
          exact: true,
        });
        await freq.fill("2");
        await freq.press("Enter");
        assert.match(await m.innerText(), /0,5/);
        results.push(
          "amplitude independent of T and λ; f changes calculated metrics",
        );
      }
      if (id === 5) {
        await page
          .getByRole("button", { name: "Opposition", exact: true })
          .click();
        assert.match(
          await page
            .getByRole("group", { name: "Mesures calculées" })
            .innerText(),
          /−?3,142|-3,142/,
        );
      }
      if (id === 10) {
        const metrics = page.getByRole("group", { name: "Mesures calculées" });
        const before = await metrics.innerText();
        const slit = page.getByRole("spinbutton", {
          name: "Largeur de la fente",
          exact: true,
        });
        await slit.fill("50");
        await slit.press("Enter");
        const after = await metrics.innerText();
        assert.notEqual(before, after);
        assert.match(after, /48/);
      }
      await page.screenshot({
        path: `artifacts/lab-${id}-${mobile ? "mobile" : "desktop"}.png`,
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: mobile ? 390 : 1440, height: 400 });
    await page.goto(`${base}#labo/4`);
    await page.getByRole("button", { name: "Lecture", exact: true }).click();
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    const frozen = await page
      .locator('output[aria-label="Temps de la simulation"]')
      .innerText();
    await page.waitForTimeout(200);
    assert.equal(
      await page
        .locator('output[aria-label="Temps de la simulation"]')
        .innerText(),
      frozen,
    );
    results.push("offscreen time frozen");
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    );
    for (const route of [
      "exercices/1",
      "exercices/2",
      "revision/0",
      "revision/1",
      "revision/2",
      "ressources",
      "chimie",
      "devoir",
      "laboratoires",
    ]) {
      await page.goto(`${base}#${route}`);
      await page.waitForTimeout(70);
      await check(route);
    }
    await page.goto(`${base}#devoir`);
    assert.equal(await page.locator(".exam-correction").count(), 0);
    await page
      .getByRole("button", { name: "Ouvrir le corrigé et le barème" })
      .click();
    assert.equal(await page.locator(".exam-correction article").count(), 4);
    await page.goto(`${base}#exercices/2`);
    await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
    assert.equal(await page.locator("details:not([open])").count(), 0);
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: `artifacts/exercices-${mobile ? "mobile" : "desktop"}.pdf`,
      format: "A4",
      printBackground: true,
    });
    await page.evaluate(() => dispatchEvent(new Event("afterprint")));
    results.push("print corrections");
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/browser-results.json",
    JSON.stringify({ passed: results.length, results, errors }, null, 2),
  );
  console.log(`${results.length} browser checks passed; no JavaScript errors.`);
} finally {
  await browser.close();
}
