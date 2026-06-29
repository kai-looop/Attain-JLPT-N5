/* ============================================================
   N5 Vocabulary Quiz — logic
   Depends on: ../Vocabs/data.js  (provides LESSONS)
   The learner picks a lesson on the start screen; WORDS is the
   word list of whichever lesson is currently selected.
   ============================================================ */

/* ---------- difficulty config ---------- */
const OPTION_COUNT = 6;        // choices per question
const QUESTION_SECONDS = 12;   // countdown when timed mode is on

/* WORDS / lessonLabel are populated from the selected lesson at quiz start. */
let WORDS = [];
let lessonLabel = "";

/* ---------- helpers ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The Japanese face of a word: kanji if present, otherwise kana.
function jpFace(w) {
  return w.kanji && w.kanji.trim() ? w.kanji : w.kana;
}

function hasKanji(w) {
  return w.kanji && w.kanji.trim() !== "";
}

const isKanjiChar = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf);
};

/* How "confusable" candidate `b` is with the target `a`. Higher = a better
   (harder) distractor: same part of speech, similar length, or a shared kanji
   all make a wrong option more tempting than a random unrelated word. */
function similarity(a, b) {
  let s = 0;
  if (a.pos && b.pos && a.pos === b.pos) s += 3;
  const d = Math.abs((a.kana ? a.kana.length : 0) - (b.kana ? b.kana.length : 0));
  if (d === 0) s += 2;
  else if (d === 1) s += 1;
  if (a.kanji && b.kanji) {
    const setA = new Set([...a.kanji].filter(isKanjiChar));
    for (const ch of b.kanji) {
      if (setA.has(ch)) { s += 2; break; }
    }
  }
  return s;
}

/* Build a single multiple-choice question.
   - prompt/sub: what the learner reads
   - correct:    the right answer text
   - optionText: how to render an option from a word (also used for distractors)
   Distractors are the words most *confusable* with the answer (see similarity),
   with a little random jitter so the same word doesn't always draw the same
   decoys. We fill up to OPTION_COUNT-1 distractors, deduped against the answer. */
function makeQuestion(word, prompt, sub, correct, optionText) {
  const ranked = WORDS
    .filter((w) => w !== word)
    .map((w) => ({ w, s: similarity(word, w) + Math.random() }))
    .sort((x, y) => y.s - x.s);

  const distractors = [];
  const seen = new Set([correct]);
  for (const { w } of ranked) {
    const t = optionText(w);
    if (t && !seen.has(t)) {
      seen.add(t);
      distractors.push(t);
    }
    if (distractors.length === OPTION_COUNT - 1) break;
  }
  const options = shuffle([correct, ...distractors]);
  return { prompt, sub, correct, options };
}

/* ---------- quiz construction ---------- */
/*
   Every word is tested on MEANING, and every kanji word on its READING — but
   each in a randomly chosen direction, so the harder "produce the Japanese"
   side comes up alongside plain recognition:
     • MEANING  — JP → English, or (harder) English → pick the Japanese.
     • READING  — kanji → kana, or (harder) kana → pick the matching kanji.
   All distractors are drawn from the current lesson only.
*/
const coin = () => Math.random() < 0.5;

function buildQuiz() {
  const questions = [];

  WORDS.forEach((word) => {
    // MEANING — flip between recognising the meaning and producing the Japanese.
    // With kanji excluded, show the kana reading rather than the kanji face so
    // no kanji surfaces anywhere in the quiz.
    const face = (w) => (noKanji ? w.kana : jpFace(w));
    if (coin()) {
      questions.push(
        makeQuestion(word, face(word), "What does this mean?", word.en, (w) => w.en)
      );
    } else {
      questions.push(
        makeQuestion(word, word.en, "Which is this in Japanese?", face(word), (w) => face(w))
      );
    }

    // READING — only for kanji words; flip between reading and recognising it.
    // Skipped entirely when the learner opts out of kanji tests.
    if (!noKanji && hasKanji(word)) {
      if (coin()) {
        questions.push(
          makeQuestion(word, word.kanji, "How is this read?", word.kana, (w) => w.kana)
        );
      } else {
        questions.push(
          makeQuestion(word, word.kana, "Which kanji is this?", word.kanji, (w) => w.kanji)
        );
      }
    }
  });

  return shuffle(questions);
}

