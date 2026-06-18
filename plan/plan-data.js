/* ============================================================
   N5 Study Plan — Genki 1 order
   Window: Tue 16 Jun → Wed 15 Jul 2026 · weekdays only · 22 days

   Each day:
     n       day number (1–22)
     date    ISO yyyy-mm-dd
     type    "review" | "study"
     title   short headline
     genki   Genki 1 workbook sections for the day
     grammar Attain N5 grammar points (課.point)
     vocab   { label, key } — key links to the flashcards (?lesson=key);
             key:null means "no single flashcard lesson" (intro/spillover)
     notes   optional caveats (points with no clean home, etc.)
   ============================================================ */
const PLAN = {
  window:  { start: "2026-06-16", end: "2026-07-15" },
  title:   "N5 Study Plan",
  subtitle:"Genki 1 order · weekdays only · 22 study days",
  days: [
    {
      n:1, date:"2026-06-16", type:"review",
      title:"Review Genki L1–3 (already covered)",
      genki:[
        "Consolidation pass over L1 (です / questions / の)",
        "L2 (これ・それ・あれ, も, じゃない)",
        "L3 (verbs, を, places, 〜ませんか)",
      ],
      grammar:["L1.1–1.7","L2.1–2.3","L3.1–3.2","L5.1–5.7","L6.5","L7.1"],
      vocab:[
        {label:"L1 — people / countries / jobs", key:"1"},
        {label:"L2 — demonstratives / family", key:"2"},
        {label:"L5 — core verbs", key:"5"},
      ],
      notes:["Aim: confirm L1–3 are solid before building on them — flag anything shaky."],
    },
    {
      n:2, date:"2026-06-17", type:"study",
      title:"Genki L4.1–4.2 — existence & location",
      genki:[
        "§1 X があります / います",
        "§2 Describing where things are",
      ],
      grammar:["L3.3 …は地点です","L3.4 あります / います","L3.5 地点に…があります","L3.6 …は地点にあります"],
      vocab:[
        {label:"L3 — objects & positions (机・椅子・上・下・隣…)", key:"3"},
      ],
    },
    {
      n:3, date:"2026-06-18", type:"study",
      title:"Genki L4.3–4.7 — past tense & particles",
      genki:[
        "§3 Past tense (nouns)",
        "§4 Verb conjugation (past)",
        "§5 Past tense (verbs)",
        "§6 も",
        "§7 〜時間 · particles",
      ],
      grammar:["L1.4 / L1.5 past of です","verb past ました (on L5.4)","L1.6 も","L4.3 durations","L4.4 …から…まで"],
      vocab:[
        {label:"L4 — time series (年・月・週・日), から…まで", key:"4"},
      ],
    },
    {
      n:4, date:"2026-06-19", type:"study",
      title:"Genki L5.1–5.5 — い-adjectives",
      genki:[
        "§1 Adjective conjugation (present)",
        "§2 Adjectives (present)",
        "§3 Conjugation (present & past)",
        "§4 Adjectives (past)",
        "§5 Adjective + noun",
      ],
      grammar:["L8.1 adj types","L8.2 い-adj forms","L8.3 い-adj predicate","L8.4 い-adj + noun","L8.5 …はどうですか","L8.8 …が、…"],
      vocab:[
        {label:"L8 — い-adjectives (忙しい・楽しい・大きい・安い…)", key:"8"},
      ],
    },
    {
      n:5, date:"2026-06-22", type:"review",
      title:"Genki L5.6–5.7 + review L4–5",
      genki:[
        "§6 好き(な) / きらい(な)",
        "§7 〜ましょう / 〜ましょうか",
      ],
      grammar:["L10.2 好き / 嫌い / 上手 / 下手","L7.2 ましょう","L7.3 ましょうか"],
      vocab:[
        {label:"L10 — 好き・嫌い・上手・下手・分かる", key:"10"},
        {label:"L9 — intro な-adjectives", key:"9"},
      ],
      notes:["Review: Attain L4–L5 grammar + vocab."],
    },
    {
      n:6, date:"2026-06-23", type:"study",
      title:"Genki L6.1–6.2 — te-form (full rules)",
      genki:[
        "§1 Te-form 1",
        "§2 Te-form 2 — full conjugation rules, own day",
      ],
      grammar:["L6.2 て形 (complete conjugation)"],
      vocab:[
        {label:"L6 — transport & motion verbs (乗る・降りる・曲がる…)", key:"6"},
      ],
    },
    {
      n:7, date:"2026-06-24", type:"study",
      title:"Genki L6.3–6.7 — te-form uses",
      genki:[
        "§3 〜てください",
        "§4 Describing two activities",
        "§5 〜てもいいです",
        "§6 〜てはいけません",
        "§7 〜から · 〜ましょうか",
      ],
      grammar:["L14.1 てください","L7.7 動詞て、動詞て (sequential)","L7.4 てもいいです","L7.5 てはいけません","L9.7 …から (because)"],
      vocab:[
        {label:"L7 — activity verbs (働く・勉強・待つ・住む・寝る…)", key:"7"},
      ],
    },
    {
      n:8, date:"2026-06-25", type:"study",
      title:"Genki L7.1–7.3 — 〜ている",
      genki:[
        "§1 Te-form (review)",
        "§2 〜ている (actions in progress)",
        "§3 〜ている (result of a change)",
      ],
      grammar:["L11.3 て形います (ongoing)","L7.6 て形います (state / result)"],
      vocab:[
        {label:"L11 — action verbs (洗う・撮る・作る・送る・終わる…)", key:"11"},
      ],
    },
    {
      n:9, date:"2026-06-26", type:"study",
      title:"Genki L7.4–7.7 — te-forms, に行く, counting",
      genki:[
        "§4 Describing people",
        "§5 Adjective / noun te-forms",
        "§6 Verb stem + に行く / 来る / 帰る",
        "§7 Counting people",
      ],
      grammar:["L8.6 い-adj て (くて)","L9.5 な-adj て (で)","L10.1 …に行きます / 来ます / 帰ります","L2.6 counting people","L9.4 名 counter"],
      vocab:[
        {label:"L9 — な-adjectives & counters (有名・静か・ひとつ・名…)", key:"9"},
      ],
    },
    {
      n:10, date:"2026-06-29", type:"review",
      title:"Review L6–7 (te-form block)",
      genki:[
        "Consolidate te-form, ている (progress vs result), adj/noun te-forms, に行く/来る/帰る — the heaviest stretch so far.",
      ],
      grammar:["L6.2","L7.6","L11.3","L8.6","L9.5","L10.1"],
      vocab:[
        {label:"L6 — transport & motion verbs", key:"6"},
        {label:"L7 — activity verbs", key:"7"},
        {label:"L11 — action verbs", key:"11"},
      ],
    },
    {
      n:11, date:"2026-06-30", type:"study",
      title:"Genki L8.1–8.2 — short forms",
      genki:[
        "§1 Short forms (present)",
        "§2 Short forms (informal speech)",
      ],
      grammar:["L12.2 ていねい形とふつう形 (polite vs plain)","L12.1 人の呼び方"],
      vocab:[
        {label:"L12 — family / casual address (姉・妹・弟・〜ちゃん…)", key:"12"},
      ],
    },
    {
      n:12, date:"2026-07-01", type:"study",
      title:"Genki L8.3–8.7 — 〜と思う / と言う / ないで",
      genki:[
        "§3 〜と思います",
        "§4 〜と言っていました",
        "§5 〜ないでください",
        "§6 Verb のが好きです / 上手です",
        "§7 が・何か / 何も",
      ],
      grammar:["L13.7 …と思います","L13.8 …と言います","L14.2 ないでください","L10.2 …のが好き / 上手","L11.5 どこか→何か","L11.6 どこも→何も"],
      vocab:[
        {label:"L13 — 思う・言う", key:"13"},
        {label:"L12 — continue", key:"12"},
      ],
    },
    {
      n:13, date:"2026-07-02", type:"study",
      title:"Genki L9.1–9.5 — past short forms & noun-modifying",
      genki:[
        "§1 Past tense short forms",
        "§2 Past short forms (informal)",
        "§3 〜と思います",
        "§4 〜と言っていました",
        "§5 Qualifying nouns with verbs",
      ],
      grammar:["L12.2 plain form (past)","L13.7 / L13.8 quotations (revisit)","L14.4 動詞普通形 + 名詞 (noun-modifying clause)"],
      vocab:[
        {label:"L12 — weather & seasons (雨・雪・春・夏・調べる…)", key:"12"},
      ],
    },
    {
      n:14, date:"2026-07-03", type:"review",
      title:"Genki L9.6–9.7 + review L8–9",
      genki:[
        "§6 もう〜ました / まだ〜ていません",
        "§7 〜から",
      ],
      grammar:["L11.1 もう…ました","L9.7 …から (reason)"],
      vocab:[],
      notes:["Review: Attain L8–L9 — short / plain forms, quotations."],
    },
    {
      n:15, date:"2026-07-06", type:"study",
      title:"Genki L10.1–10.3 — comparison",
      genki:[
        "§1 Comparison (two items)",
        "§2 Comparison (three+)",
        "§3 Adjective / noun + の",
      ],
      grammar:["L13.3 …は…より…","L13.4 どちらが / …のほうが / どちらも","L13.5 …でいちばん…","L13.6 形容詞 + の"],
      vocab:[
        {label:"L13 — places / countries (沖縄・北海道…), より・いちばん", key:"13"},
      ],
    },
    {
      n:16, date:"2026-07-07", type:"study",
      title:"Genki L10.4–10.6 — つもり / なる / どこか",
      genki:[
        "§4 〜つもりだ",
        "§5 Adjective + なる",
        "§6 どこかに / どこにも · 〜で行きます",
      ],
      grammar:["L11.4 …くなります / …になります (なる)","L11.5 / L11.6 どこか / どこも"],
      vocab:[
        {label:"L13 — continue", key:"13"},
        {label:"L14 — verbs", key:"14"},
      ],
      notes:["〜つもりだ has no Attain N5 point — learn from Genki directly."],
    },
    {
      n:17, date:"2026-07-08", type:"study",
      title:"Genki L11.1–11.2 — 〜たい / 〜たり〜たり",
      genki:[
        "§1 〜たい",
        "§2 〜たり〜たりする",
      ],
      grammar:["L13.1 …がほしい","L13.2 動詞たい","L15.1 …たり…たりします"],
      vocab:[
        {label:"L13 — clothing & wearing verbs (靴・帽子・履く・着る・脱ぐ)", key:"13"},
      ],
    },
    {
      n:18, date:"2026-07-09", type:"review",
      title:"Genki L11.3–11.4 + review L10–11",
      genki:[
        "§3 〜ことがある",
        "§4 Noun A や Noun B",
      ],
      grammar:["L12.5 動詞た形ことがあります (experience)","Noun や Noun (や particle)"],
      vocab:[
        {label:"L15 — start", key:"15"},
      ],
      notes:["Review: Attain comparison & desire grammar from L10–11."],
    },
    {
      n:19, date:"2026-07-10", type:"study",
      title:"Genki L12.1–12.3 — んです / すぎる / ほうがいい",
      genki:[
        "§1 〜んです",
        "§2 〜すぎる",
        "§3 〜ほうがいいです",
      ],
      grammar:[],
      vocab:[
        {label:"L15 — body & illness (頭・足・目・風邪・薬…)", key:"15"},
      ],
      notes:["〜んです / 〜すぎる / 〜ほうがいい are not explicit Attain N5 points (N4-leaning) — learn from Genki."],
    },
    {
      n:20, date:"2026-07-13", type:"study",
      title:"Genki L12.4–12.6 — ので / なければ / でしょう",
      genki:[
        "§4 〜ので",
        "§5 〜なければいけません / 〜なきゃ",
        "§6 〜でしょうか",
      ],
      grammar:["L10.9 …なければなりません","L12.4 普通形でしょう","L12.3 …けど (cf. ので)"],
      vocab:[
        {label:"L15 — sports & misc (運動・サッカー・できる・温泉…)", key:"15"},
      ],
    },
    {
      n:21, date:"2026-07-14", type:"study",
      title:"N5 points Genki 1 doesn't reach",
      genki:[
        "These appear in Genki 2 — covered here so your N5 base is complete.",
      ],
      grammar:[
        "L15.5 〜とき (when)","L15.2 〜ながら (two things at once)",
        "L15.3 …ができます / 辞書形ことができます (potential)","L15.4 趣味は…です / …ことです",
        "L14.6 で (basis of action)","L14.7 …だけ","L14.8 助数詞 (counters)","L14.9 期間に〜回",
      ],
      vocab:[
        {label:"L14 — counters (〜回・〜匹・〜杯・〜本・〜冊・〜台)", key:"14"},
      ],
    },
    {
      n:22, date:"2026-07-15", type:"review",
      title:"Full review",
      genki:[
        "Sweep all of Genki L1–12 and Attain L1–15 grammar + vocab.",
        "Prioritize anything flagged on review days (5, 10, 14, 18).",
        "Optionally do an N5-level mock / practice set to find weak spots.",
      ],
      grammar:[],
      vocab:[],
    },
  ],
};

if (typeof module !== "undefined" && module.exports){ module.exports = { PLAN }; }
