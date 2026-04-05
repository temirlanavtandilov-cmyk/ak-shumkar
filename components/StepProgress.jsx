'use client'

const STEPS = ["Upload", "OCR", "Generate", "Review"];

export default function StepProgress({ step, loading }) {
  return (
    <div className="step-progress">
      <div className="step-track">
        {STEPS.map((label, i) => {
          const completed = step > i;
          const active = step === i;
          return (
            <div className="step-item" key={i}>
              {i > 0 && (
                <div className={`step-line ${step > i ? "filled" : ""}`} />
              )}
              <div className="step-node-wrap">
                <div
                  className={`step-node ${completed ? "completed" : ""} ${active ? "active" : ""} ${active && loading ? "pulsing" : ""}`}
                >
                  {completed ? (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <polyline points="2,5 4,7.5 8,2.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`step-label ${active ? "active" : ""} ${completed ? "completed" : ""}`}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="step-cost-chip">~$0.004 / listing</div>
    </div>
  );
}
