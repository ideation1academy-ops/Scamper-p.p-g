import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   مغامرة سكامبر – مصنع الأفكار العجيبة  (SCAMPER Adventure)
   لعبة تعليمية تفاعلية لتعليم الأطفال (7-12) مهارتي "الاستبدال" و"الدمج"
   ========================================================================= */

/* -------------------------------------------------------------------------
   EDITABLE GAME CONTENT
   كل النصوص والأسئلة والتغذية الراجعة موجودة هنا فقط. لتعديل أي سؤال أو
   إجابة أو رسالة، عدّل هذا الكائن فقط ولن تحتاج لمس بقية الكود.
   ------------------------------------------------------------------------- */
const gameData = {
  meta: {
    titleAr: "مغامرة سكامبر",
    subtitleAr: "هل تستطيع إنقاذ مصنع الأفكار؟",
    fullTitleAr: "مصنع الأفكار العجيبة",
    badgeAr: "وسام صانع الأفكار",
  },
  characters: {
    sama: { name: "سَما", skill: "الاستبدال", color: "#8B5CF6" },
    comi: { name: "كومي", skill: "الدمج", color: "#14B8A6" },
    robot: { name: "فكّور" },
  },
  correctFeedback: [
    "رائع!",
    "ممتاز يا مخترع!",
    "فكرة ذكية!",
    "أحسنت التفكير!",
    "مذهل!",
    "عقلك يعمل كعقل المخترعين!",
  ],
  incorrectFeedback: [
    "فكرة قريبة، جرّب مرة أخرى.",
    "أنت على الطريق الصحيح.",
    "فكّر: هل تم تبديل شيء أم جمع شيئين؟",
    "فكرة جريئة! دعنا ننظر من زاوية أخرى.",
    "جرّب أن تبحث عن الجزء الذي تغيّر.",
  ],
  stages: [
    { id: "opening", checkpoint: 0, title: "البداية" },
    { id: "story", checkpoint: 0, title: "القصة" },
    { id: "hook", checkpoint: 0, title: "تحدٍ سريع" },
    { id: "sub-discover", checkpoint: 1, title: "اكتشف الاستبدال" },
    { id: "sub-practice1", checkpoint: 1, title: "تدرّب: الحقيبة" },
    { id: "sub-practice2", checkpoint: 1, title: "تدرّب: الكوب" },
    { id: "sub-dragdrop", checkpoint: 2, title: "ساعد سَما" },
    { id: "sub-reveal", checkpoint: 2, title: "لغز المبدعين" },
    { id: "sub-complete", checkpoint: 2, title: "أتقنت الاستبدال" },
    { id: "com-intro", checkpoint: 3, title: "اكتشف الدمج" },
    { id: "com-practice1", checkpoint: 3, title: "ادمج الفكرتين" },
    { id: "com-dragdrop", checkpoint: 4, title: "آلة كومي" },
    { id: "com-invention", checkpoint: 4, title: "اخترع شيئًا" },
    { id: "com-complete", checkpoint: 4, title: "أتقنت الدمج" },
    { id: "sc-quiz", checkpoint: 5, title: "استبدال أم دمج؟" },
    { id: "lightning", checkpoint: 5, title: "تحدي البرق" },
    { id: "lab", checkpoint: 5, title: "مختبر المخترع الصغير" },
    { id: "final", checkpoint: 6, title: "التحدي الأخير" },
    { id: "award", checkpoint: 6, title: "الحفل الختامي" },
  ],
  hook: {
    prompt: "لو لم نستطع استخدام أرجل الكرسي الخشبية، ماذا يمكن أن نضع مكانها؟",
    emoji: "🪑",
    options: [
      { label: "عجلات", emoji: "🛞", correct: true },
      { label: "موزة", emoji: "🍌", correct: false },
      { label: "سحابة", emoji: "☁️", correct: false },
    ],
    successMsg: "رائع! أنت استخدمت الاستبدال حتى قبل أن تعرف اسمه!",
    tryAgainMsg: "فكرة طريفة! جرّب شيئًا يمكن أن يتحرك مثل الأرجل الخشبية.",
    samaLine: "هذه إحدى حيل المبدعين... اسمها الاستبدال!",
  },
  substitute: {
    introLines: [
      "أنا سَما، وهذا صندوق أدواتي السحري 🧰",
      "أنا أسأل دائمًا: ما الذي يمكن أن أستبدله؟",
      "نستبدل المادة، أو الشكل، أو الأداة… ونبقي فكرة الشيء كما هي!",
    ],
    practice1: {
      title: "الحقيبة ثقيلة جدًا",
      emoji: "🎒",
      question: "ماذا يمكننا أن نستبدل لتصبح أخف؟",
      options: ["المادة", "اسم الحقيبة", "صاحب الحقيبة"],
      correctIndex: 0,
      correctFeedback:
        "أحسنت! عندما غيّرنا المادة واحتفظنا بفكرة الحقيبة، استخدمنا الاستبدال.",
    },
    practice2: {
      title: "كوب زجاجي ينكسر بسهولة",
      emoji: "🥛",
      question: "أي فكرة تستخدم الاستبدال؟",
      options: [
        "نصنعه من السيليكون",
        "نضع كوبين معًا",
        "نرسم نجمة عليه",
      ],
      correctIndex: 0,
      correctFeedback: "ممتاز! استبدلت الزجاج بالسيليكون.",
    },
    dragdrop: {
      title: "ساعد سَما في إصلاح الاختراعات",
      originalLabel: "مظلة من القماش",
      originalEmoji: "☂️",
      dropLabel: "استبدل القماش بـ...",
      options: [
        { label: "بلاستيك شفاف مقاوم للماء", emoji: "🧴", correct: true },
        { label: "عجلات", emoji: "🛞", correct: false },
        { label: "ملعقة", emoji: "🥄", correct: false },
        { label: "إسفنجة", emoji: "🧽", correct: false },
      ],
      wrongMsg: "فكرة جريئة! هل يوجد اختيار يحافظ على وظيفة المظلة بشكل أفضل؟",
    },
    reveal: {
      title: "لغز المبدعين",
      question: "أريد صنع حذاء يستطيع الطفل استخدامه في المطر.",
      subQuestion: "ما الجزء الذي يمكن استبداله؟",
      answer: "يمكن استبدال القماش بمادة مقاومة للماء.",
      followUp: "هل تستطيع التفكير في مادة أخرى؟",
    },
    samaOutro: "المبدع لا يسأل فقط: ما هذا؟\nبل يسأل: ماذا يمكن أن أغيّر فيه؟",
  },
  combine: {
    introLines: [
      "أنا لا أبدّل الأشياء... أنا أحب أن أجمعها!",
      "قلم ✏️ + فانوس 🔦 = قلم مضيء 💡",
      "هذه قوة الدمج!",
    ],
    practice1: {
      title: "ادمج الفكرتين",
      instruction: "اختر بطاقتين ثم اضغط ادمج",
      cards: [
        { id: "bag", label: "حقيبة", emoji: "🎒" },
        { id: "wheels", label: "عجلات", emoji: "🛞" },
        { id: "clock", label: "ساعة", emoji: "⏰" },
        { id: "pencil", label: "قلم", emoji: "✏️" },
      ],
      correctPair: ["bag", "wheels"],
      resultLabel: "حقيبة بعجلات",
      resultEmoji: "🧳",
      wrongMsg: "فكرة جميلة! جرّب مزيجًا يمنح الشيء حركة أسهل.",
    },
    dragdrop: {
      title: "آلة كومي العجيبة",
      slot1: { label: "زجاجة ماء", emoji: "🍶" },
      slot2Options: [
        { label: "مرشّح ماء", emoji: "🧪", correct: true },
        { label: "ساعة", emoji: "⏰", correct: false },
        { label: "مصباح", emoji: "💡", correct: false },
      ],
      resultLabel: "زجاجة تنقّي الماء",
      resultEmoji: "🚰",
      wrongMsg: "فكرة طريفة! جرّب شيئًا ينقّي أو يحسّن الماء.",
      successNote:
        "رائع! لم نستبدل شيئًا؛ جمعنا وظيفتين معًا. هذا هو الدمج.",
    },
    invention: {
      title: "اخترع شيئًا جديدًا",
      instruction: "اختر شيئين لتصنع منهما اختراعًا جديدًا",
      cards: [
        { id: "umbrella", label: "مظلة", emoji: "☂️" },
        { id: "light", label: "ضوء", emoji: "💡" },
        { id: "bag2", label: "حقيبة", emoji: "🎒" },
        { id: "charger", label: "شاحن", emoji: "🔌" },
        { id: "chair2", label: "كرسي", emoji: "🪑" },
        { id: "pocket", label: "جيب تخزين", emoji: "👝" },
        { id: "pencil2", label: "قلم", emoji: "✏️" },
        { id: "recorder", label: "مسجّل صوت", emoji: "🎙️" },
      ],
    },
  },
  scOrCombine: [
    {
      text: "غيرنا أرجل الكرسي الخشبية إلى عجلات.",
      answer: "S",
      reason: "لأننا استبدلنا جزءًا بجزء آخر.",
    },
    {
      text: "أضفنا حقيبة صغيرة إلى ظهر الكرسي.",
      answer: "C",
      reason: "لأننا جمعنا شيئين معًا.",
    },
    {
      text: "صنعنا القلم من بلاستيك بدل الخشب.",
      answer: "S",
      reason: "لأننا استبدلنا المادة فقط.",
    },
  ],
  lightning: [
    { text: "دمجنا مصباحًا مع مظلة.", answer: "C" },
    { text: "استبدلنا القماش بجلد صناعي.", answer: "S" },
    { text: "أضفنا عجلات لحقيبة الظهر.", answer: "C" },
  ],
  lab: {
    objects: [
      { id: "bagL", label: "حقيبة مدرسية", emoji: "🎒" },
      { id: "chairL", label: "كرسي", emoji: "🪑" },
      { id: "bottleL", label: "زجاجة ماء", emoji: "🍶" },
      { id: "umbrellaL", label: "مظلة", emoji: "☂️" },
      { id: "pencilL", label: "قلم", emoji: "✏️" },
      { id: "shoesL", label: "حذاء", emoji: "👟" },
    ],
  },
  final: {
    intro:
      "فكّور 🤖 يريد الذهاب إلى المدرسة، لكن حقيبته ثقيلة جدًا ولا يراها في الظلام.",
    step1Question: "ما أول شيء يمكن أن نفعله بالاستبدال؟",
    step1Options: [
      { label: "نستبدل مادة الحقيبة بمادة أخف", correct: true },
      { label: "نستبدل فكّور بروبوت آخر", correct: false },
    ],
    step1Feedback: "تمام! استبدلنا المادة الثقيلة بمادة خفيفة.",
    step2Question: "الآن، كيف نجعله يراها في الظلام؟ (فكّر بالدمج)",
    step2Options: [
      { label: "ندمج الحقيبة مع ضوء صغير", correct: true },
      { label: "نستبدل الحقيبة بمصباح", correct: false },
    ],
    step2Feedback: "ممتاز! دمجنا الحقيبة مع ضوء صغير، والآن هي خفيفة ومضيئة!",
  },
};

