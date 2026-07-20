/**
 * AIM28 Training Hub
 * McKesson CSI · AIMpact AI Fluency Program
 *
 * Production-ready React component merging:
 *   - Visual system from Claude Design handoff (README + Designs HTML)
 *   - Working logic, quiz engine, and data from original prototype
 *
 * Stack: React 18, no external deps, Libre Franklin via Google Fonts
 * Persistence: localStorage (swap for Dataverse / SharePoint List in prod)
 */

import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS (from README / Design handoff) ────────────────────────────
const T = {
  navy:       "#00375D",
  blue:       "#0068AC",
  ink:        "#002542",
  gold:       "#E6BC4A",
  pageBg:     "#EEF3F8",
  cardWhite:  "#FFFFFF",
  cardBorder: "#E7EDF3",
  rowBg:      "#F7F9FC",
  slate:      "#4A5B6B",
  muted:      "#6B7C8C",
  faint:      "#8A97A3",
  steel:      "#9FC3E0",
  steelDark:  "#7F9DB5",
  success:    "#1E8E6A",
  successBg:  "#E6F4EF",
  silver:     "#C3CAD2",
  bronze:     "#C4915E",
  trackBg:    "#E4EBF2",
  badgeLock:  "#E4E9EE",
  highlight:  "#EEF3F8",
};

const S = {
  card: {
    background: T.cardWhite,
    borderRadius: 14,
    border: `1px solid ${T.cardBorder}`,
    boxShadow: "0 2px 14px -6px rgba(0,55,93,.14)",
    padding: "20px 22px",
  },
  cardElevated: {
    boxShadow: "0 8px 24px -10px rgba(0,104,172,.35)",
  },
};

