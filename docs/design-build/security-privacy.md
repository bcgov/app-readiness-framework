# Security & Privacy

!!! quote "The core principle"
    Security and privacy are **designed in, not bolted on**. Decide the authentication
    model, access rules, data classification, and privacy obligations *before* you build —
    retrofitting them after go-live is expensive and usually incomplete.

The **build-time** controls — SAST, SCA, secret scanning, image scanning, SBOM, signing,
and secrets in **Vault** — live in [CI/CD & DevSecOps](cicd-devsecops.md). This page
covers the **design-time and runtime** security and privacy expectations. Depth scales by
[criticality tier](../principles/criticality-tiers.md).

---

## 1. Authentication & authorization

**MUST:** implement authentication and authorization with an approved identity provider —
don't roll your own.

| Audience | Standard identity provider |
|---|---|
| Internal staff | **IDIR** (via **Keycloak** as the broker/SSO layer) |
| Business partners | **BCeID** through Keycloak |
| Public / citizens | **BC Services Card** |

- **RBAC** with **least privilege** and **deny by default** — a user gets the minimum
  role needed, and unlisted actions are denied.
- Secure **service-to-service** calls (mTLS or signed tokens), not implicit network trust.
- Sessions follow the [resilience](application-resilience.md#1-be-stateless) rules —
  externalised or stateless tokens, never in-memory.

## 2. Access management

**MUST:** define **who approves access** and **who supports it**, and decide whether you
integrate with the **existing access-management team** or run your own process (and
justify it if so).

- Maintain an **approver matrix** — which role approves access to what.
- Use **role-based provisioning by job function** where possible: e.g. an *EA
  automatically receives a defined role* without a per-request approval, while
  elevated/exception access goes through explicit approval.
- Cover the full lifecycle: **joiner / mover / leaver**, and a **periodic access
  recertification** so access doesn't accumulate silently.

## 3. Data classification & privacy

**MUST:** classify the data and complete the required assessments **at G1**.

- **Classify** the data — Public / Protected A / B / C — per the **BC Gov Data
  Governance Job Aid**. Classification drives which cluster the app belongs in and which
  controls apply. See [Data Management](data-management.md#2-data-classification).
- **STRA** (Security Threat & Risk Assessment) — submitted and approved.
- **PIA** (Privacy Impact Assessment) — required if the app handles **personal
  information**; observe **FOIPPA** obligations and any **data-residency** requirement.

## 4. Encryption

**MUST:**

- **In transit** — TLS 1.2+ (prefer 1.3), HSTS, modern cipher suites; no plaintext
  internal hops for sensitive data.
- **At rest** — encrypt databases, volumes, and **backups**.
- **Secrets** — stored in and injected from **HashiCorp Vault**; never in source or
  environment variables with literal values (see [CI/CD & DevSecOps](cicd-devsecops.md)).

## 5. Vulnerability management

Detection is largely automated in the [pipeline](cicd-devsecops.md#the-mandatory-pipeline-attributes)
(SAST, SCA, secret, image, and — for web apps — DAST). Beyond detection:

- **Penetration test** evidence for Tier 1 (and public-facing) applications.
- Findings are **owned** and fixed within the **vulnerability-management SLAs** — the
  clock by which each severity must be remediated:

| Severity | Remediate within (Tier 1) | Remediate within (Tier 2/3) |
|---|---|---|
| **Critical** | 72 hours | 7 days |
| **High** | 7 days | 30 days |
| **Medium** | 30 days | 90 days |
| **Low** | 90 days / next release | Next release |

> These are baseline targets — record the agreed SLAs and the accountable owner in the
> [readiness record](../reference/servicenow-process.md). An unremediated Critical or High
> past its SLA blocks the gate.

## 6. TLS & configuration hardening

**MUST:** verify the running configuration, not just the code.

- No weak protocols or ciphers; valid, monitored certificates with a **rotation** plan.
- Security headers (HSTS, CSP where applicable) for web apps.
- Confirm externally (e.g. a TLS/endpoint scan) and attach the evidence to the PRR.

## How it scales by tier

| Requirement | Tier 3 | Tier 2 | Tier 1 |
|---|---|---|---|
| AuthN/AuthZ via approved IdP + RBAC | MUST | MUST | MUST |
| Access process + approver matrix | SHOULD | MUST | MUST |
| Data classification | MUST | MUST | MUST |
| STRA | Per intake | MUST | MUST |
| PIA (if personal information) | If applicable | MUST | MUST |
| Encryption in transit & at rest | MUST | MUST | MUST |
| Penetration test | MAY | SHOULD | MUST |
| Vulnerability-management SLAs owned | SHOULD | MUST | MUST |
| Access recertification | MAY | SHOULD | MUST |

---

## Quick checklist

- [ ] AuthN/AuthZ via IDIR/Keycloak/BCeID/BC Services Card as appropriate; **RBAC**, least privilege
- [ ] Access process defined: approvers, role-by-job-function, joiner/mover/leaver, recertification
- [ ] Data **classified**; **STRA** submitted/approved; **PIA** where personal information
- [ ] Encryption **in transit and at rest**; secrets in **Vault**
- [ ] Pipeline scans passing; **pen test** (Tier 1); no unresolved criticals/highs
- [ ] **Vulnerability-management SLAs** understood, owned, and being met
- [ ] TLS configuration verified externally; certificates monitored and rotated
