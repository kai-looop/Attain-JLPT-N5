/* ============================================================
   N5 Vocabulary Quiz — logic
   Depends on: ../Vocabs/data.js  (provides LESSONS)
   The learner picks a lesson on the start screen; WORDS is the
   word list of whichever lesson is currently selected.
   ============================================================ */

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

/* Build a single multiple-choice question.
   - prompt/sub: what the learner reads
   - correct:    the right answer text
   - optionText: how to render an option from a word (also used for distractors)
   Three distractors are drawn from other words, deduped against the answer. */
function makeQuestion(word, prompt, sub, correct, optionText) {
  const distractors = [];
  const seen = new Set([correct]);
  for (const w of shuffle(WORDS)) {
    if (w === word) continue;
    const t = optionText(w);
    if (t && !seen.has(t)) {
      seen.add(t);
      distractors.push(t);
    }
    if (distractors.length === 3) break;
  }
  const options = shuffle([correct, ...distractors]);
  return { prompt, sub, correct, options };
}

/* ---------- quiz construction ---------- */
/*
   Full coverage of the selected lesson:
     • MEANING  — every word: show the word (kanji if available), pick the English meaning.
     • READING  — every word that HAS kanji: show the kanji, pick its kana reading.
   So all kanji and all meanings are tested. Questions are shuffled.
*/
function buildQuiz() {
  const questions = [];

  WORDS.forEach((word) => {
    // Meaning question — shows kanji when available so the kanji is seen.
    // The kana reading is intentionally NOT shown here, so the learner must
    // actually recognise the kanji rather than read it off the hint.
    questions.push(
      makeQuestion(
        word,
        jpFace(word),
        "What does this mean?",
        word.en,
        (w) => w.en
      )
    );

    // Reading question — only for words that have kanji.
    if (hasKanji(word)) {
      questions.push(
        makeQuestion(
          word,
          word.kanji,
          "How is this read?",
          word.kana,
          (w) => w.kana
        )
      );
    }
  });

  return shuffle(questions);
}

/* ---------- state ---------- */
let quiz = [];
let current = 0;
let score = 0;
let answered = false;

/* ---------- DOM ---------- */
const el = (id) => document.getElementById(id);

function start() {
  // Load the lesson the learner picked.
  const key = el("lesson-select").value;
  const lesson = LESSONS[key];
  WORDS = lesson.words;
  lessonLabel = `Lesson ${key}`;
  el("lesson-title").textContent =
    `${lesson.jp} — ${lesson.grammar} (${lesson.en})`;
  document.title = `Lesson ${key} Vocabulary Quiz`;

  quiz = buildQuiz();
  current = 0;
  score = 0;
  answered = false;
  el("start-screen").classList.add("hidden");
  el("result-screen").classList.add("hidden");
  el("quiz-screen").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const q = quiz[current];

  el("progress-text").textContent = `Question ${current + 1} of ${quiz.length}`;
  el("score-text").textContent = `Score: ${score}`;
  el("progress-bar").style.width = `${(current / quiz.length) * 100}%`;

  el("prompt").textContent = q.prompt;
  el("sub-prompt").textContent = q.sub || "";
  el("feedback").textContent = "";
  el("feedback").className = "feedback";
  el("next-btn").classList.add("hidden");

  const optionsBox = el("options");
  optionsBox.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => choose(btn, opt, q);
    optionsBox.appendChild(btn);
  });
}

function choose(btn, opt, q) {
  if (answered) return;
  answered = true;

  const buttons = Array.from(el("options").children);
  buttons.forEach((b) => {
    b.disabled = true;
    if (b.textContent === q.correct) b.classList.add("correct");
  });

  const fb = el("feedback");
  if (opt === q.correct) {
    score++;
    btn.classList.add("correct");
    fb.textContent = "✓ Correct!";
    fb.className = "feedback good";
  } else {
    btn.classList.add("wrong");
    fb.textContent = `✗ Correct answer: ${q.correct}`;
    fb.className = "feedback bad";
  }

  el("score-text").textContent = `Score: ${score}`;
  el("next-btn").classList.remove("hidden");
  el("next-btn").textContent =
    current === quiz.length - 1 ? "See results" : "Next →";
}

function next() {
  if (!answered) return;
  current++;
  if (current < quiz.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
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

  select.onchange = updateWordCount;
  updateWordCount();

  el("start-btn").onclick = start;
  el("next-btn").onclick = next;
  el("retry-btn").onclick = start;
});
