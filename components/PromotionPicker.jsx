'use client'

export default function PromotionPicker({ promotion, onChange, campaignId }) {
  const { type, rate } = promotion;

  const select = (t) => onChange({ ...promotion, type: t });

  return (
    <div className="promotion-picker">
      <div className="promotion-header">
        <h3 className="promotion-title">Promote Your Listing</h3>
        <span className="promotion-badge">69% of Mirror Assemblies are promoted</span>
      </div>

      <div className="promotion-options">
        {/* None */}
        <div
          className={`promotion-card ${type === "none" ? "selected" : ""}`}
          onClick={() => select("none")}
        >
          <div className="promotion-card-top">
            <span className="promotion-card-name">No Promotion</span>
            <div className={`promotion-toggle ${type === "none" ? "on" : ""}`} />
          </div>
          <p className="promotion-card-desc">List without promoted placement.</p>
        </div>

        {/* General */}
        <div
          className={`promotion-card ${type === "general" ? "selected" : ""}`}
          onClick={() => select("general")}
        >
          <div className="promotion-card-top">
            <span className="promotion-card-name">General</span>
            <div className={`promotion-toggle ${type === "general" ? "on" : ""}`} />
          </div>
          <p className="promotion-card-desc">Pay a % of sale price only when sold via ad.</p>
          {type === "general" && (
            <div className="promotion-rate-row" onClick={(e) => e.stopPropagation()}>
              <label className="field-label">Listing ad rate</label>
              <div className="promotion-rate-input">
                <input
                  className="field-input rate-input"
                  type="number"
                  min="2"
                  max="100"
                  step="0.5"
                  value={rate}
                  onChange={(e) => onChange({ ...promotion, rate: e.target.value })}
                />
                <span className="rate-pct">%</span>
              </div>
              <p className="promotion-suggested">Suggested rate: 12.0%</p>
              {!campaignId && (
                <p className="promotion-warn">
                  ⚠ Campaign ID missing — go to Settings and paste your eBay Campaign ID.<br/>
                  <small>eBay Seller Hub → Marketing → Promoted Listings → copy the Campaign ID.</small>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Priority */}
        <div
          className={`promotion-card ${type === "priority" ? "selected" : ""}`}
          onClick={() => select("priority")}
        >
          <div className="promotion-card-top">
            <span className="promotion-card-name">Priority</span>
            <div className={`promotion-toggle ${type === "priority" ? "on" : ""}`} />
          </div>
          <div className="promotion-priority-stat">▲ 170% more visibility, on average</div>
          <ul className="promotion-priority-list">
            <li>Exclusive access to top of search</li>
            <li>Advanced targeting and bid controls</li>
            <li>Priority ranking in ad placements</li>
            <li>Only pay for clicks on your ads</li>
          </ul>
          {type === "priority" && (
            <p className="promotion-note">
              Priority promotion will be enrolled via eBay Seller Hub after publishing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
