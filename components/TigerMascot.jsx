'use client'

// Pixel-art tiger mascot — 48x48 SVG using rect elements
// States: idle | scanning | thinking | success | error | uploading

const AMBER = "#FABF00";
const DARK  = "#2D2D2D";
const PINK  = "#FF9999";
const WHITE = "#FFFFFF";

function ThoughtBubble() {
  return (
    <g className="thought-bubble">
      <rect x="14" y="-20" width="20" height="14" rx="4" fill={WHITE} stroke="#ccc" strokeWidth="1"/>
      <rect x="18" y="-8" width="4" height="3" rx="1" fill={WHITE} stroke="#ccc" strokeWidth="0.5"/>
      <rect x="20" y="-5" width="3" height="2" rx="1" fill={WHITE} stroke="#ccc" strokeWidth="0.5"/>
      <rect x="17" y="-17" width="3" height="3" rx="1" fill="#aaa"/>
      <rect x="22" y="-17" width="3" height="3" rx="1" fill="#aaa"/>
      <rect x="27" y="-17" width="3" height="3" rx="1" fill="#aaa"/>
    </g>
  );
}

function StarParticles() {
  return (
    <g className="star-particles">
      <rect x="-6" y="-6"  width="4" height="4" rx="1" fill="#FFF100" className="star-1"/>
      <rect x="50"  y="-8"  width="4" height="4" rx="1" fill="#FABF00" className="star-2"/>
      <rect x="42"  y="-14" width="3" height="3" rx="1" fill="#009C4D" className="star-3"/>
      <rect x="-4"  y="10"  width="3" height="3" rx="1" fill="#FABF00" className="star-4"/>
      <rect x="48"  y="6"   width="3" height="3" rx="1" fill="#FFF100" className="star-5"/>
    </g>
  );
}

function TigerSVG({ state }) {
  const scanning = state === "scanning";
  const eyeShift = scanning ? 3 : 0;

  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <rect x="3"  y="3"  width="12" height="9"  fill={AMBER}/>
      <rect x="33" y="3"  width="12" height="9"  fill={AMBER}/>
      <rect x="6"  y="3"  width="6"  height="6"  fill={PINK} opacity="0.8"/>
      <rect x="36" y="3"  width="6"  height="6"  fill={PINK} opacity="0.8"/>
      <rect x="3"  y="9"  width="42" height="30" rx="6" fill={AMBER}/>
      <rect x="21" y="9"  width="6"  height="5"  fill={DARK} opacity="0.55"/>
      <rect x="13" y="9"  width="3"  height="3"  fill={DARK} opacity="0.35"/>
      <rect x="32" y="9"  width="3"  height="3"  fill={DARK} opacity="0.35"/>
      <g transform={`translate(${eyeShift}, 0)`} className="tiger-eyes">
        <rect x="9"  y="18" width="10" height="7" rx="2" fill={WHITE}/>
        <rect x="12" y="19" width="6"  height="6" rx="1" fill={DARK}/>
        <rect x="29" y="18" width="10" height="7" rx="2" fill={WHITE}/>
        <rect x="30" y="19" width="6"  height="6" rx="1" fill={DARK}/>
      </g>
      <rect x="3"  y="24" width="8"  height="3"  fill={DARK} opacity="0.4"/>
      <rect x="37" y="24" width="8"  height="3"  fill={DARK} opacity="0.4"/>
      <rect x="3"  y="28" width="6"  height="2"  fill={DARK} opacity="0.25"/>
      <rect x="39" y="28" width="6"  height="2"  fill={DARK} opacity="0.25"/>
      <rect x="20" y="27" width="8"  height="4"  rx="2" fill={PINK}/>
      <rect x="15" y="32" width="4"  height="2"  rx="1" fill={DARK} opacity="0.5"/>
      <rect x="29" y="32" width="4"  height="2"  rx="1" fill={DARK} opacity="0.5"/>
      <rect x="12" y="39" width="24" height="9"  rx="3" fill={AMBER}/>
      <g className="tiger-tail" style={{ transformOrigin: "42px 42px" }}>
        <rect x="39" y="33" width="6" height="15" rx="3" fill={AMBER}/>
        <rect x="39" y="45" width="6" height="3"  rx="2" fill={DARK}/>
      </g>
      {state === "thinking" && <ThoughtBubble />}
      {state === "success"  && <StarParticles />}
    </svg>
  );
}

const STATE_LABELS = {
  idle:      "Idle",
  scanning:  "Reading…",
  thinking:  "Thinking…",
  success:   "Listed!",
  error:     "Oops!",
  uploading: "Uploading…",
};

export default function TigerMascot({ state = "idle" }) {
  return (
    <div className={`tiger-mascot tiger-${state}`} title={STATE_LABELS[state]}>
      <TigerSVG state={state} />
      {state !== "idle" && (
        <div className="tiger-label">{STATE_LABELS[state]}</div>
      )}
    </div>
  );
}
