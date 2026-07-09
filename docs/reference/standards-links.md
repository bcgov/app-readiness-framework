# Standards & Links

!!! warning "Stub — fill in internal links"
    External references are listed below. The **internal** links (BC Gov standards,
    intake forms, template repos) are placeholders — replace the `TODO` items with real
    URLs from your environment.

### Ready to use (in this framework)
These starters ship with the framework — copy them from the
[Templates & Starters](../starters/index.md) page:

- [x] **ADR template** — [Templates → ADR](../starters/index.md#architecture-decision-record-adr)
- [x] **Runbook template** — [Templates → Runbook](../starters/index.md#runbook)
- [x] **NFR worksheet** — [Templates → NFR worksheet](../starters/index.md#nfr-worksheet)
- [x] **Starter CI/CD pipeline** — [Templates → CI/CD](../starters/index.md#starter-cicd-pipeline)
- [x] **Helm deployment (resilience defaults)** — [Templates → Helm](../starters/index.md#helm-deployment-resilience-defaults)
- [x] **PR template + CODEOWNERS** — [Templates](../starters/index.md#pull-request-template)

### Environment-specific links (TODO — add real URLs)
Point these at the canonical repos / intake forms in your environment:

- [ ] Canonical **pipeline template** repo (versioned) — `TODO`
- [ ] Canonical **Helm chart** repo (versioned) — `TODO`
- [ ] **STRA** intake — `TODO`
- [ ] **PIA** intake — `TODO`
- [ ] **CMDB** registration process — `TODO`
- [ ] **Naming conventions** standard — `TODO`
- [ ] **BC Gov web / design standards** & design system — `TODO`
- [ ] **Architecture Review Board (ARB)** intake — `TODO`
- [ ] Logging platform ("the Hive") onboarding — `TODO`
- [ ] **Sysdig** monitoring onboarding — `TODO`

## External references

These are the bodies of practice this framework draws on. Use them for depth.

| Topic | Reference |
|---|---|
| Production readiness, SLOs, on-call | Google SRE Book — *Production Readiness Review*, *Service Level Objectives* |
| Reliability & operational excellence | AWS Well-Architected & Azure Well-Architected — Reliability / Operational Excellence pillars |
| Cloud-native app design | The Twelve-Factor App; CNCF cloud-native principles |
| Application security | OWASP Top 10; OWASP ASVS; OWASP SAMM |
| Secure development lifecycle | NIST SSDF (SP 800-218) |
| Software supply chain | SLSA framework; SBOM (CycloneDX / SPDX); Sigstore/cosign |
| Resilience patterns | "Release It!" (Nygard) — circuit breaker, bulkhead, timeout patterns |
| Delivery performance metrics | DORA / Accelerate — deploy frequency, lead time, change-fail rate, MTTR |
| Accessibility | WCAG 2.2 AA |
| Requirement keywords | RFC 2119 (MUST / SHOULD / MAY) |

> When you cite a standard in guidance, link the specific page so reviewers (and Jeremy
> Vernon / directors) can verify it.
