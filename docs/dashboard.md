# Portfolio Dashboard

A live snapshot of the **application readiness portfolio** — the same data tracked per project
in the [ServiceNow readiness record](reference/servicenow-process.md). Each application opens a
record at G1 and works through the gates; this is the roll-up operations and the business see.
{ .arr-dash-intro }

<div class="arr-dash-band">
  <span class="arr-dash-band__icon">📊</span>
  <div>
    <div class="arr-dash-band__title">Application Readiness — Executive Overview</div>
    <div class="arr-dash-band__sub">Application Development, Readiness &amp; Resilience Framework</div>
  </div>
</div>

<div class="arr-metric-grid">
  <div class="arr-metric"><div class="arr-metric__label">Total records</div><div class="arr-metric__value">4</div></div>
  <div class="arr-metric"><div class="arr-metric__label">Approved for go-live</div><div class="arr-metric__value" style="color:#198038">1</div></div>
  <div class="arr-metric"><div class="arr-metric__label">Awaiting sign-off</div><div class="arr-metric__value" style="color:#0043ce">2</div></div>
  <div class="arr-metric"><div class="arr-metric__label">Avg readiness</div><div class="arr-metric__value">58%</div></div>
</div>

<div class="arr-chart-grid">
  <div class="arr-chart-card">
    <div class="arr-chart-card__title">By criticality tier</div>
    <div class="arr-chart-card__canvas"><canvas id="arrTierChart" role="img" aria-label="Readiness records by criticality tier: Tier 1 has 2, Tier 2 has 1, Tier 3 has 1."></canvas></div>
  </div>
  <div class="arr-chart-card">
    <div class="arr-chart-card__title">By status</div>
    <div class="arr-chart-card__canvas"><canvas id="arrStatusChart" role="img" aria-label="Readiness records by status: Draft 1, In review 1, Conditional 1, Approved 1."></canvas></div>
  </div>
  <div class="arr-chart-card arr-chart-card--wide">
    <div class="arr-chart-card__title">By lifecycle gate</div>
    <div class="arr-chart-card__canvas"><canvas id="arrGateChart" role="img" aria-label="Readiness records by lifecycle gate: G1 Design 1, G2 Build 0, G3 Production Readiness Review 2, G4 Operate 1."></canvas></div>
  </div>
</div>

!!! note "How this connects"
    The framework site is the **guidance**; the [ServiceNow readiness record](reference/servicenow-process.md)
    is the **evidence and gate**. This dashboard is the portfolio roll-up of those records — tier mix,
    where each app sits in the [lifecycle gates](principles/criticality-tiers.md), and what is cleared,
    in review, or blocked on sign-off.
