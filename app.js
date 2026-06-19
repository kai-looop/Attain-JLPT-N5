/* ============================================================
   Flash-card engine — N5 Vocabulary
   Depends on globals LESSONS and KANJI from data.js
   ============================================================ */

/* ---------- kana → romaji ---------------------------------- */
/* Hepburn-style. Long vowels are written doubled (おう → ou,
   こうこう → koukou, ー → repeats the previous vowel). */
const KANA_MAP = {
  "あ":"a","い":"i","う":"u","え":"e","お":"o",
  "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
  "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
  "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
  "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
  "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
  "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
  "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
  "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
  "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
  "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
  "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
  "や":"ya","ゆ":"yu","よ":"yo",
  "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
  "わ":"wa","ゐ":"wi","ゑ":"we","を":"o","ん":"n",
  "ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o",
  "ゔ":"vu","っ":"" // handled specially
};
// digraphs (youon)
const YOUON = {
  "きゃ":"kya","きゅ":"kyu","きょ":"kyo",
  "ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
  "しゃ":"sha","しゅ":"shu","しょ":"sho","しぇ":"she",
  "じゃ":"ja","じゅ":"ju","じょ":"jo","じぇ":"je",
  "ちゃ":"cha","ちゅ":"chu","ちょ":"cho","ちぇ":"che",
  "にゃ":"nya","にゅ":"nyu","にょ":"nyo",
  "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
  "びゃ":"bya","びゅ":"byu","びょ":"byo",
  "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",
  "みゃ":"mya","みゅ":"myu","みょ":"myo",
  "りゃ":"rya","りゅ":"ryu","りょ":"ryo",
  // extended (mostly for foreign katakana)
  "てぃ":"ti","でぃ":"di","とぅ":"tu","どぅ":"du",
  "ふぁ":"fa","ふぃ":"fi","ふぇ":"fe","ふぉ":"fo","ふゅ":"fyu",
  "うぃ":"wi","うぇ":"we","うぉ":"wo",
  "ゔぁ":"va","ゔぃ":"vi","ゔぇ":"ve","ゔぉ":"vo"
};

// Convert one katakana char to its hiragana equivalent (for lookup).
function kataToHira(s){
  let out = "";
  for(const ch of s){
    const c = ch.codePointAt(0);
    if(c >= 0x30A1 && c <= 0x30F6) out += String.fromCodePoint(c - 0x60);
    else out += ch;
  }
  return out;
}

function toRomaji(input){
  // Normalise katakana → hiragana, but remember where the long mark ー was.
  const src = input.replace(/ー/g, ""); // placeholder for prolong mark
  const hira = kataToHira(src);
  const chars = [...hira];
  let out = "";
  let sokuon = false; // pending small っ (double next consonant)

  for(let i=0; i<chars.length; i++){
    const ch = chars[i];

    if(ch === ""){ // long-vowel mark: repeat last vowel
      const m = out.match(/[aeiou]$/);
      if(m) out += m[0];
      continue;
    }
    if(ch === "っ"){ sokuon = true; continue; }

    // try a two-character digraph first
    let roman = null;
    const pair = ch + (chars[i+1] || "");
    if(YOUON[pair]){ roman = YOUON[pair]; i++; }
    else if(KANA_MAP[ch] !== undefined){ roman = KANA_MAP[ch]; }
    else { roman = ch; } // pass through anything we don't know (digits, 〜, …)

    if(sokuon){
      sokuon = false;
      if(roman && /^[a-z]/.test(roman)){
        // standard Hepburn: っち → tch
        roman = (roman[0] === "c" ? "t" : roman[0]) + roman;
      }
    }
    out += roman;
  }

  // ん euphony: n → m before b / p / m
  out = out.replace(/n(?=[bpm])/g, "m");
  return out;
}

/* ---------- kanji breakdown -------------------------------- */
const isKanji = ch => {
  const c = ch.codePointAt(0);
  return (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF);
};
function breakdown(kanji){
  if(!kanji) return [];
  return [...kanji].filter(isKanji).map(ch => ({ char: ch, gloss: KANJI[ch] || "—" }));
}

