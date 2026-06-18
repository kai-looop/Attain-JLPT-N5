/* ============================================================
   Study-plan view — depends on global PLAN from plan-data.js
   Pulls the current date, shows that day's plan, and lets the
   learner step to previous / next days or jump back to today.
   Vocab rows deep-link into the flashcards (../index.html?lesson=).
   ============================================================ */
const $ = id => document.getElementById(id);
const DAYS = PLAN.days;

/* ---- dates ------------------------------------------------- */
// Local yyyy-mm-dd for a Date (avoids UTC off-by-one from toISOString).
function isoLocal(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Parse an ISO date as a *local* date so comparisons stay in local time.
function parseISO(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
function prettyDate(iso){
  const d = parseISO(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Index of today's plan day. Exact match wins; otherwise the next
// upcoming study day; if the window is over, the last day.
function todayIndex(){
  const today = isoLocal(new Date());
  const exact = DAYS.findIndex(d => d.date === today);
  if(exact !== -1) return exact;
  const upcoming = DAYS.findIndex(d => d.date > today);
  if(upcoming !== -1) return upcoming;
  return DAYS.length - 1;
}

/* ---- state ------------------------------------------------- */
let idx = 0;
const TODAY_ISO = isoLocal(new Date());

/* ---- rendering --------------------------------------------- */
function listBlock(label, badge, items, jp){
  if(!items || !items.length) return "";
  const lis = items.map(t => `<li>${t}</li>`).join("");
  const b = badge ? `<span class="badge">${badge}</span>` : "";
  return `<section class="block"><div class="block-label">${label}${b}</div>` +
         `<ul class="lines">${lis}</ul></section>`;
}

function grammarBlock(items){
  if(!items || !items.length) return "";
  const pills = items.map(p => `<span class="pill">${p}</span>`).join("");
  return `<section class="block"><div class="block-label">Attain grammar` +
         `<span class="badge">課.point</span></div><div class="pills">${pills}</div></section>`;
}

function vocabBlock(items){
  const head = `<section class="block"><div class="block-label">Attain vocabulary` +
               `<span class="badge">flashcards</span></div>`;
  if(!items || !items.length){
    return head + `<div class="empty-note">No new vocabulary — review day.</div></section>`;
  }
  const rows = items.map(v => {
    if(!v.key) return `<div class="empty-note">${v.label}</div>`;
    return `<a class="vocab" href="../index.html?lesson=${encodeURIComponent(v.key)}">` +
           `<span>${v.label}</span>` +
           `<span class="go">Flashcards <span class="arrow">&rarr;</span></span></a>`;
  }).join("");
  return head + `<div class="vocab-links">${rows}</div></section>`;
}

function render(){
  const day = DAYS[idx];
  const isReview = day.type === "review";

  $("planSub").textContent = PLAN.subtitle;
  $("dayNo").textContent = `Day ${day.n} / ${DAYS.length}`;
  $("dayDate").textContent = prettyDate(day.date);
  $("todayWrap").innerHTML = (day.date === TODAY_ISO) ? `<span class="today-tag">Today</span>` : "";

  $("prevBtn").disabled = idx === 0;
  $("nextBtn").disabled = idx === DAYS.length - 1;

  const sheet = $("sheet");
  sheet.classList.toggle("is-review", isReview);
  sheet.innerHTML =
    `<div class="kind ${isReview ? "review" : ""}">${isReview ? "Review day" : "Study day"}</div>` +
    `<h2>${day.title}</h2>` +
    listBlock("Genki 1", null, day.genki) +
    grammarBlock(day.grammar) +
    vocabBlock(day.vocab) +
    (day.notes && day.notes.length
      ? `<div class="notes">${day.notes.map(n => `<span>${n}</span>`).join("")}</div>`
      : "");

  document.title = `N5 Study Plan — Day ${day.n} (${prettyDate(day.date)})`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---- navigation -------------------------------------------- */
function step(d){
  idx = Math.min(DAYS.length - 1, Math.max(0, idx + d));
  render();
}
function goToday(){ idx = todayIndex(); render(); }

/* ---- init -------------------------------------------------- */
function init(){
  idx = todayIndex();
  render();
  document.addEventListener("keydown", e => {
    if(e.key === "ArrowRight") step(1);
    else if(e.key === "ArrowLeft") step(-1);
    else if(e.key === "t" || e.key === "T") goToday();
  });
}

if (typeof window !== "undefined"){ window.step = step; window.goToday = goToday; }
if (typeof document !== "undefined"){ document.addEventListener("DOMContentLoaded", init); }
