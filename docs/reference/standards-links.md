# Standards & Links

!!! note "Environment links (verified 2026-09-23)"
    The BC Gov standards, repos and intake points are linked below. A few are internal
    (IDIR / SharePoint login) or handled inside ServiceNow and are marked as such. Two are
    still open (`TODO`) because no public page was found.

### Ready to use (in this framework)
These starters ship with the framework — copy them from the
[Templates & Starters](../starters/index.md) page:

- [x] **ADR template** — [Templates → ADR](../starters/index.md#architecture-decision-record-adr)
- [x] **Runbook template** — [Templates → Runbook](../starters/index.md#runbook)
- [x] **NFR worksheet** — [Templates → NFR worksheet](../starters/index.md#nfr-worksheet)
- [x] **Starter CI/CD pipeline** — [Templates → CI/CD](../starters/index.md#starter-cicd-pipeline)
- [x] **Helm deployment (resilience defaults)** — [Templates → Helm](../starters/index.md#helm-deployment-resilience-defaults)
- [x] **PR template + CODEOWNERS** — [Templates](../starters/index.md#pull-request-template)

### Environment-specific links

- [x] **DevOps Quick Start** (pipeline template, Emerald) — [bcgov/quickstart-openshift-emerald](https://github.com/bcgov/quickstart-openshift-emerald) · general: [bcgov/quickstart-openshift](https://github.com/bcgov/quickstart-openshift)
- [x] **Helm chart** repo — [bcgov/helm-charts](https://github.com/bcgov/helm-charts) *(the Quick Start line is moving toward OpenShift templates over Helm)*
- [x] **STRA** service & intake — [CITZ Cybersecurity — STRA Service](https://bcgov.sharepoint.com/sites/CITZ-Cybersecurity/SitePages/STRA-Service.aspx) *(SharePoint, IDIR login)*
- [x] **PIA** — [Complete a Privacy Impact Assessment](https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/privacy-impact-assessments/complete-a-privacy-impact-assessment)
- [x] **API management (APS)** — [API Services Portal](https://digital.gov.bc.ca/technology/api/portal/) · [BC Gov API Guidelines](https://github.com/bcgov/api-guidelines)
- [x] **Monitoring (Sysdig)** — [Sysdig Monitor onboarding](https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/app-monitoring/sysdig-monitor-onboarding/)
- [x] **Logging** — [Application logging in OpenShift](https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/app-monitoring/best-pratices-for-application-logging-in-openshift/)
- [x] **Secrets (Vault)** — [Vault Secrets Management Service](https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/secrets-management/vault-secrets-management-service/)
- [x] **Private cloud (OpenShift) — Emerald** — [Emerald internal resources](https://digital.gov.bc.ca/technology/cloud/private/internal-resources/emerald/) *(IDIR login)*
- [x] **Naming conventions** (repos) — [BC Gov repo naming](https://github.com/bcgov/BC-Policy-Framework-For-GitHub/blob/master/BC-Gov-Org-HowTo/Naming-Repos.md)
- [x] **Web / design standards & Design System** — [BC Gov Design System](https://digital.gov.bc.ca/design/design-system/)
- [ ] **CMDB** registration — handled in **My Service Centre (MySC)**, the OCIO ServiceNow ITSM platform (internal, no public page). `TODO: add the MySC CI-registration link`
- [ ] **Architecture Review Board (ARB)** intake — `TODO` (no public intake page found)

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
