# Application Resilience

!!! quote "The core principle"
    Infrastructure provides at most **half** of resilience. You can run on gold-grade,
    DR-replicated infrastructure and still have an application that falls over during a
    routine update — because the *application* was not built to be resilient. This page
    is about the half that is your responsibility as the builder.

Most of the production incidents we see are not exotic. They are applications that:
keep state in memory, have no health checks, don't handle being shut down, make
network calls with no timeout, and run as a single instance. The patterns below
prevent the vast majority of them.

Applicability scales by [criticality tier](../principles/criticality-tiers.md). Tier 1
and Tier 2 applications **MUST** implement the patterns marked MUST; Tier 3 **SHOULD**.

---

## 1. Be stateless

**MUST (Tier 1/2):** the application must not rely on in-memory state that is lost when
a pod restarts or when a request lands on a different replica.

- Externalise session state to a shared store (e.g. Redis) or use stateless tokens
  (signed JWT) — do **not** rely on in-memory sessions or sticky sessions as a
  resilience strategy.
- Persist anything that must survive a restart to a database or object store.
- Treat each pod as disposable. It can be killed at any time (scaling, node drain,
  rolling update) and a new one will replace it.

!!! danger "This is the #1 cause of 'it crashes during updates'"
    During a rolling update OpenShift starts new pods and terminates old ones. If a
    user's session or in-flight work lives only in the memory of the pod being killed,
    they get errors. Stateless design + the shutdown handling below makes rolling
    updates invisible to users.

## 2. Time out every external call

**MUST:** every outbound call (HTTP, database, message broker, cache) has an explicit,
finite timeout. A call with no timeout can hang forever and exhaust your threads/connections,
turning one slow dependency into a full outage.

```text
HTTP client        → connect timeout + read/request timeout
Database           → connection timeout + query/statement timeout
Message broker     → publish/consume timeout
Cache              → operation timeout (and treat cache as optional, see §6)
```

## 3. Retry — but safely

**MUST (Tier 1/2):** transient failures (network blips, brief unavailability) are
retried with **exponential backoff and jitter**, a **bounded** number of attempts, and
**only for idempotent operations**.

- Exponential backoff + jitter prevents a "thundering herd" all retrying in lockstep.
- Cap total attempts and total time — retries must not pile up faster than they drain.
- **Never blindly retry a non-idempotent write** (you'll double-charge, double-create,
  etc.). Make writes idempotent first (see §4).

=== "Conceptual"

    ```text
    attempt = 0
    delay   = base            # e.g. 200ms
    loop:
        try call()            # with a per-attempt timeout
        on transient error:
            attempt += 1
            if attempt > MAX: fail
            sleep(min(delay, cap) + random_jitter())
            delay *= 2
    ```

=== "Java (Resilience4j)"

    ```java
    RetryConfig cfg = RetryConfig.custom()
        .maxAttempts(4)
        .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(200, 2.0))
        .retryExceptions(IOException.class, TimeoutException.class)
        .build();
    ```

=== "Node.js"

    ```js
    // e.g. p-retry / cockatiel — bounded attempts, exp backoff + jitter
    await retry(() => callWithTimeout(), {
      retries: 3, factor: 2, minTimeout: 200, randomize: true,
    });
    ```

## 4. Make operations idempotent

**MUST (Tier 1/2 for write paths):** a retried or duplicated request must not cause
duplicate side effects.

- Accept an **idempotency key** on create/charge-style operations and de-duplicate on it.
- Use natural unique constraints / upserts so re-processing the same event is safe.
- Design message consumers for **at-least-once** delivery (assume duplicates happen).

## 5. Contain failures: circuit breakers, bulkheads, load shedding

**MUST (Tier 1):** isolate failures so one bad dependency can't sink the whole app.

- **Circuit breaker** — after repeated failures to a dependency, stop calling it for a
  cool-off period and fail fast, rather than queueing requests behind a dead service.
- **Bulkheads** — separate connection pools / thread pools per dependency so one
  saturated dependency doesn't starve the others.
- **Rate limiting / load shedding** — reject or queue beyond a known safe concurrency
  rather than accepting unbounded load and collapsing. Apply **backpressure**.

## 6. Degrade gracefully

**SHOULD:** when a non-critical dependency is down, degrade instead of failing entirely.

