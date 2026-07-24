import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://dfoirzqmqezomgfbcncx.supabase.co",
  "sb_publishable_ktYshEjlmAzMjFnpWZkSSw_1MTdq_Lr",
  {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}
function getOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
const TODAY = dateKey(new Date());
function genLog(rate) {
  const log = {};
  for (let i = 1; i < 45; i++) {
    let r = rate;
    if (i >= 14 && i <= 17) r *= 0.15;
    if (i >= 7 && i <= 9) r *= 0.45;
    if (Math.random() < r) log[dateKey(getOffset(i))] = true;
  }
  return log;
}
function getStreak(log) {
  let s = 0,
    start = log[TODAY] ? 0 : 1;
  for (let i = start; i < 90; i++) {
    if (log[dateKey(getOffset(i))]) s++;
    else break;
  }
  return s;
}
function successRate(log, days = 28) {
  let done = 0;
  for (let i = 0; i < days; i++) if (log[dateKey(getOffset(i))]) done++;
  return Math.round((done / days) * 100);
}

const DNAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MEDALS = ["🥇", "🥈", "🥉", ""];

const INIT_HABITS = [
  {
    id: 1,
    name: "Hit the gym",
    color: "#4FC3F7",
    log: genLog(0.82),
    identity: "Athletes who never miss a training session",
    stack: "After morning practice",
    blueprint: {
      type: "build",
      identity: "I am an athlete who never misses a training session",
      cue: "After morning practice, in my gym bag already packed the night before",
      attractive: "I train with my crew — we hold each other to it",
      easy: "Even on tired days, I show up for just the warm-up. Showing up is the win.",
      satisfying:
        "I log it here and watch my streak grow. My squad sees I showed up.",
    },
  },
  {
    id: 2,
    name: "Protein goal",
    color: "#81C784",
    log: genLog(0.75),
    identity: "Athletes who fuel their body with purpose",
    stack: "After the gym",
    blueprint: {
      type: "build",
      identity: "I am someone who fuels my body with purpose",
      cue: "Right after my workout, shaker already prepped",
      attractive: "I pair it with my favorite post-workout playlist",
      easy: "One scoop minimum. The two-minute version is just the shake.",
      satisfying: "I feel the recovery the next day in how I move.",
    },
  },
  {
    id: 3,
    name: "Sleep 8 hours",
    color: "#CE93D8",
    log: genLog(0.68),
    identity: "Athletes who recover like professionals",
    stack: "Non-negotiable",
    blueprint: {
      type: "build",
      identity: "I am someone who recovers like a professional",
      cue: "Phone on the charger across the room by 10pm",
      attractive: "I read a few pages of a book I actually enjoy",
      easy: "Just get in bed by 10. Even resting counts.",
      satisfying: "I wake up sharp instead of dragging.",
    },
  },
  {
    id: 4,
    name: "Visualize",
    color: "#FFB74D",
    log: genLog(0.6),
    identity: "Athletes who train their mind as hard as their body",
    stack: "After waking up",
    blueprint: {
      type: "build",
      identity: "I am someone who trains my mind as hard as my body",
      cue: "Right after I wake up, before I check my phone",
      attractive: "I picture the exact moment I want in my next game",
      easy: "Just 60 seconds of seeing it clearly.",
      satisfying: "I walk into practice already feeling it.",
    },
  },
];
const INIT_ANTI = [
  {
    id: 10,
    name: "No late nights",
    color: "#F06292",
    guarded: genLog(0.55),
    conflict: "Staying up past midnight kills your recovery.",
    icon: "🌙",
  },
  {
    id: 11,
    name: "No junk food",
    color: "#FF8A65",
    guarded: genLog(0.62),
    conflict: "Every bad meal votes for who you used to be.",
    icon: "🍕",
  },
];
const MEMBERS = [
  {
    name: "Carter",
    pct: 81,
    streak: 9,
    votes: 67,
    trend: "up",
    color: "#4FC3F7",
    isYou: true,
    isCap: true,
  },
  {
    name: "Marcus",
    pct: 94,
    streak: 14,
    votes: 78,
    trend: "up",
    color: "#81C784",
  },
  {
    name: "Devon",
    pct: 72,
    streak: 5,
    votes: 59,
    trend: "down",
    color: "#FFB74D",
  },
  {
    name: "Jaylen",
    pct: 58,
    streak: 3,
    votes: 47,
    trend: "up",
    color: "#F06292",
  },
];
const GROUP = {
  name: "Summer Grind",
  code: "SMRGR7",
  identity:
    "We are the kind of athletes who show up every single day, even when nobody is watching.",
};

function HabitCard({ h, done, onDone, onUndo }) {
  const [prog, setProg] = useState(0);
  const [holding, setHolding] = useState(false);
  const iRef = useRef(null);
  const pRef = useRef(0);
  const streak = getStreak(h.log);

  function startHold(e) {
    e.preventDefault();
    if (done) {
      onUndo();
      return;
    }
    setHolding(true);
    pRef.current = 0;
    iRef.current = setInterval(() => {
      pRef.current += 2.2;
      setProg(pRef.current);
      if (pRef.current >= 100) {
        clearInterval(iRef.current);
        setHolding(false);
        pRef.current = 0;
        setProg(0);
        onDone();
      }
    }, 28);
  }
  function endHold() {
    if (pRef.current < 100) {
      clearInterval(iRef.current);
      setHolding(false);
      pRef.current = 0;
      setProg(0);
    }
  }
  useEffect(() => () => clearInterval(iRef.current), []);

  // Light builds behind the card as you hold
  const glowSize = 20 + prog * 1.8;
  const glowOpacity = (prog / 100) * 0.85;
  const cardLift = holding ? (prog / 100) * 6 : 0;

  return (
    <div
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      style={{
        width: "100%",
        height: 210,
        borderRadius: 22,
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        transform: holding
          ? `scale(${1 + (prog / 100) * 0.02}) translateY(-${cardLift}px)`
          : "scale(1)",
        transition: holding
          ? "none"
          : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* LIGHT BUILDING BEHIND CARD */}
      {holding && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 22,
            pointerEvents: "none",
            zIndex: 0,
            boxShadow: `0 0 ${glowSize}px ${glowSize * 0.6}px ${
              h.color
            }${Math.round(glowOpacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
            background: `radial-gradient(ellipse at center, ${
              h.color
            }${Math.round(glowOpacity * 40)
              .toString(16)
              .padStart(2, "0")} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* CARD BODY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          overflow: "hidden",
          zIndex: 1,
          border: `1px solid ${
            done
              ? h.color + "50"
              : holding
              ? h.color +
                Math.round((prog / 100) * 120)
                  .toString(16)
                  .padStart(2, "0")
              : "rgba(255,255,255,0.08)"
          }`,
          background: done ? `${h.color}12` : "rgba(255,255,255,0.04)",
          transition: done ? "all 0.3s" : "border-color 0.1s",
        }}
      >
        {/* Color rising from bottom as you hold */}
        {holding && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: `${prog}%`,
              background: `linear-gradient(to top, ${h.color}22, transparent)`,
              transition: "height 0.04s",
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              marginBottom: 10,
            }}
          >
            {h.stack}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: done ? "rgba(255,255,255,0.4)" : "#fff",
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              marginBottom: 12,
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {h.name}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              marginBottom: 3,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {done ? "✓ Voted for:" : "I want to become"}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.55,
              color: done ? h.color : "rgba(255,255,255,0.45)",
              fontStyle: done ? "normal" : "italic",
            }}
          >
            {h.identity}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.55)",
            border: `1px solid ${
              streak > 0 ? h.color + "40" : "rgba(255,255,255,0.08)"
            }`,
            borderRadius: 12,
            padding: "6px 10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              lineHeight: 1,
              color: streak > 0 ? h.color : "rgba(255,255,255,0.25)",
            }}
          >
            {streak}
          </div>
          <div
            style={{
              fontSize: 7,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "rgba(255,255,255,0.3)",
              marginTop: 1,
            }}
          >
            days
          </div>
        </div>

        {!done && !holding && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              fontSize: 8,
              color: "rgba(255,255,255,0.18)",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            hold to log
          </div>
        )}
        {holding && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: h.color,
              fontWeight: 700,
            }}
          >
            {Math.round(prog)}%
          </div>
        )}
      </div>
    </div>
  );
}

