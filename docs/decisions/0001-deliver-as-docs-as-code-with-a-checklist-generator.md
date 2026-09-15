[//]: # (bc-madr v0.1)
<!-- modified MADR 4.0.0 -->

# Deliver the framework as a static docs-as-code site with a client-side checklist generator

* status: accepted <!-- proposed | rejected | accepted | deprecated | ... | superseded by ADR-0123 -->
* date: 2026-09-15 <!-- YYYY-MM-DD when the decision was last updated -->
* decision-makers: Karim Gillani (sponsor), Stanley Okeke (author) <!-- confirm the full list -->
* consulted: Leo Lou, Keith Parkin, Fred Wen <!-- confirm; ARB review pending --> <!-- OPTIONAL -->
* informed: Application delivery teams, contracted vendors <!-- OPTIONAL -->

## Context and Problem Statement

The existing *Application Readiness Checklist* (ISD0005, 2018) is an Adobe LiveCycle XFA
PDF. Most people cannot open it, nobody can update it, and in practice teams skip it — so
vendors continue to hand over applications that are not supportable or resilient.

A first attempt to replace it with a conventional document was reviewed by the delivery
team and did not land: the feedback was that it would become "another document nobody
reads." We therefore need a delivery format that makes the guardrails **actionable** for a
delivery team, **maintainable** by a non-developer, and **cheap to operate** — without
standing up and funding a new application.

## Decision Drivers

* Teams must be able to *use* it — produce a right-sized, actionable checklist for their
  app — not merely read a document.
* A non-developer (product owner, BA, manager) must be able to change what it asks for.
* Minimal operational burden: nothing to host, patch, back up, or fund long-term.
* Changes must be reviewable and versioned — this is a governance artifact.
* Public, linkable, and accessible (WCAG 2.2 AA), usable inside the government network.
* Reuse existing BC Gov platforms (GitHub, GitHub Pages, ServiceNow); do not reinvent.

## Considered Options

* Keep a fillable PDF form (LiveCycle/XFA, or a modern AcroForm replacement)
* A Word / SharePoint / Confluence document
* A full web application with a backend, database, and accounts
* A commercial GRC / compliance SaaS product
* A static docs-as-code site with a client-side, data-file-driven checklist generator

## Decision Outcome

Chosen option: **"A static docs-as-code site with a client-side, data-file-driven checklist
generator"** — Markdown in a public GitHub repository, built with MkDocs Material, deployed
to GitHub Pages by GitHub Actions, with the checklist itself generated in the browser from a
single CSV data file. Per-application gate tracking and sign-off stay in **ServiceNow**,
which already holds the CMDB and the audit trail.

It is the only option that satisfies *actionable*, *non-developer maintainable*, and
*near-zero operating cost* at the same time.

### Consequences

* Good, because there is no backend, database, or authentication to run, secure, patch, or
  fund — the site is static and hosted free on GitHub Pages.
* Good, because the entire checklist is one CSV file: a non-developer edits it in Excel, and
  the pull-request review doubles as the audit trail for a governance document.
* Good, because every merge auto-builds and deploys in about a minute, so the published
  guidance is never stale.
* Good, because the output is actionable — teams answer a few questions and get a
  tier- and platform-appropriate checklist they can work, export, and attach evidence to.
* Good, because it reuses platforms the ministry already runs (GitHub, Pages, ServiceNow)
  rather than introducing a new system to own.
* Bad, because there is no server-side state: a team's tick-off progress lives in their
  browser (localStorage) plus an exportable CSV. There is no central store of who has
  completed what — that role belongs to the ServiceNow readiness record.
* Bad, because a content change requires a Git pull request and a short deploy, so it is not
  instant in-place editing the way a shared document would be.
* Neutral, because being client-side the tool can *guide* but cannot *enforce*; enforcement
  is handled separately by the pipeline templates and the repo compliance scan.

### Confirmation

* The site builds under `mkdocs build --strict` in CI on every pull request, and deploys via
  the *Publish framework site* GitHub Action — a broken link or bad build blocks the change.
* The published site is live at <https://bcgov.github.io/app-readiness-framework/>.
* Walk a non-developer through the edit → pull request → deploy loop on the checklist CSV to
  confirm the maintainability claim holds in practice.
* Review the approach with the Architecture Review Board.

## Pros and Cons of the Options

### Keep a fillable PDF form

* Good, because it matches the existing ISD0005 artifact teams may recognise.
* Bad, because the current XFA format needs Adobe LiveCycle/Reader and often will not open
  at all — the root cause of the present problem.
* Bad, because it cannot be right-sized: every team sees every question regardless of tier
  or platform.
* Bad, because editing it requires a specialised tool and a specific person.
* Bad, because there is no version history or review trail.

### A Word / SharePoint / Confluence document

* Good, because anyone can edit it, with no technical skill needed.
* Good, because it is instantly editable in place, with no build step.
* Neutral, because SharePoint keeps versions, though the diffs are not review-oriented.
* Bad, because it is passive reading material — exactly the failure mode the team flagged.
* Bad, because it cannot tailor content to an application's tier or platform.
* Bad, because the ministry does not run Confluence, and SharePoint links are not public to
  contracted vendors.

### A full web application with a backend, database, and accounts

* Good, because it could store progress centrally and report across the portfolio.
* Good, because it could enforce gates rather than only advise.
* Bad, because it must be hosted, secured, patched, backed up, and funded — we would be
  asking teams to meet readiness guardrails while ourselves operating an unfunded app.
* Bad, because it needs a STRA/PIA, authentication integration, and an operating budget for
  a tool that is essentially a checklist.
* Bad, because ServiceNow already provides the record of truth for gate tracking and the
  CMDB; a second store would duplicate it.

### A commercial GRC / compliance SaaS product

* Good, because it offers workflow, reporting, and evidence management out of the box.
* Bad, because of procurement cost and time for a problem this size.
* Bad, because it duplicates ServiceNow, which the ministry already licenses and uses.
* Bad, because the guidance would live outside the delivery teams' own tooling, making it
  less likely to be used.

### A static docs-as-code site with a client-side checklist generator

* Good, because it is actionable, free to host, and has no runtime to operate.
* Good, because content lives in plain text and CSV under version control, so changes are
  reviewable and attributable.
* Good, because it publishes automatically and is public, linkable, and accessible.
* Neutral, because it requires a pull request to change content — a deliberate trade of
  immediacy for an audit trail.
* Bad, because it holds no central state and cannot enforce compliance on its own.
