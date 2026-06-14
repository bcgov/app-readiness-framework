# Criticality Tiers

Not every application needs gold-grade disaster recovery, 24×7 on-call, and
multi-region failover. Over-engineering a low-risk internal tool wastes money;
under-engineering a mission-critical system causes outages and harm. **The tier
decides which `MUST`s apply.**

!!! important "Decide your tier at G1 (design), with the business — not at handover"
    Don't ask the business *"do you want high availability?"* — they will always say
    *"24/7, 365."* Ask **how long they can actually be down before there is real harm**,
    and **how much data they can afford to lose**. Those answers set the tier, the
    [RTO/RPO](../design-build/nfrs.md), and ultimately the cost.

## The tiers

| | **Tier 1 — Mission-critical** | **Tier 2 — Business-important** | **Tier 3 — Supporting** |
|---|---|---|---|
| **Typical examples** | Public-facing services; core case / court / justice systems; anything where downtime causes legal, financial, safety, or reputational harm | Internal line-of-business apps that a team depends on daily | Internal tools, reporting utilities, low-usage apps |
| **Tolerable downtime (RTO)** | Minutes to ~1 hour | Hours (same business day) | A day or more |
| **Tolerable data loss (RPO)** | Near-zero | Minutes to hours | Up to a day |
| **Availability target** | High (e.g. ≥ 99.9%) | Moderate (e.g. ~99.5%) | Best-effort |
| **Support hours** | Up to 24×7 | Business hours + on-call escalation | Business hours, best-effort |
| **Audience** | Often public / external | Internal staff | Internal, small group |

> These thresholds are starting points. Record the agreed values as
> [non-functional requirements](../design-build/nfrs.md); they are what actually
> drive design and cost.

## What each tier requires

The table below summarises how the major guardrails scale. Detailed requirements live
on each topic page.

| Requirement area | Tier 3 | Tier 2 | Tier 1 |
|---|---|---|---|
| **[CI/CD pipeline](../design-build/cicd-devsecops.md)** with SAST, SCA, secret + image scanning | MUST | MUST | MUST |
| **Automated test coverage** | SHOULD (≥ 70%) | MUST (≥ 80%) | MUST (≥ 85%) |
| **SBOM + signed artifacts + provenance** | SHOULD | MUST | MUST |
| **[Resilience patterns](../design-build/application-resilience.md)** (timeouts, retries, circuit breakers, graceful shutdown) | SHOULD | MUST | MUST |
| **Stateless / externalised session** | SHOULD | MUST | MUST |
| **Multiple replicas + PodDisruptionBudget** | MAY | MUST | MUST |
| **HA database / replication** | MAY | SHOULD | MUST |
| **Disaster recovery plan + tested restore** | SHOULD | MUST | MUST |
| **[Observability](#)** (metrics, logs, traces) + alerting | SHOULD | MUST | MUST |
| **SLIs/SLOs + error budget** | MAY | SHOULD | MUST |
| **Load / performance test evidence** | MAY | SHOULD | MUST |
| **Chaos / failover test evidence** | — | SHOULD | MUST |
| **Threat model + STRA/PIA** | Per Security & Privacy intake | MUST | MUST |
| **Runbook + on-call model** | SHOULD | MUST | MUST |
| **[Production Readiness Review](../readiness/production-readiness-review.md)** | Lightweight | MUST | MUST |

## How to classify

Pick the **highest** tier for which *any* statement is true:

- **Tier 1** if: the application is public/external facing; OR an outage would cause
  legal, financial, safety, privacy, or significant reputational harm; OR it handles
  highly sensitive data; OR the business cannot tolerate more than ~1 hour of downtime
  or meaningful data loss.
- **Tier 2** if: an internal team's daily work depends on it; OR an outage is
  disruptive but tolerable for a few hours; OR it holds moderately sensitive data.
- **Tier 3** otherwise: limited audience, low impact if briefly unavailable.

When in doubt, classify **up** and discuss with the architecture team. Record the tier
and the reasoning in the [ServiceNow readiness record](../reference/servicenow-process.md)
and, ideally, an ADR.

!!! note "Data classification is related but separate"
    Sensitivity/security classification (and whether the app is internal or
    public-facing) also determines which environment/cluster it belongs in and which
    privacy and security assessments are required. Capture it alongside the tier.