/* -------------------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------------------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function useSound(enabled) {
  const ctxRef = useRef(null);
  const play = useCallback(
    (type) => {
      if (!enabled) return;
      try {
        if (!ctxRef.current) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          ctxRef.current = new AC();
        }
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") ctx.resume();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === "correct") {
          o.frequency.setValueAtTime(523, now);
          o.frequency.setValueAtTime(659, now + 0.09);
          o.frequency.setValueAtTime(784, now + 0.18);
        } else if (type === "wrong") {
          o.frequency.setValueAtTime(220, now);
          o.frequency.setValueAtTime(180, now + 0.12);
        } else if (type === "click") {
          o.frequency.setValueAtTime(440, now);
        } else if (type === "spark") {
          o.frequency.setValueAtTime(660, now);
          o.frequency.setValueAtTime(880, now + 0.1);
          o.frequency.setValueAtTime(1100, now + 0.2);
        }
        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        o.start(now);
        o.stop(now + 0.36);
      } catch (e) {
        /* audio unsupported — silently ignore */
      }
    },
    [enabled]
  );
  return play;
}

function loadSave() {
  try {
    const raw = window.localStorage.getItem("scamper-save-v1");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function writeSave(data) {
  try {
    window.localStorage.setItem("scamper-save-v1", JSON.stringify(data));
  } catch (e) {
    /* storage unavailable — game still works, just won't persist */
  }
}
function clearSave() {
  try {
    window.localStorage.removeItem("scamper-save-v1");
  } catch (e) {}
}

/* -------------------------------------------------------------------------
   Character SVGs
   ------------------------------------------------------------------------- */
function CharacterSVG({ who = "sama", expression = "happy", size = 110 }) {
  const color = who === "sama" ? "#8B5CF6" : "#14B8A6";
  const light = who === "sama" ? "#C4B5FD" : "#99F6E4";
  let mouth;
  if (expression === "happy" || expression === "celebrating")
    mouth = <path d="M38 62 Q50 76 62 62" stroke="#3B2A55" strokeWidth="4" fill="none" strokeLinecap="round" />;
  else if (expression === "thinking")
    mouth = <path d="M40 65 Q50 62 60 65" stroke="#3B2A55" strokeWidth="4" fill="none" strokeLinecap="round" />;
  else if (expression === "surprised")
    mouth = <circle cx="50" cy="66" r="7" fill="#3B2A55" />;
  else
    mouth = <path d="M38 60 Q50 70 62 60" stroke="#3B2A55" strokeWidth="4" fill="none" strokeLinecap="round" />;

  const eyeY = expression === "thinking" ? 44 : 42;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={who === "sama" ? "سَما" : "كومي"}>
      <ellipse cx="50" cy="55" rx="42" ry="38" fill={color} />
      <ellipse cx="50" cy="50" rx="34" ry="30" fill={light} opacity="0.35" />
      {expression === "celebrating" && (
        <>
          <text x="8" y="20" fontSize="16">✨</text>
          <text x="78" y="24" fontSize="16">✨</text>
        </>
      )}
      <circle cx="36" cy={eyeY} r="6.5" fill="#2B2140" />
      <circle cx="64" cy={eyeY} r="6.5" fill="#2B2140" />
      <circle cx="38" cy={eyeY - 2} r="2" fill="#fff" />
      <circle cx="66" cy={eyeY - 2} r="2" fill="#fff" />
      {expression === "thinking" && (
        <ellipse cx="30" cy="30" rx="8" ry="5" fill="#F9A8D4" opacity="0.7" />
      )}
      <ellipse cx="30" cy="58" rx="6" ry="4" fill="#F9A8D4" opacity="0.6" />
      <ellipse cx="70" cy="58" rx="6" ry="4" fill="#F9A8D4" opacity="0.6" />
      {mouth}
      {who === "sama" ? (
        <rect x="42" y="86" width="16" height="10" rx="2" fill="#FBBF24" stroke="#2B2140" strokeWidth="2" />
      ) : (
        <circle cx="50" cy="90" r="7" fill="#FBBF24" stroke="#2B2140" strokeWidth="2" />
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------
   Generic UI atoms
   ------------------------------------------------------------------------- */
function BigButton({ children, onClick, variant = "primary", disabled, className = "" }) {
  const variants = {
    primary:
      "bg-gradient-to-l from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300",
    teal: "bg-gradient-to-l from-teal-400 to-teal-500 text-white shadow-lg shadow-teal-200",
    coral: "bg-gradient-to-l from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-200",
    ghost: "bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400",
    sky: "bg-gradient-to-l from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-xl p-5 sm:p-8 ${className}`}>{children}</div>
  );
}

function FeedbackBanner({ text, kind }) {
  if (!text) return null;
  const cls =
    kind === "good"
      ? "bg-teal-50 text-teal-800 border-teal-300"
      : "bg-amber-50 text-amber-800 border-amber-300";
  return (
    <div
      role="status"
      className={`mt-4 border-2 rounded-2xl px-4 py-3 text-base sm:text-lg font-bold animate-[pop_0.25s_ease-out] ${cls}`}
    >
      {text}
    </div>
  );
}

function SparkBadge({ sparks, stars, classMode }) {
  return (
    <div className={`flex items-center gap-4 ${classMode ? "text-2xl" : "text-sm sm:text-base"}`}>
      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 font-bold">
        <span>⚡</span>
        <span>{sparks} / 6</span>
      </div>
      <div className="flex items-center gap-1 bg-purple-100 text-purple-800 rounded-full px-3 py-1 font-bold">
        <span>⭐</span>
        <span>{stars}</span>
      </div>
    </div>
  );
}

function ProgressBar({ checkpoint, classMode }) {
  const total = 6;
  const pct = Math.min(100, Math.round((checkpoint / total) * 100));
  return (
    <div className="w-full">
      <div className={`w-full bg-purple-100 rounded-full overflow-hidden ${classMode ? "h-5" : "h-3"}`}>
        <div
          className="h-full bg-gradient-to-l from-teal-400 via-purple-400 to-yellow-400 transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Generic activity components
   ------------------------------------------------------------------------- */
function MCQuestion({ emoji, title, question, options, correctIndex, correctFeedback, onDone, sound, classMode, showAnswers = false }) {
  const [chosen, setChosen] = useState(null);
  const [status, setStatus] = useState(null); // 'good' | 'bad'
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const choose = (i) => {
    if (done) return;
    setChosen(i);
    if (i === correctIndex) {
      setStatus("good");
      setMsg(correctFeedback || pick(gameData.correctFeedback));
      setDone(true);
      sound("correct");
    } else {
      setStatus("bad");
      setMsg(pick(gameData.incorrectFeedback));
      sound("wrong");
    }
  };

  return (
    <div>
      {emoji && <div className={`text-center ${classMode ? "text-7xl" : "text-5xl"} mb-2`}>{emoji}</div>}
      {title && <h3 className={`text-center font-extrabold text-purple-900 ${classMode ? "text-2xl" : "text-lg"} mb-1`}>{title}</h3>}
      <p className={`text-center font-bold text-gray-700 ${classMode ? "text-2xl" : "text-lg"} mb-5`}>{question}</p>
      <div className="grid gap-3">
        {options.map((opt, i) => {
          const isChosen = chosen === i;
          const showGood = done && i === correctIndex;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={done}
              className={`w-full text-right px-5 py-4 rounded-2xl border-2 font-bold transition-all active:scale-95 ${classMode ? "text-xl" : "text-base"}
                ${showGood ? "bg-teal-100 border-teal-400 text-teal-900" : isChosen && status === "bad" ? "bg-rose-50 border-rose-300 text-rose-700 animate-[shake_0.4s]" : showAnswers && i === correctIndex ? "bg-teal-50 border-teal-300 text-teal-900" : "bg-purple-50 border-purple-100 hover:border-purple-300 text-purple-900"}
                disabled:cursor-default`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <FeedbackBanner text={msg} kind={status} />
      {done && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={onDone} variant="primary">
            التالي ⬅
          </BigButton>
        </div>
      )}
    </div>
  );
}

function DragDropActivity({ data, onDone, sound, classMode, showAnswers = false }) {
  const [placed, setPlaced] = useState(null);
  const [wrongPulse, setWrongPulse] = useState(null);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);
  const [dragId, setDragId] = useState(null);
  const done = placed !== null;

  const tryOption = (opt, idx) => {
    if (done) return;
    if (opt.correct) {
      setPlaced(idx);
      setStatus("good");
      setMsg(pick(gameData.correctFeedback));
      sound("correct");
    } else {
      setWrongPulse(idx);
      setStatus("bad");
      setMsg(data.wrongMsg);
      sound("wrong");
      setTimeout(() => setWrongPulse(null), 450);
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-4 ${classMode ? "text-2xl" : "text-lg"}`}>{data.title}</h3>
      <div className="flex flex-col items-center gap-2 mb-5">
        <div className={`${classMode ? "text-7xl" : "text-5xl"}`}>{data.originalEmoji}</div>
        <div className="font-bold text-gray-600">{data.originalLabel}</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId !== null) tryOption(data.options[dragId], dragId);
            setDragId(null);
          }}
          className={`mt-2 w-full max-w-sm border-4 border-dashed rounded-2xl py-4 text-center font-bold ${
            done ? "border-teal-400 bg-teal-50 text-teal-800" : dragId !== null ? "border-sky-400 bg-sky-50 text-sky-700" : "border-purple-200 bg-purple-50 text-purple-600"
          }`}
        >
          {done ? (
            <span>
              {data.originalLabel.split(" ")[0]} + {data.options[placed].emoji} {data.options[placed].label}
            </span>
          ) : (
            data.dropLabel
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.options.map((opt, idx) => (
          <button
            key={idx}
            draggable
            onDragStart={() => setDragId(idx)}
            onClick={() => tryOption(opt, idx)}
            onDragEnd={() => setDragId(null)}
            disabled={done}
            className={`px-3 py-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 ${classMode ? "text-lg" : "text-sm"}
              ${placed === idx ? "bg-teal-100 border-teal-400" : showAnswers && opt.correct ? "bg-teal-50 border-teal-300" : "bg-white border-purple-100 hover:border-purple-300"}
              ${wrongPulse === idx ? "animate-[shake_0.4s] border-rose-300 bg-rose-50" : ""}
              disabled:cursor-default`}
          >
            <span className={classMode ? "text-4xl" : "text-3xl"}>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      <FeedbackBanner text={msg} kind={status} />
      {done && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={onDone}>التالي ⬅</BigButton>
        </div>
      )}
    </div>
  );
}

function RevealActivity({ data, onDone, sound, classMode }) {
  const [thought, setThought] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [praised, setPraised] = useState(false);

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-3 ${classMode ? "text-2xl" : "text-lg"}`}>{data.title}</h3>
      <p className={`text-center font-bold text-gray-700 mb-1 ${classMode ? "text-xl" : "text-base"}`}>{data.question}</p>
      <p className={`text-center font-bold text-purple-700 mb-5 ${classMode ? "text-xl" : "text-base"}`}>{data.subQuestion}</p>
      {!thought && (
        <div className="flex justify-center">
          <BigButton variant="ghost" onClick={() => setThought(true)}>
            فكّر أولًا 🤔
          </BigButton>
        </div>
      )}
      {thought && !revealed && (
        <div className="flex justify-center">
          <BigButton variant="sky" onClick={() => { setRevealed(true); sound("click"); }}>
            اكشف الفكرة
          </BigButton>
        </div>
      )}
      {revealed && (
        <>
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl px-4 py-3 text-center font-bold text-sky-800 mb-4">
            {data.answer}
          </div>
          <p className="text-center font-bold text-gray-700 mb-3">{data.followUp}</p>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="اكتب فكرتك هنا (اختياري)"
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400 mb-3"
            aria-label="فكرتك"
          />
          {!praised && (
            <div className="flex justify-center mb-3">
              <BigButton
                variant="teal"
                onClick={() => {
                  setPraised(true);
                  sound("correct");
                }}
              >
                أرسل فكرتي
              </BigButton>
            </div>
          )}
          <FeedbackBanner text={praised ? "فكرة تستحق التجربة!" : ""} kind="good" />
          {praised && (
            <div className="flex justify-center mt-4">
              <BigButton onClick={onDone}>التالي ⬅</BigButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PairPickActivity({ data, onDone, sound, classMode, showAnswers = false }) {
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);

  const toggle = (id) => {
    if (result) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : s));
  };

  const combine = () => {
    if (selected.length !== 2) return;
    const isCorrect =
      selected.every((id) => data.correctPair.includes(id)) && data.correctPair.length === 2;
    if (isCorrect) {
      setResult({ label: data.resultLabel, emoji: data.resultEmoji });
      setStatus("good");
      setMsg(pick(gameData.correctFeedback));
      sound("correct");
    } else {
      setStatus("bad");
      setMsg(data.wrongMsg);
      sound("wrong");
      setSelected([]);
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-1 ${classMode ? "text-2xl" : "text-lg"}`}>{data.title}</h3>
      <p className="text-center text-gray-600 font-bold mb-4">{data.instruction}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {data.cards.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            disabled={!!result}
            className={`px-2 py-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 ${classMode ? "text-lg" : "text-sm"}
              ${selected.includes(c.id) ? "bg-purple-100 border-purple-400" : showAnswers && data.correctPair.includes(c.id) ? "bg-teal-50 border-teal-300" : "bg-white border-purple-100 hover:border-purple-300"}`}
          >
            <span className={classMode ? "text-4xl" : "text-3xl"}>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      {!result && (
        <div className="flex justify-center">
          <BigButton variant="teal" onClick={combine} disabled={selected.length !== 2}>
            ادمج الفكرتين ⚙️
          </BigButton>
        </div>
      )}
      {result && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-4 text-center mb-3">
          <div className="text-4xl mb-1">{result.emoji}</div>
          <div className="font-extrabold text-teal-900 text-lg">{result.label}</div>
        </div>
      )}
      <FeedbackBanner text={msg} kind={status} />
      {result && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={onDone}>التالي ⬅</BigButton>
        </div>
      )}
    </div>
  );
}

function ComDragDrop({ data, onDone, sound, classMode, showAnswers = false }) {
  const [placed, setPlaced] = useState(null);
  const [wrongPulse, setWrongPulse] = useState(null);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [dragId, setDragId] = useState(null);
  const done = placed !== null;

  const tryOption = (opt, idx) => {
    if (done) return;
    if (opt.correct) {
      setPlaced(idx);
      setStatus("good");
      setMsg(data.successNote);
      sound("correct");
    } else {
      setWrongPulse(idx);
      setStatus("bad");
      setMsg(data.wrongMsg);
      sound("wrong");
      setTimeout(() => setWrongPulse(null), 450);
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-4 ${classMode ? "text-2xl" : "text-lg"}`}>{data.title}</h3>
      <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
        <div className="bg-purple-50 rounded-2xl px-4 py-3 text-center">
          <div className={classMode ? "text-5xl" : "text-4xl"}>{data.slot1.emoji}</div>
          <div className="font-bold text-sm mt-1">{data.slot1.label}</div>
        </div>
        <div className="text-3xl font-black text-purple-400">+</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId !== null) tryOption(data.slot2Options[dragId], dragId);
            setDragId(null);
          }}
          className={`rounded-2xl px-4 py-3 text-center border-4 border-dashed min-w-[110px] ${
            done ? "border-teal-400 bg-teal-50" : dragId !== null ? "border-sky-400 bg-sky-50" : "border-purple-200 bg-purple-50"
          }`}
        >
          {done ? (
            <>
              <div className={classMode ? "text-5xl" : "text-4xl"}>{data.slot2Options[placed].emoji}</div>
              <div className="font-bold text-sm mt-1">{data.slot2Options[placed].label}</div>
            </>
          ) : (
            <div className="text-purple-400 font-bold py-3">الخانة الثانية</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        {data.slot2Options.map((opt, idx) => (
          <button
            key={idx}
            draggable={!done}
            onDragStart={() => setDragId(idx)}
            onDragEnd={() => setDragId(null)}
            onClick={() => tryOption(opt, idx)}
            disabled={done}
            className={`px-2 py-3 rounded-2xl border-2 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 text-sm
              ${placed === idx ? "bg-teal-100 border-teal-400" : showAnswers && opt.correct ? "bg-teal-50 border-teal-300" : "bg-white border-purple-100 hover:border-purple-300"}
              ${wrongPulse === idx ? "animate-[shake_0.4s] border-rose-300 bg-rose-50" : ""}`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      {!done && (
        <div className="flex justify-center mb-2">
          <span className="text-gray-400 text-sm">اسحب قطعة إلى الآلة، أو اضغط عليها على الهاتف</span>
        </div>
      )}
      {done && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-4 text-center mb-3">
          <div className="text-4xl mb-1">{data.resultEmoji}</div>
          <div className="font-extrabold text-teal-900 text-lg">{data.resultLabel}</div>
        </div>
      )}
      <FeedbackBanner text={msg} kind={status} />
      {done && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={onDone}>التالي ⬅</BigButton>
        </div>
      )}
    </div>
  );
}

function InventionActivity({ data, onDone, sound, classMode }) {
  const [selected, setSelected] = useState([]);
  const [ideaText, setIdeaText] = useState("");
  const [inventionName, setInventionName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => {
    if (submitted) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : s));
  };
  const cards = data.cards.filter((c) => selected.includes(c.id));

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-1 ${classMode ? "text-2xl" : "text-lg"}`}>{data.title}</h3>
      <p className="text-center text-gray-600 font-bold mb-4">{data.instruction}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {data.cards.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            disabled={submitted}
            className={`px-2 py-4 rounded-2xl border-2 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 text-sm
              ${selected.includes(c.id) ? "bg-purple-100 border-purple-400" : "bg-white border-purple-100 hover:border-purple-300"}`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      {selected.length === 2 && !submitted && (
        <div className="space-y-3">
          <div className="text-center font-bold text-purple-700">
            {cards.map((c) => c.emoji).join(" + ")} = ؟
          </div>
          <p className="text-center font-bold">ما الاختراع الذي يمكن أن تصنعه؟</p>
          <input
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="اكتب فكرتك (اختياري)"
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-400"
          />
          <p className="text-center font-bold">اختر اسمًا لاختراعك</p>
          <input
            value={inventionName}
            onChange={(e) => setInventionName(e.target.value)}
            placeholder="اسم الاختراع (اختياري)"
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-400"
          />
          <div className="flex justify-center">
            <BigButton
              variant="teal"
              onClick={() => {
                setSubmitted(true);
                sound("correct");
              }}
            >
              اعتمد اختراعي 🎉
            </BigButton>
          </div>
        </div>
      )}
      {submitted && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-4 text-center">
          <div className="text-4xl mb-1">{cards.map((c) => c.emoji).join(" ")}</div>
          <div className="font-extrabold text-teal-900 text-lg">{inventionName || "اختراع رائع بلا اسم بعد"}</div>
          {ideaText && <div className="text-teal-700 mt-1">{ideaText}</div>}
          <div className="mt-2 font-bold text-teal-700">فكرة تستحق التجربة!</div>
        </div>
      )}
      {submitted && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={onDone}>التالي ⬅</BigButton>
        </div>
      )}
    </div>
  );
}

function SubOrComQuiz({ items, onDone, sound, classMode, showAnswers = false }) {
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const item = items[idx];

  const answer = (a) => {
    if (locked) return;
    setLocked(true);
    if (a === item.answer) {
      setStatus("good");
      setMsg(item.reason);
      sound("correct");
    } else {
      setStatus("bad");
      setMsg(item.reason);
      sound("wrong");
    }
  };

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      setStatus(null);
      setMsg("");
      setLocked(false);
    } else {
      onDone();
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-1 ${classMode ? "text-2xl" : "text-lg"}`}>استبدال أم دمج؟</h3>
      <div className="text-center text-gray-400 font-bold text-sm mb-4">
        {idx + 1} / {items.length}
      </div>
      <p className={`text-center font-bold text-gray-700 mb-6 ${classMode ? "text-2xl" : "text-lg"}`}>{item.text}</p>
      <div className="flex justify-center gap-4 mb-2">
        <button
          onClick={() => answer("S")}
          disabled={locked}
          className={`w-28 h-28 rounded-3xl border-4 font-black text-3xl transition-all active:scale-95 ${
            locked && item.answer === "S" ? "bg-teal-100 border-teal-400 text-teal-800" : showAnswers && item.answer === "S" ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400"
          }`}
        >
          S<div className="text-xs font-bold mt-1">استبدال</div>
        </button>
        <button
          onClick={() => answer("C")}
          disabled={locked}
          className={`w-28 h-28 rounded-3xl border-4 font-black text-3xl transition-all active:scale-95 ${
            locked && item.answer === "C" ? "bg-teal-100 border-teal-400 text-teal-800" : showAnswers && item.answer === "C" ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400"
          }`}
        >
          C<div className="text-xs font-bold mt-1">دمج</div>
        </button>
      </div>
      <FeedbackBanner text={msg} kind={status} />
      {locked && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={next}>{idx + 1 < items.length ? "التالي ⬅" : "متابعة ⬅"}</BigButton>
        </div>
      )}
    </div>
  );
}

function LightningRound({ items, onDone, sound, classMode, difficulty = "medium", showAnswers = false }) {
  const timerStart = difficulty === "easy" ? 12 : difficulty === "challenge" ? 5 : 8;
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerStart);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState(null);
  const item = items[idx];

  useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) {
      setLocked(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked]);

  const answer = (a) => {
    if (locked) return;
    setLocked(true);
    if (a === item.answer) {
      setStatus("good");
      sound("correct");
    } else {
      setStatus(null);
      sound("wrong");
    }
  };

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      setTimeLeft(timerStart);
      setLocked(false);
      setStatus(null);
    } else {
      onDone();
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-1 ${classMode ? "text-2xl" : "text-lg"}`}>تحدي البرق ⚡</h3>
      <div className="flex justify-center mb-3">
        <div className="bg-yellow-100 text-yellow-800 font-black rounded-full w-10 h-10 flex items-center justify-center">
          {Math.max(timeLeft, 0)}
        </div>
      </div>
      <p className={`text-center font-bold text-gray-700 mb-6 ${classMode ? "text-2xl" : "text-lg"}`}>{item.text}</p>
      <div className="flex justify-center gap-4 mb-2">
        <button
          onClick={() => answer("S")}
          disabled={locked}
          className={`w-24 h-24 rounded-3xl border-4 font-black text-2xl active:scale-95 disabled:opacity-60 ${showAnswers && item.answer === "S" ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400"}`}
        >
          S
        </button>
        <button
          onClick={() => answer("C")}
          disabled={locked}
          className={`w-24 h-24 rounded-3xl border-4 font-black text-2xl active:scale-95 disabled:opacity-60 ${showAnswers && item.answer === "C" ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400"}`}
        >
          C
        </button>
      </div>
      {locked && (
        <FeedbackBanner
          text={status === "good" ? pick(gameData.correctFeedback) : `الإجابة: ${item.answer === "S" ? "استبدال" : "دمج"}`}
          kind={status === "good" ? "good" : "bad"}
        />
      )}
      {locked && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={next}>{idx + 1 < items.length ? "التالي ⬅" : "متابعة ⬅"}</BigButton>
        </div>
      )}
    </div>
  );
}

function InventorLab({ onDone, sound, classMode, invCount, setInvCount }) {
  const [step, setStep] = useState("pick-object");
  const [obj, setObj] = useState(null);
  const [tech, setTech] = useState(null);
  const [replaceWhat, setReplaceWhat] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [combineWith, setCombineWith] = useState("");
  const [invName, setInvName] = useState("");
  const [cardShown, setCardShown] = useState(false);

  const reset = () => {
    setStep("pick-object");
    setObj(null);
    setTech(null);
    setReplaceWhat("");
    setReplaceWith("");
    setCombineWith("");
    setInvName("");
    setCardShown(false);
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-4 ${classMode ? "text-2xl" : "text-lg"}`}>مختبر المخترع الصغير 🧪</h3>

      {step === "pick-object" && (
        <>
          <p className="text-center font-bold text-gray-600 mb-4">اختر شيئًا لتبدأ اختراعك</p>
          <div className="grid grid-cols-3 gap-3">
            {gameData.lab.objects.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setObj(o);
                  setStep("pick-tech");
                  sound("click");
                }}
                className="px-2 py-4 rounded-2xl border-2 bg-white border-purple-100 hover:border-purple-300 font-bold flex flex-col items-center gap-1 active:scale-95"
              >
                <span className="text-3xl">{o.emoji}</span>
                <span className="text-sm">{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "pick-tech" && obj && (
        <>
          <div className="text-center mb-4">
            <span className="text-4xl">{obj.emoji}</span>
            <div className="font-bold">{obj.label}</div>
          </div>
          <div className="flex justify-center gap-4">
            <BigButton variant="primary" onClick={() => { setTech("S"); setStep("detail"); }}>
              استخدم الاستبدال S
            </BigButton>
            <BigButton variant="teal" onClick={() => { setTech("C"); setStep("detail"); }}>
              استخدم الدمج C
            </BigButton>
          </div>
        </>
      )}

      {step === "detail" && tech === "S" && (
        <div className="space-y-3">
          <p className="font-bold text-center">ماذا ستستبدل؟</p>
          <input
            value={replaceWhat}
            onChange={(e) => setReplaceWhat(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3"
            placeholder="مثال: المادة"
          />
          <p className="font-bold text-center">بماذا ستستبدله؟</p>
          <input
            value={replaceWith}
            onChange={(e) => setReplaceWith(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3"
            placeholder="مثال: بلاستيك خفيف"
          />
          <p className="font-bold text-center">اسم اختراعك</p>
          <input
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3"
            placeholder="اختياري"
          />
          <div className="flex justify-center">
            <BigButton
              variant="coral"
              onClick={() => {
                setCardShown(true);
                setStep("card");
                sound("correct");
              }}
            >
              أنشئ بطاقة اختراعي
            </BigButton>
          </div>
        </div>
      )}

      {step === "detail" && tech === "C" && (
        <div className="space-y-3">
          <p className="font-bold text-center">بماذا ستدمج {obj.label}؟</p>
          <input
            value={combineWith}
            onChange={(e) => setCombineWith(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3"
            placeholder="مثال: ضوء صغير"
          />
          <p className="font-bold text-center">اسم اختراعك</p>
          <input
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3"
            placeholder="اختياري"
          />
          <div className="flex justify-center">
            <BigButton
              variant="coral"
              onClick={() => {
                setCardShown(true);
                setStep("card");
                sound("correct");
              }}
            >
              أنشئ بطاقة اختراعي
            </BigButton>
          </div>
        </div>
      )}

      {step === "card" && cardShown && (
        <div className="bg-gradient-to-b from-yellow-50 to-purple-50 border-2 border-purple-200 rounded-3xl p-5 text-center">
          <div className="text-4xl mb-2">{obj.emoji}</div>
          <div className="font-black text-purple-900 text-xl mb-2">{invName || "اختراعي الجديد"}</div>
          <div className="text-sm text-gray-500 mb-1">الشيء الأصلي: {obj.label}</div>
          <div className="text-sm text-gray-500 mb-1">التقنية: {tech === "S" ? "استبدال" : "دمج"}</div>
          <div className="text-sm text-gray-700 font-bold mt-2">
            {tech === "S" ? `استبدلنا ${replaceWhat || "جزءًا"} بـ ${replaceWith || "شيء جديد"}` : `دمجنا ${obj.label} مع ${combineWith || "فكرة جديدة"}`}
          </div>
        </div>
      )}
      {step === "card" && (
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-5">
          <BigButton
            variant="ghost"
            onClick={() => {
              if (invCount === 0) setInvCount(1);
              reset();
            }}
          >
            اخترع من جديد 🔄
          </BigButton>
          <BigButton
            onClick={() => {
              if (invCount === 0) setInvCount(1);
              onDone();
            }}
          >
            متابعة المغامرة ⬅
          </BigButton>
        </div>
      )}
    </div>
  );
}

function FinalChallenge({ onDone, sound, classMode, showAnswers = false }) {
  const [step, setStep] = useState(1);
  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");
  const [s1done, setS1done] = useState(false);
  const [s2done, setS2done] = useState(false);
  const d = gameData.final;

  const answer1 = (correct) => {
    if (s1done) return;
    if (correct) {
      setMsg1(d.step1Feedback);
      setS1done(true);
      sound("correct");
    } else {
      setMsg1(pick(gameData.incorrectFeedback));
      sound("wrong");
    }
  };
  const answer2 = (correct) => {
    if (s2done) return;
    if (correct) {
      setMsg2(d.step2Feedback);
      setS2done(true);
      sound("correct");
    } else {
      setMsg2(pick(gameData.incorrectFeedback));
      sound("wrong");
    }
  };

  return (
    <div>
      <h3 className={`text-center font-extrabold text-purple-900 mb-3 ${classMode ? "text-2xl" : "text-lg"}`}>التحدي الأخير 🤖</h3>
      <p className="text-center font-bold text-gray-700 mb-5">{d.intro}</p>

      <div className="bg-purple-50 rounded-2xl p-4 mb-4">
        <p className="font-bold text-purple-800 mb-3">{d.step1Question}</p>
        <div className="grid gap-2">
          {d.step1Options.map((o, i) => (
            <button
              key={i}
              onClick={() => answer1(o.correct)}
              disabled={s1done}
              className={`text-right px-4 py-3 rounded-xl border-2 font-bold ${
                s1done && o.correct ? "bg-teal-100 border-teal-400" : showAnswers && o.correct ? "bg-teal-50 border-teal-300" : "bg-white border-purple-100 hover:border-purple-300"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <FeedbackBanner text={msg1} kind={s1done ? "good" : "bad"} />
      </div>

      {s1done && (
        <div className="bg-teal-50 rounded-2xl p-4 mb-4">
          <p className="font-bold text-teal-800 mb-3">{d.step2Question}</p>
          <div className="grid gap-2">
            {d.step2Options.map((o, i) => (
              <button
                key={i}
                onClick={() => answer2(o.correct)}
                disabled={s2done}
                className={`text-right px-4 py-3 rounded-xl border-2 font-bold ${
                  s2done && o.correct ? "bg-purple-100 border-purple-400" : showAnswers && o.correct ? "bg-teal-50 border-teal-300" : "bg-white border-teal-100 hover:border-teal-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <FeedbackBanner text={msg2} kind={s2done ? "good" : "bad"} />
        </div>
      )}

      {s2done && (
        <div className="flex justify-center mt-4">
          <BigButton onClick={onDone}>أكمل المغامرة 🎉</BigButton>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Teacher panel
   ------------------------------------------------------------------------- */
function TeacherPanel({ state, setState, onClose, onReset, stages }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-lg text-purple-900">⚙️ إعدادات المعلم</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none" aria-label="إغلاق">×</button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-bold">الصوت</span>
            <BigButton
              variant={state.soundEnabled ? "teal" : "ghost"}
              onClick={() => setState((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className="!px-4 !py-2 !text-sm"
            >
              {state.soundEnabled ? "🔊 مفعّل" : "🔇 مغلق"}
            </BigButton>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold">وضع العرض للصف</span>
            <BigButton
              variant={state.classMode ? "teal" : "ghost"}
              onClick={() => setState((s) => ({ ...s, classMode: !s.classMode }))}
              className="!px-4 !py-2 !text-sm"
            >
              {state.classMode ? "مفعّل" : "مغلق"}
            </BigButton>
          </div>

          <div>
            <span className="font-bold block mb-2">مستوى الصعوبة</span>
            <div className="flex gap-2">
              {[
                ["easy", "سهل"],
                ["medium", "متوسط"],
                ["challenge", "تحدٍ"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setState((s) => ({ ...s, difficulty: val }))}
                  className={`flex-1 py-2 rounded-xl border-2 font-bold ${
                    state.difficulty === val ? "bg-purple-500 text-white border-purple-500" : "bg-white border-purple-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold block mb-2">الانتقال إلى مرحلة</span>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {stages.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => setState((s) => ({ ...s, stageIndex: i }))}
                  className={`text-xs px-2 py-2 rounded-lg border ${
                    state.stageIndex === i ? "bg-purple-100 border-purple-400 font-bold" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {i}. {st.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold">إظهار الإجابات الصحيحة</span>
            <BigButton
              variant={state.showAnswers ? "teal" : "ghost"}
              onClick={() => setState((s) => ({ ...s, showAnswers: !s.showAnswers }))}
              className="!px-4 !py-2 !text-sm"
            >
              {state.showAnswers ? "مفعّل" : "مغلق"}
            </BigButton>
          </div>

          <div className="bg-purple-50 rounded-xl p-3">
            <div className="font-bold mb-1">ملخص المحتوى</div>
            <div className="text-gray-600">
              {stages.length} مراحل • مهارتان (استبدال، دمج) • 6 شرارات إبداع
            </div>
          </div>

          <BigButton variant="coral" className="w-full" onClick={onReset}>
            ابدأ من جديد (يمسح التقدم المحفوظ)
          </BigButton>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Main App
   ------------------------------------------------------------------------- */
const DEFAULT_STATE = {
  screen: "opening", // opening | howto | intro | game
  stageIndex: 0,
  sparks: 0,
  stars: 0,
  completedStages: [],
  soundEnabled: true,
  classMode: false,
  difficulty: "medium",
  showAnswers: false,
};

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadSave();
    return saved ? { ...DEFAULT_STATE, ...saved, screen: "game" } : DEFAULT_STATE;
  });
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [invCount, setInvCount] = useState(0);
  const play = useSound(state.soundEnabled);

  useEffect(() => {
    writeSave({
      stageIndex: state.stageIndex,
      sparks: state.sparks,
      stars: state.stars,
      completedStages: state.completedStages,
      soundEnabled: state.soundEnabled,
      classMode: state.classMode,
      difficulty: state.difficulty,
    });
  }, [state.stageIndex, state.sparks, state.stars, state.completedStages, state.soundEnabled, state.classMode, state.difficulty]);

  useEffect(() => {
    // load Arabic-friendly font, safe fallback if network unavailable
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;700;800&family=Tajawal:wght@400;500;700;800&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const stages = gameData.stages;
  const stage = stages[state.stageIndex];

  const goto = (id) => {
    const i = stages.findIndex((s) => s.id === id);
    if (i >= 0) setState((s) => ({ ...s, stageIndex: i }));
  };
  const next = () => {
    setState((s) => {
      const idx = Math.min(s.stageIndex + 1, stages.length - 1);
      const completedStages = s.completedStages.includes(stage.id)
        ? s.completedStages
        : [...s.completedStages, stage.id];
      return { ...s, stageIndex: idx, completedStages };
    });
  };
  const addSpark = () => {
    if (!state.completedStages.includes(stage.id)) play("spark");
    setState((s) =>
      s.completedStages.includes(stage.id)
        ? s
        : { ...s, sparks: Math.min(6, s.sparks + 1) }
    );
  };
  const addStar = () =>
    setState((s) =>
      s.completedStages.includes(stage.id) ? s : { ...s, stars: s.stars + 1 }
    );

  const resetAll = () => {
    clearSave();
    setState(DEFAULT_STATE);
    setInvCount(0);
    setTeacherOpen(false);
  };

  const cm = state.classMode;

  // ----- pre-game screens -----
  if (state.screen === "opening") {
    return (
      <RootWrap>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-10 text-center relative overflow-hidden">
          <FloatingShapes />
          <div className="flex gap-3 mb-6 relative z-10">
            <CharacterSVG who="sama" expression="celebrating" size={90} />
            <CharacterSVG who="comi" expression="celebrating" size={90} />
          </div>
          <h1 className="relative z-10 text-4xl sm:text-6xl font-black text-purple-900 mb-2 drop-shadow-sm" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
            {gameData.meta.titleAr}
          </h1>
          <p className="relative z-10 text-lg sm:text-2xl font-bold text-teal-700 mb-10">{gameData.meta.subtitleAr}</p>
          <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
            <BigButton
              variant="primary"
              className="!text-xl !py-4"
              onClick={() => {
                play("click");
                setState((s) => ({ ...s, screen: "intro" }));
              }}
            >
              ابدأ المغامرة 🚀
            </BigButton>
            <BigButton variant="ghost" onClick={() => setState((s) => ({ ...s, screen: "howto" }))}>
              كيف ألعب؟
            </BigButton>
          </div>
        </div>
      </RootWrap>
    );
  }

  if (state.screen === "howto") {
    return (
      <RootWrap>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-10">
          <Card className="max-w-md w-full text-center">
            <div className="text-5xl mb-3">🎮</div>
            <h2 className="text-2xl font-extrabold text-purple-900 mb-4">كيف ألعب؟</h2>
            <ul className="text-right space-y-2 text-gray-700 font-bold mb-6">
              <li>🧭 تابع سَما وكومي في رحلتهما</li>
              <li>⚡ اجمع 6 شرارات إبداع لإنقاذ المصنع</li>
              <li>🎯 اضغط أو اسحب الإجابات — لا توجد إجابات خاطئة، فقط أفكار نجرّبها</li>
              <li>🏅 في النهاية ستفوز بوسام صانع الأفكار</li>
            </ul>
            <BigButton onClick={() => setState((s) => ({ ...s, screen: "opening" }))}>رجوع</BigButton>
          </Card>
        </div>
      </RootWrap>
    );
  }

  if (state.screen === "intro") {
    return (
      <RootWrap>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-10 text-center">
          <div className="text-6xl mb-4">😮</div>
          <p className="text-2xl sm:text-3xl font-black text-purple-900 mb-3">أوه لا!</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">توقفت آلات مصنع الأفكار!</p>
          <p className="text-lg font-bold text-gray-600 mb-2">نحتاج إلى عقل مبدع يعيد تشغيلها.</p>
          <p className="text-lg font-bold text-teal-700 mb-8">هل أنت مستعد؟</p>
          <BigButton
            variant="primary"
            className="!text-xl !py-4"
            onClick={() => {
              play("click");
              setState((s) => ({ ...s, screen: "game", stageIndex: 2 }));
            }}
          >
            نعم! أنا مستعد
          </BigButton>
        </div>
      </RootWrap>
    );
  }

  // ----- main game screen -----
  return (
    <RootWrap>
      <div className="min-h-[100dvh] flex flex-col">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-purple-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setTeacherOpen(true)}
              className="text-xl opacity-60 hover:opacity-100"
              aria-label="إعدادات المعلم"
              title="إعدادات المعلم"
            >
              ⚙️
            </button>
            <div className="flex-1 mx-2">
              <ProgressBar checkpoint={stage.checkpoint} classMode={cm} />
            </div>
            <SparkBadge sparks={state.sparks} stars={state.stars} classMode={cm} />
            <button
              onClick={() => setState((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className="text-xl"
              aria-label="تشغيل/إيقاف الصوت"
            >
              {state.soundEnabled ? "🔊" : "🔇"}
            </button>
          </div>
          {!cm && (
            <div className="max-w-2xl mx-auto text-xs text-purple-400 font-bold mt-1">{stage.title}</div>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-6">
          <div className={`w-full ${cm ? "max-w-3xl" : "max-w-xl"}`}>
            <StageRenderer
              stage={stage}
              state={state}
              setState={setState}
              next={next}
              goto={goto}
              addSpark={addSpark}
              addStar={addStar}
              sound={play}
              classMode={cm}
              invCount={invCount}
              setInvCount={setInvCount}
              resetAll={resetAll}
            />
          </div>
        </main>

        {stage.id !== "opening" && state.stageIndex > 0 && stage.id !== "award" && (
          <div className="max-w-xl mx-auto w-full px-4 pb-4 flex justify-start">
            <button
              onClick={() => setState((s) => ({ ...s, stageIndex: Math.max(0, s.stageIndex - 1) }))}
              className="text-purple-400 font-bold text-sm hover:text-purple-600"
            >
              ➡ السابق
            </button>
          </div>
        )}
      </div>

      {teacherOpen && (
        <TeacherPanel
          state={state}
          setState={setState}
          onClose={() => setTeacherOpen(false)}
          onReset={resetAll}
          stages={stages}
        />
      )}
    </RootWrap>
  );
}

function StageRenderer({ stage, state, setState, next, goto, addSpark, addStar, sound, classMode, invCount, setInvCount, resetAll }) {
  const withStar = (fn) => (...args) => {
    addStar();
    fn && fn(...args);
  };

  switch (stage.id) {
    case "hook":
      return <HookStage next={next} sound={sound} classMode={classMode} addStar={addStar} showAnswers={state.showAnswers} />;
    case "sub-discover":
      return <SamaIntro next={next} classMode={classMode} />;
    case "sub-practice1":
      return (
        <Card>
          <MCQuestion
            emoji={gameData.substitute.practice1.emoji}
            title={gameData.substitute.practice1.title}
            question={gameData.substitute.practice1.question}
            options={gameData.substitute.practice1.options}
            correctIndex={gameData.substitute.practice1.correctIndex}
            correctFeedback={gameData.substitute.practice1.correctFeedback}
            onDone={withStar(next)}
            sound={sound}
            classMode={classMode}
            showAnswers={state.showAnswers}
          />
        </Card>
      );
    case "sub-practice2":
      return (
        <Card>
          <MCQuestion
            emoji={gameData.substitute.practice2.emoji}
            title={gameData.substitute.practice2.title}
            question={gameData.substitute.practice2.question}
            options={gameData.substitute.practice2.options}
            correctIndex={gameData.substitute.practice2.correctIndex}
            correctFeedback={gameData.substitute.practice2.correctFeedback}
            onDone={withStar(next)}
            sound={sound}
            classMode={classMode}
            showAnswers={state.showAnswers}
          />
        </Card>
      );
    case "sub-dragdrop":
      return (
        <Card>
          <DragDropActivity data={gameData.substitute.dragdrop} onDone={withStar(next)} sound={sound} classMode={classMode} showAnswers={state.showAnswers} />
        </Card>
      );
    case "sub-reveal":
      return (
        <Card>
          <RevealActivity data={gameData.substitute.reveal} onDone={withStar(next)} sound={sound} classMode={classMode} />
        </Card>
      );
    case "sub-complete":
      return (
        <CelebrationStage
          who="sama"
          title="لقد أتقنت قوة الاستبدال!"
          line={gameData.substitute.samaOutro}
          buttonLabel="اكتشف القوة الثانية"
          classMode={classMode}
          onNext={() => {
            addSpark();
            next();
          }}
        />
      );
    case "com-intro":
      return <ComiIntro next={next} classMode={classMode} />;
    case "com-practice1":
      return (
        <Card>
          <PairPickActivity data={gameData.combine.practice1} onDone={withStar(next)} sound={sound} classMode={classMode} showAnswers={state.showAnswers} />
        </Card>
      );
    case "com-dragdrop":
      return (
        <Card>
          <ComDragDrop data={gameData.combine.dragdrop} onDone={withStar(next)} sound={sound} classMode={classMode} showAnswers={state.showAnswers} />
        </Card>
      );
    case "com-invention":
      return (
        <Card>
          <InventionActivity data={gameData.combine.invention} onDone={withStar(next)} sound={sound} classMode={classMode} />
        </Card>
      );
    case "com-complete":
      return (
        <CelebrationStage
          who="comi"
          title="لقد أتقنت قوة الدمج!"
          line={"المبدع يجمع بين أشياء لم تجتمع من قبل\nويصنع منها شيئًا جديدًا."}
          buttonLabel="تابع المغامرة"
          classMode={classMode}
          onNext={() => {
            addSpark();
            next();
          }}
        />
      );
    case "sc-quiz":
      return (
        <Card>
          <SubOrComQuiz
            items={gameData.scOrCombine}
            onDone={() => {
              addSpark();
              next();
            }}
            sound={sound}
            classMode={classMode}
            showAnswers={state.showAnswers}
          />
        </Card>
      );
    case "lightning":
      return (
        <Card>
          <LightningRound
            items={gameData.lightning}
            onDone={() => {
              addSpark();
              next();
            }}
            sound={sound}
            classMode={classMode}
            difficulty={state.difficulty}
            showAnswers={state.showAnswers}
          />
        </Card>
      );
    case "lab":
      return (
        <Card>
          <InventorLab
            onDone={() => {
              addSpark();
              next();
            }}
            sound={sound}
            classMode={classMode}
            invCount={invCount}
            setInvCount={setInvCount}
          />
        </Card>
      );
    case "final":
      return (
        <Card>
          <FinalChallenge
            onDone={() => {
              addSpark();
              next();
            }}
            sound={sound}
            classMode={classMode}
            showAnswers={state.showAnswers}
          />
        </Card>
      );
    case "award":
      return <AwardScreen state={state} classMode={classMode} resetAll={resetAll} goto={goto} />;
    case "story":
      // fallback in case someone routes here directly
      return (
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">😮</div>
            <p className="font-bold text-xl mb-4">أوه لا! توقفت آلات مصنع الأفكار!</p>
            <BigButton onClick={next}>نعم! أنا مستعد</BigButton>
          </div>
        </Card>
      );
    default:
      return (
        <Card>
          <BigButton onClick={next}>متابعة</BigButton>
        </Card>
      );
  }
}

function HookStage({ next, sound, classMode, addStar, showAnswers = false }) {
  const [chosen, setChosen] = useState(null);
  const [msg, setMsg] = useState("");
  const [good, setGood] = useState(false);
  const [samaShown, setSamaShown] = useState(false);
  const h = gameData.hook;

  const choose = (opt, i) => {
    if (good) return;
    setChosen(i);
    if (opt.correct) {
      setGood(true);
      setMsg(h.successMsg);
      sound("correct");
      addStar();
      setTimeout(() => setSamaShown(true), 700);
    } else {
      setMsg(h.tryAgainMsg);
      sound("wrong");
    }
  };

  return (
    <Card>
      <div className={`text-center ${classMode ? "text-8xl" : "text-6xl"} mb-3`}>{h.emoji}</div>
      <p className={`text-center font-bold text-gray-700 mb-6 ${classMode ? "text-2xl" : "text-lg"}`}>{h.prompt}</p>
      <div className="grid grid-cols-3 gap-3">
        {h.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => choose(opt, i)}
            disabled={good}
            className={`rounded-2xl border-2 py-5 flex flex-col items-center gap-1 font-bold transition-all active:scale-95 ${
              good && opt.correct ? "bg-teal-100 border-teal-400" : chosen === i ? "bg-rose-50 border-rose-300 animate-[shake_0.4s]" : showAnswers && opt.correct ? "bg-teal-50 border-teal-300" : "bg-purple-50 border-purple-100 hover:border-purple-300"
            }`}
          >
            <span className={classMode ? "text-4xl" : "text-3xl"}>{opt.emoji}</span>
            <span className="text-sm">{opt.label}</span>
          </button>
        ))}
      </div>
      <FeedbackBanner text={msg} kind={good ? "good" : "bad"} />
      {samaShown && (
        <div className="mt-5 flex items-center gap-3 bg-purple-50 rounded-2xl p-4">
          <CharacterSVG who="sama" expression="happy" size={56} />
          <p className="font-bold text-purple-800">{h.samaLine}</p>
        </div>
      )}
      {samaShown && (
        <div className="flex justify-center mt-5">
          <BigButton onClick={next}>هيا نكتشف أكثر ⬅</BigButton>
        </div>
      )}
    </Card>
  );
}

function SamaIntro({ next, classMode }) {
  const [i, setI] = useState(0);
  const lines = gameData.substitute.introLines;
  return (
    <Card className="text-center">
      <CharacterSVG who="sama" expression={i === lines.length - 1 ? "happy" : "thinking"} size={classMode ? 140 : 110} />
      <div className="bg-purple-50 rounded-2xl px-4 py-4 mt-4 mb-6 min-h-[70px] flex items-center justify-center">
        <p className={`font-bold text-purple-900 ${classMode ? "text-2xl" : "text-lg"}`}>{lines[i]}</p>
      </div>
      <BigButton
        onClick={() => {
          if (i + 1 < lines.length) setI(i + 1);
          else next();
        }}
      >
        {i + 1 < lines.length ? "التالي" : "لنتدرّب!"} ⬅
      </BigButton>
    </Card>
  );
}

function ComiIntro({ next, classMode }) {
  const [i, setI] = useState(0);
  const lines = gameData.combine.introLines;
  return (
    <Card className="text-center">
      <CharacterSVG who="comi" expression={i === lines.length - 1 ? "celebrating" : "happy"} size={classMode ? 140 : 110} />
      <div className="bg-teal-50 rounded-2xl px-4 py-4 mt-4 mb-6 min-h-[70px] flex items-center justify-center">
        <p className={`font-bold text-teal-900 ${classMode ? "text-2xl" : "text-lg"}`}>{lines[i]}</p>
      </div>
      <BigButton
        variant="teal"
        onClick={() => {
          if (i + 1 < lines.length) setI(i + 1);
          else next();
        }}
      >
        {i + 1 < lines.length ? "التالي" : "لنتدرّب!"} ⬅
      </BigButton>
    </Card>
  );
}

function CelebrationStage({ who, title, line, buttonLabel, onNext, classMode }) {
  return (
    <Card className="text-center relative overflow-hidden">
      <ConfettiBurst />
      <CharacterSVG who={who} expression="celebrating" size={classMode ? 140 : 110} />
      <div className="text-3xl my-2">⚡</div>
      <h2 className={`font-black text-purple-900 mb-3 ${classMode ? "text-3xl" : "text-xl"}`}>{title}</h2>
      <p className={`font-bold text-gray-600 whitespace-pre-line mb-6 ${classMode ? "text-xl" : "text-base"}`}>{line}</p>
      <BigButton onClick={onNext}>{buttonLabel} ⬅</BigButton>
    </Card>
  );
}

function AwardScreen({ state, classMode, resetAll, goto }) {
  return (
    <Card className="text-center relative overflow-hidden">
      <ConfettiBurst dense />
      <div className="text-5xl mb-2">🎉</div>
      <h2 className={`font-black text-purple-900 mb-2 ${classMode ? "text-3xl" : "text-2xl"}`}>مبروك!</h2>
      <p className={`font-bold text-gray-700 mb-4 ${classMode ? "text-xl" : "text-base"}`}>
        أصبحت صانع أفكار معتمدًا في مصنع سكامبر!
      </p>
      <div className="text-6xl mb-2">🏅</div>
      <div className="font-black text-purple-800 text-lg mb-6">{gameData.meta.badgeAr}</div>
      <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-right">
        <div className="font-bold text-purple-900 mb-2">تعلمت اليوم:</div>
        <div className="flex items-center gap-2 mb-1">
          <span>✓</span>
          <span className="font-bold">الاستبدال Substitute</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✓</span>
          <span className="font-bold">الدمج Combine</span>
        </div>
      </div>
      <p className="font-bold text-teal-700 mb-6">المبدع يستطيع رؤية أكثر من احتمال للشيء نفسه.</p>
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="bg-yellow-100 rounded-2xl px-4 py-2 font-bold text-yellow-800">⚡ {state.sparks}/6</div>
        <div className="bg-purple-100 rounded-2xl px-4 py-2 font-bold text-purple-800">⭐ {state.stars}</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <BigButton variant="ghost" onClick={resetAll}>العب مرة أخرى</BigButton>
        <BigButton variant="teal" onClick={() => goto("lab")}>مختبر الاختراعات</BigButton>
        <BigButton variant="sky" onClick={() => goto("sc-quiz")}>راجع مهاراتي</BigButton>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   Decorative bits
   ------------------------------------------------------------------------- */
function FloatingShapes() {
  const shapes = [
    { emoji: "⭐", top: "10%", left: "8%", size: 28, delay: "0s" },
    { emoji: "💡", top: "20%", left: "82%", size: 34, delay: "0.5s" },
    { emoji: "⚡", top: "70%", left: "12%", size: 30, delay: "1s" },
    { emoji: "🎨", top: "78%", left: "80%", size: 30, delay: "1.5s" },
    { emoji: "✨", top: "45%", left: "5%", size: 22, delay: "0.2s" },
    { emoji: "✨", top: "40%", left: "90%", size: 22, delay: "0.8s" },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {shapes.map((s, i) => (
        <span
          key={i}
          className="absolute opacity-70 animate-[floaty_4s_ease-in-out_infinite]"
          style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: s.delay }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}

function ConfettiBurst({ dense }) {
  const n = dense ? 24 : 14;
  const colors = ["#8B5CF6", "#14B8A6", "#FBBF24", "#FB7185", "#38BDF8"];
  const pieces = Array.from({ length: n }).map((_, i) => ({
    left: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.6,
    dur: 1.6 + Math.random() * 1,
    rot: Math.random() * 360,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-[-10px] w-2 h-3 rounded-sm animate-[confetti_2s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function RootWrap({ children }) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-[100dvh] w-full bg-gradient-to-b from-sky-50 via-white to-purple-50"
      style={{ fontFamily: "'Tajawal', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <style>{`
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes confetti { 0% { top: -10px; opacity: 1; } 100% { top: 100%; opacity: 0; } }
        * { -webkit-tap-highlight-color: transparent; }
        button:focus-visible, input:focus-visible { outline: 3px solid #38BDF8; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[floaty_4s_ease-in-out_infinite\\], .animate-\\[confetti_2s_ease-in_forwards\\], .animate-\\[pop_0\\.25s_ease-out\\], .animate-\\[shake_0\\.4s\\] {
            animation: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