// ─── MODULE DATA ─────────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 1, day: 1, label: "Welcome and purpose", time: "15 min", points: 5,
    blurb: "Why AI fluency matters for CSI and how the two days run.",
    summary: "Why AI fluency matters for CSI and how the two days run. Set expectations and build the room.",
    concepts: ["AIM28 program goals","Two-day structure overview","What fluency means at CSI"],
    quiz: [
      { q: "What is the primary goal of the AIM28 AI Fluency program?", opts: ["Replace human workers with AI","Build practical AI judgment for real CSI work","Learn to code AI models","Earn a technical certification"], a: 1 },
      { q: "How many modules does the AI Fluency Workshop contain?", opts: ["4","6","8","10"], a: 2 },
      { q: "What does 'AI fluency' mean in this program?", opts: ["Using AI for every task","Choosing where AI belongs and prompting with intent","Mastering Python and machine learning","Replacing existing workflows entirely"], a: 1 },
    ],
    takeaway: "AI fluency is about judgment, not just tool use. You finish this program knowing when to use AI and when not to.",
    reflection: "What's one task in your current role you believe AI could help with? What's one it shouldn't touch?",
  },
  {
    id: 2, day: 1, label: "The two-category test", time: "30 min", points: 15,
    blurb: "Separate ceiling work from no-ceiling work as a decision framework.",
    summary: "Separate ceiling work from no-ceiling work. This single test becomes your decision framework for every AI use case.",
    concepts: ["Ceiling vs. no-ceiling tasks","Where human judgment must lead","Applying the test to real CSI work"],
    quiz: [
      { q: "A 'ceiling task' is one where...", opts: ["The output has no upper bound","There is a defined right answer or quality ceiling","AI always performs best","You never need human review"], a: 1 },
      { q: "Which is a no-ceiling task best suited for AI?", opts: ["Diagnosing a patient","Generating 10 draft email subject lines","Making a final hiring decision","Signing a legal contract"], a: 1 },
      { q: "After applying the Two-Category Test, what should you always do?", opts: ["Deploy AI immediately","Keep the result private","Verify output with your own judgment","Ask AI to check its own work"], a: 2 },
    ],
    takeaway: "Not every task should be delegated to AI. The Two-Category Test gives you a repeatable way to decide before you start.",
    reflection: "List three tasks from your last week. Which category does each fall into? Where did you actually use AI?",
  },
  {
    id: 3, day: 1, label: "How AI works and fails", time: "40 min", points: 15,
    blurb: "Understand model strengths and failure modes to guard your work.",
    summary: "Understand the strengths and failure modes of large language models so you can guard against them in your own work.",
    concepts: ["How LLMs generate output","Hallucination and sycophancy","Guarding against failure modes"],
    quiz: [
      { q: "What is 'hallucination' in AI language models?", opts: ["When AI refuses to answer","When AI generates confident but factually incorrect output","When AI repeats itself","When AI asks clarifying questions"], a: 1 },
      { q: "What is 'sycophancy' in AI behavior?", opts: ["AI that corrects you aggressively","AI that agrees with you even when you're wrong","AI that refuses controversial topics","AI that only answers in lists"], a: 1 },
      { q: "Which technique best reduces hallucination risk?", opts: ["Using longer prompts","Asking AI to verify in the same prompt","Asking AI to cite sources and independently verifying key claims","Using a premium AI plan"], a: 2 },
    ],
    takeaway: "AI does not know what it doesn't know. Your verification step is not optional.",
    reflection: "Describe a time you trusted a source that turned out to be wrong. What would you check differently with AI output?",
  },
  {
    id: 4, day: 1, label: "Responsible AI (SOCS)", time: "25 min", points: 10,
    blurb: "Safe, owned, compliant, sanctioned. The rules of the road at McKesson.",
    summary: "The SOCS rules of the road: Safe, Owned, Compliant, Sanctioned. McKesson's operating framework for AI at work.",
    concepts: ["Safe: what data stays out","Owned: who is accountable","Compliant: policy and PHI","Sanctioned: approved tools only"],
    quiz: [
      { q: "What does the 'S' in SOCS stand for?", opts: ["Structured","Safe","Scalable","Sensitive"], a: 1 },
      { q: "Which tool is approved for confidential McKesson business information?", opts: ["ChatGPT personal account","Any free AI tool","Microsoft Copilot Chat (M365)","A public API without authentication"], a: 2 },
      { q: "If a colleague shares a new AI tool informally, what should you do first?", opts: ["Try it immediately","Check if it is on the McKesson approved tools list","Share it more broadly to test","Assume it is approved if it's free"], a: 1 },
    ],
    takeaway: "Using unapproved AI tools with business data is a policy violation, and an unnecessary risk when approved alternatives exist.",
    reflection: "Have you ever used a tool at work that wasn't officially sanctioned? What would the SOCS test say about your current AI habits?",
  },
  {
    id: 5, day: 1, label: "CRISP prompting lab", time: "60 min", points: 20,
    blurb: "Build stronger prompts with context, role, intent, specifics, polish.",
    summary: "Build stronger prompts using the CRISP framework. Context, Role, Intent, Specifics, Polish. Then practice on real CSI work.",
    concepts: ["C — Context: what the AI needs to know","R — Role: who the AI is being","I — Intent: what you want","S — Specifics: constraints and format","P — Polish: refine after first output"],
    quiz: [
      { q: "In CRISP, what does the 'R' stand for?", opts: ["Result","Role","Review","Repeat"], a: 1 },
      { q: "A prompt that says 'Write an email' is missing which CRISP elements most critically?", opts: ["Nothing — it's fine","Context, Role, Intent, and Specifics","Only formatting guidance","Only a subject line"], a: 1 },
      { q: "What does the 'P' (Polish) step in CRISP involve?", opts: ["Using spell-check","Reviewing the AI output and refining the prompt based on what came back","Publishing the output immediately","Printing the result"], a: 1 },
    ],
    takeaway: "A great prompt is a clear brief. The CRISP framework is how you stop starting over and start iterating intentionally.",
    reflection: "Take one prompt you've used this month. Rewrite it using all five CRISP elements. What did you add? What changed?",
  },
  {
    id: 6, day: 1, label: "Accuracy checks and reflection", time: "30 min", points: 10,
    blurb: "Verification techniques and a Day 1 synthesis check-in.",
    summary: "Verification techniques and Day 1 synthesis. Build the habit of checking before trusting any AI output.",
    concepts: ["Three-source verification rule","Red-teaming your own prompts","Day 1 synthesis and fluency check-in"],
    quiz: [
      { q: "What is 'red-teaming' a prompt?", opts: ["Making it angrier in tone","Deliberately trying to find ways the output could be wrong or misused","Asking a colleague to rewrite it","Using AI to generate the prompt automatically"], a: 1 },
      { q: "After receiving AI output, the best next step is to...", opts: ["Use it immediately to save time","Ask AI if it's confident","Verify key facts against authoritative sources before using","Delete it and start over"], a: 2 },
      { q: "Day 1 of the workshop focuses primarily on:", opts: ["Building automation workflows","Agents and Copilot configuration","Foundations and prompting judgment","Data science and model training"], a: 2 },
    ],
    takeaway: "Verification is the skill that separates an AI user from an AI-fluent professional.",
    reflection: "What's your current verification habit for AI outputs? What would need to change to make checking a default?",
  },
  {
    id: 7, day: 2, label: "Copilot agents and automation", time: "60 min", points: 15,
    blurb: "Design an agent or flow for a real recurring bottleneck.",
    summary: "Design a Copilot agent or Power Automate flow for a real bottleneck. Learn when to build, when to wait, and how to document.",
    concepts: ["When an agent is worth building","Designing a Copilot agent","Power Automate: triggers and actions","Documentation that travels"],
    quiz: [
      { q: "When is a Copilot agent worth building vs. just prompting directly?", opts: ["Always — agents are always better","When the task is one-off and quick","When a task recurs predictably, has defined steps, and involves multiple data sources","Only when IT requests it"], a: 2 },
      { q: "In Power Automate, what is a 'trigger'?", opts: ["A button someone clicks in the agent","The event that starts an automated flow","The final output of the workflow","A notification sent to a user"], a: 1 },
      { q: "What should always accompany a new agent or automation you deploy?", opts: ["A PowerPoint slide","A secret only you know","Documentation: what it does, when it runs, who owns it","Nothing — agents are self-explanatory"], a: 2 },
    ],
    takeaway: "An agent that no one else understands is a liability. Document it, test it, own it.",
    reflection: "Identify one recurring bottleneck in your team's workflow. Would an agent help? Sketch the trigger and first three steps.",
  },
  {
    id: 8, day: 2, label: "Commit and close", time: "30 min", points: 10,
    blurb: "Commit to one real improvement, earn your badge, and plan next steps.",
    summary: "Each participant commits to one real improvement in their own work. Fluency check-out, badge earn, and next steps.",
    concepts: ["The one-improvement commitment","Fluency Points totals and badge","Resources: McKNet AI Hub, Community of Practice","Your AI Fluency action plan"],
    quiz: [
      { q: "The AIM28 program outcome for this workshop is:", opts: ["Every participant builds a new AI product","Every participant leaves able to choose where AI belongs and prompt with intent","Every participant becomes a data scientist","Every participant trains a custom language model"], a: 1 },
      { q: "Where should you bring forward AI improvement ideas after this workshop?", opts: ["Keep them internal to your team only","The Enterprise AI Use Case Intake Form or AskAI@McKesson.com","Post them to personal social media","Wait for an official announcement"], a: 1 },
      { q: "Earning 100 Fluency Points means you have:", opts: ["Read all eight module summaries","Completed every activity in the two-day program","Attended at least one day of the workshop","Passed a separate certification exam"], a: 1 },
    ],
    takeaway: "One real improvement committed and started beats ten ideas that stay on a slide. Choose yours and start this week.",
    reflection: "What is the one concrete thing you will change or try in the next two weeks? Write it as a commitment with a deadline.",
  },
];

