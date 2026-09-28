# Runbook template

!!! tip "Copy, don't recreate"
    A runbook is the one document that lets someone who did **not** build the app operate it.
    Copy the template below into `docs/runbook.md` in your repo and fill it in — the code
    block has a **copy button** in the top-right.

There is no BC Gov runbook standard, so the framework supplies this one template. Everything
else the checklist asks for points to an authoritative source instead — the compliant
**CI/CD pipeline and Helm chart** come from the BC Gov
[DevOps Quick Start](https://github.com/bcgov/quickstart-openshift), and every other item
links to its BC Gov or standard reference from the checklist.

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