/* ---------- state ------------------------------------------ */
const $ = id => document.getElementById(id);
let lessonKey = "1";
let WORDS = [];
let order = [];
let pos = 0, shuffled = false, reversed = false;
let seen = new Set();
const card = () => $("card");
const current = () => WORDS[order[pos]];

/* ---------- WaniKani links --------------------------------- */
const WK_BASE = "https://www.wanikani.com";
const wkVocabUrl = term => `${WK_BASE}/vocabulary/${encodeURIComponent(term)}`;
const wkKanjiUrl = ch => `${WK_BASE}/kanji/${encodeURIComponent(ch)}`;

/* ---------- rendering -------------------------------------- */
function renderBreakdown(w){
  const items = breakdown(w.kanji);
  const box = $("breakdown");
  if(!items.length){ box.innerHTML = ""; box.style.display = "none"; return; }
  box.style.display = "flex";
  // Each kanji links to its WaniKani page; stopPropagation keeps the click
  // from also flipping the card.
  box.innerHTML = items.map(it =>
    `<a class="kb" href="${wkKanjiUrl(it.char)}" target="_blank" rel="noopener"` +
    ` onclick="event.stopPropagation()" title="View 「${it.char}」 on WaniKani">` +
    `<span class="kb-char">${it.char}</span>` +
    `<span class="kb-gloss">${it.gloss}</span></a>`
  ).join("");
}

function renderWaniKani(w){
  const link = $("wkVocab");
  if(!link) return;
  // WaniKani indexes vocabulary by its written form (kanji when present).
  const term = w.kanji || w.kana;
  link.href = wkVocabUrl(term);
  link.title = `View 「${term}」 on WaniKani`;
}

/* Shrink the big word until it fits on one line within the card face.
   Starts from the CSS (clamp) size and steps down to a sensible minimum. */
function fitText(el){
  if(!el) return;
  el.style.whiteSpace = "nowrap";
  el.style.fontSize = "";                 // reset to the CSS-defined size
  const face = el.closest(".face");
  const avail = (face ? face.clientWidth : el.clientWidth) - 56; // face padding + margin
  let size = parseFloat(getComputedStyle(el).fontSize) || 48;
  el.style.fontSize = size + "px";
  while(el.scrollWidth > avail && size > 20){
    size -= 1;
    el.style.fontSize = size + "px";
  }
}

function fitBigText(){ fitText($("fBig")); fitText($("bBig")); }

function render(){
  card().classList.remove("flipped");
  const w = current();
  const romaji = toRomaji(w.kana);
  const num = String(pos+1).padStart(2,"0");
  $("idx").textContent = num; $("idx2").textContent = num;

  if(!reversed){
    // FRONT: Japanese  |  BACK: English
    $("frontTag").textContent = "日本語";
    $("backTag").textContent = "English";
    $("fBig").className = "big jp";
    $("fBig").textContent = w.kana;
    if(w.kanji){ $("fSub").textContent = w.kanji; $("fSub").className = "sub2"; }
    else { $("fSub").textContent = "kana only"; $("fSub").className = "sub2 empty"; }
    $("bRomaji").textContent = romaji;
    $("bBig").className = "big";
    $("bBig").textContent = w.en;
  } else {
    // FRONT: English  |  BACK: Japanese
    $("frontTag").textContent = "English";
    $("backTag").textContent = "日本語";
    $("fBig").className = "big";
    $("fBig").textContent = w.en;
    $("fSub").textContent = w.pos;
    $("fSub").className = "sub2 empty";
    $("bRomaji").textContent = romaji;
    $("bBig").className = "big jp";
    $("bBig").textContent = w.kanji ? `${w.kana}　${w.kanji}` : w.kana;
  }
  $("bPos").textContent = w.pos;
  renderBreakdown(w);
  renderWaniKani(w);

  fitBigText();

  seen.add(order[pos]);
  $("count").textContent = `${num} / ${WORDS.length}`;
  $("seen").textContent = `${seen.size} seen`;
  // Loader tracks the CURRENT position, so it moves both when advancing and
  // when going back, and visibly jumps when navigation loops past either end.
  $("fill").style.width = ((pos + 1) / WORDS.length * 100) + "%";
}