/* ---------- state ---------- */
let quiz = [];
let current = 0;
let score = 0;
// The option the learner has currently picked (text), or null for "no pick".
// Grading is deferred until they confirm, so this can change freely beforehand.
let selected = null;
// Questions the learner got wrong or tapped "I don't know" on, kept for the
// end-of-quiz review. Each: { prompt, sub, correct, chosen, type }.
let missed = [];
let timed = false;         // timed mode chosen on the start screen
let noKanji = false;       // exclude kanji reading tests, chosen on the start screen
let timerId = null;        // active per-question countdown interval

/* ---------- DOM ---------- */
const el = (id) => document.getElementById(id);

/* ---------- per-question timer ---------- */
function stopTimer() {
  if (timerId !== null) { clearInterval(timerId); timerId = null; }
}

function renderTimer(left) {
  const t = el("timer-text");
  t.textContent = `⏱ ${left}s`;
  t.classList.toggle("warn", left <= 3);
}

// Start a fresh countdown for the current question; on zero, auto-skip.
function startTimer() {
  stopTimer();
  if (!timed) { el("timer-text").textContent = ""; return; }
  let left = QUESTION_SECONDS;
  renderTimer(left);
  timerId = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      stopTimer();
      renderTimer(0);
      dontKnow(); // out of time → counts as "I don't know"
    } else {
      renderTimer(left);
    }
  }, 1000);
}

function start() {
  // Load the lesson the learner picked.
  const key = el("lesson-select").value;
  timed = el("timer-toggle").checked;
  noKanji = el("no-kanji-toggle").checked;

  const lesson = LESSONS[key];
  WORDS = lesson.words;
  lessonLabel = `Lesson ${key}`;
  el("lesson-title").textContent =
    `${lesson.jp} — ${lesson.grammar} (${lesson.en})`;
  document.title = `Lesson ${key} Vocabulary Quiz`;

  quiz = buildQuiz();
  current = 0;
  score = 0;
  selected = null;
  missed = [];
  el("start-screen").classList.add("hidden");
  el("result-screen").classList.add("hidden");
  el("review-screen").classList.add("hidden");
  el("quiz-screen").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  selected = null;
  el("confirm-btn").disabled = true; // nothing picked yet
  const q = quiz[current];

  el("progress-text").textContent = `Question ${current + 1} of ${quiz.length}`;
  el("progress-bar").style.width = `${(current / quiz.length) * 100}%`;

  el("prompt").textContent = q.prompt;
  el("sub-prompt").textContent = q.sub || "";
  el("confirm-btn").textContent =
    current === quiz.length - 1 ? "Confirm & See results" : "Confirm & Next →";

  const optionsBox = el("options");
  optionsBox.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => select(btn, opt);
    optionsBox.appendChild(btn);
  });

  startTimer();
}

// Pick (or re-pick) an option. Purely visual — nothing is graded until confirm.
function select(btn, opt) {
  selected = opt;
  Array.from(el("options").children).forEach((b) =>
    b.classList.toggle("selected", b === btn)
  );
  el("confirm-btn").disabled = false;
}

// Grade the current question silently and move on. No right/wrong is shown.
// `forceSkip` (from "I don't know") records a skip regardless of selection.
function settle(forceSkip) {
  stopTimer();
  const q = quiz[current];
  const pick = forceSkip ? null : selected;

  if (pick === null) {
    // Nothing chosen (or skipped on purpose) — counts as "didn't know".
    missed.push({ prompt: q.prompt, sub: q.sub, correct: q.correct, chosen: null, type: "skipped" });
  } else if (pick === q.correct) {
    score++;
  } else {
    missed.push({ prompt: q.prompt, sub: q.sub, correct: q.correct, chosen: pick, type: "wrong" });
  }

  current++;
  if (current < quiz.length) renderQuestion();
  else showResults();
}

// Confirm advances only when an option is actually selected; otherwise it's a
// no-op so a stray double-click can't skip a question. Use "I don't know" to
// deliberately skip.
function confirmAndNext() {
  if (selected === null) {
    el("confirm-hint").textContent = "Select an answer first — or tap “I don't know”.";
    return;
  }
  settle(false);
}
function dontKnow() { settle(true); }

