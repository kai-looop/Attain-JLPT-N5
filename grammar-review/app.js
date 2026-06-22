/* ============================================================
   Grammar Review — engine
   Depends on: review-1.js (provides window.REVIEW)

   Two question types:
     • mcq   — pick one of options[]; graded against `answer`.
     • short — type a word/phrase; graded against `accept[]` after
               normalising (whitespace stripped, ASCII lower-cased,
               trailing です / 。 / 、 ignored), so kana or kanji and
               an optional です both count.
   At the end: a score ring + grade, and a review listing every
   question you missed with the correct answer and a short why.
   ============================================================ */

/* ---------- helpers ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Forgiving comparison key for short answers: drop all whitespace, lower-case
// ASCII, and shave a trailing です / 。 / 、 so the learner needn't add です.
function normalise(s) {
  return String(s == null ? "" : s)
    .replace(/[\s　]+/g, "")
    .replace(/[。、，,.]+$/u, "")
    .replace(/です$/u, "")
    .toLowerCase();
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const el = (id) => document.getElementById(id);

/* ---------- state ---------- */
let quiz = [];          // the questions for this run (optionally shuffled)
let current = 0;
let score = 0;
let selected = null;    // current MCQ pick (text) — not graded until confirm
// Each miss: { q, chosen, type: 'wrong' | 'skipped' }
let missed = [];

/* ---------- run setup ---------- */
function start() {
  const order = el("shuffle-toggle").checked
    ? shuffle(REVIEW.questions)
    : REVIEW.questions.slice();
  // For MCQ, shuffle the options each run so position isn't a tell.
  quiz = order.map((q) =>
    q.type === "mcq" ? { ...q, options: shuffle(q.options) } : { ...q }
  );

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
  const q = quiz[current];

  el("progress-text").textContent = `Question ${current + 1} of ${quiz.length}`;
  el("progress-bar").style.width = `${(current / quiz.length) * 100}%`;
  el("topic").textContent = q.topic || "";

  el("prompt").textContent = q.prompt;
  el("sub-prompt").textContent = q.sub || "";

  const last = current === quiz.length - 1;
  el("confirm-btn").textContent = last
    ? "Confirm & See results"
    : "Confirm & Next →";

  const optionsBox = el("options");
  const shortBox = el("short-box");
  optionsBox.innerHTML = "";

  if (q.type === "mcq") {
    shortBox.classList.add("hidden");
    optionsBox.classList.remove("hidden");
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = opt;
      btn.onclick = () => selectOption(btn, opt);
      optionsBox.appendChild(btn);
    });
    el("confirm-hint").textContent =
      "Select an answer, then confirm — or press Enter.";
  } else {
    optionsBox.classList.add("hidden");
    shortBox.classList.remove("hidden");
    const input = el("short-input");
    input.value = "";
    input.placeholder = "Type your answer…";
    el("confirm-hint").textContent =
      "Type your answer (kana or kanji) and press Enter.";
    // focus after the screen paints
    setTimeout(() => input.focus(), 0);
  }
}

// MCQ pick (re-pickable; purely visual until confirm).
function selectOption(btn, opt) {
  selected = opt;
  Array.from(el("options").children).forEach((b) =>
    b.classList.toggle("selected", b === btn)
  );
}

// Is this short answer acceptable?
function shortCorrect(q, raw) {
  const got = normalise(raw);
  if (!got) return false;
  return (q.accept || []).some((a) => normalise(a) === got);
}

// Grade current question and advance. forceSkip → record as "I don't know".
function settle(forceSkip) {
  const q = quiz[current];
  let ok = false;
  let chosen = null;

  if (!forceSkip) {
    if (q.type === "mcq") {
      chosen = selected;
      ok = chosen != null && chosen === q.answer;
    } else {
      chosen = el("short-input").value.trim();
      if (chosen === "") {
        // empty input → treat as skip
        chosen = null;
      } else {
        ok = shortCorrect(q, chosen);
      }
    }
  }

  if (ok) {
    score++;
  } else {
    missed.push({ q, chosen, type: chosen == null ? "skipped" : "wrong" });
  }

  current++;
  if (current < quiz.length) renderQuestion();
  else showResults();
}

