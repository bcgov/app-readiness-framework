# Non-Functional Requirements (NFRs)

Functional requirements describe *what the system does*. **Non-functional requirements
describe how well it must do it** — performance, availability, security, scalability,
usability, and so on. They are routinely missed, and that gap is exactly what makes
applications unsupportable later.

!!! note "Why this page is explicit"
    "Capture the NFRs" is often met with blank looks. So this page **defines each NFR,
    gives the question to ask, and provides a worksheet to fill in.** Complete it at
    **G1 (design)** — the answers drive the architecture, the
    [criticality tier](../principles/criticality-tiers.md), and the cost.

## How to gather them

- Ask the **business**, not the build team, for the *needs* — then translate to targets.
- **Don't ask "do you want it fast / always up?"** — everyone says yes. Ask the
  inverted question: *"How slow is too slow? How long can you be down before there's
  real harm? How much data can you afford to lose?"*
- Every target should be **measurable** (a number), **testable**, and **tied to a tier**.
- Record assumptions and trade-offs in an ADR.

## The NFR catalogue

### Performance
*How responsive must it be under expected load?*

- **Response time** — target latency for key transactions (e.g. p95 < 500 ms).
- **Throughput** — transactions/requests per second at peak.
- **Batch windows** — any job that must finish within a time window.

### Scalability & capacity
*How much, and how much growth?*

- **Concurrent users** at average and peak.
- **Data volume** today and projected growth (drives storage and DB sizing).
- **Scaling approach** — horizontal (preferred; see [autoscaling](application-resilience.md#10-set-resource-requests-and-limits)).

### Availability & reliability
- **Availability target** (uptime %) — tie to tier.
- **RTO (Recovery Time Objective)** — how quickly service must be restored after a
  failure. *Question: how long can you be down before it's a serious problem?*
- **RPO (Recovery Point Objective)** — how much recent data you can afford to lose.
  *Question: if we restore from the last backup, how much work is acceptable to redo?*
- **Maintenance windows** — is planned downtime acceptable, or must updates be
  zero-downtime?

!!! tip "RTO/RPO drive cost"
    Near-zero RTO/RPO means HA databases, replication, hot standby, failover testing —
    real money. Generous RTO/RPO (e.g. "restore from backup overnight is fine") is far
    cheaper. Get the *business* to choose with eyes open. There is a direct line from
    these two numbers to the [resilience patterns](application-resilience.md) you must build.

### Security & privacy
- Data classification / sensitivity; internal vs public-facing.
- Authentication & authorization model (see Security & Privacy).
- Compliance obligations (privacy/FOIPPA, retention, residency).

### Usability & accessibility
- **WCAG 2.2 AA** is required for public-facing applications; strongly recommended for
  internal ones.
- Supported browsers/devices; localisation (e.g. English/French) if required.

### Maintainability & operability
- Supportability expectations, support hours, on-call model (see
  [PRR](../readiness/production-readiness-review.md)).
- Observability requirements (what must be measurable).

### Interoperability & data
- Integrations / APIs and their own availability needs.
- Data lifecycle: retention, archival, deletion (see Data Management).

---

## NFR worksheet

Copy this into the project's design docs / ServiceNow readiness record and fill it in.
Replace the examples with agreed, measured values.

| NFR | Question to the business | Target (fill in) | Tier driver |
|---|---|---|---|
| Response time | How slow is too slow for the main task? | _e.g. p95 < 500 ms_ | Perf |
| Throughput | Busiest realistic moment? | _e.g. 50 req/s peak_ | Perf/scale |
| Concurrent users | How many at once, peak? | _e.g. 300_ | Scale |
| Data growth | How much data, growing how fast? | _e.g. 20 GB, +30%/yr_ | Capacity |
| Availability | Acceptable uptime? | _e.g. 99.9%_ | Tier |
| **RTO** | How long can you be down before real harm? | _e.g. 1 hour_ | Tier/DR |
| **RPO** | How much recent data can you lose? | _e.g. 5 min_ | Tier/DR |
| Maintenance | Is planned downtime OK? | _e.g. no — zero-downtime_ | Resilience |
| Data sensitivity | Classification? Internal/public? | _e.g. internal, medium_ | Security |
| Auth model | Who logs in, how? | _e.g. IDIR; RBAC_ | Security |
| Accessibility | Public-facing? | _e.g. yes → WCAG 2.2 AA_ | Usability |
| Support hours | When must it be supported? | _e.g. business hrs + on-call_ | Operability |
| Retention/deletion | How long is data kept; deletion rules? | _e.g. 7 yrs then purge_ | Data |
| Integrations | What does it depend on / serve? | _e.g. ICM (REST)_ | Interop |

> A completed worksheet is a required input to G1 design sign-off and the
> [Production Readiness Review](../readiness/production-readiness-review.md).