function GuardItem({ h, guarded, onGuard, onBreak, onDetail }) {
  const [prog, setProg] = useState(0);
  const [holding, setHolding] = useState(false);
  const iRef = useRef(null);
  const pRef = useRef(0);
  function startHold(e) {
    e.preventDefault();
    if (guarded) {
      onBreak();
      return;
    }
    setHolding(true);
    pRef.current = 0;
    iRef.current = setInterval(() => {
      pRef.current += 3;
      setProg(pRef.current);
      if (pRef.current >= 100) {
        clearInterval(iRef.current);
        setHolding(false);
        pRef.current = 0;
        setProg(0);
        onGuard();
      }
    }, 28);
  }
  function endHold() {
    if (pRef.current < 100) {
      clearInterval(iRef.current);
      setHolding(false);
      pRef.current = 0;
      setProg(0);
    }
  }
  useEffect(() => () => clearInterval(iRef.current), []);
  const glowSize = 10 + prog * 0.9;
  const glowOpacity = (prog / 100) * 0.8;
  return (
    <div style={{ position: "relative" }}>
      {holding && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            pointerEvents: "none",
            zIndex: 0,
            boxShadow: `0 0 ${glowSize}px ${glowSize * 0.6}px ${
              h.color
            }${Math.round(glowOpacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
          }}
        />
      )}
      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 14,
          padding: "12px 14px",
          position: "relative",
          zIndex: 1,
          border: `1px solid ${
            guarded
              ? h.color + "40"
              : holding
              ? h.color +
                Math.round((prog / 100) * 120)
                  .toString(16)
                  .padStart(2, "0")
              : "rgba(255,255,255,0.06)"
          }`,
          cursor: "pointer",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
          transition: holding ? "none" : "border-color 0.3s",
          transform: holding
            ? `scale(${1 + (prog / 100) * 0.015})`
            : "scale(1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: guarded ? h.color : "rgba(255,255,255,0.08)",
            borderRadius: "3px 0 0 3px",
            transition: "background 0.3s",
          }}
        />
        {holding && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: `${prog}%`,
              background: `linear-gradient(to top, ${h.color}22, transparent)`,
              transition: "height 0.04s",
              pointerEvents: "none",
            }}
          />
        )}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: guarded ? `${h.color}18` : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {h.icon}
        </div>
        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: guarded ? h.color : "rgba(255,255,255,0.6)",
              marginBottom: 2,
            }}
          >
            {h.name}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.22)",
              lineHeight: 1.4,
            }}
          >
            {h.conflict}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: guarded ? h.color : "rgba(255,255,255,0.18)",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {holding ? `${Math.round(prog)}%` : guarded ? "held ✓" : "hold"}
        </div>
        {onDetail && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            style={{
              flexShrink: 0,
              marginLeft: 2,
              padding: "4px 6px",
              color: "rgba(255,255,255,0.25)",
              fontSize: 15,
              cursor: "pointer",
              zIndex: 2,
              position: "relative",
            }}
          >
            ›
          </div>
        )}
      </div>
    </div>
  );
}

function Flash({ text, color, guard, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 90,
        pointerEvents: "none",
        animation: "vf 2.2s ease forwards",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.93)",
          border: `1.5px solid ${color}`,
          borderRadius: 20,
          padding: "16px 22px",
          textAlign: "center",
          maxWidth: 240,
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "2px",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {guard
            ? "Ground held · light protected"
            : "Vote cast for your identity"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.5 }}>
          {text}
        </div>
        <div
          style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 5 }}
        >
          {guard ? "darkness loses ground" : "1% closer · every day counts"}
        </div>
      </div>
    </div>
  );
}

function LineChart({ values, color }) {
  const n = values.length,
    W = 300,
    H = 70,
    pl = 4,
    pr = 4,
    pt = 4,
    pb = 4;
  const iW = W - pl - pr,
    iH = H - pt - pb;
  const xp = (i) => pl + (i / (n - 1)) * iW;
  const yp = (v) => pt + iH - (Math.max(0, Math.min(100, v)) / 100) * iH;
  const path = values
    .map(
      (v, i) => `${i === 0 ? "M" : "L"}${xp(i).toFixed(1)},${yp(v).toFixed(1)}`
    )
    .join(" ");
  const gid = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${xp(n - 1)},${pt + iH} L${xp(0)},${pt + iH} Z`}
        fill={`url(#${gid})`}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HabitDetail({ h, isAnti, onClose, onSaveBlueprint, T, darkMode }) {
  const M = "'DM Mono',monospace";
  const F = "'Bebas Neue',sans-serif";
  const S = "'Syne',sans-serif";
  const [editing, setEditing] = useState(false);
  const bp = h.blueprint || {};
  const [draft, setDraft] = useState(bp);
  const logSource = isAnti ? h.guarded : h.log;

  // Stats
  const weeks = 8;
  const today = new Date();
  const todayDow = today.getDay();
  let totalDone = 0,
    totalMissed = 0;
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const key = dateKey(getOffset(i));
    if (logSource[key]) totalDone++;
    else totalMissed++;
  }
  let currentMissStreak = 0;
  for (let i = 0; i < weeks * 7; i++) {
    if (!logSource[dateKey(getOffset(i))]) currentMissStreak++;
    else break;
  }
  const rate = Math.round((totalDone / (totalDone + totalMissed)) * 100);
  const streak = getStreak(logSource);

  // Heatmap grid
  const grid = [];
  for (let dow = 0; dow < 7; dow++) {
    const row = [];
    for (let w = 0; w < weeks; w++) {
      const daysAgo = (weeks - 1 - w) * 7 + (todayDow - dow);
      if (daysAgo < 0) {
        row.push(null);
        continue;
      }
      const d = getOffset(daysAgo);
      row.push({
        key: dateKey(d),
        done: !!logSource[dateKey(d)],
        isToday: dateKey(d) === TODAY,
      });
    }
    grid.push(row);
  }

  // Missed list
  const missedList = [];
  for (let i = 0; i < 56; i++) {
    const d = getOffset(i);
    if (!logSource[dateKey(d)]) missedList.push(d);
    if (missedList.length >= 8) break;
  }

  const isBuild = bp.type === "build" || !isAnti;

  // Blueprint fields depend on type
  const buildFields = [
    { key: "identity", label: "Who I'm becoming", ph: "I am someone who..." },
    { key: "cue", label: "Make it obvious — when & where", ph: "After I..." },
    { key: "attractive", label: "Make it attractive", ph: "I pair it with..." },
    { key: "easy", label: "Make it easy — two-minute version", ph: "Just..." },
    {
      key: "satisfying",
      label: "Make it satisfying — the reward",
      ph: "I get to...",
    },
  ];
  const reclaimFields = [
    {
      key: "identity",
      label: "The identity I'm reclaiming",
      ph: "I am someone who...",
    },
    {
      key: "oldBehavior",
      label: "What I'm reclaiming from",
      ph: "The old behavior...",
    },
    { key: "cue", label: "The cue that triggers it", ph: "It happens when..." },
    {
      key: "craving",
      label: "The craving underneath",
      ph: "What I'm really after...",
    },
    { key: "environment", label: "My environment change", ph: "I changed..." },
    { key: "replacement", label: "What I do instead", ph: "Instead I..." },
  ];
  const fields = isBuild ? buildFields : reclaimFields;

  const inp = {
    width: "100%",
    background: T.inp,
    border: `1px solid ${T.br}`,
    borderRadius: 12,
    padding: "11px 13px",
    color: T.tx,
    fontFamily: S,
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    resize: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
    marginTop: 4,
  };

  function save() {
    onSaveBlueprint(h.id, isAnti, {
      ...draft,
      type: bp.type || (isAnti ? "reclaim" : "build"),
    });
    setEditing(false);
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 95,
        background: darkMode ? "#000" : "#f0ede8",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s ease",
      }}
    >
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: `1px solid ${T.br}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.txS,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: S,
              fontWeight: 700,
              padding: 0,
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => {
              if (editing) {
                save();
              } else {
                setDraft(bp);
                setEditing(true);
              }
            }}
            style={{
              background: editing ? T.ac : T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 10,
              padding: "7px 13px",
              color: editing ? T.acTx : T.txS,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: S,
            }}
          >
            {editing ? "Save" : "Edit system"}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: h.color,
            }}
          />
          {isAnti && (
            <span
              style={{
                fontFamily: M,
                fontSize: 8,
                color: "rgba(255,210,100,0.7)",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Reclaim
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: F,
            fontSize: 34,
            color: T.tx,
            lineHeight: 1.05,
            letterSpacing: "-0.5px",
          }}
        >
          {isAnti ? bp.identity || h.name : h.name}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 30px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <div
            style={{
              flex: 1,
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 13,
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: F,
                fontSize: 28,
                color: h.color,
                lineHeight: 1,
              }}
            >
              {rate}%
            </div>
            <div
              style={{
                fontFamily: M,
                fontSize: 8,
                color: T.txH,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: 3,
              }}
            >
              {isAnti ? "held" : "success"}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 13,
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: F,
                fontSize: 28,
                color: T.tx,
                lineHeight: 1,
              }}
            >
              {streak}
            </div>
            <div
              style={{
                fontFamily: M,
                fontSize: 8,
                color: T.txH,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: 3,
              }}
            >
              streak
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 13,
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: F,
                fontSize: 28,
                color: totalMissed > 0 ? "#F06292" : T.tx,
                lineHeight: 1,
              }}
            >
              {totalMissed}
            </div>
            <div
              style={{
                fontFamily: M,
                fontSize: 8,
                color: T.txH,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: 3,
              }}
            >
              missed
            </div>
          </div>
        </div>

        {/* THE BLUEPRINT — the answers resurfaced */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: M,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "1px",
              color: T.txH,
              textTransform: "uppercase",
            }}
          >
            Your blueprint
          </div>
          <div style={{ flex: 1, height: 1, background: T.br }} />
          {!editing && (
            <div
              style={{
                fontFamily: M,
                fontSize: 8,
                color: T.txM,
                fontStyle: "italic",
              }}
            >
              tap edit to refine
            </div>
          )}
        </div>

        {bp && Object.keys(bp).length > 0 ? (
          <div
            style={{
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 16,
              padding: "4px 0",
              marginBottom: 18,
            }}
          >
            {fields.map((f, i) => (
              <div
                key={f.key}
                style={{
                  padding: "13px 16px",
                  borderBottom:
                    i < fields.length - 1 ? `1px solid ${T.br}` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: M,
                    fontSize: 8,
                    color: h.color,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: editing ? 0 : 4,
                  }}
                >
                  {f.label}
                </div>
                {editing ? (
                  <textarea
                    rows={2}
                    value={draft[f.key] || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, [f.key]: e.target.value })
                    }
                    placeholder={f.ph}
                    style={inp}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color: T.tx,
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {bp[f.key] || (
                      <span style={{ color: T.txM, fontStyle: "italic" }}>
                        Not set — tap edit to add
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 14,
              padding: "18px",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 13, color: T.txS, marginBottom: 4 }}>
              No blueprint yet
            </div>
            <div style={{ fontSize: 11, color: T.txH, lineHeight: 1.5 }}>
              Tap "Edit system" to build out the why behind this habit.
            </div>
          </div>
        )}

        {editing && (
          <button
            onClick={save}
            style={{
              width: "100%",
              padding: "14px",
              background: T.ac,
              border: "none",
              borderRadius: 14,
              color: T.acTx,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: S,
              marginBottom: 18,
            }}
          >
            Save my blueprint
          </button>
        )}

        {/* Heatmap */}
        <div
          style={{
            fontFamily: M,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "1px",
            color: T.txH,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Last 8 weeks
        </div>
        <div
          style={{
            background: T.sf,
            border: `1px solid ${T.br}`,
            borderRadius: 15,
            padding: "14px",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                justifyContent: "space-around",
                marginRight: 2,
              }}
            >
              {["", "M", "", "W", "", "F", ""].map((l, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: M,
                    fontSize: 8,
                    color: T.txM,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {Array.from({ length: 8 }, (_, w) => (
                <div
                  key={w}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {grid.map((row, dow) => {
                    const cell = row[w];
                    if (!cell) return <div key={dow} style={{ height: 18 }} />;
                    return (
                      <div
                        key={dow}
                        style={{
                          height: 18,
                          borderRadius: 4,
                          background: cell.done
                            ? h.color
                            : darkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                          border: cell.isToday
                            ? `1.5px solid ${h.color}`
                            : "1px solid transparent",
                          opacity: cell.done ? 1 : 0.6,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missed days */}
        <div
          style={{
            fontFamily: M,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "1px",
            color: T.txH,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Days you missed
        </div>
        {missedList.length === 0 ? (
          <div
            style={{
              background: T.sf,
              border: `1px solid ${h.color}30`,
              borderRadius: 13,
              padding: "18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, color: h.color, fontWeight: 700 }}>
              Perfect record ✦
            </div>
            <div style={{ fontSize: 11, color: T.txH, marginTop: 4 }}>
              No missed days in 8 weeks.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {missedList.map((d, i) => {
              const daysAgo = Math.round(
                (new Date(TODAY) - new Date(dateKey(d))) / 86400000
              );
              const label =
                daysAgo === 0
                  ? "Today"
                  : daysAgo === 1
                  ? "Yesterday"
                  : `${daysAgo} days ago`;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 12,
                    padding: "11px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#F06292",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.tx }}>
                      {d.toLocaleDateString("en", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 9,
                        color: T.txM,
                        marginTop: 1,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentMissStreak >= 2 && (
          <div
            style={{
              marginTop: 14,
              background: "rgba(240,98,146,0.08)",
              border: "1px solid rgba(240,98,146,0.2)",
              borderRadius: 13,
              padding: "13px 15px",
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "1px",
                color: "#F06292",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Never miss twice
            </div>
            <div style={{ fontSize: 12, color: T.txS, lineHeight: 1.55 }}>
              You've missed {currentMissStreak} days in a row.{" "}
              {isBuild
                ? bp.easy
                  ? `Remember your two-minute version: "${bp.easy}"`
                  : "Get back on track today."
                : bp.replacement
                ? `Remember your replacement: "${bp.replacement}"`
                : "Get back on track today."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BuildFlow({ onComplete, onCancel, T, darkMode }) {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState("create");
  const [habitText, setHabitText] = useState("");
  const [timeLocation, setTimeLocation] = useState("");
  const [badHabit, setBadHabit] = useState("");
  const [anchor, setAnchor] = useState("");
  const [person, setPerson] = useState("");
  const [days, setDays] = useState([]);
  const [goalCount, setGoalCount] = useState(1);
  const [goalUnit, setGoalUnit] = useState("times");
  const [habitTime, setHabitTime] = useState("07:00");
  const [reminder, setReminder] = useState(true);
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState("#4FC3F7");
  const M = "'DM Mono',monospace";
  const F = "'Bebas Neue',sans-serif";
  const S = "'Syne',sans-serif";
  const TOTAL = 6;
  const COLORS = [
    "#4FC3F7",
    "#81C784",
    "#FFB74D",
    "#F06292",
    "#CE93D8",
    "#4DB6AC",
    "#FF8A65",
  ];
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const UNITS = [
    "times",
    "seconds",
    "minutes",
    "hours",
    "steps",
    "reps",
    "pages",
    "milligrams",
    "grams",
    "kilograms",
    "pounds",
    "ounces",
    "cups",
    "milliliters",
    "liters",
    "calories",
  ];

  const inp = {
    width: "100%",
    background: T.inp,
    border: `1px solid ${T.br}`,
    borderRadius: 14,
    padding: "14px 16px",
    color: T.tx,
    fontFamily: S,
    fontSize: 15,
    fontWeight: 600,
    outline: "none",
    resize: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
  };
  const prim = (ok) => ({
    width: "100%",
    padding: "15px",
    background: ok ? T.ac : T.inp,
    border: "none",
    borderRadius: 14,
    color: ok ? T.acTx : T.txH,
    fontSize: 15,
    fontWeight: 800,
    cursor: ok ? "pointer" : "default",
    fontFamily: S,
    opacity: ok ? 1 : 0.5,
    marginTop: 24,
  });
  const sec = {
    width: "100%",
    padding: "13px",
    background: "transparent",
    border: `1px solid ${T.br}`,
    borderRadius: 14,
    color: T.txS,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: S,
    marginTop: 8,
  };
  const wrap = {
    position: "absolute",
    inset: 0,
    zIndex: 96,
    background: darkMode ? "#000" : "#f0ede8",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.3s ease",
  };
  const pad = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px 26px 40px",
    overflowY: "auto",
    minHeight: 0,
  };
  const lbl = {
    fontFamily: M,
    fontSize: 9,
    color: T.txH,
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    margin: "14px 0 6px",
  };

  const statement =
    kind === "create"
      ? `I will ${habitText.trim()} at ${timeLocation.trim()} so that I can become ${person.trim()}.`
      : kind === "replace"
      ? `I will replace ${badHabit.trim()} with ${habitText.trim()} at ${timeLocation.trim()} so that I can become ${person.trim()}.`
      : `After ${anchor.trim()}, I will ${habitText.trim()} so that I can become ${person.trim()}.`;
  const stmtOk =
    kind === "create"
      ? !!(habitText.trim() && timeLocation.trim() && person.trim())
      : kind === "replace"
      ? !!(
          badHabit.trim() &&
          habitText.trim() &&
          timeLocation.trim() &&
          person.trim()
        )
      : !!(anchor.trim() && habitText.trim() && person.trim());
  const cueLabel =
    kind === "stack"
      ? `after ${anchor.trim()}`
      : kind === "replace"
      ? `instead of ${badHabit.trim()}`
      : timeLocation.trim();
  const fmtTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  const toggleDay = (d) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const sortedDays = DAYS.filter((d) => days.includes(d));

  function PB() {
    return (
      <div
        style={{
          height: 2,
          background: T.br,
          borderRadius: 1,
          marginBottom: 26,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: T.ac,
            borderRadius: 1,
            width: `${(step / TOTAL) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    );
  }
  function SH({ n, chapter, title, sub }) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {n} of {TOTAL}
          </span>
          <span
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              letterSpacing: "0.5px",
              fontStyle: "italic",
            }}
          >
            {chapter}
          </span>
        </div>
        <div
          style={{
            fontFamily: F,
            fontSize: 34,
            color: T.tx,
            lineHeight: 1.05,
            marginBottom: 8,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.txS,
            fontWeight: 600,
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          {sub}
        </div>
      </>
    );
  }
  function BK({ to }) {
    return (
      <button
        onClick={() => setStep(to)}
        style={{
          background: "none",
          border: "none",
          color: T.txH,
          fontFamily: S,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          alignSelf: "flex-start",
          padding: 0,
          marginBottom: 16,
        }}
      >
        ← Back
      </button>
    );
  }

  if (step === 0)
    return (
      <div style={wrap}>
        <div style={{ ...pad, justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div
              style={{
                width: 34,
                height: 34,
                margin: "0 auto 18px",
                color: T.tx,
              }}
            >
              <svg
                viewBox="0 0 28 28"
                fill="none"
                style={{ width: "100%", height: "100%" }}
              >
                <polygon
                  points="14,2 26,10 26,18 14,26 2,18 2,10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <polygon
                  points="14,6 22,11 22,17 14,22 6,17 6,11"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  strokeLinejoin="round"
                  opacity="0.4"
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily: F,
                fontSize: 44,
                color: T.tx,
                lineHeight: 1,
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              ADD A HABIT
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.txS,
                fontWeight: 600,
                lineHeight: 1.7,
                maxWidth: 280,
                margin: "0 auto",
              }}
            >
              Three ways to build. Pick the one that fits.
            </div>
          </div>
          {[
            {
              k: "create",
              t: "Create a habit",
              d: "Start something new, tied to who you're becoming.",
            },
            {
              k: "replace",
              t: "Replace a bad habit",
              d: "Swap a habit that isn't serving you for one that does.",
            },
            {
              k: "stack",
              t: "Create a habit stack",
              d: "Attach the new habit to one you already do.",
            },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => {
                setKind(o.k);
                setStep(1);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                background: T.sf,
                border: `1px solid ${T.br}`,
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: S,
                  fontSize: 16,
                  fontWeight: 800,
                  color: T.tx,
                  marginBottom: 3,
                }}
              >
                {o.t}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.txS,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  fontFamily: S,
                }}
              >
                {o.d}
              </div>
            </button>
          ))}
          <button onClick={onCancel} style={sec}>
            Maybe later
          </button>
        </div>
      </div>
    );

  if (step === 1)
    return (
      <div style={wrap}>
        <div style={pad}>
          <BK to={0} />
          <PB />
          <SH
            n="Step 1"
            chapter={
              kind === "create"
                ? "Clear · Implementation intention"
                : kind === "replace"
                ? "Clear · Habit replacement"
                : "Clear · Habit stacking"
            }
            title="Design your statement."
            sub={
              kind === "create"
                ? "Fill in the blanks. A habit with a time, a place, and an identity behind it is hard to skip."
                : kind === "replace"
                ? "Name the habit you're done with, and what takes its place."
                : "Anchor the new habit to something you already do every day."
            }
          />
          {kind === "replace" && (
            <>
              <div style={lbl}>I will replace</div>
              <input
                autoFocus
                value={badHabit}
                onChange={(e) => setBadHabit(e.target.value)}
                placeholder="e.g. scrolling in bed"
                style={inp}
              />
              <div style={lbl}>With</div>
              <input
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                placeholder="e.g. reading 10 pages"
                style={inp}
              />
            </>
          )}
          {kind === "stack" && (
            <>
              <div style={lbl}>After</div>
              <input
                autoFocus
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
                placeholder="e.g. I pour my morning coffee"
                style={inp}
              />
              <div style={lbl}>I will</div>
              <input
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                placeholder="e.g. do 10 pushups"
                style={inp}
              />
            </>
          )}
          {kind === "create" && (
            <>
              <div style={lbl}>I will</div>
              <input
                autoFocus
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                placeholder="e.g. read 10 pages"
                style={inp}
              />
            </>
          )}
          {kind !== "stack" && (
            <>
              <div style={lbl}>At (time & location)</div>
              <input
                value={timeLocation}
                onChange={(e) => setTimeLocation(e.target.value)}
                placeholder="e.g. 9 PM, on the couch"
                style={inp}
              />
            </>
          )}
          <div style={lbl}>So that I can become</div>
          <input
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="e.g. a reader"
            style={inp}
          />
          <div
            style={{
              background: T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Your statement
            </div>
            <div
              style={{
                fontSize: 13,
                color: stmtOk ? T.tx : T.txH,
                fontWeight: 600,
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              {stmtOk
                ? `"${statement}"`
                : "Fill in the blanks above to see it."}
            </div>
          </div>
          <button
            onClick={() => {
              if (!stmtOk) return;
              if (!shortName.trim())
                setShortName(habitText.trim().slice(0, 28));
              setStep(2);
            }}
            style={prim(stmtOk)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  if (step === 2)
    return (
      <div style={wrap}>
        <div style={pad}>
          <BK to={1} />
          <PB />
          <SH
            n="Step 2"
            chapter="Schedule"
            title="Which days?"
            sub="Pick the days this habit happens. Consistency beats intensity."
          />
          <div
            style={{
              display: "flex",
              gap: 7,
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <div
                  key={d}
                  onClick={() => toggleDay(d)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: on ? T.ac : T.inp,
                    color: on ? T.acTx : T.txS,
                    border: `1px solid ${on ? T.ac : T.br}`,
                    fontFamily: M,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setDays(days.length === 7 ? [] : [...DAYS])}
            style={{
              background: "none",
              border: "none",
              color: T.txS,
              fontFamily: S,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              alignSelf: "flex-start",
              padding: 0,
            }}
          >
            {days.length === 7 ? "Clear all" : "Every day"}
          </button>
          <button
            onClick={() => days.length > 0 && setStep(3)}
            style={prim(days.length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  if (step === 3)
    return (
      <div style={wrap}>
        <div style={pad}>
          <BK to={2} />
          <PB />
          <SH
            n="Step 3"
            chapter="Measure it"
            title="What's your daily goal?"
            sub="How much, and how you'll measure it. What gets measured gets managed."
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 18,
            }}
          >
            <button
              onClick={() => setGoalCount(Math.max(1, goalCount - 1))}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: T.inp,
                border: `1px solid ${T.br}`,
                color: T.tx,
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: S,
              }}
            >
              −
            </button>
            <div
              style={{
                fontFamily: F,
                fontSize: 44,
                color: T.tx,
                minWidth: 70,
                textAlign: "center",
              }}
            >
              {goalCount}
            </div>
            <button
              onClick={() => setGoalCount(goalCount + 1)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: T.inp,
                border: `1px solid ${T.br}`,
                color: T.tx,
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: S,
              }}
            >
              +
            </button>
          </div>
          <div style={{ ...lbl, margin: "0 0 8px" }}>Measured in</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginBottom: 16,
            }}
          >
            {UNITS.map((u) => {
              const on = goalUnit === u;
              return (
                <div
                  key={u}
                  onClick={() => setGoalUnit(u)}
                  style={{
                    padding: "8px 13px",
                    borderRadius: 10,
                    background: on ? T.ac : T.inp,
                    color: on ? T.acTx : T.txS,
                    border: `1px solid ${on ? T.ac : T.br}`,
                    fontFamily: S,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {u}
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              fontStyle: "italic",
            }}
          >
            {goalCount} {goalUnit} per day, on habit days.
          </div>
          <button onClick={() => setStep(4)} style={prim(true)}>
            Continue →
          </button>
        </div>
      </div>
    );

  if (step === 4)
    return (
      <div style={wrap}>
        <div style={pad}>
          <BK to={3} />
          <PB />
          <SH
            n="Step 4"
            chapter="Clear · Law 1 — Make it obvious"
            title="When exactly?"
            sub="Give the habit a specific time on the days you chose. A habit with a home on your clock gets done."
          />
          <div style={{ ...lbl, margin: "0 0 6px" }}>Habit time</div>
          <input
            type="time"
            value={habitTime}
            onChange={(e) => setHabitTime(e.target.value)}
            style={{ ...inp, colorScheme: darkMode ? "dark" : "light" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: T.sf,
              border: `1px solid ${T.br}`,
              borderRadius: 14,
              padding: "14px 16px",
              marginTop: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: S,
                  fontSize: 14,
                  fontWeight: 800,
                  color: T.tx,
                  marginBottom: 2,
                }}
              >
                Send me a reminder
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.txS,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  fontFamily: S,
                }}
              >
                A nudge at {fmtTime(habitTime)} on habit days.
              </div>
            </div>
            <div
              onClick={() => setReminder(!reminder)}
              style={{
                width: 46,
                height: 26,
                borderRadius: 13,
                background: reminder ? T.ac : T.inp,
                border: `1px solid ${T.br}`,
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: reminder ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: reminder ? T.acTx : T.txH,
                  transition: "left 0.2s",
                }}
              />
            </div>
          </div>
          <button onClick={() => setStep(5)} style={prim(true)}>
            Continue →
          </button>
        </div>
      </div>
    );

  if (step === 5)
    return (
      <div style={wrap}>
        <div style={pad}>
          <BK to={4} />
          <PB />
          <SH
            n="Step 5"
            chapter="Name it"
            title="Name your habit."
            sub="Short and clear — this is what you'll see on your card every day. Then pick a color."
          />
          <input
            autoFocus
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="e.g. Morning run"
            style={{ ...inp, marginBottom: 14 }}
            maxLength={28}
          />
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border:
                    color === c ? `3px solid ${T.tx}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => shortName.trim() && setStep(6)}
            style={prim(shortName.trim().length > 0)}
          >
            Review my habit →
          </button>
        </div>
      </div>
    );

  if (step === 6) {
    return (
      <div style={wrap}>
        <div style={{ ...pad, justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div
              style={{
                fontFamily: M,
                fontSize: 10,
                color: T.txH,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your habit
            </div>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                margin: "0 auto 12px",
              }}
            />
            <div
              style={{
                fontFamily: F,
                fontSize: 32,
                color: T.tx,
                lineHeight: 1.05,
                letterSpacing: "-0.3px",
                marginBottom: 10,
              }}
            >
              {shortName}
            </div>
            <div
              style={{
                fontSize: 13,
                color: color,
                fontStyle: "italic",
                fontWeight: 600,
                lineHeight: 1.6,
                maxWidth: 290,
                margin: "0 auto",
              }}
            >
              "{statement}"
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Days",
                val:
                  sortedDays.length === 7
                    ? "Every day"
                    : sortedDays.join(" · "),
                n: "01",
              },
              { label: "Daily goal", val: `${goalCount} ${goalUnit}`, n: "02" },
              { label: "Habit time", val: fmtTime(habitTime), n: "03" },
              {
                label: "Reminder",
                val: reminder ? `On — ${fmtTime(habitTime)}` : "Off",
                n: "04",
              },
            ].map((item) => (
              <div
                key={item.n}
                style={{
                  background: T.sf,
                  border: `1px solid ${T.br}`,
                  borderRadius: 13,
                  padding: "13px 15px",
                  display: "flex",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: M,
                    fontSize: 11,
                    color: color,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: M,
                      fontSize: 8,
                      color: T.txH,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.tx,
                      fontWeight: 600,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.val}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              onComplete({
                kind,
                statement,
                shortName: shortName.trim(),
                color,
                identity: person.trim(),
                cue: cueLabel,
                habitText: habitText.trim(),
                timeLocation: timeLocation.trim(),
                badHabit: badHabit.trim(),
                anchor: anchor.trim(),
                days: sortedDays,
                goalCount,
                goalUnit,
                habitTime,
                reminder,
              })
            }
            style={{ ...prim(true), marginTop: 0 }}
          >
            Create habit ✦
          </button>
          <button onClick={() => setStep(5)} style={sec}>
            ← Back
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function ReclaimFlow({ onComplete, onCancel, T, darkMode }) {
  const [step, setStep] = useState(0);
  const [behavior, setBehavior] = useState("");
  const [cue, setCue] = useState("");
  const [craving, setCraving] = useState("");
  const [oldIdentity, setOldIdentity] = useState("");
  const [newIdentity, setNewIdentity] = useState("");
  const [environment, setEnvironment] = useState("");
  const [replacement, setReplacement] = useState("");
  const [statement, setStatement] = useState("");
  const M = "'DM Mono',monospace";
  const F = "'Bebas Neue',sans-serif";
  const S = "'Syne',sans-serif";
  const TOTAL = 8;

  const inp = {
    width: "100%",
    background: T.inp,
    border: `1px solid ${T.br}`,
    borderRadius: 14,
    padding: "14px 16px",
    color: T.tx,
    fontFamily: S,
    fontSize: 15,
    fontWeight: 600,
    outline: "none",
    resize: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
  };
  const prim = (ok) => ({
    width: "100%",
    padding: "15px",
    background: ok ? T.ac : T.inp,
    border: "none",
    borderRadius: 14,
    color: ok ? T.acTx : T.txH,
    fontSize: 15,
    fontWeight: 800,
    cursor: ok ? "pointer" : "default",
    fontFamily: S,
    opacity: ok ? 1 : 0.5,
    marginTop: 24,
  });
  const sec = {
    width: "100%",
    padding: "13px",
    background: "transparent",
    border: `1px solid ${T.br}`,
    borderRadius: 14,
    color: T.txS,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: S,
    marginTop: 8,
  };

  function ProgressBar() {
    return (
      <div
        style={{
          height: 2,
          background: T.br,
          borderRadius: 1,
          marginBottom: 26,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: T.ac,
            borderRadius: 1,
            width: `${(step / TOTAL) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    );
  }
  function StepHead({ n, chapter, title, sub }) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {n} of {TOTAL}
          </span>
          <span
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              letterSpacing: "0.5px",
              fontStyle: "italic",
            }}
          >
            {chapter}
          </span>
        </div>
        <div
          style={{
            fontFamily: F,
            fontSize: 34,
            color: T.tx,
            lineHeight: 1.05,
            marginBottom: 8,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.txS,
            fontWeight: 600,
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          {sub}
        </div>
      </>
    );
  }

  const wrap = {
    position: "absolute",
    inset: 0,
    zIndex: 96,
    background: darkMode ? "#000" : "#f0ede8",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.3s ease",
  };
  const pad = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px 26px 40px",
    overflowY: "auto",
    minHeight: 0,
  };

  // Step 0 — Intro
  if (step === 0)
    return (
      <div style={wrap}>
        <div style={{ ...pad, justifyContent: "center", textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              margin: "0 auto 22px",
              color: T.tx,
            }}
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              style={{ width: "100%", height: "100%" }}
            >
              <polygon
                points="14,2 26,10 26,18 14,26 2,18 2,10"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
              <polygon
                points="14,6 22,11 22,17 14,22 6,17 6,11"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeLinejoin="round"
                opacity="0.4"
              />
            </svg>
          </div>
          <div
            style={{
              fontFamily: F,
              fontSize: 48,
              color: T.tx,
              lineHeight: 1,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            RECLAIM
          </div>
          <div
            style={{
              width: 40,
              height: 1,
              background: T.br,
              margin: "0 auto 18px",
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: T.txS,
              lineHeight: 1.75,
              fontWeight: 600,
              maxWidth: 290,
              margin: "0 auto 14px",
            }}
          >
            You don't break a bad habit by fighting it. You reclaim the identity
            it stole from you — one small system at a time.
          </div>
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              fontStyle: "italic",
              lineHeight: 1.6,
              maxWidth: 270,
              margin: "0 auto 40px",
            }}
          >
            "The ultimate form of intrinsic motivation is when a habit becomes
            part of your identity." — James Clear
          </div>
          <button
            onClick={() => setStep(1)}
            style={{ ...prim(true), marginTop: 0 }}
          >
            Begin →
          </button>
          <button onClick={onCancel} style={sec}>
            Maybe later
          </button>
        </div>
      </div>
    );

  // Step 1 — Name the behavior
  if (step === 1)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 1"
            chapter="Awareness"
            title="What do you want to reclaim?"
            sub="Name the behavior honestly. The one that's been voting against who you want to be."
          />
          <textarea
            autoFocus
            rows={2}
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="e.g. Scrolling my phone until 2am"
            style={inp}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Be specific. "Staying up late on my phone" beats "bad sleep."
          </div>
          <button
            onClick={() => behavior.trim() && setStep(2)}
            style={prim(behavior.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 2 — Find the cue
  if (step === 2)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 2"
            chapter="Clear · Law 1 — Make it invisible"
            title="What triggers it?"
            sub="Every habit starts with a cue. Time, place, emotion, or the people around you. Find the trigger and you can change the environment."
          />
          <textarea
            autoFocus
            rows={3}
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="e.g. When I get in bed, I grab my phone out of boredom"
            style={inp}
          />
          <div
            style={{
              background: T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginTop: 12,
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Gladwell's insight
            </div>
            <div style={{ fontSize: 12, color: T.txS, lineHeight: 1.6 }}>
              Small shifts in context tip behavior more than willpower ever
              will. The environment is the lever.
            </div>
          </div>
          <button
            onClick={() => cue.trim() && setStep(3)}
            style={prim(cue.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 3 — The craving underneath
  if (step === 3)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 3"
            chapter="Clear · Law 2 — The craving"
            title="What are you really after?"
            sub="Every behavior serves a deeper need. You're not chasing the phone — you're chasing the feeling it gives you. Name it."
          />
          <textarea
            autoFocus
            rows={3}
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            placeholder="e.g. I'm avoiding the silence. I don't want to be alone with my thoughts."
            style={inp}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            The craving isn't the enemy. It's information. Once you see the real
            need, you can meet it a better way.
          </div>
          <button
            onClick={() => craving.trim() && setStep(4)}
            style={prim(craving.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 4 — The identity conflict
  if (step === 4)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 4"
            chapter="Clear · Identity"
            title="Who does this make you?"
            sub="This is the hardest question. When you do this behavior, who are you being? And who do you want to be instead?"
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            The person this makes me
          </div>
          <textarea
            autoFocus
            rows={2}
            value={oldIdentity}
            onChange={(e) => setOldIdentity(e.target.value)}
            placeholder="e.g. Someone who's always tired and behind"
            style={{ ...inp, marginBottom: 14 }}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 9,
              color: T.txH,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            The person I want to be
          </div>
          <textarea
            rows={2}
            value={newIdentity}
            onChange={(e) => setNewIdentity(e.target.value)}
            placeholder="e.g. Someone who protects their rest like a pro"
            style={inp}
          />
          <button
            onClick={() =>
              oldIdentity.trim() && newIdentity.trim() && setStep(5)
            }
            style={prim(
              oldIdentity.trim().length > 0 && newIdentity.trim().length > 0
            )}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 5 — Design the environment
  if (step === 5)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 5"
            chapter="Clear · Law 3 — Make it hard"
            title="Change the environment."
            sub="Don't rely on willpower. Add friction. What's one change to your space that makes the old behavior harder to start?"
          />
          <textarea
            autoFocus
            rows={3}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="e.g. Charge my phone in the kitchen, not my bedroom"
            style={inp}
          />
          <div
            style={{
              background: T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginTop: 12,
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Why this works
            </div>
            <div style={{ fontSize: 12, color: T.txS, lineHeight: 1.6 }}>
              "Make the cue invisible." Twenty seconds of added friction is
              often enough to break the automatic loop.
            </div>
          </div>
          <button
            onClick={() => environment.trim() && setStep(6)}
            style={prim(environment.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 6 — The replacement
  if (step === 6)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 6"
            chapter="Clear · Habit substitution"
            title="What will you do instead?"
            sub="You can't just delete a habit — you replace it. When the cue hits, what's the new response that meets the same craving?"
          />
          <textarea
            autoFocus
            rows={3}
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="e.g. Read 5 pages of a book instead of scrolling"
            style={inp}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Same cue. Same craving met. Better action. That's the swap.
          </div>
          <button
            onClick={() => {
              if (replacement.trim()) {
                setStatement(
                  `I am someone who ${newIdentity
                    .trim()
                    .toLowerCase()
                    .replace(/^someone who /, "")}`
                );
                setStep(7);
              }
            }}
            style={prim(replacement.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 7 — The new identity statement
  if (step === 7)
    return (
      <div style={wrap}>
        <div style={pad}>
          <ProgressBar />
          <StepHead
            n="Step 7"
            chapter="Clear · Identity-based habits"
            title="Write your new identity."
            sub="This is what you'll track. Not 'don't do the bad thing' — but the identity you vote for every time you resist."
          />
          <div
            style={{
              background: T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 12,
              cursor: "pointer",
            }}
            onClick={() =>
              setStatement(
                `I am someone who ${newIdentity
                  .trim()
                  .toLowerCase()
                  .replace(/^someone who /, "")}`
              )
            }
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Suggested — tap to use
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.txS,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              "I am someone who{" "}
              {newIdentity
                .trim()
                .toLowerCase()
                .replace(/^someone who /, "")}
              "
            </div>
          </div>
          <textarea
            autoFocus
            rows={3}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="I am someone who..."
            style={inp}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Every day you hold this, you cast a vote for this identity.
          </div>
          <button
            onClick={() => statement.trim() && setStep(8)}
            style={prim(statement.trim().length > 0)}
          >
            See my system →
          </button>
        </div>
      </div>
    );

  // Step 8 — Summary / the system
  if (step === 8) {
    const color = "#FFB74D";
    return (
      <div style={wrap}>
        <div style={{ ...pad, justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontFamily: M,
                fontSize: 10,
                color: T.txH,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your reclaim system
            </div>
            <div
              style={{
                fontFamily: F,
                fontSize: 30,
                color: T.tx,
                lineHeight: 1.1,
                letterSpacing: "-0.3px",
              }}
            >
              {statement}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {[
              { label: "The cue to watch", val: cue, n: "01" },
              { label: "The craving underneath", val: craving, n: "02" },
              { label: "Environment change", val: environment, n: "03" },
              { label: "Do this instead", val: replacement, n: "04" },
            ].map((item) => (
              <div
                key={item.n}
                style={{
                  background: T.sf,
                  border: `1px solid ${T.br}`,
                  borderRadius: 13,
                  padding: "13px 15px",
                  display: "flex",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: M,
                    fontSize: 11,
                    color: color,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: M,
                      fontSize: 8,
                      color: T.txH,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.tx,
                      fontWeight: 600,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.val}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            "Every action you take is a vote for the type of person you wish to
            become."
          </div>
          <button
            onClick={() =>
              onComplete({
                name: statement,
                color,
                cue,
                craving,
                environment,
                replacement,
                oldBehavior: behavior,
              })
            }
            style={{ ...prim(true), marginTop: 0 }}
          >
            Add to my daily reclaim ✦
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function VideoSplash({ onDone }) {
  const ref = useRef(null);
  // Auto-advance after the video ends OR after a max timeout (in case video missing)
  useEffect(() => {
    const t = setTimeout(onDone, 9000); // fallback if video doesn't fire onEnded
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      onClick={onDone}
      style={{
        width: 390,
        minHeight: 820,
        background: "#000",
        borderRadius: 36,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <video
        ref={ref}
        autoPlay
        muted
        playsInline
        onEnded={onDone}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        src="/black-diamond-intro_1.mp4"
      ></video>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "1px",
        }}
      >
        tap to skip
      </div>
    </div>
  );
}

function Welcome({ onEnter, onSignIn }) {
  const F = "'Bebas Neue',sans-serif";
  const S = "'Syne',sans-serif";
  const [ui, setUi] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setUi(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        width: 390,
        minHeight: 820,
        position: "relative",
        overflow: "hidden",
        background: "#000",
        borderRadius: 36,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
      }}
    >
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,transparent 30%,transparent 50%,rgba(0,0,0,0.98) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* centered brand */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 26px",
          opacity: ui ? 1 : 0,
          transform: ui ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
        }}
      >
        <div
          style={{ width: 110, height: 110, color: "#fff", marginBottom: 28 }}
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            style={{ width: "100%", height: "100%" }}
          >
            <polygon
              points="14,2 26,10 26,18 14,26 2,18 2,10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <polygon
              points="14,6 22,11 22,17 14,22 6,17 6,11"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeLinejoin="round"
              opacity="0.4"
            />
          </svg>
        </div>
        <div
          style={{
            fontFamily: F,
            fontSize: 68,
            lineHeight: 0.95,
            color: "#fff",
            letterSpacing: 4,
          }}
        >
          BLACK
          <br />
          DIAMOND
        </div>
      </div>

      {/* bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 26px 44px",
          opacity: ui ? 1 : 0,
          transform: ui ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s",
        }}
      >
        <button
          onClick={onEnter}
          style={{
            width: "100%",
            padding: "17px",
            background: "#fff",
            border: "none",
            borderRadius: 16,
            color: "#000",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            marginBottom: 10,
            fontFamily: S,
          }}
        >
          Build something that lasts
        </button>
        <button
          onClick={onSignIn}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 16,
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: S,
          }}
        >
          I already have a squad →
        </button>
      </div>
    </div>
  );
}

function SignIn({ onBack, onComplete }) {
  const F = "'Bebas Neue',sans-serif";
  const M = "'DM Mono',monospace";
  const S = "'Syne',sans-serif";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function sendLink() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }
  const inputStyle = {
    width: "100%",
    padding: "15px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 14,
    color: "#fff",
    fontSize: 15,
    fontFamily: S,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  };
  const primaryBtn = {
    width: "100%",
    padding: "16px",
    background: "#fff",
    border: "none",
    borderRadius: 14,
    color: "#000",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: S,
    marginBottom: 12,
  };
  return (
    <div
      style={{
        width: 390,
        minHeight: 820,
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 20%, #0a0703 0%, #000 60%)",
        borderRadius: 36,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        padding: "48px 28px 40px",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: S,
          fontWeight: 700,
          alignSelf: "flex-start",
          padding: "0 0 36px",
        }}
      >
        ← Back
      </button>
      <div style={{ width: 36, height: 36, color: "#fff", marginBottom: 20 }}>
        <svg
          viewBox="0 0 28 28"
          fill="none"
          style={{ width: "100%", height: "100%" }}
        >
          <polygon
            points="14,2 26,10 26,18 14,26 2,18 2,10"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
          />
          <polygon
            points="14,6 22,11 22,17 14,22 6,17 6,11"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>
      </div>
      <div
        style={{
          fontFamily: F,
          fontSize: 50,
          color: "#fff",
          lineHeight: 1,
          marginBottom: 10,
        }}
      >
        WELCOME
        <br />
        IN
      </div>
      <button onClick={async () => { await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); }} style={{ width: "100%", padding: "16px", background: "#fff", border: "none", borderRadius: 14, color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: S, marginBottom: 16 }}>Continue with Google</button><div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 20px" }}><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: M }}>OR</span><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} /></div>{!sent ? (
        <>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Enter your email and we'll send you a secure link to sign in. No
            password needed.
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoFocus
            style={inputStyle}
          />
          {err ? (
            <div
              style={{
                fontFamily: M,
                fontSize: 11,
                color: "#F06292",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              {err}
            </div>
          ) : null}
          <button onClick={sendLink} style={primaryBtn}>
            {busy ? "Sending..." : "Send me a login link"}
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 15,
              color: "#fff",
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: 10,
              fontFamily: S,
            }}
          >
            Check your email.
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            We sent a login link to {email}. Tap it to sign in. If you don't see
            it in a minute, check your spam folder.
          </div>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            style={{
              width: "100%",
              padding: "14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: S,
            }}
          >
            Use a different email
          </button>
        </>
      )}
      <div
        style={{
          fontFamily: M,
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          lineHeight: 1.7,
          marginTop: "auto",
        }}
      >
        Your data stays yours. Always.
      </div>
    </div>
  );
}

function suggestIdentity(behavior) {
  const b = behavior.trim().toLowerCase();
  // Athletic-leaning smart templates with keyword matching
  const rules = [
    {
      kw: ["gym", "lift", "weight", "train", "workout", "exercise"],
      id: "someone who trains like an athlete",
    },
    {
      kw: ["run", "jog", "sprint", "cardio", "mile"],
      id: "someone who runs every day, no excuses",
    },
    {
      kw: ["protein", "eat", "meal", "nutrition", "diet", "food"],
      id: "someone who fuels their body with purpose",
    },
    {
      kw: ["sleep", "rest", "bed", "recover"],
      id: "someone who recovers like a professional",
    },
    {
      kw: ["water", "hydrate", "drink"],
      id: "someone who takes care of their body",
    },
    {
      kw: ["read", "book", "study", "learn"],
      id: "someone who sharpens their mind daily",
    },
    {
      kw: ["stretch", "mobility", "yoga", "warm"],
      id: "someone who moves with intention",
    },
    {
      kw: ["meditat", "breath", "visualize", "mindful", "journal"],
      id: "someone who trains their mind as hard as their body",
    },
    {
      kw: ["practice", "drill", "skill", "shoot", "ball"],
      id: "someone who masters their craft through reps",
    },
    { kw: ["wake", "morning", "early"], id: "someone who owns their mornings" },
  ];
  for (const r of rules) {
    if (r.kw.some((k) => b.includes(k))) return "I am " + r.id;
  }
  return "I am someone who shows up every single day";
}

function Onboarding({ onComplete, T, darkMode }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [squadChoice, setSquadChoice] = useState(null);
  const [squadName, setSquadName] = useState("");
  const [squadCode, setSquadCode] = useState("");
  const [behavior, setBehavior] = useState("");
  const [cue, setCue] = useState("");
  const [identity, setIdentity] = useState("");
  const [habitColor, setHabitColor] = useState("#4FC3F7");
  const F = "'Bebas Neue',sans-serif";
  const M = "'DM Mono',monospace";
  const S = "'Syne',sans-serif";
  const COLORS = [
    "#4FC3F7",
    "#81C784",
    "#FFB74D",
    "#F06292",
    "#CE93D8",
    "#4DB6AC",
    "#FF8A65",
  ];
  const TOTAL = 5;

  const inp = {
    width: "100%",
    background: T.inp,
    border: `1px solid ${T.br}`,
    borderRadius: 14,
    padding: "15px 16px",
    color: T.tx,
    fontFamily: S,
    fontSize: 16,
    fontWeight: 600,
    outline: "none",
    resize: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
  };
  const prim = (ok) => ({
    width: "100%",
    padding: "16px",
    background: ok ? T.ac : T.inp,
    border: "none",
    borderRadius: 14,
    color: ok ? T.acTx : T.txH,
    fontSize: 15,
    fontWeight: 800,
    cursor: ok ? "pointer" : "default",
    fontFamily: S,
    opacity: ok ? 1 : 0.5,
    marginTop: 24,
  });
  const back = {
    background: "none",
    border: "none",
    color: T.txH,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: S,
    fontWeight: 700,
    alignSelf: "flex-start",
    padding: 0,
    marginBottom: 24,
  };
  const wrap = {
    width: 390,
    minHeight: 820,
    background: darkMode
      ? "radial-gradient(ellipse at 50% 15%, #0a0703 0%, #000 60%)"
      : "#f0ede8",
    borderRadius: 36,
    border: `1px solid ${T.br}`,
    boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };
  const pad = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "48px 28px 36px",
    overflowY: "auto",
  };

  function PB() {
    return (
      <div
        style={{
          height: 2,
          background: T.br,
          borderRadius: 1,
          marginBottom: 30,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: T.ac,
            borderRadius: 1,
            width: `${((step + 1) / TOTAL) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    );
  }
  function Head({ n, title, sub }) {
    return (
      <>
        <div
          style={{
            fontFamily: M,
            fontSize: 9,
            color: T.txH,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {n} of {TOTAL}
        </div>
        <div
          style={{
            fontFamily: F,
            fontSize: 40,
            color: T.tx,
            lineHeight: 1.02,
            letterSpacing: "-0.3px",
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: T.txS,
            fontWeight: 600,
            lineHeight: 1.6,
            marginBottom: 26,
          }}
        >
          {sub}
        </div>
      </>
    );
  }

  // Step 0 — Name
  if (step === 0)
    return (
      <div style={wrap}>
        <div style={pad}>
          <PB />
          <Head
            n="Step 1"
            title={"What's your name?"}
            sub="This is how your squad will see you on the leaderboard."
          />
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inp}
            maxLength={20}
          />
          <button
            onClick={() => name.trim() && setStep(1)}
            style={prim(name.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 1 — Squad
  if (step === 1)
    return (
      <div style={wrap}>
        <div style={pad}>
          <button onClick={() => setStep(0)} style={back}>
            ← Back
          </button>
          <PB />
          <Head
            n="Step 2"
            title="Your squad."
            sub="Black Diamond works best with your people. Start a new squad or join one with a code."
          />
          <div
            onClick={() => setSquadChoice("create")}
            style={{
              background: squadChoice === "create" ? T.ac : T.inp,
              border: `1px solid ${squadChoice === "create" ? T.ac : T.br}`,
              borderRadius: 16,
              padding: "16px 18px",
              cursor: "pointer",
              marginBottom: 10,
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: squadChoice === "create" ? T.acTx : T.tx,
                marginBottom: 3,
              }}
            >
              Start a new squad
            </div>
            <div
              style={{
                fontSize: 12,
                color: squadChoice === "create" ? T.acTx : T.txH,
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              You'll be the captain. Invite your crew with a code.
            </div>
          </div>
          <div
            onClick={() => setSquadChoice("join")}
            style={{
              background: squadChoice === "join" ? T.ac : T.inp,
              border: `1px solid ${squadChoice === "join" ? T.ac : T.br}`,
              borderRadius: 16,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: squadChoice === "join" ? T.acTx : T.tx,
                marginBottom: 3,
              }}
            >
              Join an existing squad
            </div>
            <div
              style={{
                fontSize: 12,
                color: squadChoice === "join" ? T.acTx : T.txH,
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              Got an invite code? Drop it in.
            </div>
          </div>
          {squadChoice === "create" && (
            <input
              autoFocus
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              placeholder="Name your squad (e.g. Summer Grind)"
              style={{ ...inp, marginTop: 14 }}
              maxLength={24}
            />
          )}
          {squadChoice === "join" && (
            <input
              autoFocus
              value={squadCode}
              onChange={(e) => setSquadCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              style={{
                ...inp,
                marginTop: 14,
                fontFamily: M,
                letterSpacing: "2px",
              }}
              maxLength={8}
            />
          )}
          <button
            onClick={() => {
              if (squadChoice === "create" && squadName.trim()) setStep(2);
              else if (squadChoice === "join" && squadCode.trim()) setStep(2);
            }}
            style={prim(
              (squadChoice === "create" && squadName.trim()) ||
                (squadChoice === "join" && squadCode.trim())
            )}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 2 — The behavior (start small + concrete)
  if (step === 2)
    return (
      <div style={wrap}>
        <div style={pad}>
          <button onClick={() => setStep(1)} style={back}>
            ← Back
          </button>
          <PB />
          <Head
            n="Step 3"
            title="What's one thing you want to start doing?"
            sub="Keep it simple and concrete. One behavior. You can add more once you're in."
          />
          <input
            autoFocus
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="e.g. Hit the gym"
            style={inp}
            maxLength={28}
          />
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginTop: 10,
            }}
          >
            Don't overthink it. The smallest action you'll actually repeat beats
            the perfect one you won't.
          </div>
          <button
            onClick={() => behavior.trim() && setStep(3)}
            style={prim(behavior.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 3 — The cue (make it obvious)
  if (step === 3)
    return (
      <div style={wrap}>
        <div style={pad}>
          <button onClick={() => setStep(2)} style={back}>
            ← Back
          </button>
          <PB />
          <Head
            n="Step 4"
            title="When will you do it?"
            sub="A habit needs a moment to live in. Tie it to a time or something you already do."
          />
          <input
            autoFocus
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="e.g. After morning practice"
            style={inp}
            maxLength={40}
          />
          <div
            style={{
              background: T.inp,
              border: `1px solid ${T.br}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginTop: 14,
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Why this matters
            </div>
            <div style={{ fontSize: 12, color: T.txS, lineHeight: 1.6 }}>
              "Make it obvious." A specific time and place makes a habit far
              more likely to stick.
            </div>
          </div>
          <button
            onClick={() => {
              if (cue.trim()) {
                setIdentity(suggestIdentity(behavior));
                setStep(4);
              }
            }}
            style={prim(cue.trim().length > 0)}
          >
            Continue →
          </button>
        </div>
      </div>
    );

  // Step 4 — Identity emerges (auto-generated, editable)
  if (step === 4) {
    const suggestion = suggestIdentity(behavior);
    return (
      <div style={wrap}>
        <div style={pad}>
          <button onClick={() => setStep(3)} style={back}>
            ← Back
          </button>
          <PB />
          <Head
            n="Step 5"
            title="Here's who that makes you."
            sub="You didn't just pick a habit. You picked a person to become. This is what every rep votes for."
          />
          <div
            style={{
              background: `${habitColor}14`,
              border: `1px solid ${habitColor}40`,
              borderRadius: 16,
              padding: "18px 18px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: M,
                fontSize: 9,
                color: T.txH,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your identity
            </div>
            <textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: T.tx,
                fontFamily: S,
                fontSize: 19,
                fontWeight: 800,
                outline: "none",
                resize: "none",
                lineHeight: 1.35,
                boxSizing: "border-box",
              }}
            />
          </div>
          {identity.trim() !== suggestion && (
            <button
              onClick={() => setIdentity(suggestion)}
              style={{
                background: "transparent",
                border: `1px solid ${T.br}`,
                borderRadius: 10,
                padding: "8px 12px",
                color: T.txS,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: S,
                marginBottom: 14,
              }}
            >
              ↺ Reset to suggestion
            </button>
          )}
          <div
            style={{
              fontFamily: M,
              fontSize: 11,
              color: T.txH,
              lineHeight: 1.6,
              marginBottom: 4,
            }}
          >
            This is a starting point — edit it to sound like you. You can always
            refine it later.
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.txH,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Pick a color for this habit
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setHabitColor(c)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border:
                    habitColor === c
                      ? `3px solid ${T.tx}`
                      : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() =>
              identity.trim() &&
              onComplete({
                name: name.trim(),
                squadChoice,
                squadName: squadName.trim(),
                squadCode: squadCode.trim(),
                behavior: behavior.trim(),
                cue: cue.trim(),
                identity: identity.trim(),
                habitColor,
              })
            }
            style={prim(identity.trim().length > 0)}
          >
            Enter Black Diamond ✦
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function App() {
  const SAVED = (() => {
    try {
      return JSON.parse(localStorage.getItem("bd_v1") || "{}");
    } catch (e) {
      return {};
    }
  })();
  const [screen, setScreen] = useState(SAVED.onboarded ? "app" : "splash");
  const [myName, setMyName] = useState(SAVED.myName ?? "Carter");
  const [myGroup, setMyGroup] = useState(SAVED.myGroup ?? GROUP);
  const [habits, setHabits] = useState(SAVED.habits ?? INIT_HABITS);
  const [anti, setAnti] = useState(SAVED.anti ?? INIT_ANTI);
  const [flash, setFlash] = useState(null);
  const [burst, setBurst] = useState(null);
  const [detailHabit, setDetailHabit] = useState(null);
  const [myAvatar, setMyAvatar] = useState(SAVED.myAvatar ?? null);
  const [showReclaim, setShowReclaim] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [tab, setTab] = useState("today");
  const [darkMode, setDarkMode] = useState(SAVED.darkMode ?? true);
  const [notifOn, setNotifOn] = useState(SAVED.notifOn ?? false);
  useEffect(() => {
    try {
      localStorage.setItem(
        "bd_v1",
        JSON.stringify({
          onboarded: SAVED.onboarded || screen === "app",
          myName,
          myGroup,
          habits,
          anti,
          myAvatar,
          darkMode,
          notifOn,
        })
      );
    } catch (e) {}
  }, [screen, myName, myGroup, habits, anti, myAvatar, darkMode, notifOn]);
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authSub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => authSub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (
      session &&
      (screen === "signin" || screen === "splash" || screen === "welcome")
    ) {
      setScreen(SAVED.onboarded ? "app" : "onboarding");
    }
    // eslint-disable-next-line
  }, [session]);

  const now = new Date(),
    dow = now.getDay();
  const wDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - dow + i);
    return d;
  });
  const coreDone = habits.filter((h) => h.log[TODAY]).length;
  const antiDone = anti.filter((h) => h.guarded[TODAY]).length;
  const lightLvl = (coreDone + antiDone) / (habits.length + anti.length) || 0;
  const bestStreak = habits.length
    ? Math.max(...habits.map((h) => getStreak(h.log)))
    : 0;
  const totalVotes = habits.reduce((s, h) => s + Object.keys(h.log).length, 0);
  // Votes this week (last 7 days incl today)
  const weeklyVotes = habits.reduce((s, h) => {
    let c = 0;
    for (let i = 0; i < 7; i++) {
      if (h.log[dateKey(getOffset(i))]) c++;
    }
    return s + c;
  }, 0);
  // Milestone logic
  const MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000];
  const nextMilestone =
    MILESTONES.find((m) => m > totalVotes) ||
    Math.ceil(totalVotes / 5000) * 5000 + 5000;
  const prevMilestone =
    [...MILESTONES].reverse().find((m) => m <= totalVotes) || 0;
  const milestoneProg = Math.round(
    ((totalVotes - prevMilestone) / (nextMilestone - prevMilestone)) * 100
  );
  const sorted = [...MEMBERS].sort((a, b) => b.pct - a.pct);
  const PD = 14;

  const bg = darkMode
    ? `radial-gradient(ellipse at 50% 20%, rgba(${Math.round(
        lightLvl * 45
      )},${Math.round(lightLvl * 30)},${Math.round(
        lightLvl * 12
      )},1) 0%, #000 60%)`
    : `radial-gradient(ellipse at 50% 20%, #f5f0e8 0%, #ede8e0 100%)`;

  const T = darkMode
    ? {
        tx: "#fff",
        txS: "rgba(255,255,255,0.5)",
        txH: "rgba(255,255,255,0.28)",
        txM: "rgba(255,255,255,0.12)",
        br: "rgba(255,255,255,0.08)",
        sf: "rgba(255,255,255,0.04)",
        inp: "rgba(255,255,255,0.06)",
        ac: "#fff",
        acTx: "#000",
        nav: "rgba(0,0,0,0.96)",
      }
    : {
        tx: "#0a0a0a",
        txS: "rgba(0,0,0,0.5)",
        txH: "rgba(0,0,0,0.35)",
        txM: "rgba(0,0,0,0.15)",
        br: "rgba(0,0,0,0.08)",
        sf: "rgba(255,255,255,0.7)",
        inp: "rgba(0,0,0,0.05)",
        ac: "#0a0a0a",
        acTx: "#fff",
        nav: "rgba(237,232,224,0.96)",
      };

  function showToast(m) {
    setToast(m);
    setToastOn(true);
    setTimeout(() => setToastOn(false), 2400);
  }
  function finishOnboarding(data) {
    setMyName(data.name);
    if (data.squadChoice === "create") {
      const code =
        (data.squadName
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 5)
          .toUpperCase() || "SQUAD") + Math.floor(Math.random() * 9 + 1);
      setMyGroup({
        name: data.squadName,
        code,
        identity: "We show up for each other, every single day.",
      });
    }
    // seed first habit from onboarding: behavior=name, cue=stack, identity, plus a blueprint
    const firstHabit = {
      id: Date.now(),
      name: data.behavior,
      color: data.habitColor,
      log: {},
      identity: data.identity,
      stack: data.cue,
      blueprint: {
        type: "build",
        identity: data.identity,
        cue: data.cue,
        attractive: "",
        easy: "",
        satisfying: "",
      },
    };
    setHabits([firstHabit]);
    setScreen("app");
  }
  function handleAvatarUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMyAvatar(ev.target.result);
      showToast("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  }
  function doHabit(id) {
    const h = habits.find((h) => h.id === id);
    if (!h) return;
    setHabits((p) =>
      p.map((x) =>
        x.id !== id ? x : { ...x, log: { ...x.log, [TODAY]: true } }
      )
    );
    setBurst(h.color);
    setFlash({ text: h.identity, color: h.color, guard: false });
  }
  function undoHabit(id) {
    setHabits((p) =>
      p.map((x) =>
        x.id !== id ? x : { ...x, log: { ...x.log, [TODAY]: false } }
      )
    );
  }
  function doGuard(id) {
    const h = anti.find((h) => h.id === id);
    if (!h) return;
    setAnti((p) =>
      p.map((x) =>
        x.id !== id ? x : { ...x, guarded: { ...x.guarded, [TODAY]: true } }
      )
    );
    setBurst(h.color);
    setFlash({
      text:
        h.blueprint && h.blueprint.identity
          ? h.blueprint.identity
          : "Ground held. The light stays lit.",
      color: h.color,
      guard: true,
    });
  }
  function doBreak(id) {
    setAnti((p) =>
      p.map((x) =>
        x.id !== id ? x : { ...x, guarded: { ...x.guarded, [TODAY]: false } }
      )
    );
    showToast("Never miss twice. Tomorrow is a new day.");
  }
  function completeReclaim(data) {
    const newId = Math.max(0, 9, ...anti.map((a) => a.id)) + 1;
    setAnti((p) => [
      ...p,
      {
        id: newId,
        name: data.name,
        color: data.color,
        guarded: {},
        conflict: data.replacement,
        icon: "✦",
        blueprint: {
          type: "reclaim",
          identity: data.name,
          oldBehavior: data.oldBehavior,
          cue: data.cue,
          craving: data.craving,
          environment: data.environment,
          replacement: data.replacement,
        },
      },
    ]);
    setShowReclaim(false);
    showToast("Reclaim system added. Hold it daily.");
  }
  function completeBuild(data) {
    const newId = Math.max(0, ...habits.map((h) => h.id)) + 1;
    setHabits((p) => [
      ...p,
      {
        id: newId,
        name: data.shortName,
        color: data.color,
        log: {},
        identity: data.identity,
        stack: data.cue,
        days: data.days,
        goalCount: data.goalCount,
        goalUnit: data.goalUnit,
        habitTime: data.habitTime,
        reminder: data.reminder,
        blueprint: {
          type: "build",
          kind: data.kind,
          statement: data.statement,
          identity: data.identity,
          cue: data.cue,
          days: data.days,
          goalCount: data.goalCount,
          goalUnit: data.goalUnit,
          habitTime: data.habitTime,
          reminder: data.reminder,
        },
      },
    ]);
    setShowBuild(false);
    showToast("Habit created. Start today.");
  }
  function updateBlueprint(habitId, isAnti, newBp) {
    if (isAnti) {
      setAnti((p) =>
        p.map((x) =>
          x.id !== habitId
            ? x
            : {
                ...x,
                blueprint: newBp,
                name: newBp.identity || x.name,
                conflict: newBp.replacement || x.conflict,
              }
        )
      );
    } else {
      setHabits((p) =>
        p.map((x) =>
          x.id !== habitId
            ? x
            : {
                ...x,
                blueprint: newBp,
                identity: newBp.identity || x.identity,
                stack: newBp.cue || x.stack,
              }
        )
      );
    }
    showToast("Blueprint updated.");
  }

  const M = "'DM Mono',monospace";
  const S = "'Syne',sans-serif";
  const F = "'Bebas Neue',sans-serif";

  const TOG = (on) => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    background: on ? T.ac : T.inp,
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
    border: `1px solid ${T.br}`,
  });
  const TH = (on) => ({
    position: "absolute",
    top: 2,
    left: on ? 22 : 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: on ? (darkMode ? "#000" : "#fff") : "rgba(128,128,128,0.4)",
    transition: "left 0.2s",
  });
  const BTN = (f) => ({
    width: "100%",
    padding: "14px",
    background: f ? T.ac : T.inp,
    border: f ? "none" : `1px solid ${T.br}`,
    borderRadius: 14,
    color: f ? T.acTx : T.txS,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: S,
  });

  // ── Screen routing: cinematic intro first ──
  if (
    screen === "splash" ||
    screen === "welcome" ||
    screen === "signin" ||
    screen === "onboarding"
  ) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=Syne:wght@400;600;700;800;900&display=swap');
          @keyframes slideProg{0%{width:0%}100%{width:100%}}
          *{box-sizing:border-box}::-webkit-scrollbar{display:none}
        `}</style>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            background: "#111",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            padding: "20px 0",
          }}
        >
          {screen === "splash" && (
            <VideoSplash onDone={() => setScreen("welcome")} />
          )}
          {screen === "welcome" && (
            <Welcome
              onEnter={() => setScreen("signin")}
              onSignIn={() => setScreen("signin")}
            />
          )}
          {screen === "signin" && (
            <SignIn
              onBack={() => setScreen("welcome")}
              onComplete={() => setScreen("onboarding")}
            />
          )}
          {screen === "onboarding" && (
            <Onboarding
              onComplete={finishOnboarding}
              T={T}
              darkMode={darkMode}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=Syne:wght@400;600;700;800;900&display=swap');
        @keyframes vf{0%{opacity:0;transform:scale(0.88)}12%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(0.95)}}
        @keyframes burstExpand{0%{transform:scale(0);opacity:0.9}100%{transform:scale(45);opacity:0}}
        @keyframes burstFlash{0%{opacity:0}25%{opacity:1}100%{opacity:0}}
        @keyframes slideUp{0%{transform:translateY(100%)}100%{transform:translateY(0)}}
        @keyframes slideProg{0%{width:0%}100%{width:100%}}
        *{box-sizing:border-box}::-webkit-scrollbar{display:none}
      `}</style>
      <div
        style={{
          fontFamily: S,
          background: "#111",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            width: 390,
            minHeight: 820,
            background: bg,
            borderRadius: 36,
            border: `1px solid ${T.br}`,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            transition: "background 1.2s ease",
            boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          }}
        >
          {/* ── HEADER ── */}
          <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.txH,
                    marginBottom: 3,
                  }}
                >
                  {now.toLocaleDateString("en", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 20,
                    color: T.tx,
                    letterSpacing: 2,
                    lineHeight: 1,
                  }}
                >
                  BLACK DIAMOND
                </div>
                <div
                  style={{
                    fontFamily: M,
                    fontSize: 9,
                    color: T.txH,
                    marginTop: 2,
                  }}
                >
                  {myGroup.name} · 4 members
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  background: T.sf,
                  border: `1px solid ${T.br}`,
                  borderRadius: 14,
                  padding: "8px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 2,
                    justifyContent: "center",
                    height: 16,
                    marginBottom: 3,
                  }}
                >
                  {Array.from({ length: 7 }, (_, i) => {
                    const h = 6 + Math.round((i / 6) * 9);
                    const on = i >= 7 - Math.min(bestStreak, 7);
                    return (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          borderRadius: 2,
                          background: on ? T.tx : `${T.tx}18`,
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 24,
                    color: T.tx,
                    lineHeight: 1,
                  }}
                >
                  {bestStreak}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: T.txH,
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  streak
                </div>
              </div>
            </div>
            {tab === "today" && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: T.txH,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {lightLvl === 0
                      ? "Cast your first vote"
                      : lightLvl === 1
                      ? "Full light today ✦"
                      : lightLvl > 0.5
                      ? "Light is winning"
                      : "Light is growing"}
                  </span>
                  <span style={{ fontFamily: M, fontSize: 8, color: T.txH }}>
                    {Math.round(lightLvl * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    background: darkMode
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.07)",
                    borderRadius: 4,
                    height: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${lightLvl * 100}%`,
                      height: "100%",
                      borderRadius: 4,
                      background:
                        "linear-gradient(to right,rgba(255,200,100,0.6),rgba(255,230,180,0.9))",
                      transition: "width 0.9s ease",
                    }}
                  />
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 3,
                paddingBottom: 14,
                borderBottom: `1px solid ${T.br}`,
              }}
            >
              {wDays.map((d, i) => {
                const isT = dateKey(d) === TODAY;
                const hd = habits.some((h) => h.log[dateKey(d)]);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: M,
                        fontSize: 8,
                        color: isT ? T.tx : T.txH,
                        fontWeight: 600,
                      }}
                    >
                      {DNAMES[d.getDay()]}
                    </span>
                    <div
                      style={{
                        width: 27,
                        height: 27,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isT ? T.ac : "transparent",
                        border: isT ? "none" : `1px solid ${T.br}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: M,
                          fontSize: 11,
                          fontWeight: 700,
                          color: isT ? T.acTx : T.txS,
                          lineHeight: 1,
                        }}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: hd && !isT ? T.txH : "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 88 }}>
            {/* TODAY */}
            {tab === "today" && (
              <div>
                <div
                  style={{
                    padding: "12px 20px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Group habits
                  </span>
                  <span style={{ fontFamily: M, fontSize: 9, color: T.txM }}>
                    {coreDone} / {habits.length} today
                  </span>
                </div>
                <div
                  style={{
                    padding: "0 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {habits.map((h) => (
                    <HabitCard
                      key={h.id}
                      h={h}
                      done={!!h.log[TODAY]}
                      onDone={() => doHabit(h.id)}
                      onUndo={() => undoHabit(h.id)}
                    />
                  ))}
                </div>
                <div style={{ padding: "10px 16px 0" }}>
                  <button
                    onClick={() => setShowBuild(true)}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "transparent",
                      border: `1px dashed ${T.br}`,
                      borderRadius: 14,
                      color: T.txS,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Syne',sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    + Build a new habit
                  </button>
                </div>
                <div
                  style={{
                    margin: "14px 16px 0",
                    background: darkMode
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,200,100,0.06)",
                    border: "1px solid rgba(255,200,100,0.12)",
                    borderRadius: 18,
                    padding: "13px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 18 18"
                      fill="none"
                      stroke="rgba(255,210,100,0.6)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8" />
                    </svg>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "rgba(255,210,100,0.65)",
                      }}
                    >
                      Reclaim
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: M,
                        fontSize: 8,
                        color: T.txM,
                      }}
                    >
                      {antiDone}/{anti.length} held
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: T.txH,
                      lineHeight: 1.6,
                      marginBottom: 10,
                      fontStyle: "italic",
                    }}
                  >
                    "You don't break a habit by fighting it — you reclaim the
                    identity it stole. Hold each one daily."
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
                  >
                    {anti.map((h) => (
                      <GuardItem
                        key={h.id}
                        h={h}
                        guarded={!!h.guarded[TODAY]}
                        onGuard={() => doGuard(h.id)}
                        onBreak={() => doBreak(h.id)}
                        onDetail={() =>
                          setDetailHabit({ habit: h, isAnti: true })
                        }
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setShowReclaim(true)}
                    style={{
                      width: "100%",
                      marginTop: 9,
                      padding: "11px",
                      background: "transparent",
                      border: "1px dashed rgba(255,200,100,0.25)",
                      borderRadius: 12,
                      color: "rgba(255,200,100,0.55)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Syne',sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    + Reclaim a new habit
                  </button>
                </div>
                <div style={{ padding: "12px 16px 0" }}>
                  <button
                    onClick={() =>
                      showToast("Check-in sent! Your squad sees you.")
                    }
                    style={{
                      ...BTN(true),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 18 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 9l7-7 7 7" />
                      <path d="M9 2v13" />
                      <path d="M4 16h10" />
                    </svg>
                    Send today's check-in to squad
                  </button>
                </div>
                {lightLvl === 1 && (
                  <div
                    style={{
                      margin: "10px 16px 0",
                      background: "rgba(255,210,100,0.07)",
                      border: "1px solid rgba(255,210,100,0.18)",
                      borderRadius: 14,
                      padding: "12px 14px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 8,
                        color: "rgba(255,210,100,0.7)",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      Full light today ✦
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: T.txH,
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}
                    >
                      Every vote cast. Every shadow held back.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SQUAD */}
            {tab === "group" && (
              <div>
                <div
                  style={{
                    margin: "12px 16px 0",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: M,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: T.txH,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {myGroup.name} · {myGroup.code}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.txS,
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  >
                    "{myGroup.identity}"
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 20px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Leaderboard
                  </span>
                  <span style={{ fontFamily: M, fontSize: 9, color: T.txM }}>
                    consistency vs target
                  </span>
                </div>
                {sorted.map((m, rank) => (
                  <div
                    key={m.name}
                    style={{
                      margin: "0 16px 8px",
                      background: m.isYou
                        ? darkMode
                          ? "rgba(255,255,255,0.07)"
                          : "rgba(0,0,0,0.04)"
                        : T.sf,
                      border: `1px solid ${m.isYou ? T.txH : T.br}`,
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: `${m.color}18`,
                          border: `1.5px solid ${m.color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 800,
                          color: m.color,
                          flexShrink: 0,
                          fontFamily: F,
                          overflow: "hidden",
                        }}
                      >
                        {m.isYou && myAvatar ? (
                          <img
                            src={myAvatar}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          m.name[0]
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: T.tx,
                            }}
                          >
                            {m.name}
                          </span>
                          {m.isCap && (
                            <span
                              style={{
                                fontSize: 7,
                                fontWeight: 700,
                                background: T.sf,
                                color: T.txH,
                                padding: "2px 5px",
                                borderRadius: 6,
                                border: `1px solid ${T.br}`,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Cap
                            </span>
                          )}
                          {m.isYou && (
                            <span
                              style={{
                                fontSize: 7,
                                fontWeight: 700,
                                background: T.sf,
                                color: T.tx,
                                padding: "2px 5px",
                                borderRadius: 6,
                                border: `1px solid ${T.br}`,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              You
                            </span>
                          )}
                        </div>
                        <div
                          style={{ fontFamily: M, fontSize: 9, color: T.txH }}
                        >
                          {m.streak}d streak · {m.votes} votes ·{" "}
                          <span
                            style={{
                              color: m.trend === "up" ? "#81C784" : "#F06292",
                            }}
                          >
                            {m.trend === "up" ? "↑ up" : "↓ down"}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14 }}>{MEDALS[rank]}</div>
                        <div
                          style={{
                            fontFamily: F,
                            fontSize: 24,
                            color: m.color,
                            lineHeight: 1,
                          }}
                        >
                          {m.pct}%
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.06)",
                        borderRadius: 4,
                        height: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${m.pct}%`,
                          height: "100%",
                          background: m.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    margin: "0 16px 14px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 13,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: M,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: T.txH,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Never miss twice
                  </div>
                  <div style={{ fontSize: 11, color: T.txS, lineHeight: 1.65 }}>
                    "Missing once is an accident. Missing twice is the start of
                    a new habit." — James Clear
                  </div>
                </div>
              </div>
            )}

            {/* PROGRESS */}
            {tab === "progress" && (
              <div>
                <div
                  style={{
                    padding: "12px 20px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Progress
                  </span>
                  <span style={{ fontFamily: M, fontSize: 9, color: T.txM }}>
                    the compound curve
                  </span>
                </div>
                <div
                  style={{
                    margin: "0 16px 12px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 20,
                    padding: "28px 18px 24px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-20%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 240,
                      height: 240,
                      background:
                        "radial-gradient(circle, rgba(255,210,120,0.10) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: M,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "2px",
                      color: T.txH,
                      textTransform: "uppercase",
                      marginBottom: 8,
                      position: "relative",
                    }}
                  >
                    Total votes cast
                  </div>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 96,
                      color: T.tx,
                      lineHeight: 0.85,
                      letterSpacing: "-1px",
                      position: "relative",
                      textShadow: darkMode
                        ? "0 0 40px rgba(255,210,120,0.15)"
                        : "none",
                    }}
                  >
                    {totalVotes}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.txS,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginTop: 6,
                      marginBottom: 14,
                      position: "relative",
                    }}
                  >
                    votes for who you're becoming
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.txH,
                      lineHeight: 1.65,
                      fontStyle: "italic",
                      position: "relative",
                      maxWidth: 260,
                      margin: "0 auto",
                    }}
                  >
                    "Each action is a vote for the type of person you wish to
                    become." — James Clear
                  </div>
                </div>

                {/* Weekly + Milestone row */}
                <div style={{ margin: "0 16px 10px", display: "flex", gap: 8 }}>
                  {/* This week */}
                  <div
                    style={{
                      flex: 1,
                      background: T.sf,
                      border: `1px solid ${T.br}`,
                      borderRadius: 15,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: T.txH,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      This week
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: F,
                          fontSize: 36,
                          color: T.tx,
                          lineHeight: 1,
                        }}
                      >
                        {weeklyVotes}
                      </div>
                      <div
                        style={{ fontSize: 10, color: T.txS, fontWeight: 600 }}
                      >
                        votes
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 9,
                        color: T.txM,
                        marginTop: 3,
                      }}
                    >
                      last 7 days
                    </div>
                  </div>
                  {/* Milestone */}
                  <div
                    style={{
                      flex: 1,
                      background: T.sf,
                      border: `1px solid rgba(255,200,100,0.15)`,
                      borderRadius: 15,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: "rgba(255,210,100,0.6)",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Next milestone
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: F,
                          fontSize: 36,
                          color: T.tx,
                          lineHeight: 1,
                        }}
                      >
                        {nextMilestone}
                      </div>
                    </div>
                    <div
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.06)",
                        borderRadius: 3,
                        height: 4,
                        overflow: "hidden",
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: `${milestoneProg}%`,
                          height: "100%",
                          background:
                            "linear-gradient(to right,rgba(255,200,100,0.7),rgba(255,230,180,0.9))",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 9,
                        color: T.txM,
                        marginTop: 5,
                      }}
                    >
                      {nextMilestone - totalVotes} votes to go
                    </div>
                  </div>
                </div>
                {habits.map((h) => {
                  const vals = Array.from({ length: PD }, (_, i) =>
                    h.log[dateKey(getOffset(PD - 1 - i))] ? 100 : 0
                  );
                  // count missed in last 14
                  let missed14 = 0;
                  for (let i = 0; i < PD; i++) {
                    if (!h.log[dateKey(getOffset(i))]) missed14++;
                  }
                  return (
                    <div
                      key={h.id}
                      onClick={() =>
                        setDetailHabit({ habit: h, isAnti: false })
                      }
                      style={{
                        margin: "0 16px 8px",
                        background: T.sf,
                        border: `1px solid ${T.br}`,
                        borderRadius: 15,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ padding: "12px 14px 0" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 2,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: h.color,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: T.tx,
                              }}
                            >
                              {h.name}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: M,
                                fontSize: 10,
                                color: h.color,
                              }}
                            >
                              {successRate(h.log, PD)}%
                            </span>
                            <span style={{ color: T.txM, fontSize: 14 }}>
                              ›
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: T.txH,
                            fontStyle: "italic",
                            marginBottom: 4,
                            paddingLeft: 15,
                            lineHeight: 1.4,
                          }}
                        >
                          {h.identity}
                        </div>
                      </div>
                      <div style={{ padding: "0 12px 8px" }}>
                        <LineChart values={vals} color={h.color} />
                      </div>
                      <div
                        style={{
                          padding: "0 14px 11px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: M,
                            fontSize: 9,
                            color: missed14 > 0 ? "#F06292" : T.txM,
                          }}
                        >
                          {missed14 === 0
                            ? "no misses · 14 days"
                            : `${missed14} missed · last 14 days`}
                        </span>
                        <span
                          style={{ fontFamily: M, fontSize: 9, color: T.txM }}
                        >
                          tap for detail
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{
                    padding: "12px 20px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Reclaim progress
                  </span>
                </div>
                {anti.map((h) => {
                  const gp = Math.round(
                    (Object.values(h.guarded).filter(Boolean).length / 28) * 100
                  );
                  return (
                    <div
                      key={h.id}
                      onClick={() => setDetailHabit({ habit: h, isAnti: true })}
                      style={{
                        margin: "0 16px 8px",
                        background: T.sf,
                        border: "1px solid rgba(255,200,100,0.12)",
                        borderRadius: 15,
                        padding: "13px 14px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{h.icon}</span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.tx,
                            flex: 1,
                          }}
                        >
                          {h.name}
                        </span>
                        <span
                          style={{
                            fontFamily: M,
                            fontSize: 10,
                            color: h.color,
                          }}
                        >
                          {gp}% held
                        </span>
                      </div>
                      <div
                        style={{
                          background: darkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.06)",
                          borderRadius: 3,
                          height: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${gp}%`,
                            height: "100%",
                            background: `linear-gradient(to right,${h.color},rgba(255,210,100,0.8))`,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SETTINGS */}
            {tab === "settings" && (
              <div>
                <div style={{ padding: "12px 20px 8px" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Profile
                  </span>
                </div>
                <div
                  style={{
                    margin: "0 16px 8px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 15,
                    padding: "14px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 15,
                        background: myAvatar
                          ? "transparent"
                          : "rgba(79,195,247,0.15)",
                        border: "1.5px solid rgba(79,195,247,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: F,
                        fontSize: 22,
                        color: "#4FC3F7",
                        flexShrink: 0,
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {myAvatar ? (
                        <img
                          src={myAvatar}
                          alt="me"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "C"
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "rgba(0,0,0,0.6)",
                          padding: "2px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 18 18"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 7h2l1-2h6l1 2h2v8H3z" />
                          <circle cx="9" cy="11" r="2.5" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: T.tx,
                          marginBottom: 2,
                        }}
                      >
                        {myName}
                      </div>
                      <div
                        style={{ fontFamily: M, fontSize: 10, color: T.txH }}
                      >
                        captain · {myGroup.name}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      style={{
                        background: T.inp,
                        border: `1px solid ${T.br}`,
                        borderRadius: 10,
                        padding: "8px 12px",
                        color: T.txS,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      {myAvatar ? "Change" : "Add photo"}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                </div>
                <div style={{ padding: "12px 20px 8px" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Appearance
                  </span>
                </div>
                <div
                  style={{
                    margin: "0 16px 8px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 15,
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.tx,
                          marginBottom: 1,
                        }}
                      >
                        Dark mode
                      </div>
                      <div style={{ fontSize: 10, color: T.txH }}>
                        Default dark — switch to light anytime
                      </div>
                    </div>
                    <div
                      style={TOG(darkMode)}
                      onClick={() => setDarkMode((v) => !v)}
                    >
                      <div style={TH(darkMode)} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: "12px 20px 8px" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Your group
                  </span>
                </div>
                <div
                  style={{
                    margin: "0 16px 8px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 15,
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: T.tx,
                      marginBottom: 3,
                    }}
                  >
                    {myGroup.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.txS,
                      fontStyle: "italic",
                      lineHeight: 1.55,
                      marginBottom: 10,
                    }}
                  >
                    "{myGroup.identity}"
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontFamily: M, fontSize: 10, color: T.txH }}>
                      4 members
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 18,
                        color: T.tx,
                        letterSpacing: 4,
                      }}
                    >
                      {myGroup.code}
                    </div>
                  </div>
                  <button
                    onClick={() => showToast("Code copied!")}
                    style={BTN(false)}
                  >
                    Copy invite code
                  </button>
                </div>
                <div style={{ padding: "12px 20px 8px" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: T.txH,
                    }}
                  >
                    Notifications
                  </span>
                </div>
                <div
                  style={{
                    margin: "0 16px 8px",
                    background: T.sf,
                    border: `1px solid ${T.br}`,
                    borderRadius: 15,
                    padding: "14px",
                  }}
                >
                  {!notifOn ? (
                    <div style={{ textAlign: "center", padding: "6px 0" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.tx,
                          marginBottom: 5,
                        }}
                      >
                        Enable notifications
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.txS,
                          marginBottom: 12,
                          lineHeight: 1.6,
                        }}
                      >
                        The daily cue that starts your habit loop.
                      </div>
                      <button
                        onClick={() => setNotifOn(true)}
                        style={BTN(true)}
                      >
                        Enable notifications
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: M,
                        fontSize: 11,
                        color: T.txH,
                        textAlign: "center",
                        padding: "8px 0",
                      }}
                    >
                      Notifications enabled ✓
                    </div>
                  )}
                </div>
                <div style={{ margin: "8px 16px 20px" }}>
                  <button
                    onClick={() => setScreen("welcome")}
                    style={{
                      ...BTN(false),
                      color: "#F06292",
                      borderColor: "rgba(240,98,146,0.2)",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NAV */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: T.nav,
              backdropFilter: "blur(20px)",
              borderTop: `1px solid ${T.br}`,
              display: "flex",
              padding: "7px 0 13px",
            }}
          >
            {[
              { v: "today", label: "Today", i: "◎" },
              { v: "group", label: "Squad", i: "◉" },
              { v: "progress", label: "Progress", i: "↗" },
              { v: "settings", label: "Settings", i: "⚙" },
            ].map(({ v, label, i }) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                style={{
                  flex: 1,
                  padding: "3px 0 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  color: tab === v ? T.tx : T.txH,
                  fontFamily: S,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: tab === v ? T.tx : "transparent",
                    marginBottom: 1,
                    transition: "background 0.2s",
                  }}
                />
                <div style={{ fontSize: 16, marginBottom: 1 }}>{i}</div>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {detailHabit && (
            <HabitDetail
              h={detailHabit.habit}
              isAnti={detailHabit.isAnti}
              onClose={() => setDetailHabit(null)}
              onSaveBlueprint={updateBlueprint}
              T={T}
              darkMode={darkMode}
            />
          )}
          {showReclaim && (
            <ReclaimFlow
              onComplete={completeReclaim}
              onCancel={() => setShowReclaim(false)}
              T={T}
              darkMode={darkMode}
            />
          )}
          {showBuild && (
            <BuildFlow
              onComplete={completeBuild}
              onCancel={() => setShowBuild(false)}
              T={T}
              darkMode={darkMode}
            />
          )}
          {burst && <LightBurst color={burst} onDone={() => setBurst(null)} />}
          {flash && (
            <Flash
              text={flash.text}
              color={flash.color}
              guard={flash.guard}
              onDone={() => setFlash(null)}
            />
          )}
          <div
            style={{
              position: "absolute",
              bottom: 88,
              left: "50%",
              transform: toastOn
                ? "translateX(-50%) translateY(0)"
                : "translateX(-50%) translateY(10px)",
              background: T.ac,
              color: T.acTx,
              fontSize: 12,
              fontWeight: 700,
              padding: "9px 18px",
              borderRadius: 22,
              opacity: toastOn ? 1 : 0,
              transition: "all 0.25s",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 99,
            }}
          >
            {toast}
          </div>
        </div>
      </div>
    </>
  );
}
