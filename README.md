# Application Development, Readiness & Resilience Framework

Source for the framework site that guides internal teams, contractors, and vendors
in building **supportable, resilient, production-ready** applications.

This repository is **docs-as-code**: the content is Markdown, version-controlled and
reviewed via pull requests, and published as a [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
static site to **GitHub Enterprise private Pages** (read access gated by IDIR SSO).

> **Status:** MVP draft. Priority pages (CI/CD & DevSecOps, Application Resilience,
> NFRs, Production Readiness Review) are written first; remaining pages are stubbed
> and filled in iteratively.

## Local preview

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdocs serve                     # http://127.0.0.1:8000
```

## Build

```bash
mkdocs build --strict            # output in ./site
```

## Publishing

Pushing to `main` triggers `.github/workflows/publish.yml`, which builds the site and
deploys it to GitHub Pages. To make it **internal-only** on GitHub Enterprise Cloud:

1. Repo → **Settings → Pages** → set **Visibility: Private** (enterprise members only).
2. Confirm SSO is enforced on the enterprise org so access maps to IDIR.
3. Set `site_url` and the `repo_*` keys in `mkdocs.yml` to your enterprise URLs.

> If some non-technical reviewers do not have a GitHub Enterprise seat, either grant
> them read access, or export to PDF for distribution (see below). The fallback option
> is to publish the same site as a static container on OpenShift behind IDIR.

## Optional: PDF export

For printable / offline distribution, add a PDF plugin (e.g. `mkdocs-with-pdf`) to
`requirements.txt` and `mkdocs.yml`. Kept out of the default build to keep CI fast and
dependency-light.

## Contributing

- One change = one pull request; `CODEOWNERS` review required before merge.
- `mkdocs build --strict` must pass (CI enforces this — broken links fail the build).
- Keep requirement language consistent: **MUST / SHOULD / MAY** (see `docs/index.md`).

## Structure

```
docs/
  index.md                              How to use · the 4 gates · tiers
  principles/criticality-tiers.md       Tier 1/2/3 → which requirements apply
  design-build/                         Shift-left guardrails
    cicd-devsecops.md
    application-resilience.md
    nfrs.md
  readiness/production-readiness-review.md
  reference/
    servicenow-process.md               How the per-project gate is tracked
    standards-links.md                  External standards & internal links
```