function flip(){ card().classList.toggle("flipped"); }
function go(d){ pos = (pos + d + WORDS.length) % WORDS.length; render(); }

function setDir(rev){
  reversed = rev;
  $("m-jp").classList.toggle("on", !rev);
  $("m-en").classList.toggle("on", rev);
  pos = 0; render();
}

function toggleShuffle(){
  shuffled = !shuffled;
  $("shuffleBtn").classList.toggle("on", shuffled);
  if(shuffled){
    for(let i=order.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [order[i],order[j]] = [order[j],order[i]];
    }
  } else order = WORDS.map((_,i)=>i);
  pos = 0; render();
}

function reset(){
  order = WORDS.map((_,i)=>i);
  shuffled = false; reversed = false;
  $("shuffleBtn").classList.remove("on");
  $("m-jp").classList.add("on");
  $("m-en").classList.remove("on");
  seen.clear(); pos = 0; render();
}

/* Jump to the quiz for the lesson currently being studied.
   Read the key straight off the selector so it always reflects the
   on-screen lesson, and use an explicit index.html path so the query
   string survives on every host (including file://). */
function goToQuiz(){
  const key = $("lessonSelect").value || lessonKey;
  window.location.href = `quiz/index.html?lesson=${encodeURIComponent(key)}`;
}

/* ---------- lesson switching ------------------------------- */
function loadLesson(key){
  lessonKey = key;
  const lesson = LESSONS[key];
  WORDS = lesson.words;
  order = WORDS.map((_,i)=>i);
  shuffled = false; reversed = false;
  $("shuffleBtn").classList.remove("on");
  $("m-jp").classList.add("on");
  $("m-en").classList.remove("on");
  seen = new Set();
  pos = 0;

  $("lessonNo").textContent = `Lesson ${key}`;
  $("lessonSub").textContent = `${lesson.jp} — ${lesson.grammar} · “${lesson.en}”`;
  $("wordCount").textContent = `${WORDS.length} words`;
  document.title = `N5 Lesson ${key} — Flash Cards`;
  render();
}

/* ---------- init ------------------------------------------- */
function init(){
  const sel = $("lessonSelect");
  sel.innerHTML = Object.keys(LESSONS)
    .map(k => `<option value="${k}">Lesson ${k} — ${LESSONS[k].en}</option>`)
    .join("");
  sel.addEventListener("change", e => loadLesson(e.target.value));

  document.addEventListener("keydown", e=>{
    if(e.key === "ArrowRight") go(1);
    else if(e.key === "ArrowLeft") go(-1);
    else if(e.key === " "){ e.preventDefault(); flip(); }
  });

  // Re-fit when the card width changes or the web font finishes loading
  // (measuring before Noto Sans JP loads would size against a fallback font).
  window.addEventListener("resize", fitBigText);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitBigText); }

  // Honour a lesson passed in from the study plan (?lesson=N); fall back to 1.
  const requested = new URLSearchParams(window.location.search).get("lesson");
  const start = (requested && LESSONS[requested]) ? requested : "1";
  sel.value = start;
  loadLesson(start);
}

// expose handlers used by inline onclick
if (typeof window !== "undefined"){
  window.flip = flip;
  window.go = go;
  window.setDir = setDir;
  window.toggleShuffle = toggleShuffle;
  window.reset = reset;
  window.goToQuiz = goToQuiz;
}

if (typeof document !== "undefined"){
  document.addEventListener("DOMContentLoaded", init);
}
if (typeof module !== "undefined" && module.exports){
  module.exports = { toRomaji, breakdown };
}
