# Templates & starters

!!! tip "Copy, don't recreate"
    These are the **fill-in-the-blank deliverables** the framework asks for. Copy the one
    you need into your repo and complete it — every code block has a **copy button** in
    the top-right. Where a file belongs in the repo is noted above each template.

The mandatory pipeline attributes and resilience patterns should be **inherited** from the
standard [pipeline template and Helm chart](#starter-cicd-pipeline), not assembled by hand.
The documentation deliverables (ADR, runbook, NFR worksheet) are yours to fill in per
project.

| Template | What it's for | Where it goes |
|---|---|---|
| [ADR](#architecture-decision-record-adr) | Record a significant decision and why | `docs/adr/NNNN-title.md` |
| [Runbook](#runbook) | How Operations runs it at 2 a.m. | `docs/runbook.md` |
| [NFR worksheet](#nfr-worksheet) | The non-functional targets, agreed with the business | `docs/nfr-worksheet.md` |
| [Pull request template](#pull-request-template) | Force the readiness checks on every PR | `.github/pull_request_template.md` |
| [CODEOWNERS](#codeowners) | Required review on protected paths | `.github/CODEOWNERS` |
| [Starter CI/CD pipeline](#starter-cicd-pipeline) | The mandatory build-time controls | `.github/workflows/ci.yml` |
| [Helm deployment](#helm-deployment-resilience-defaults) | Resilience defaults (probes, PDB, HPA) | `chart/templates/deployment.yaml` |
| [Compliance scan](#compliance-scan-scheduled) | Nightly org-wide check of the mandatory controls | ops repo · `.github/workflows/compliance-scan.yml` |

---

## Architecture Decision Record (ADR)

*A short record of one significant decision. One file per decision; never edit a decided
ADR — supersede it with a new one.*

```markdown
# NNNN. <short decision title>

- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <names/roles>
- Tier: <1 | 2 | 3>

## Context
What is the problem or forcing function? What constraints apply (NFRs, tier, security,
cost, deadlines)? Link the relevant requirements.

## Decision
The decision, stated plainly in active voice: "We will …".

## Alternatives considered
- Option A — why not
- Option B — why not

## Consequences
- Positive: …
- Negative / trade-offs: …
- Follow-ups / new risks: …
```

## Runbook

*The document that lets someone who did not build the app operate it. If it is not
written down here, it does not exist at 2 a.m.*

```markdown
# <Application> — Runbook

## 1. Overview
- What the app does, tier, and business impact if it is down.
- Architecture diagram link; key dependencies (and their owners).
- On-call / support contacts and hours.

## 2. Access
- How to get access (which roles, who approves).
- Dashboards: <Sysdig link> · Logs: <the Hive link>.

## 3. Routine operations
- Deploy: <how a release is promoted; GitOps/ArgoCD link>.
- Rollback: <exact steps; who authorizes>.
- Restart / scale: <commands>.
- Config & secrets: <where they live — Vault path>.

## 4. Common failures & fixes
| Symptom | Likely cause | Action |
|---|---|---|
| e.g. 5xx spike | dependency X down | check X dashboard; circuit breaker status; page X owner |
| pod crashloop | bad config / migration | check logs; roll back last release |

## 5. Backup & restore
- Backup schedule and location; **tested restore** procedure; RPO/RTO.

## 6. Escalation
- Tier-1 support → app support owner → vendor / third-party. Names and paths.
```

## NFR worksheet

*Complete with the **business** at G1. Every target is a number, testable, tied to a tier.
Mirrors the [NFR guidance](../design-build/nfrs.md).*

```markdown
# <Application> — NFR worksheet

| NFR | Question to the business | Agreed target | Tier driver |
|---|---|---|---|
| Response time | How slow is too slow for the main task? | | Perf |
| Throughput | Busiest realistic moment? | | Perf/scale |
| Concurrent users | How many at once, peak? | | Scale |
| Data growth | How much data, growing how fast? | | Capacity |
| Availability | Acceptable uptime? | | Tier |
| RTO | How long can you be down before real harm? | | Tier/DR |
| RPO | How much recent data can you lose? | | Tier/DR |
| Maintenance | Is planned downtime OK, or zero-downtime? | | Resilience |
| Data sensitivity | Classification? Internal/public? | | Security |
| Auth model | Who logs in, how? | | Security |
| Accessibility | Public-facing? (WCAG 2.2 AA) | | Usability |
| Support hours | When must it be supported? | | Operability |
| Retention/deletion | How long kept; deletion rules? | | Data |
| Integrations | What does it depend on / serve? | | Interop |
```

## Pull request template

*Drop into `.github/pull_request_template.md` so every PR carries the checks.*

```markdown
## What & why
<summary of the change, link the issue/ADR>

## Readiness checks
- [ ] Tests added/updated; coverage gate passing
- [ ] SAST / SCA / secret / image scans green (no new criticals/highs)
- [ ] No secrets in code or env; secrets in Vault
- [ ] Observability: logs/metrics updated where relevant
- [ ] Docs updated (solution doc / changelog / ADR if a decision was made)
- [ ] Resilience impact considered (timeouts, retries, statelessness)
```

## CODEOWNERS

*Enforces review on protected paths. Drop into `.github/CODEOWNERS`.*

```text
# Default owners for everything
*                       @your-org/your-team

# Guardrail-sensitive paths require the platform team
/.github/workflows/     @your-org/platform-engineering
/chart/                 @your-org/platform-engineering
/docs/adr/              @your-org/architecture
```

## Starter CI/CD pipeline

*A GitHub Actions workflow that implements the [mandatory pipeline
attributes](../design-build/cicd-devsecops.md#the-mandatory-pipeline-attributes). Use the
org standard template where one exists; this is the shape it must have. Goes in
`.github/workflows/ci.yml`.*

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  id-token: write          # for keyless signing (cosign/Sigstore)
  security-events: write   # for code scanning upload

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: make build            # reproducible build from source
      - name: Unit + integration tests
        run: make test
      - name: Coverage gate (SonarQube)
        run: make sonar             # fails the build below the tier threshold

  security-scans:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SAST (CodeQL)
        uses: github/codeql-action/analyze@v3
      - name: Secret scan (gitleaks)
        uses: gitleaks/gitleaks-action@v2
      - name: SCA (dependency review)
        uses: actions/dependency-review-action@v4
      # SCA over time is also enforced by Dependabot on the repo.

  image:
    needs: [build-test, security-scans]
    if: github.ref == 'refs/heads/main'    # build the image once, after checks pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t "$IMAGE:$GITHUB_SHA" .
      - name: Image scan (Trivy)
        uses: aquasecurity/trivy-action@master
        with: { image-ref: "${{ env.IMAGE }}:${{ github.sha }}", exit-code: "1", severity: "CRITICAL,HIGH" }
      - name: Generate SBOM (CycloneDX)
        uses: anchore/sbom-action@v0
        with: { image: "${{ env.IMAGE }}:${{ github.sha }}", format: cyclonedx-json }
      - name: Sign image + attest provenance (cosign)
        run: cosign sign --yes "$IMAGE:$GITHUB_SHA"
```

## Helm deployment (resilience defaults)

*The [resilience](../design-build/application-resilience.md) defaults every Tier 1/2
deployment needs: ≥2 replicas, zero-downtime rollout, probes, resources, anti-affinity,
and a PodDisruptionBudget. Goes in `chart/templates/`.*

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: {{ .Release.Name }} }
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  template:
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          readinessProbe: { httpGet: { path: /healthz/ready, port: 8080 }, periodSeconds: 5 }
          livenessProbe:  { httpGet: { path: /healthz/live,  port: 8080 }, periodSeconds: 10 }
          startupProbe:   { httpGet: { path: /healthz/live,  port: 8080 }, failureThreshold: 30, periodSeconds: 5 }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 512Mi }
      terminationGracePeriodSeconds: 45     # exceed your drain time
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                topologyKey: kubernetes.io/hostname
                labelSelector: { matchLabels: { app: {{ .Release.Name }} } }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: {{ .Release.Name }} }
spec:
  minAvailable: 1
  selector: { matchLabels: { app: {{ .Release.Name }} } }
```

## Compliance scan (scheduled)

*The nightly org-wide scan behind [Compliance & enforcement](../reference/compliance-enforcement.md):
it enumerates repos tagged `app-readiness`, checks each mandatory control, and reports the
gaps. Run it from a central ops repo at `.github/workflows/compliance-scan.yml`. Start in
report-only mode; wire the ServiceNow step once the report looks right.*

```yaml
name: app-readiness-compliance-scan
on:
  schedule:
    - cron: "0 6 * * *"      # nightly ~06:00 UTC
  workflow_dispatch: {}

env:
  ORG: your-org
  TOPIC: app-readiness

permissions:
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Check every tagged repo for the mandatory controls
        env:
          GH_TOKEN: ${{ secrets.ORG_SCAN_TOKEN }}   # PAT: repo + read:org
        run: |
          set -euo pipefail
          {
            echo "# App readiness compliance — $(date -u +%F)"
            echo ""
            echo "| Repo | Template | Branch prot. | Secret scan | Image scan | SBOM | Signing | Verdict |"
            echo "|---|---|---|---|---|---|---|---|"
          } > report.md

          repos=$(gh api "orgs/$ORG/repos?per_page=100" --paginate \
            --jq ".[] | select(.topics | index(\"$TOPIC\")) | .name")

          for repo in $repos; do
            blob=""
            for f in $(gh api "repos/$ORG/$repo/contents/.github/workflows" --jq '.[].name' 2>/dev/null || true); do
              blob="$blob $(gh api "repos/$ORG/$repo/contents/.github/workflows/$f" \
                --jq '.content' 2>/dev/null | base64 -d 2>/dev/null || true)"
            done
            has() { echo "$blob" | grep -qiE "$1" && echo "Y" || echo "N"; }

            template=$(echo "$blob" | grep -qiE "uses:.*/standard-pipeline" && echo "Y" || echo "N")
            bp=$(gh api "repos/$ORG/$repo/branches/main/protection" \
              --jq '.required_status_checks != null' 2>/dev/null | grep -q true && echo "Y" || echo "N")
            secret=$(gh api "repos/$ORG/$repo" \
              --jq '.security_and_analysis.secret_scanning.status' 2>/dev/null | grep -q enabled && echo "Y" || echo "N")
            image=$(has "trivy|sysdig")
            sbom=$(has "cyclonedx|syft|sbom")
            sign=$(has "cosign|sigstore")

            verdict="PASS"
            for c in "$template" "$bp" "$secret" "$image" "$sbom" "$sign"; do
              [ "$c" = "N" ] && verdict="GAPS"
            done
            echo "| $repo | $template | $bp | $secret | $image | $sbom | $sign | $verdict |" >> report.md
          done
          cat report.md

      - name: Publish report
        uses: actions/upload-artifact@v4
        with: { name: compliance-report, path: report.md }

      # Optional — push the verdict into the ServiceNow readiness record:
      # - name: Update ServiceNow readiness record
      #   run: |
      #     curl -sf -u "$SN_USER:$SN_PASS" -H "Content-Type: application/json" \
      #       -X PATCH "https://$SN_INSTANCE.service-now.com/api/now/table/u_readiness_record/$SYS_ID" \
      #       -d '{"u_g2_build":"true","u_evidence_url":"<report artifact url>"}'
```

---

!!! note "Canonical template repos"
    In a real environment the pipeline and Helm chart live in **versioned template repos**
    so fixes propagate. Link them from [Standards & Links](../reference/standards-links.md);
    the compliance scan checks whether a repo inherits them.