// Confirm only advances when there's actually an answer. With nothing picked
// (MCQ) or an empty box (short), it's a no-op — so a stray double-click can't
// skip a question you knew. Use "I don't know" to deliberately skip.
function hasAnswer() {
  const q = quiz[current];
  if (q.type === "mcq") return selected != null;
  return el("short-input").value.trim() !== "";
}

function confirmAndNext() {
  if (!hasAnswer()) {
    el("confirm-hint").textContent =
      quiz[current].type === "mcq"
        ? "Pick an answer first — or tap “I don't know”."
        : "Type an answer first — or tap “I don't know”.";
    return;
  }
  settle(false);
}
function dontKnow() { settle(true); }

function showResults() {
  el("quiz-screen").classList.add("hidden");
  el("result-screen").classList.remove("hidden");

  const total = quiz.length;
  const pct = Math.round((score / total) * 100);

  el("final-score").textContent = `${score} / ${total}`;
  el("final-pct").textContent = `${pct}%`;

  let grade, msg;
  if (pct === 100) { grade = "Perfect! 🏆"; msg = "Week 1 grammar is rock solid."; }
  else if (pct >= 85) { grade = "Excellent! 🎉"; msg = "Just a couple to polish — see below."; }
  else if (pct >= 70) { grade = "Good work 👍"; msg = "Solid base; review the misses and retry."; }
  else if (pct >= 50) { grade = "Keep going 💪"; msg = "Re-study the flagged points, then try again."; }
  else { grade = "Keep studying 📚"; msg = "Go back over Week 1 grammar and retake this."; }

  el("grade").textContent = grade;
  el("grade-msg").textContent = msg;

  const ring = el("score-ring");
  if (ring) {
    ring.style.background =
      `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--track) 0deg)`;
  }

  const reviewBtn = el("review-btn");
  if (missed.length) {
    reviewBtn.textContent = `Review ${missed.length} you missed →`;
    reviewBtn.classList.remove("hidden");
  } else {
    reviewBtn.classList.add("hidden");
  }
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
      const q = m.q;
      const yours =
        m.type === "wrong"
          ? `<div class="review-ans your-ans">✗ You answered: ${esc(m.chosen)}</div>`
          : `<div class="review-ans skip-ans">You skipped this one</div>`;
      const why = q.explain
        ? `<div class="review-why">${esc(q.explain)}</div>`
        : "";
      const topic = q.topic ? `<span class="review-topic">${esc(q.topic)}</span>` : "";
      return (
        `<div class="review-item ${m.type}">` +
        topic +
        `<div class="review-prompt">${esc(q.prompt)}</div>` +
        (q.sub ? `<div class="review-sub">${esc(q.sub)}</div>` : "") +
        `<div class="review-ans correct-ans">✓ ${esc(q.answer)}</div>` +
        yours +
        why +
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

/* ---------- wire up ---------- */
document.addEventListener("DOMContentLoaded", () => {
  el("review-title").textContent = REVIEW.title;
  el("review-subtitle").textContent = REVIEW.subtitle;
  el("total-q").textContent = REVIEW.questions.length;
  document.title = `${REVIEW.title} — N5`;

  el("start-btn").onclick = start;
  el("confirm-btn").onclick = confirmAndNext;
  el("dont-know-btn").onclick = dontKnow;
  el("retry-btn").onclick = start;
  el("review-btn").onclick = showReview;
  el("review-back-btn").onclick = backToResults;
  el("review-retry-btn").onclick = start;

  // Enter = Confirm & Next while a question is showing.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (el("quiz-screen").classList.contains("hidden")) return;
    e.preventDefault();
    confirmAndNext();
  });
});
