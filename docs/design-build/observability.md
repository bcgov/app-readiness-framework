# Observability

!!! quote "The core principle"
    You cannot operate — or debug at 2 a.m. — what you cannot see. Observability is
    **not a go-live add-on**; instrument from the first commit. **Metrics** tell you
    *something is wrong*, **logs** tell you *what happened*, **traces** tell you *where*.

Monitoring and logging are **mandatory**, not optional. The standard tooling is
**Sysdig** for metrics and dashboards and **the Hive** for centralised logs. You **MAY**
use additional tooling, but the app **MUST** emit metrics and structured logs to these
platforms. Depth scales by [criticality tier](../principles/criticality-tiers.md).

---

## The three pillars

| Pillar | Question it answers | Standard tooling |
|---|---|---|
| **Metrics** | Is the system healthy right now? Is it getting worse? | Sysdig |
| **Logs** | What exactly happened for this request/error? | The Hive |
| **Traces** | Where, across services, did the time or failure go? | Distributed tracing |

## 1. Metrics (Sysdig)

**MUST:** expose application and runtime metrics and build **Sysdig dashboards** for the
service.

- Instrument the **RED** signals for request-driven services — **R**ate, **E**rrors,
  **D**uration — and the **USE** signals for resources — **U**tilisation,
  **S**aturation, **E**rrors.
- Emit **business metrics** that matter to the service (e.g. submissions processed,
  queue depth), not just infrastructure counters.
- Every Tier 1/2 service has at least one **dashboard** that an on-call responder can
  open and understand in seconds.

## 2. Logging (the Hive)

**MUST:** ship **structured (JSON) logs** to **the Hive** — not plain text, not
node-local files.

- Put a **correlation / trace ID** on every log line and **propagate it** across service
  boundaries, so one request can be followed end to end.
- Use consistent **log levels** (`ERROR` / `WARN` / `INFO` / `DEBUG`) and log events, not
  prose. Include context (user/session ID *reference*, operation, outcome) — never the
  data itself.
- **Never log secrets or personal information** — no credentials, tokens, or
  unmasked personal data. See [Security & Privacy](security-privacy.md).

!!! warning "Audit logging is separate from application logging"
    Security- and records-relevant events — authentication, authorization decisions,
    and **changes to data** — need an **audit trail** that is tamper-evident and retained
    per the [data retention schedule](data-management.md#5-retention-archival-deletion).
    This matters especially for OpenShift apps where pods are ephemeral.

## 3. Distributed tracing

**MUST (Tier 1) / SHOULD (Tier 2):** trace requests across services and propagate trace
context (e.g. W3C `traceparent`). Tracing is how you find the one slow hop in a chain of
calls that a single service's metrics will never reveal.

## 4. SLIs, SLOs & error budgets

**MUST (Tier 1) / SHOULD (Tier 2):** define what "healthy" means numerically.

- **SLI** (indicator) — a measured signal: availability, p95 latency, error rate.
- **SLO** (objective) — the target for that signal, tied to the
  [tier](../principles/criticality-tiers.md) and the agreed
  [NFRs](nfrs.md) (e.g. "99.9% of requests succeed under 500 ms").
- **Error budget** — the allowed shortfall. When it's spent, slow down and stabilise
  before shipping more features.

## 5. Alerting

**MUST:** alerts are **actionable** and **route to the on-call owner** named in the
[readiness record](../reference/servicenow-process.md).

- Alert on **symptoms and SLO burn** (users are affected), not on every transient blip —
  noisy alerts get muted, and a muted alert is worse than none.
- **No unowned alerts.** Every alert has a runbook link and a clear "what to do."
- A page that fires with no defined response is a defect, not observability.

## 6. Onboarding

Getting a service onto the platforms is a one-time setup — see the onboarding links on
the [Standards & Links](../reference/standards-links.md) page for **Sysdig** and **the
Hive**. Wire log/metric shipping into the [standard pipeline & Helm
templates](cicd-devsecops.md) so it's inherited, not reinvented per app.

## How it scales by tier

| Capability | Tier 3 | Tier 2 | Tier 1 |
|---|---|---|---|
| Metrics in Sysdig + dashboard | SHOULD | MUST | MUST |
| Structured logs to the Hive + correlation IDs | SHOULD | MUST | MUST |
| Audit logging of security/data events | SHOULD | MUST | MUST |
| Distributed tracing | MAY | SHOULD | MUST |
| SLIs/SLOs defined | MAY | SHOULD | MUST |
| Error budget policy | — | MAY | SHOULD |
| Actionable alerts routed to on-call | SHOULD | MUST | MUST |

---

## Quick checklist

- [ ] Metrics emitted (RED/USE) and a **Sysdig dashboard** exists
- [ ] **Structured JSON logs** shipping to **the Hive** with correlation/trace IDs
- [ ] No secrets or personal information in logs
- [ ] Audit trail for authn/authz and data changes, retained per policy
- [ ] Distributed tracing (Tier 1/2) with context propagation
- [ ] **SLIs/SLOs defined** and tied to tier/NFRs
- [ ] **Alerts are actionable**, carry a runbook link, and route to the on-call owner
- [ ] Observability wired in via the standard pipeline/Helm templates
