# Data Management

!!! quote "The core principle"
    The **data outlives the application**. A new app usually means a new data model and
    new records that someone else will have to correct, report on, and eventually delete —
    for years after the project team has moved on. Govern it from day one.

Data is where the meeting kept landing: not just *storing* it, but **owning, correcting,
integrating, reporting on, and retiring** it. This page covers the data expectations;
data **classification** also drives security controls (see
[Security & Privacy](security-privacy.md)) and DR sits with
[resilience](application-resilience.md#11-resilient-data-layer). Depth scales by
[criticality tier](../principles/criticality-tiers.md).

---

## 1. Data governance roles

**MUST:** name a real person for each — "the team" is not an owner.

| Role | Who | Accountable for |
|---|---|---|
| **Data Owner** | Product Owner | Classification, retention rules, and access decisions |
| **Data Steward** | Business/data SME | Data quality, definitions, correcting records |
| **Data Custodian** | DBA / platform | Storage, backups, access control, technical safeguards |

## 2. Data classification

**MUST:** classify the data — **Public / Protected A / B / C** — per the **BC Gov Data
Governance Job Aid**, set by the **Data Owner**. Classification decides which
environment/cluster the app belongs in and which privacy and security assessments are
required. See [Security & Privacy](security-privacy.md#3-data-classification-privacy).

## 3. Data model & quality

**MUST (new data models):** design the model deliberately — don't let it accrete.

- Document the **schema / ERD** and keep it with the solution documentation.
- Enforce **validation, constraints, and referential integrity** at the data layer, not
  only in the UI.
- Design **uniqueness** deliberately to prevent duplicate entities from being created in
  the first place (see records management below).

## 4. Records management

The part most handovers forget — and the part Operations inherits:

- **How is a wrong record corrected?** Is there a **steward-facing screen** for it, or
  must every correction go through a DBA running SQL against the back-end database? A
  Tier 1/2 app **SHOULD** give stewards a supported way to fix data without raw DB access.
- **Duplicate-entity resolution** — how do you investigate and **merge a duplicate
  person/record**? Define the process and, ideally, the tooling.
- Every data change is **auditable** — tie into
  [audit logging](observability.md#2-logging-the-hive).

## 5. Retention, archival & deletion

**MUST:** the **Data Owner** defines the schedule and it is **implemented in the
application** — data must not simply grow forever.

- **Retention** — how long each data category is kept, and why (business, legal, FOIPPA).
- **Archival** — move cold/long-term data out of the hot store; engage the **OHI data
  archival** service for long-term retention where applicable.
- **Deletion** — secure, auditable deletion at end of life; honour **legal holds** that
  suspend deletion.

## 6. Data interoperability & integration

**SHOULD:** engage the **Data Interoperability team early** — especially for a new data
model, shared/reference data, or integrations.

- Get them in at **G1**, not at handover — see the engagement/intake link on
  [Standards & Links](../reference/standards-links.md).
- Document **APIs and interfaces**; prefer governed, reusable interfaces over
  point-to-point sprawl.
- Identify **master / reference data** and who is the authoritative source.

## 7. Reporting, analytics & the corporate data warehouse

**SHOULD:** decide the reporting story at design time, not after go-live.

- Does the application need to **feed the corporate data warehouse**? Define what,
  how, and how often.
- Capture **reporting and analytics** needs as requirements.
- **Don't run heavy reporting against the transactional database** in a way that harms
  the application's performance — separate the read path if needed.

## 8. Backups & disaster recovery

**MUST:** backups are configured and a **restore has actually been tested** against the
agreed [RPO](nfrs.md); DR/failover is tested for Tier 1. Full detail lives in
[Application Resilience §11](application-resilience.md#11-resilient-data-layer) and the
[PRR](../readiness/production-readiness-review.md).

## How it scales by tier

| Requirement | Tier 3 | Tier 2 | Tier 1 |
|---|---|---|---|
| Data classified by the Data Owner | MUST | MUST | MUST |
| Governance roles named (Owner/Steward/Custodian) | MAY | SHOULD | MUST |
| Retention / archival / deletion schedule implemented | SHOULD | MUST | MUST |
| Steward-facing record correction (not raw DB) | MAY | SHOULD | MUST |
| Duplicate-entity resolution process | MAY | SHOULD | MUST |
| Data Interoperability team engaged | MAY | SHOULD | SHOULD |
| Data-warehouse / reporting feed defined | MAY | SHOULD | SHOULD |
| Backups + **tested restore** | SHOULD | MUST | MUST |

---

## Quick checklist

- [ ] **Data Owner, Steward, Custodian** named
- [ ] Data **classified** (Public / Protected A / B / C) per the Data Governance Job Aid
- [ ] New data model **documented** (schema/ERD); constraints and uniqueness enforced
- [ ] **Record correction** path defined — steward screen, not ad-hoc DBA SQL
- [ ] **Duplicate-entity resolution** process defined
- [ ] **Retention / archival / deletion** schedule defined and implemented; OHI archival engaged where needed
- [ ] **Data Interoperability team** engaged at G1; APIs documented
- [ ] Reporting / **data-warehouse** needs captured; reporting doesn't degrade the app
- [ ] Backups configured with a **tested restore** meeting the RPO