- Serve cached or default data; hide an optional feature; queue work for later.
- Distinguish **critical** vs **optional** dependencies explicitly. A cache outage
  should slow you down, not take you down.

## 7. Health checks (probes)

**MUST:** expose liveness, readiness, and (where startup is slow) startup probes, and
wire them into the deployment.

| Probe | Question it answers | If it fails |
|---|---|---|
| **Liveness** | Is the process wedged/deadlocked? | Pod is restarted |
| **Readiness** | Can it serve traffic *right now*? | Pod is removed from the load balancer (no traffic) until ready |
| **Startup** | Has a slow-starting app finished booting? | Protects slow starters from premature liveness kills |

```yaml
# Kubernetes/OpenShift — illustrative
livenessProbe:
  httpGet: { path: /healthz/live, port: 8080 }
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /healthz/ready, port: 8080 }  # should check critical deps
  periodSeconds: 5
startupProbe:
  httpGet: { path: /healthz/live, port: 8080 }
  failureThreshold: 30
  periodSeconds: 5
```

!!! warning "Readiness must reflect real readiness"
    A readiness probe that returns 200 before the DB connection pool is up will send
    traffic to a pod that immediately errors. The readiness check should verify the
    dependencies the app actually needs to serve a request.

## 8. Shut down gracefully

**MUST:** handle `SIGTERM` and drain in-flight work before exiting. This is what makes
rolling updates and scaling seamless.

- On `SIGTERM`: stop accepting new requests, finish in-flight ones (within a deadline),
  close DB/broker connections cleanly, then exit.
- Set `terminationGracePeriodSeconds` to comfortably exceed your drain time.
- Use a `preStop` hook delay so the pod is removed from the Service endpoints *before*
  it stops accepting connections (avoids races where traffic is still routed to a
  terminating pod).

## 9. Run more than one of everything

**MUST (Tier 1/2):**

- **≥ 2 replicas** (no single pod).
- **PodDisruptionBudget** so voluntary disruptions (node drains, upgrades) never take
  all replicas down at once.
- **Pod anti-affinity / topology spread** so replicas don't all sit on one node.
- A **rolling update** strategy with `maxUnavailable`/`maxSurge` tuned for zero downtime.

```yaml
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
spec:
  minAvailable: 1
  selector: { matchLabels: { app: my-app } }
```

## 10. Set resource requests and limits

**MUST:** declare CPU/memory **requests** (for correct scheduling) and **limits** (to
prevent a runaway pod starving neighbours). Without requests, the scheduler can't place
pods sensibly; without limits, one leak can destabilise a node.

- Add a **HorizontalPodAutoscaler** for Tier 1/2 so the app scales with load.
- Right-size from load-test data, not guesses.

## 11. Resilient data layer

**MUST (Tier 1):**

- HA database topology (primary + replica / managed HA), with connection pooling and
  sensible pool limits.
- **Backups with *tested* restores** — an untested backup is not a backup. Restore
  drills meet the agreed [RPO](../design-build/nfrs.md).
- Define and test the **failover** path; know your actual [RTO](../design-build/nfrs.md).

## 12. Prove it (don't assert it)

**MUST (Tier 1) / SHOULD (Tier 2):** resilience is verified, not claimed.

- **Load / performance tests** to the expected peak (and beyond) — evidence attached to
  the [PRR](../readiness/production-readiness-review.md).
- **Failover / chaos tests** — kill a pod, drain a node, sever a dependency, and show
  the application stays within SLO. Run these as periodic **game days**.

---

## Quick checklist (paste into the readiness record)

- [ ] Stateless; session/state externalised
- [ ] Every external call has a timeout
- [ ] Retries use bounded exponential backoff + jitter, idempotent ops only
- [ ] Write paths are idempotent (idempotency keys / upserts)
- [ ] Circuit breakers / bulkheads on external dependencies (Tier 1)
- [ ] Critical vs optional dependencies identified; graceful degradation for optional
- [ ] Liveness / readiness / startup probes implemented and meaningful
- [ ] Graceful `SIGTERM` shutdown + connection draining + `preStop` delay
- [ ] ≥ 2 replicas + PodDisruptionBudget + anti-affinity
- [ ] Resource requests/limits set; HPA for Tier 1/2
- [ ] HA data layer; backups with tested restore; failover tested (Tier 1)
- [ ] Load test + failover/chaos evidence attached