const TOTAL_PTS = 100;
const SAMPLE_BOARD = [
  { n: "Jordan K.", pts: 100, badge: true },
  { n: "Alex T.",   pts: 85,  badge: false },
  { n: "Morgan S.", pts: 75,  badge: false },
  { n: "Casey R.",  pts: 65,  badge: false },
  { n: "Jamie L.",  pts: 50,  badge: false },
];

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
function usePersisted(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  const set = useCallback((next) => {
    setVal(prev => {
      const v = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
      return v;
    });
  }, [key]);
  return [val, set];
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────
function Pill({ children, color = T.blue, bg = T.highlight, style: s }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", background: bg, color, fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 11px", borderRadius: 20, ...s }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small, style: s }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: small ? "8px 16px" : "12px 24px",
    borderRadius: 9, fontFamily: "inherit",
    fontWeight: 700, fontSize: small ? 12.5 : 14,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "filter 0.15s, transform 0.15s",
    opacity: disabled ? 0.45 : 1, lineHeight: 1.2, ...s,
  };
  const variants = {
    primary: { background: T.blue,  color: "#fff" },
    gold:    { background: T.gold,  color: T.navy },
    ghost:   { background: "transparent", color: T.blue, border: `1.5px solid ${T.blue}` },
    dark:    { background: T.navy,  color: "#fff" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
      onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}>
      {children}
    </button>
  );
}

function PadlockSVG() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16">
      <rect x="3.5" y="7" width="9" height="6.4" rx="1.3" fill="#8A97A3" />
      <path d="M5 7V5.3a3 3 0 0 1 6 0V7" fill="none" stroke="#8A97A3" strokeWidth="1.6" />
    </svg>
  );
}

function ProgressRing({ pct, size = 88, stroke = 8 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, pct);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.trackBg} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.blue} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{Math.round(pct * 100)}%</div>
        <div style={{ fontSize: 10, color: T.faint, marginTop: 2 }}>complete</div>
      </div>
    </div>
  );
}

function MedalCircle({ rank }) {
  const styles = {
    1: { bg: T.gold,   color: T.navy },
    2: { bg: T.silver, color: "#3B4753" },
    3: { bg: T.bronze, color: "#fff" },
  };
  const st = styles[rank] || { bg: "#EAEEF2", color: T.muted };
  return (
    <div style={{ width: 26, height: 26, borderRadius: "50%", background: st.bg, color: st.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
      {rank}
    </div>
  );
}

function UnlockedBadgeDot() {
  return (
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#F4E3AA,#E6BC4A 65%,#B4791A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px -3px rgba(230,188,74,.75)" }}>
      <span style={{ color: "#fff", fontSize: 11 }}>★</span>
    </div>
  );
}

// ─── QUIZ ENGINE ─────────────────────────────────────────────────────────────
function Quiz({ module: m, onClaim }) {
  const [step, setStep]       = useState(0);
  const [sel, setSel]         = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);
  const q = m.quiz[step];

  function check() {
    setChecked(true);
    if (sel === q.a) setScore(s => s + 1);
  }
  function next() {
    setChecked(false); setSel(null);
    if (step + 1 >= m.quiz.length) setDone(true);
    else setStep(s => s + 1);
  }
  function retry() { setStep(0); setScore(0); setDone(false); setSel(null); setChecked(false); }

  if (done) {
    const pct = score / m.quiz.length;
    const passed = pct >= 0.67;
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{passed ? "★" : "↺"}</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: passed ? T.success : T.navy, marginBottom: 8 }}>
          {passed ? "Nice work." : "Keep going."}
        </div>
        <div style={{ color: T.muted, marginBottom: 24, fontSize: 15 }}>
          You scored {score}/{m.quiz.length} ({Math.round(pct * 100)}%)
        </div>
        {passed
          ? <Btn variant="gold" onClick={() => onClaim(m.points)}>Claim {m.points} points →</Btn>
          : <Btn variant="ghost" onClick={retry}>Retry quiz</Btn>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", color: T.muted, fontSize: 13, marginBottom: 16 }}>
        <span>Question {step + 1} of {m.quiz.length}</span>
        <span>Select one answer</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 17, color: T.navy, lineHeight: 1.4, marginBottom: 18 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 20 }}>
        {q.opts.map((opt, i) => {
          let border = `1.5px solid #DDE4EB`, bg = T.cardWhite, color = T.slate, fontWeight = 400;
          if (checked) {
            if (i === q.a)            { border = `2px solid ${T.success}`; bg = T.successBg; color = T.success; fontWeight = 600; }
            else if (i === sel)       { border = "2px solid #c0392b"; bg = "#fdf0f0"; color = "#c0392b"; }
          } else if (i === sel)       { border = `2px solid ${T.blue}`; bg = T.highlight; color = T.blue; fontWeight = 600; }
          return (
            <div key={i} onClick={() => !checked && setSel(i)}
              style={{ padding: "14px 16px", borderRadius: 10, cursor: checked ? "default" : "pointer", border, background: bg, color, fontWeight, fontSize: 15, display: "flex", alignItems: "center", gap: 12, transition: "all 0.12s" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: i === sel && !checked ? `5px solid ${T.blue}` : checked && i === q.a ? `5px solid ${T.success}` : `1.8px solid #C4CED8`, background: i === sel && !checked ? T.highlight : "#fff", flexShrink: 0, boxSizing: "border-box" }} />
              {opt}
            </div>
          );
        })}
      </div>
      {checked && (
        <div style={{ background: sel === q.a ? T.successBg : "#fdf0f0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: sel === q.a ? T.success : "#c0392b", fontWeight: 600 }}>
          {sel === q.a ? "✓ Correct." : `Correct answer: "${q.opts[q.a]}"`}
        </div>
      )}
      {!checked
        ? <Btn onClick={check} disabled={sel === null}>Check answer</Btn>
        : <Btn onClick={next}>{step + 1 < m.quiz.length ? "Next question →" : "See results →"}</Btn>
      }
    </div>
  );
}

