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

Each item below asks for **evidence** (a link), not a yes/no claim.

---

## 1. Design & decisions (confirms G1)
- [ ] Criticality tier assigned and justified
- [ ] [NFR worksheet](../design-build/nfrs.md) complete (incl. RTO/RPO, performance targets)
- [ ] Architecture diagram and **ADRs** in the repo (the technical-design record)
- [ ] Threat model done; STRA (and PIA if personal information) submitted/approved

### Solution & feature documentation
*Replaces the legacy FDD/TDD. For modified applications this MUST describe the **whole**
solution — existing features as well as new — not just the delta.*

- [ ] **Functional / solution documentation** in the repo — what the system does and its
      **complete feature set** (existing + new), kept current
- [ ] **Release notes / changelog** for this release — **new, changed, and removed**
      features, so old-vs-new is always traceable
- [ ] Integrations / interfaces and external dependencies documented

## 2. Build & supply chain (confirms G2)
- [ ] Pipeline uses the standard template (or inherits all
      [mandatory attributes](../design-build/cicd-devsecops.md#the-mandatory-pipeline-attributes))
- [ ] Test coverage meets the tier threshold — link to report
- [ ] SAST, SCA, secret scan, image scan all passing — no unresolved criticals/highs
- [ ] **SBOM** generated; artifacts **signed**; provenance available (Tier 1/2)
- [ ] No secrets in source or env vars; all runtime secrets stored in and injected from **HashiCorp Vault** (Vault Agent Injector or CSI driver)

## 3. Resilience (confirms [Application Resilience](../design-build/application-resilience.md))
- [ ] Stateless / session externalised
- [ ] Timeouts on all external calls; safe retries; idempotent writes
- [ ] Circuit breakers / bulkheads on external deps (Tier 1)
- [ ] Liveness / readiness / startup probes implemented and meaningful
- [ ] Graceful `SIGTERM` shutdown + connection draining
- [ ] ≥ 2 replicas + PodDisruptionBudget + anti-affinity (Tier 1/2)
- [ ] Resource requests/limits set; HPA configured (Tier 1/2)
- [ ] **Rolling update verified zero-downtime** (the test that catches most incidents)

## 4. Data & DR
- [ ] HA data layer appropriate to tier
- [ ] **Backups configured and a restore has been tested** (meets RPO)
- [ ] DR plan documented; **failover tested**; actual RTO measured (Tier 1)
- [ ] **Data classified** by the **Product Owner / product team** (the *Data Owner*),
      per the BC Gov **Data Governance Job Aid** standard
- [ ] Data **retention / archival / deletion** schedule defined by the Data Owner and
      implemented in the application
- [ ] **Data governance roles named** — Data Owner (PO), Data Steward (data quality &
      definitions), Data Custodian (storage / DBA / access control)
- [ ] Data Interoperability engaged where relevant

## 5. Observability
- [ ] Metrics in **Sysdig**; dashboards exist
- [ ] **Structured logs** shipping to the central logging platform (the Hive), with
      correlation/trace IDs
- [ ] Distributed tracing (Tier 1/2)
- [ ] **SLIs/SLOs defined**; actionable **alerts** route to the on-call owner

## 6. Security & access
- [ ] AuthN/AuthZ implemented (IDIR/Keycloak/BC Services Card as appropriate); RBAC defined
- [ ] Access management process defined (who approves access; who can support)
- [ ] Encryption in transit and at rest
- [ ] Vulnerability/pen-test evidence (Tier 1); TLS configuration verified
- [ ] Vulnerability-management SLAs understood and owned

## 7. Performance
- [ ] **Load/performance test to peak** completed — meets NFR targets (evidence attached)
- [ ] Chaos/failover test evidence (Tier 1 MUST, Tier 2 SHOULD)
- [ ] Capacity plan / autoscaling validated

## 8. Operability & support
- [ ] **Runbook** complete: deploy, rollback, restart, common failures, escalation
- [ ] On-call / support model defined; support hours agreed and funded
- [ ] **Application registered in the CMDB**
- [ ] **Change & release management** defined: RFC / change-control process, release
      cadence (scheduled vs ad-hoc), and **who authorizes a rollback**
- [ ] **Service Desk enabled**: notified, call-handling script / knowledge article
      provided, escalation path to the support owner wired up
- [ ] Defect/backlog tooling in place (JIRA); **defect "tombstone" list** provided at
      go-live for import into the standard tool
- [ ] User documentation **and support-staff training** materials (where applicable)

## 9. Contractual (vendor-built)
- [ ] Mandatory items (coverage %, SBOM, runbook, support terms) are **contract/SOW
      deliverables** — not optional extras
- [ ] **SLA** agreed — the contractual availability/response commitment (distinct from
      the engineering SLOs in §5)
- [ ] **Third-party support agreements** in place for any dependencies the vendor relies on
- [ ] Maintenance terms cover keeping the above true after changes (e.g. maintaining
      coverage, not just hitting it once)

## 10. Cost & sustainability (internal)
*Owned by the ministry/business, not the vendor — but confirmed before go-live.*

- [ ] **Operating-cost estimate** documented (compute/platform, licensing, support effort)
- [ ] Operating cost **approved by the Expense Authority** — named
- [ ] **Support is funded** for the agreed support hours and model (§8)

---

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Product owner | | Approve / Conditional / Reject | |
| Architecture | | | |
| Operations / SRE | | | |
| Security & Privacy | | | |

**Outstanding items / waivers:** any unmet `MUST` requires an explicit, time-boxed
**waiver** with an owner and remediation date — recorded here and in the readiness record.

!!! tip "Retrofitting existing applications"
    For applications already in production (e.g. the OpenShift fleet), run this PRR as a
    **gap assessment**: score each section, log gaps as prioritised remediation work
    (resilience and observability gaps first). This makes the framework a remediation
    backlog, not just a gate for new builds.