function showResults() {
  stopTimer();
  el("quiz-screen").classList.add("hidden");
  el("result-screen").classList.remove("hidden");

  const total = quiz.length;
  const pct = Math.round((score / total) * 100);

  el("final-score").textContent = `${score} / ${total}`;
  el("final-pct").textContent = `${pct}%`;

  let grade, msg;
  if (pct === 100) { grade = "Perfect! 🏆"; msg = `You mastered ${lessonLabel}!`; }
  else if (pct >= 80) { grade = "Great work! 🎉"; msg = "Almost there — review a few and you're set."; }
  else if (pct >= 60) { grade = "Good effort 👍"; msg = "Solid base. Keep reviewing the tricky ones."; }
  else if (pct >= 40) { grade = "Keep going 💪"; msg = `Go back over ${lessonLabel} and try again.`; }
  else { grade = "Keep studying 📚"; msg = "Review the vocabulary list and retake the quiz."; }

  el("grade").textContent = grade;
  el("grade-msg").textContent = msg;

  const ring = el("score-ring");
  if (ring) {
    ring.style.background =
      `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--track) 0deg)`;
  }

  // Offer a review only when there's something to review.
  const reviewBtn = el("review-btn");
  if (missed.length) {
    reviewBtn.textContent = `Review ${missed.length} missed →`;
    reviewBtn.classList.remove("hidden");
  } else {
    reviewBtn.classList.add("hidden");
  }
}

// Escape user-facing text before injecting as HTML (data is trusted, but the
// review list builds markup, so stay safe).
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showReview() {
  el("result-screen").classList.add("hidden");
  el("review-screen").classList.remove("hidden");

  const wrong = missed.filter((m) => m.type === "wrong").length;
  const skipped = missed.filter((m) => m.type === "skipped").length;
  const parts = [];
  if (wrong) parts.push(`${wrong} wrong`);
  if (skipped) parts.push(`${skipped} skipped`);
  el("review-intro").textContent =
    `The ${missed.length} you missed (${parts.join(", ")}). Study these, then try again.`;

  el("review-list").innerHTML = missed
    .map((m) => {
      const yours =
        m.type === "wrong"
          ? `<div class="review-ans your-ans">✗ You chose: ${esc(m.chosen)}</div>`
          : `<div class="review-ans skip-ans">You didn't know this one</div>`;
      return (
        `<div class="review-item ${m.type}">` +
        `<div class="review-prompt">${esc(m.prompt)}</div>` +
        `<div class="review-sub">${esc(m.sub)}</div>` +
        `<div class="review-ans correct-ans">✓ ${esc(m.correct)}</div>` +
        yours +
        `</div>`
      );
    })
    .join("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToResults() {
  el("review-screen").classList.add("hidden");
  el("result-screen").classList.remove("hidden");
}

// Sorts lesson keys numerically (so 2 comes before 10).
function lessonKeys() {
  return Object.keys(LESSONS).sort((a, b) => Number(a) - Number(b));
}

// Reflect the selected lesson in the word-count hint and the browser tab title.
function updateWordCount() {
  const key = el("lesson-select").value;
  const lesson = LESSONS[key];
  el("total-words").textContent = lesson ? lesson.words.length : 0;
  if (lesson) document.title = `Lesson ${key} Vocabulary Quiz`;
}

document.addEventListener("DOMContentLoaded", () => {
  const select = el("lesson-select");
  lessonKeys().forEach((key) => {
    const lesson = LESSONS[key];
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `Lesson ${key} — ${lesson.grammar}`;
    select.appendChild(opt);
  });

  // Honour a lesson passed in from the flashcards page (?lesson=N).
  const requested = new URLSearchParams(window.location.search).get("lesson");
  if (requested && LESSONS[requested]) select.value = requested;

  select.onchange = updateWordCount;
  updateWordCount();

  el("start-btn").onclick = start;
  el("confirm-btn").onclick = confirmAndNext;
  el("retry-btn").onclick = start;
  el("dont-know-btn").onclick = dontKnow;
  el("review-btn").onclick = showReview;
  el("review-back-btn").onclick = backToResults;
  el("review-retry-btn").onclick = start;

  // Enter behaves like "Confirm & Next" while a question is on screen.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (el("quiz-screen").classList.contains("hidden")) return;
    e.preventDefault();
    confirmAndNext();
  });
});
