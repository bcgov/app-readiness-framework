# Production Readiness Review (PRR)

The PRR is **gate G3** — the checkpoint an application must pass **before go-live** and
before operations accepts it for support. It is the modern replacement for the old
handover checklist: instead of paperwork filled in at the end, it confirms that the
guardrails were actually followed and that the application is genuinely operable.

!!! info "How it's run"
    The PRR is recorded as a **[ServiceNow readiness record](../reference/servicenow-process.md)**,
    opened early and completed as evidence accumulates. Operations/SRE reviews and
    signs off. Depth scales by [criticality tier](../principles/criticality-tiers.md):
    Tier 3 is lightweight; Tier 1/2 require the full review with evidence attached.

## Get your review checklist

The review items are **generated, not maintained by hand** — so the list is always
right-sized to your tier and platform, and never drifts from the source.

[:octicons-arrow-right-24: Build your PRR checklist](../checklist/checklist-generator.md){ .md-button .md-button--primary }

Answer the six questions and you get the exact items your application must evidence — across
**design, build, resilience, data & DR, observability, security, operability**, and (for
vendor-built apps) **contractual** deliverables. Each item asks for an **evidence link**, not
a yes/no — that evidence is what Operations/SRE signs off against.

---

## Sign-off

Record the decision here and in the ServiceNow readiness record.

| Role | Name | Decision | Date |
|---|---|---|---|
| Product owner | | Approve / Conditional / Reject | |
| Architecture | | | |
| Operations / SRE | | | |
| Security & Privacy | | | |

**Outstanding items / waivers:** any unmet `MUST` requires an explicit, time-boxed
**waiver** with an owner and a remediation date — recorded here and in the readiness record.

!!! tip "Retrofitting existing applications"
    For applications already in production (e.g. the OpenShift fleet), run the PRR as a
    **gap assessment**: generate the checklist, score each section, and log the gaps as
    prioritised remediation work (resilience and observability first). That turns the
    framework into a remediation backlog, not just a gate for new builds.