// ─── MODULE DRAWER ────────────────────────────────────────────────────────────
function Drawer({ module: m, progress, reflections, role, onClose, onClaim, onSaveReflection }) {
  const [tab, setTab] = useState("overview");
  const [refText, setRefText] = useState(reflections[m.id] || "");
  const [saved, setSaved] = useState(false);
  const passed = !!progress[m.id];
  const tabs = ["overview", "concepts", "quiz", "reflection", ...(role === "trainer" ? ["facilitator"] : [])];

  function saveRef() {
    onSaveReflection(m.id, refText);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function dlRef() {
    const txt = `Module ${m.id}: ${m.label}\n\nReflection prompt:\n${m.reflection}\n\nMy reflection:\n${refText}`;
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
    a.download = `AIM28_Module${m.id}_Reflection.txt`;
    a.click();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,37,66,.5)", zIndex: 200, display: "flex", justifyContent: "flex-end", backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 600, background: T.cardWhite, display: "flex", flexDirection: "column", boxShadow: "-30px 0 80px -30px rgba(0,37,66,.5)", animation: "drawerIn .25s ease", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ background: T.ink, color: "#fff", padding: "26px 28px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <Pill bg="rgba(230,188,74,.16)" color={T.gold}>Day {m.day} · Module {String(m.id).padStart(2, "0")}</Pill>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.5px", lineHeight: 1.2, color: "#fff", marginBottom: 6 }}>{m.label}</div>
          <div style={{ color: T.steel, fontSize: 14 }}>{m.time} · {m.points} fluency points</div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2, marginTop: 18, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", fontFamily: "inherit",
                color: tab === t ? "#fff" : T.steelDark,
                fontWeight: tab === t ? 700 : 600,
                fontSize: 12, letterSpacing: ".5px", textTransform: "capitalize",
                padding: "8px 12px 10px", cursor: "pointer",
                borderBottom: tab === t ? `2px solid ${T.gold}` : "2px solid transparent",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28, flex: 1, overflowY: "auto" }}>

          {tab === "overview" && (
            <div>
              <p style={{ color: T.slate, lineHeight: 1.65, fontSize: 15, marginTop: 0, marginBottom: 18 }}>{m.summary}</p>
              <div style={{ background: T.highlight, borderRadius: 12, padding: "14px 18px", marginBottom: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: T.navy, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Key takeaway</div>
                <p style={{ margin: 0, color: T.slate, lineHeight: 1.55, fontStyle: "italic", fontSize: 14 }}>{m.takeaway}</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {passed
                  ? <div style={{ color: T.success, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.success, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>
                      Quiz complete · Points earned
                    </div>
                  : <Btn variant="gold" onClick={() => setTab("quiz")}>Take the quiz →</Btn>}
                <Btn variant="ghost" small onClick={() => setTab("concepts")}>Review concepts</Btn>
              </div>
            </div>
          )}

          {tab === "concepts" && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginBottom: 16 }}>What this module covers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {m.concepts.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: T.rowBg, borderRadius: 10, padding: "12px 16px" }}>
                    <span style={{ fontWeight: 800, color: T.blue, fontSize: 13, minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ color: T.slate, fontSize: 14, lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "quiz" && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginBottom: 20 }}>Knowledge check</div>
              {passed
                ? <div style={{ textAlign: "center", padding: 32 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.success, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>✓</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: T.success }}>Quiz already passed.</div>
                    <div style={{ color: T.muted, marginTop: 8 }}>Points have been credited to your profile.</div>
                  </div>
                : <Quiz module={m} onClaim={pts => { onClaim(m.id, pts); setTab("overview"); }} />
              }
            </div>
          )}

          {tab === "reflection" && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginBottom: 10 }}>Reflection prompt</div>
              <div style={{ background: "#FBF3DD", borderLeft: `4px solid ${T.gold}`, borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 18, color: "#6b5310", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>
                {m.reflection}
              </div>
              <textarea
                value={refText}
                onChange={e => setRefText(e.target.value)}
                placeholder="Write your reflection here..."
                rows={8}
                style={{ width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 14, color: T.navy, background: T.rowBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "12px 14px", resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <Btn small onClick={saveRef} variant="primary">{saved ? "Saved ✓" : "Save reflection"}</Btn>
                <Btn small onClick={dlRef} variant="ghost">Download</Btn>
                <Btn small onClick={() => window.open(`mailto:?subject=AIM28 Module ${m.id} Reflection&body=${encodeURIComponent(`Module ${m.id}: ${m.label}\n\nPrompt:\n${m.reflection}\n\nMy reflection:\n${refText}`)}`)} variant="ghost">Email to me</Btn>
              </div>
            </div>
          )}

          {tab === "facilitator" && role === "trainer" && (
            <div>
              <Pill bg={T.navy} color="#fff">Trainer only</Pill>
              <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, margin: "16px 0 14px" }}>Facilitation notes</div>
              <div style={{ background: T.highlight, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: T.blue, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Timing</div>
                <p style={{ margin: 0, color: T.slate, fontSize: 14 }}>{m.time} — leave 5 min buffer for questions.</p>
              </div>
              <div style={{ background: "#FBF3DD", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#7A4E0A", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Facilitation tip</div>
                <p style={{ margin: 0, color: "#6b5310", fontSize: 14, fontStyle: "italic" }}>Use the reflection prompt as a room debrief opener. Cold-call two or three participants before moving on — it surfaces application gaps early.</p>
              </div>
              <div style={{ background: T.rowBg, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, color: T.navy, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Common questions</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: T.slate, fontSize: 14, lineHeight: 1.8 }}>
                  <li>What counts as a "real" AI use case vs. a convenience shortcut?</li>
                  <li>How do we know if our output is accurate enough to use?</li>
                  <li>Who do we contact if we find an approved tool that still seems risky?</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid #EAEEF2`, background: "#F9FAFC", padding: "16px 28px", display: "flex", gap: 8, flexShrink: 0 }}>
          <Btn small variant="ghost" onClick={() => window.print()}>Print</Btn>
          <Btn small variant="ghost" onClick={() => window.open(`mailto:?subject=AIM28 Module ${m.id}: ${m.label}`)}>Email to me</Btn>
          <Btn small variant="dark" style={{ marginLeft: "auto" }} onClick={onClose}>Close</Btn>
        </div>
      </div>
      <style>{`@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboard({ onDone }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const valid = name.trim() && email.trim() && email.includes("@") && role;

  async function handleSubmit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      // Netlify Forms submission
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "aim28-registration",
          name: name.trim(),
          email: email.trim(),
          role: role,
          timestamp: new Date().toISOString(),
        }).toString(),
      });
    } catch (e) {
      // Continue even if form submission fails — don't block the user
      console.warn("Form submission failed:", e);
    }
    setSubmitting(false);
    onDone(name.trim(), email.trim(), role);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(140deg,#00101d 0%,#002542 52%,#004670 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Libre Franklin', system-ui, sans-serif" }}>
      {/* Hidden Netlify form for detection */}
      <form name="aim28-registration" data-netlify="true" style={{ display: "none" }}>
        <input name="name" /><input name="email" /><input name="role" /><input name="timestamp" />
      </form>

      <div style={{ background: T.cardWhite, borderRadius: 20, padding: "40px 44px", maxWidth: 520, width: "100%", boxShadow: "0 30px 60px -20px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ width: 36, height: 4, background: T.gold, borderRadius: 2 }} />
          <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: T.muted }}>CSI AIMpact · AI fluency program</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 30, color: T.navy, lineHeight: 1.15, marginBottom: 10 }}>Welcome to the<br />AIM28 training hub</div>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Two days. Eight modules. One goal: put AI to work with judgment. Tell us who you are to get started.</p>

        <label style={{ fontWeight: 700, fontSize: 13, color: T.navy, display: "block", marginBottom: 8 }}>Your name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="First name or display name"
          style={{ width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 15, padding: "12px 14px", borderRadius: 8, border: `1.5px solid #CDD7DF`, background: "#F7F9FC", color: T.navy, marginBottom: 16, outline: "none" }}
          onFocus={e => e.target.style.borderColor = T.blue}
          onBlur={e => e.target.style.borderColor = "#CDD7DF"}
        />

        <label style={{ fontWeight: 700, fontSize: 13, color: T.navy, display: "block", marginBottom: 8 }}>Work email</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@mckesson.com"
          type="email"
          style={{ width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 15, padding: "12px 14px", borderRadius: 8, border: `1.5px solid #CDD7DF`, background: "#F7F9FC", color: T.navy, marginBottom: 22, outline: "none" }}
          onFocus={e => e.target.style.borderColor = T.blue}
          onBlur={e => e.target.style.borderColor = "#CDD7DF"}
        />

        <label style={{ fontWeight: 700, fontSize: 13, color: T.navy, display: "block", marginBottom: 12 }}>I am joining as</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { val: "participant", title: "Participant", sub: "Learn and earn fluency points across the two-day program." },
            { val: "trainer",     title: "Trainer",     sub: "Deliver and manage the program with facilitator tools." },
          ].map(r => (
            <div key={r.val} onClick={() => setRole(r.val)}
              style={{ border: `2px solid ${role === r.val ? T.blue : "#DDE4EB"}`, background: role === r.val ? T.highlight : "#fff", borderRadius: 12, padding: 16, cursor: "pointer", position: "relative" }}>
              <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: "50%", border: role === r.val ? `5px solid ${T.blue}` : `1.8px solid #C4CED8`, background: role === r.val ? T.highlight : "#fff", boxSizing: "border-box" }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.4 }}>{r.sub}</div>
            </div>
          ))}
        </div>

        <Btn variant="gold" disabled={!valid || submitting} onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}>
          {submitting ? "Registering..." : "Enter the training hub →"}
        </Btn>

        <p style={{ fontSize: 11, color: T.faint, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          Your email is used only for program tracking and material delivery. No marketing.
        </p>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ view, setView, userName, role, setOnboarded, setRole, setUserName, setUserEmail, setProgress, setReflections }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = [["home","Dashboard"],["modules","Modules"],["progress","My progress"],
    ...(role === "trainer" ? [["trainer","Trainer view"]] : []),
    ["resources","Resources"]];
  return (
    <nav style={{ background: T.ink, height: 60, display: "flex", alignItems: "center", padding: "0 28px", gap: 34, position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
      <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.2px", flexShrink: 0 }}>
        <span style={{ color: T.gold }}>AIM</span><span style={{ color: "#fff" }}>28</span>
      </div>
      <div style={{ display: "flex", height: "100%", alignItems: "stretch", flex: 1, gap: 4, overflowX: "auto" }}>
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ background: "none", border: "none", fontFamily: "inherit", color: view === v ? "#fff" : T.steelDark, fontWeight: view === v ? 700 : 500, fontSize: 13.5, padding: "0 8px", cursor: "pointer", borderBottom: view === v ? `2px solid ${T.gold}` : "2px solid transparent", whiteSpace: "nowrap" }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
        <div style={{ textAlign: "right", lineHeight: 1.25 }}>
          <div style={{ fontSize: 11, color: T.steelDark }}>Signed in as</div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{userName}</div>
        </div>
        <div onClick={() => setMenuOpen(m => !m)}
          style={{ width: 34, height: 34, borderRadius: "50%", background: T.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {(userName[0] || "?").toUpperCase()}
        </div>
        {menuOpen && (
          <div style={{ position: "absolute", top: 44, right: 0, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px -6px rgba(0,37,66,.25)", minWidth: 200, zIndex: 200, overflow: "hidden" }}
            onMouseLeave={() => setMenuOpen(false)}>
            <div style={{ padding: "10px 16px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.cardBorder}`, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase" }}>
              {role === "trainer" ? "Trainer" : "Participant"} view
            </div>
            <div onClick={() => { setMenuOpen(false); if(window.confirm("Switch role? This will reset your session.")) { setOnboarded(false); setRole(null); setUserName(""); setUserEmail(""); setProgress({}); setReflections({}); }}}
              style={{ padding: "12px 16px", fontSize: 14, color: T.slate, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = T.highlight}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              ⇄ Switch role
            </div>
            <div onClick={() => { setMenuOpen(false); if(window.confirm("Reset all progress and start over?")) { setProgress({}); setReflections({}); setOnboarded(false); setRole(null); setUserName(""); setUserEmail(""); }}}
              style={{ padding: "12px 16px", fontSize: 14, color: "#c0392b", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${T.cardBorder}` }}
              onMouseEnter={e => e.currentTarget.style.background = "#fdf0f0"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              ↺ Restart demo
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────
function Dashboard({ userName, totalPts, completedCount, progress, onOpenModule }) {
  const pct = totalPts / TOTAL_PTS;
  const next = MODULES.find(m => !progress[m.id]);
  const badge = totalPts >= TOTAL_PTS;
  const board = [...SAMPLE_BOARD, { n: userName, pts: totalPts, isMe: true, badge }].sort((a, b) => b.pts - a.pts);

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", color: T.navy }}>Good to see you, {userName}.</div>
        <div style={{ width: 46, height: 3, background: T.gold, borderRadius: 2, margin: "12px 0" }} />
        <div style={{ fontSize: 16, color: T.muted }}>
          {completedCount === 0 ? "Start with Module 01 — Welcome and purpose." : `${completedCount} of ${MODULES.length} modules complete.${next ? ` Module ${next.id} is queued up next.` : " Outstanding work."}`}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Fluency points",    value: <><span style={{ fontSize: 30, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{totalPts}</span><span style={{ fontSize: 17, color: T.faint, fontWeight: 600 }}> / {TOTAL_PTS}</span></> },
          { label: "Modules complete",  value: <><span style={{ fontSize: 30, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{completedCount}</span><span style={{ fontSize: 17, color: T.faint, fontWeight: 600 }}> / {MODULES.length}</span></> },
          { label: "Current day",       value: <span style={{ fontSize: 30, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{completedCount < 6 ? "Day 1" : "Day 2"}</span> },
          { label: "Badge status",      value: badge
            ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 19, fontWeight: 800, color: T.success }}>Earned</span><UnlockedBadgeDot /></div>
            : <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}><span style={{ fontSize: 19, fontWeight: 800, color: T.muted }}>In progress</span><div style={{ width: 44, height: 44, borderRadius: "50%", background: T.badgeLock, display: "flex", alignItems: "center", justifyContent: "center" }}><PadlockSVG /></div></div>
          },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "center" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar + ring */}
      <div style={{ ...S.card, marginBottom: 20, display: "flex", alignItems: "center", gap: 36 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: T.navy }}>Overall progress</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: T.blue }}>{Math.round(pct * 100)}%</span>
          </div>
          <div style={{ background: T.trackBg, borderRadius: 100, height: 12, overflow: "hidden" }}>
            <div style={{ height: 12, borderRadius: 100, width: `${Math.min(100, pct * 100)}%`, background: `linear-gradient(90deg,${T.blue},#3f93c9 60%,${T.gold})`, transition: "width .6s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 12 }}>
            {totalPts} of {TOTAL_PTS} fluency points earned. {badge ? "AI Fluency Badge unlocked." : `${TOTAL_PTS - totalPts} points to unlock the AI fluency badge.`}
          </div>
        </div>
        <ProgressRing pct={pct} />
      </div>

      {/* Up next banner */}
      {next && (
        <div style={{ background: T.navy, borderRadius: 16, padding: "24px 28px", color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,.08)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, flexShrink: 0 }}>
            {String(next.id).padStart(2, "0")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.steel, marginBottom: 5 }}>Up next</div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Module {next.id}: {next.label}</div>
            <div style={{ fontSize: 14, color: T.steel, marginTop: 3 }}>{next.time} · {next.points} fluency points</div>
          </div>
          <Btn variant="gold" onClick={() => onOpenModule(next.id)}>Start module →</Btn>
        </div>
      )}

      {/* Leaderboard */}
      <div style={{ ...S.card, borderRadius: 16, padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>Cohort leaderboard</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.blue, cursor: "pointer" }}>View full cohort →</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {board.slice(0, 7).map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: p.isMe ? T.highlight : T.rowBg, border: p.isMe ? `1.5px solid ${T.blue}` : "1.5px solid transparent", borderRadius: 10, padding: "11px 16px" }}>
              <MedalCircle rank={i + 1} />
              <span style={{ flex: 1, fontWeight: p.isMe ? 700 : 600, fontSize: 15, color: T.navy }}>{p.n}{p.isMe ? " (you)" : ""}</span>
              {p.badge && <UnlockedBadgeDot />}
              <span style={{ fontWeight: 700, fontSize: 15, color: T.blue, minWidth: 56, textAlign: "right" }}>{p.pts} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModulesView({ progress, onOpenModule }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-0.4px", color: T.navy, marginBottom: 22 }}>Modules</div>
      {[1, 2].map(day => {
        const mods = MODULES.filter(m => m.day === day);
        return (
          <div key={day} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <Pill>{`Day ${day} · ${day === 1 ? "Foundations and prompting" : "Agents and automation"}`}</Pill>
              <div style={{ flex: 1, height: 1, background: "#DEE6EE" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {mods.map(m => {
                const done = !!progress[m.id];
                const pts  = progress[m.id] || 0;
                return (
                  <div key={m.id} onClick={() => onOpenModule(m.id)}
                    style={{ background: T.cardWhite, borderRadius: 13, border: `1px solid ${T.cardBorder}`, borderTop: `4px solid ${done ? T.success : T.blue}`, padding: "18px 20px", boxShadow: "0 2px 14px -6px rgba(0,55,93,.12)", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px -10px rgba(0,104,172,.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 14px -6px rgba(0,55,93,.12)"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: done ? T.successBg : T.highlight, color: done ? T.success : T.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
                        {String(m.id).padStart(2, "0")}
                      </div>
                      {done
                        ? <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.success, fontWeight: 700, fontSize: 12 }}>
                            <span style={{ width: 17, height: 17, borderRadius: "50%", background: T.success, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>Done
                          </div>
                        : <span style={{ fontWeight: 700, fontSize: 12, color: T.blue }}>{m.points} pts</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, marginBottom: 5 }}>{m.label}</div>
                    <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginBottom: 13 }}>{m.blurb}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                      <span style={{ color: T.faint }}>{m.time}</span>
                      <span style={{ color: done ? T.success : T.blue, fontWeight: 700 }}>{done ? `${pts} pts earned` : "Open →"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressView({ userName, totalPts, completedCount, progress, reflections, onReset }) {
  const pct = totalPts / TOTAL_PTS;
  const badge = totalPts >= TOTAL_PTS;

  function dlReport() {
    const lines = MODULES.map(m => `Module ${m.id}: ${m.label}\nStatus: ${progress[m.id] ? "Complete" : "Incomplete"}\nPoints: ${progress[m.id] || 0}\nReflection: ${reflections[m.id] || "(none)"}\n`);
    const out = `AIM28 Training Hub — Progress Report\nName: ${userName}\nDate: ${new Date().toLocaleDateString()}\nTotal points: ${totalPts}/${TOTAL_PTS}\n\n${lines.join("\n")}`;
    const a = document.createElement("a"); a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(out);
    a.download = `AIM28_Progress_${userName.replace(/\s/g, "_")}.txt`; a.click();
  }

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", color: T.navy }}>My learning record</div>
      <div style={{ width: 46, height: 3, background: T.gold, borderRadius: 2, margin: "12px 0 22px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 20, marginBottom: 24 }}>
        {/* Module list */}
        <div style={{ ...S.card, borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: T.navy, marginBottom: 16 }}>Module completion</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map(m => {
              const done = !!progress[m.id];
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: done ? T.successBg : T.rowBg, borderRadius: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: done ? T.success : T.trackBg, color: done ? "#fff" : T.faint, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    {done ? "✓" : String(m.id).padStart(2,"0")}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.navy }}>{m.label}</span>
                  {reflections[m.id] && <span title="Reflection saved" style={{ fontSize: 13, color: T.muted }}>📝</span>}
                  <span style={{ fontWeight: 700, fontSize: 13, color: done ? T.success : T.faint }}>{done ? `+${progress[m.id]} pts` : "—"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge + ring */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...S.card, borderRadius: 16, textAlign: "center", padding: "24px 20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: badge ? "radial-gradient(circle at 35% 30%,#F4E3AA,#E6BC4A 65%,#B4791A)" : T.badgeLock, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: badge ? "0 8px 20px -6px rgba(230,188,74,.6)" : "none", transition: "all .4s ease", position: "relative" }}>
              {badge ? <span style={{ color: "#fff", fontSize: 26 }}>★</span> : <>
                <PadlockSVG />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,.2)" }} />
              </>}
            </div>
            <div style={{ fontWeight: 700, color: T.navy, fontSize: 14 }}>AI Fluency Badge</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{badge ? "Earned!" : `${TOTAL_PTS - totalPts} pts to go`}</div>
          </div>
          <div style={{ ...S.card, borderRadius: 16, textAlign: "center", padding: "20px" }}>
            <ProgressRing pct={pct} size={72} stroke={7} />
            <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginTop: 10 }}>{totalPts} / {TOTAL_PTS}</div>
            <div style={{ fontSize: 12, color: T.muted }}>Fluency points</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={dlReport} small>Download progress report</Btn>
        <Btn onClick={() => window.open(`mailto:?subject=My AIM28 AI Fluency Progress&body=${encodeURIComponent(`AIM28 Progress: ${totalPts}/${TOTAL_PTS} points, ${completedCount}/${MODULES.length} modules complete`)}`)} small variant="ghost">Email progress</Btn>
        <Btn onClick={() => { if (window.confirm("Reset all progress? This cannot be undone.")) onReset(); }} small variant="ghost" style={{ marginLeft: "auto", color: "#c0392b", borderColor: "#c0392b" }}>Reset progress</Btn>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  {
    label: "Facilitation guide",
    format: "PDF",
    icon: "📋",
    desc: "Step-by-step delivery guide covering timing, discussion prompts, debrief questions, and facilitation tips for all 8 modules.",
    location: "Shared via SharePoint · CSI AIMpact Program Library",
  },
  {
    label: "Participant workbook",
    format: "PDF",
    icon: "📓",
    desc: "22-page participant workbook with module summaries, CRISP prompting worksheets, reflection pages, and the SOCS reference card.",
    location: "Shared via SharePoint · CSI AIMpact Program Library",
  },
  {
    label: "Master slide deck",
    format: "PPTX",
    icon: "🖥️",
    desc: "Full two-day slide deck in McKesson brand standards. Includes facilitator notes, activity slides, and all module visuals.",
    location: "Shared via SharePoint · CSI AIMpact Program Library",
  },
  {
    label: "Cohort roster and attendance",
    format: "XLSX",
    icon: "👥",
    desc: "Pre-populated cohort roster with attendance tracking, completion status, and fluency points per participant.",
    location: "Shared via SharePoint · CSI AIMpact Program Library",
  },
];

function ResourceModal({ resource, onClose }) {
  if (!resource) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,37,66,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.cardWhite, borderRadius: 16, padding: "32px 36px", maxWidth: 480, width: "90%", boxShadow: "0 30px 60px -20px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <Pill>{resource.format}</Pill>
            <div style={{ fontWeight: 800, fontSize: 22, color: T.navy, marginTop: 10 }}>{resource.icon} {resource.label}</div>
          </div>
          <button onClick={onClose} style={{ background: T.highlight, border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 15, color: T.slate }}>✕</button>
        </div>
        <p style={{ color: T.slate, fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>{resource.desc}</p>
        <div style={{ background: T.highlight, borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>📁</span>
          <span style={{ fontSize: 13, color: T.muted }}>{resource.location}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="primary" onClick={() => { window.open("https://sharepoint.com", "_blank"); onClose(); }}>
            Open in SharePoint →
          </Btn>
          <Btn variant="ghost" small onClick={() => {
            window.open(`mailto:?subject=AIM28 Resource Request: ${resource.label}&body=Please share the ${resource.label} for the AIM28 AI Fluency program.`);
          }}>
            Request via email
          </Btn>
        </div>
      </div>
    </div>
  );
}

function TrainerView({ onOpenModule }) {
  const [activeResource, setActiveResource] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", color: T.navy }}>Trainer dashboard</div>
        <Pill bg={T.navy} color="#fff">Facilitator access</Pill>
      </div>
      <div style={{ width: 46, height: 3, background: T.gold, borderRadius: 2, margin: "12px 0 24px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div style={{ ...S.card, borderRadius: 14, padding: "22px 26px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 16 }}>Pre-session checklist</div>
          {[
            { label: "Confirm date, time, and platform", done: true },
            { label: "Review the facilitation guide",   done: true },
            { label: "Prepare discussion prompts",      done: false },
            { label: "Test breakout rooms and polls",   done: false },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 3 ? `1px solid ${T.cardBorder}` : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: item.done ? T.success : "transparent", border: item.done ? "none" : `1.8px solid #C4CED8`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14.5, color: item.done ? T.slate : T.muted }}>{item.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ background: T.trackBg, borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ height: 6, borderRadius: 100, width: "50%", background: T.blue }} />
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>2 of 4 complete</div>
          </div>
        </div>

        <div style={{ ...S.card, borderRadius: 14, padding: "22px 26px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 16 }}>Quick links</div>
          {QUICK_LINKS.map((item, i, arr) => (
            <div key={i} onClick={() => setActiveResource(item)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.highlight}` : "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14.5, color: T.slate, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: T.faint }}>{item.format}</div>
                </div>
              </div>
              <span style={{ color: T.blue, fontWeight: 700, fontSize: 15 }}>→</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginBottom: 14 }}>Module facilitator views</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MODULES.map(m => (
          <div key={m.id} style={{ background: T.cardWhite, border: `1px solid ${T.cardBorder}`, borderRadius: 11, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: T.highlight, color: T.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
              {String(m.id).padStart(2,"0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{m.label}</div>
              <div style={{ fontSize: 12.5, color: T.faint }}>Day {m.day} · {m.time} · {m.points} pts</div>
            </div>
            <Btn small variant="ghost" onClick={() => onOpenModule(m.id)}>Facilitator view →</Btn>
          </div>
        ))}
      </div>

      <ResourceModal resource={activeResource} onClose={() => setActiveResource(null)} />
    </div>
  );
}

function ResourcesView() {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px", color: T.navy }}>Resources and references</div>
      <div style={{ width: 46, height: 3, background: T.gold, borderRadius: 2, margin: "12px 0 22px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "🖨️", label: "Print workbook", sub: "Full 22-page workbook, print-optimized", action: () => window.print() },
          { icon: "✉️", label: "Email materials", sub: "Send key resources to your inbox", action: () => window.open("mailto:?subject=AIM28 AI Fluency Program Materials") },
          { icon: "☁️", label: "Save to OneDrive", sub: "Archive your materials in the cloud", action: () => window.open("https://onedrive.live.com","_blank") },
          { icon: "💬", label: "AI Community of Practice", sub: "Teams: share progress and ask questions", action: () => {} },
          { icon: "🔗", label: "McKNet AI Hub", sub: "Guides, videos, and colleague use cases", action: () => {} },
          { icon: "📋", label: "AI Use Case Intake", sub: "Bring forward your improvement ideas", action: () => window.open("mailto:AskAI@McKesson.com") },
        ].map((r, i) => (
          <div key={i} onClick={r.action}
            style={{ background: T.cardWhite, border: `1px solid ${T.cardBorder}`, borderRadius: 13, padding: "18px 20px", cursor: "pointer", transition: "border-color .15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.cardBorder}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.navy, marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 13, color: T.muted }}>{r.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.ink, borderRadius: 14, padding: "22px 28px", color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Evidence and references</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 13, lineHeight: 1.7, color: T.steel }}>
          {[
            ["Responsible AI",    "NIST AI RMF 1.0 · Microsoft Responsible AI Standard v2 · Cloud Security Alliance (2026)"],
            ["AI Behavior & Risk","IBM Cost of a Data Breach Report (2025) · Vectra AI (2026) · Anthropic sycophancy research (2023)"],
            ["Learning Design",   "Knowles: The Adult Learner · Kolb: Experiential Learning (1984) · Roediger & Karpicke (2006)"],
            ["Internal Alignment","CSI AIM28 program outcomes · McKesson approved-tools guidance (Copilot Chat, M365)"],
          ].map(([cat, text], i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, color: T.gold, marginBottom: 6, borderBottom: `1px solid rgba(230,188,74,.3)`, paddingBottom: 4 }}>{cat}</div>
              <div>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AIM28Hub() {
  const [onboarded, setOnboarded] = usePersisted("aim28v3_onboarded", false);
  const [role,      setRole]      = usePersisted("aim28v3_role", null);
  const [userName,  setUserName]  = usePersisted("aim28v3_name", "");
  const [userEmail, setUserEmail] = usePersisted("aim28v3_email", "");
  const [progress,  setProgress]  = usePersisted("aim28v3_progress", {});
  const [reflections, setReflections] = usePersisted("aim28v3_refs", {});
  const [view,      setView]      = useState("home");
  const [drawer,    setDrawer]    = useState(null);

  const totalPts       = Object.values(progress).reduce((s, v) => s + (v || 0), 0);
  const completedCount = Object.keys(progress).filter(k => progress[k] > 0).length;

  function handleOnboard(name, email, r) {
    setUserName(name); setUserEmail(email); setRole(r); setOnboarded(true);
  }

  function handleClaim(moduleId, pts) {
    setProgress(prev => ({ ...prev, [moduleId]: pts }));
  }

  function handleSaveReflection(moduleId, text) {
    setReflections(prev => ({ ...prev, [moduleId]: text }));
  }

  function handleReset() {
    setProgress({}); setReflections({});
  }

  if (!onboarded || !role) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <Onboard onDone={handleOnboard} />
      </>
    );
  }

  const activeModule = drawer ? MODULES.find(m => m.id === drawer) : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Libre Franklin', system-ui, sans-serif; background: ${T.pageBg}; color: ${T.navy}; }
        @media print { nav { display: none !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav view={view} setView={setView} userName={userName} role={role} setOnboarded={setOnboarded} setRole={setRole} setUserName={setUserName} setUserEmail={setUserEmail} setProgress={setProgress} setReflections={setReflections} />

        <main style={{ flex: 1, maxWidth: 1140, margin: "0 auto", padding: "38px 48px", width: "100%" }}>
          {view === "home"      && <Dashboard userName={userName} totalPts={totalPts} completedCount={completedCount} progress={progress} onOpenModule={id => setDrawer(id)} />}
          {view === "modules"   && <ModulesView progress={progress} onOpenModule={id => setDrawer(id)} />}
          {view === "progress"  && <ProgressView userName={userName} totalPts={totalPts} completedCount={completedCount} progress={progress} reflections={reflections} onReset={handleReset} />}
          {view === "trainer" && role === "trainer" && <TrainerView onOpenModule={id => setDrawer(id)} />}
          {view === "resources" && <ResourcesView />}
        </main>
      </div>

      {activeModule && (
        <Drawer
          module={activeModule}
          progress={progress}
          reflections={reflections}
          role={role}
          onClose={() => setDrawer(null)}
          onClaim={handleClaim}
          onSaveReflection={handleSaveReflection}
        />
      )}
    </>
  );
}
