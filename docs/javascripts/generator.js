/* Application Readiness — checklist generator.
   Turns the framework from a reading assignment into a backlog: a team answers a
   few questions, gets a right-sized checklist, and exports it as JIRA CSV or
   GitHub issues. Pure client-side; no backend. Catalog obligations mirror the
   Criticality Tiers table and the PRR. */

(function () {
  "use strict";

  /* --- obligation model --------------------------------------------------
     Per tier, each item is M (MUST), S (SHOULD), Y (MAY/optional), or - (n/a).
     t = [tier1, tier2, tier3]. */
  var LABELS = { M: "Must", S: "Should", Y: "Optional", "-": "" };
  var PRIORITY = { M: "High", S: "Medium", Y: "Low" };

  var SECTIONS = [
    ["design",       "Design & decisions",        "G1"],
    ["build",        "Build & supply chain",      "G2"],
    ["resilience",   "Resilience",                "G3"],
    ["data",         "Data & DR",                 "G3"],
    ["observability","Observability",             "G3"],
    ["security",     "Security & access",         "G3"],
    ["performance",  "Performance",               "G3"],
    ["operability",  "Operability & support",     "G3"],
    ["contractual",  "Contractual (vendor-built)","G3"],
    ["cost",         "Cost & sustainability",     "G3"]
  ];

  function I(section, title, why, evidence, t, opts) {
    var o = { section: section, title: title, why: why, evidence: evidence, t: t };
    if (opts) { for (var k in opts) o[k] = opts[k]; }
    return o;
  }

  /* opts: facing 'public'|'internal', platform [..], vendor true (vendor-only) */
  var CATALOG = [
    /* --- Design & decisions (G1) --- */
    I("design", "Assign and justify a criticality tier",
      "Decides which guardrails are mandatory and right-sizes cost — don't over-build a tool or under-build a critical system.",
      "Tier + written rationale in the ServiceNow readiness record and an ADR.",
      ["M","M","M"]),
    I("design", "Complete the NFR worksheet (incl. RTO/RPO and performance targets)",
      "Non-functional requirements drive design and cost, and are the thing BAs most often miss.",
      "Completed NFR worksheet linked in the repo.",
      ["M","M","S"]),
    I("design", "Publish architecture diagram + ADRs in the repo",
      "Decisions must be traceable, not just diagrammed — ADRs are the technical-design record.",
      "diagram + /adr folder in GitHub.",
      ["M","M","S"]),
    I("design", "Complete a threat model; submit STRA (and PIA if personal information)",
      "Security and privacy risk has to be assessed before build, not discovered at go-live.",
      "STRA (+PIA) reference and status.",
      ["M","M","S"]),
    I("design", "Write solution & feature documentation (whole solution, existing + new)",
      "Replaces the legacy FDD/TDD; support needs the complete feature set, not just the delta.",
      "Living solution doc in the repo.",
      ["M","M","S"]),
    I("design", "Maintain release notes / changelog (new, changed, removed)",
      "Keeps old-vs-new traceable across releases.",
      "CHANGELOG in the repo.",
      ["M","M","S"]),
    I("design", "Document integrations, interfaces and external dependencies",
      "Support can't operate what they can't see; dependencies drive resilience and incident response.",
      "Integration/dependency list in the solution doc.",
      ["M","M","S"]),

    /* --- Build & supply chain (G2) --- */
    I("build", "Adopt the standard pipeline template (or inherit all mandatory attributes)",
      "CI/CD means 1001 things to 1001 teams — the template guarantees the controls we support out of the box.",
      "Repo on the standard template; nightly compliance scan green.",
      ["M","M","M"]),
    I("build", "Enforce the test-coverage gate",
      "Coverage decays without a build-breaking gate; the number must be maintained, not hit once.",
      "SonarQube gate: T1 ≥85%, T2 ≥80%, T3 ≥70%.",
      ["M","M","S"]),
    I("build", "Make SAST, SCA, secret scan and image scan build-breaking",
      "Warnings get ignored; only a failed build stops vulnerable code shipping.",
      "Pipeline logs showing each stage can block the merge/deploy.",
      ["M","M","M"]),
    I("build", "Generate an SBOM, sign artifacts, and produce build provenance",
      "So we can verify what we deploy and respond to the next dependency-level incident.",
      "CycloneDX/SPDX SBOM + cosign signature + SLSA provenance.",
      ["M","M","S"]),
    I("build", "Store all runtime secrets in Vault (none in source or env vars)",
      "K8s Secrets are base64, not encrypted at rest; secrets in code are a breach waiting to happen.",
      "Vault Agent Injector or CSI driver config; secret-scan clean.",
      ["M","M","M"]),
    I("build", "Require signed commits and protected main + CODEOWNERS review",
      "Auditable, reviewed change flow is the baseline for a supportable app.",
      "Branch protection + required checks + linear history.",
      ["M","M","Y"]),
    I("build", "Add DAST / OWASP scanning for the web front end",
      "Catches running-app vulnerabilities that static analysis can't.",
      "OWASP ZAP stage in the pipeline.",
      ["M","S","Y"]),

    /* --- Resilience (G3) --- */
    I("resilience", "Make the app stateless / externalise session",
      "Statefulness breaks horizontal scaling and zero-downtime deploys.",
      "Session store externalised (e.g. Redis); no node-local state.",
      ["M","M","S"]),
    I("resilience", "Add timeouts, safe retries with backoff, and idempotent writes on all external calls",
      "Infra resilience does only ~50% of the work — an app that doesn't retry/back off still falls over.",
      "Code review + config showing timeouts and retry/backoff.",
      ["M","M","S"]),
    I("resilience", "Add circuit breakers / bulkheads on external dependencies",
      "Stops one slow dependency from cascading into a full outage.",
      "Resilience library config (e.g. Resilience4j/Polly).",
      ["M","S","-"]),
    I("resilience", "Implement meaningful liveness / readiness / startup probes",
      "Probes are how the platform knows when to route traffic and when to restart.",
      "Deployment manifest probes tied to real health.",
      ["M","M","S"], { platform: ["openshift"] }),
    I("resilience", "Handle graceful SIGTERM shutdown + connection draining",
      "Ungraceful shutdown drops in-flight requests during every deploy.",
      "Shutdown hook + preStop drain verified.",
      ["M","M","S"], { platform: ["openshift"] }),
    I("resilience", "Run ≥2 replicas with a PodDisruptionBudget and anti-affinity",
      "A single replica means node maintenance = downtime.",
      "Deployment replicas ≥2 + PDB + anti-affinity rules.",
      ["M","M","Y"], { platform: ["openshift"] }),
    I("resilience", "Set resource requests/limits and configure autoscaling (HPA)",
      "Without limits one pod can starve the node; without HPA you can't absorb load.",
      "requests/limits + HPA manifest.",
      ["M","M","S"], { platform: ["openshift"] }),
    I("resilience", "Verify a zero-downtime rolling update",
      "This is the single test that catches most incidents — the OpenShift crash-on-update problem.",
      "Recorded rolling-update run with no dropped requests.",
      ["M","M","S"]),

    /* --- Data & DR (G3) --- */
    I("data", "Provision an HA data layer appropriate to the tier",
      "The data tier is usually the real single point of failure.",
      "Replication / HA topology documented.",
      ["M","S","Y"]),
    I("data", "Configure backups and test a restore against the stated RPO",
      "An untested backup is not a backup; the restore is what matters.",
      "Backup schedule + successful restore test evidence.",
      ["M","M","S"]),
    I("data", "Document a DR plan, test failover, and measure actual RTO",
      "You only know your RTO once you've actually failed over.",
      "DR runbook + failover test with measured RTO.",
      ["M","S","-"]),
    I("data", "Classify data by the Product Owner (Data Owner) per the BC Gov Data Governance Job Aid",
      "Classification drives which cluster, controls, and privacy assessments apply.",
      "Recorded data classification (public / protected B / C).",
      ["M","M","S"]),
    I("data", "Define and implement a data retention / archival / deletion schedule",
      "Data has to be archived, backed up, and deleted on a plan — not left to grow forever.",
      "Retention schedule implemented in the app.",
      ["M","M","S"]),
    I("data", "Name the data governance roles — Data Owner, Steward, Custodian",
      "Someone has to own quality, definitions, and access after go-live.",
      "Named roles in the readiness record.",
      ["M","S","Y"]),
    I("data", "Engage the Data Interoperability / architecture team",
      "New data models and record-fixing need architecture and interoperability review.",
      "Engagement recorded; data model reviewed.",
      ["S","S","Y"]),

    /* --- Observability (G3) --- */
    I("observability", "Ship metrics to Sysdig with dashboards",
      "You can't operate what you can't see.",
      "Sysdig dashboards for the app.",
      ["M","M","S"]),
    I("observability", "Ship structured logs to the Hive with correlation / trace IDs",
      "Central, correlated logs are what make incident triage possible.",
      "Logs arriving in the Hive with trace IDs.",
      ["M","M","S"]),
    I("observability", "Add distributed tracing",
      "Traces are how you find the slow hop across a chain of services.",
      "Tracing wired through the request path.",
      ["M","S","-"]),
    I("observability", "Define SLIs/SLOs and route actionable alerts to the on-call owner",
      "Alerts with no owner and no SLO are just noise.",
      "SLO doc + alert routing to on-call.",
      ["M","S","Y"]),

    /* --- Security & access (G3) --- */
    I("security", "Implement AuthN/AuthZ (IDIR / Keycloak) and define RBAC",
      "Roles decide who can see and do what — has to be designed, not bolted on.",
      "Auth integration + RBAC role matrix.",
      ["M","M","M"]),
    I("security", "Integrate BC Services Card / public auth and front with a WAF",
      "Public-facing apps need citizen identity and edge protection.",
      "BCSC integration + WAF config.",
      ["M","M","S"], { facing: "public" }),
    I("security", "Define the access-management process (who approves, who supports)",
      "There's an existing access team — decide whether you integrate or run your own.",
      "Access process + approver roles documented.",
      ["M","M","S"]),
    I("security", "Encrypt data in transit and at rest",
      "Baseline control for any government data.",
      "TLS config + at-rest encryption confirmed.",
      ["M","M","M"]),
    I("security", "Provide vulnerability / pen-test evidence and verify TLS",
      "Independent testing catches what the pipeline misses.",
      "Pen-test report + TLS scan.",
      ["M","S","Y"]),
    I("security", "Understand and own the vulnerability-management SLAs",
      "Findings need a named owner and a fix-by clock per severity.",
      "Documented vuln-management SLAs + owner.",
      ["M","M","S"]),

    /* --- Performance (G3) --- */
    I("performance", "Run a load / performance test to peak against NFR targets",
      "Peak is where apps fall over; prove it before users do.",
      "Load-test report at agreed thresholds.",
      ["M","S","Y"]),
    I("performance", "Provide chaos / failover test evidence",
      "Proves the resilience patterns actually work under failure.",
      "Chaos/failover test results.",
      ["M","S","-"]),
    I("performance", "Validate the capacity plan / autoscaling",
      "Confirms headroom and that autoscaling triggers correctly.",
      "Capacity plan + autoscaling validation.",
      ["M","S","Y"]),

    /* --- Operability & support (G3) --- */
    I("operability", "Write a runbook: deploy, rollback, restart, common failures, escalation",
      "The runbook is what lets someone who didn't build it operate it at 2am.",
      "Runbook published with the app.",
      ["M","M","S"]),
    I("operability", "Define and fund the on-call / support model and hours",
      "Do we need 24×7? contractors? standby funding? Decide before go-live, not after.",
      "Support model + funded hours agreed.",
      ["M","M","S"]),
    I("operability", "Register the application in the CMDB",
      "The CMDB is where we store application information — hand it over there or it gets lost.",
      "CMDB CI created and linked.",
      ["M","M","M"]),
    I("operability", "Define change & release management + who authorizes a rollback",
      "Clear change control and a named rollback authority prevent go-live chaos.",
      "RFC / release process + rollback authority named.",
      ["M","M","S"]),
    I("operability", "Enable the Service Desk (call script / KB + escalation path)",
      "The front line takes the calls — they need a script and an escalation route.",
      "Service Desk notified; KB article + escalation wired.",
      ["M","M","S"]),
    I("operability", "Provide a defect 'tombstone' list at go-live",
      "Defects live in the vendor's tool; we need them imported into the standard tool.",
      "Exported defect list for import (e.g. JIRA).",
      ["M","M","S"]),
    I("operability", "Deliver user documentation and support-staff training",
      "UI changes (e.g. drag-drop → upload) need real training for users and support.",
      "User docs + training materials.",
      ["S","S","Y"]),
    I("operability", "Document desktop client install and required runtime versions",
      "If there's a desktop component, packaging and runtime (e.g. Java) versions must be known.",
      "Client install + runtime requirements.",
      ["M","M","S"], { platform: ["desktop"] }),

    /* --- Contractual (vendor-built) --- */
    I("contractual", "Make mandatory items SOW deliverables (coverage %, SBOM, runbook, support terms)",
      "If it isn't in the contract, the vendor isn't obliged to do it — the AG 85% coverage lesson.",
      "SOW listing the deliverables explicitly.",
      ["M","M","M"], { vendor: true }),
    I("contractual", "Agree an SLA (availability / response commitment)",
      "The contractual availability/response promise, distinct from engineering SLOs.",
      "Signed SLA.",
      ["M","M","S"], { vendor: true }),
    I("contractual", "Put third-party support agreements in place for vendor dependencies",
      "The vendor's own dependencies need support commitments too.",
      "Third-party support agreements.",
      ["M","S","Y"], { vendor: true }),
    I("contractual", "Include maintenance terms that keep the guardrails true after changes",
      "Coverage and controls must be maintained, not hit once and left to rot.",
      "Maintenance clause in the contract.",
      ["M","M","S"], { vendor: true }),

    /* --- Cost & sustainability (internal owner) --- */
    I("cost", "Document an operating-cost estimate (compute, licensing, support effort)",
      "An app with no cost estimate has no funded future.",
      "Operating-cost estimate.",
      ["M","M","S"]),
    I("cost", "Get operating cost approved by the named Expense Authority",
      "Someone with signing authority has to own the run cost.",
      "EA approval recorded.",
      ["M","M","S"]),
    I("cost", "Confirm support is funded for the agreed hours and model",
      "An app with no funded support model will not pass the gate.",
      "Funding confirmed for the support model.",
      ["M","M","S"])
  ];

  /* --- filtering --------------------------------------------------------- */
  function tierIndex(tier) { return { "1": 0, "2": 1, "3": 2 }[tier]; }

  function applies(item, cfg) {
    if (item.facing && item.facing !== cfg.facing) return false;
    if (item.vendor && cfg.delivery !== "vendor") return false;
    if (item.platform && item.platform.indexOf(cfg.platform) === -1) return false;
    return true;
  }

  function selectItems(cfg) {
    var idx = tierIndex(cfg.tier);
    var out = [];
    CATALOG.forEach(function (item) {
      if (!applies(item, cfg)) return;
      var ob = item.t[idx];
      if (ob === "-" ) return;
      if (ob === "Y" && !cfg.includeOptional) return;
      out.push({ item: item, ob: ob });
    });
    return out;
  }

  function group(selected) {
    var by = {};
    selected.forEach(function (row) {
      (by[row.item.section] = by[row.item.section] || []).push(row);
    });
    return by;
  }

  /* --- helpers ----------------------------------------------------------- */
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function sectionMeta(key) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i][0] === key) return SECTIONS[i];
    return [key, key, ""];
  }

  function download(name, mime, text) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /* --- exporters --------------------------------------------------------- */
  function csvField(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }

  function metaLine(cfg) {
    return tierLabel(cfg.tier) + " · " +
      (cfg.facing === "public" ? "Public-facing" : "Internal") + " · " +
      platformLabel(cfg.platform) + " · " +
      (cfg.delivery === "vendor" ? "Vendor-built" : "Internal team") +
      (cfg.build === "existing" ? " · retrofit" : "");
  }

  // ServiceNow-friendly CSV: the column names match standard task fields, so a
  // ServiceNow Import Set auto-maps them. Opens fine in Excel for any other tool too.
  function toCsv(cfg, rows) {
    var app = cfg.app || "Application";
    var out = [["short_description", "description", "priority", "section", "gate"]];
    rows.forEach(function (r) {
      var m = sectionMeta(r.item.section);
      var prio = r.ob === "M" ? "2" : "3";   // ServiceNow priority: 2 = High (Must), 3 = Moderate (Should)
      var desc = "Why: " + r.item.why + "  Evidence: " + r.item.evidence +
                 "  [" + LABELS[r.ob] + " | " + m[1] + " | Gate " + m[2] + "]";
      out.push(["[" + app + "] " + r.item.title, desc, prio, m[1], m[2]]);
    });
    return out.map(function (row) { return row.map(csvField).join(","); }).join("\r\n");
  }

  function toMarkdownList(cfg, rows) {
    var by = group(rows);
    var h = "# Readiness items — " + (cfg.app || "Application") + "\n\n> " +
      metaLine(cfg) + " · " + rows.length + " items\n>\n> Add these to ServiceNow, JIRA, or your tool of choice.\n";
    SECTIONS.forEach(function (s) {
      var items = by[s[0]];
      if (!items || !items.length) return;
      h += "\n## " + s[1] + "  ·  Gate " + s[2] + "\n\n";
      items.forEach(function (r) {
        h += "- [ ] **" + LABELS[r.ob] + "** — " + r.item.title + "\n" +
             "  - _Why:_ " + r.item.why + "\n  - _Evidence:_ " + r.item.evidence + "\n";
      });
    });
    return h;
  }

  function toPlainText(cfg, rows) {
    var by = group(rows);
    var lines = ["Readiness items — " + (cfg.app || "Application"), metaLine(cfg),
      rows.length + " items to action", "",
      "Add these to ServiceNow, JIRA, or your tool of choice.", ""];
    SECTIONS.forEach(function (s) {
      var items = by[s[0]];
      if (!items || !items.length) return;
      lines.push("== " + s[1] + " (Gate " + s[2] + ") ==");
      items.forEach(function (r) {
        lines.push("[ ] (" + LABELS[r.ob] + ") " + r.item.title);
        lines.push("      Why: " + r.item.why);
        lines.push("      Evidence: " + r.item.evidence);
      });
      lines.push("");
    });
    return lines.join("\n");
  }

  // jsPDF standard fonts are WinAnsi — swap the few glyphs they don't carry.
  function pdfSafe(s) {
    return String(s).replace(/≥/g, ">=").replace(/×/g, "x").replace(/→/g, "->");
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function todayStr() {
    try { var d = new Date(); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
    catch (e) { return ""; }
  }

  // Build a branded, fillable readiness checklist PDF (AcroForm) and open it.
  function openPdf(cfg, rows) {
    var J = window.jspdf && window.jspdf.jsPDF;
    if (!J) { window.print(); return; }
    var CB = window.jspdf.AcroFormCheckBox || J.AcroFormCheckBox;
    var TF = window.jspdf.AcroFormTextField || J.AcroFormTextField;
    var editable = !!TF;

    var doc = new J({ unit: "pt", format: "letter" });
    var PW = doc.internal.pageSize.getWidth(), PH = doc.internal.pageSize.getHeight();
    var ML = 42, MR = 42, MB = 44, W = PW - ML - MR, x0 = ML;
    var NAVY = [0, 51, 102], GOLD = [252, 186, 25], INK = [27, 39, 51], GRAY = [120, 120, 120];
    var app = cfg.app || "Application", date = todayStr(), fld = 0, y = 0;

    function setFill(c) { doc.setFillColor(c[0], c[1], c[2]); }
    function setText(c) { doc.setTextColor(c[0], c[1], c[2]); }
    function newPage() { doc.addPage(); y = 52; }
    function ensure(h) { if (y + h > PH - MB) newPage(); }

    function fieldBox(fx, fy, fw, fh, name) {          // underline + text field
      doc.setDrawColor(170, 170, 170); doc.setLineWidth(0.5);
      doc.line(fx, fy + 2, fx + fw, fy + 2);
      if (editable) {
        var t = new TF(); t.fieldName = name + "_" + (fld++);
        t.Rect = [fx, fy - 11, fw, 15]; t.fontSize = 11; t.value = "";
        doc.addField(t);
      }
    }

    // ---------- header (page 1) ----------
    setFill(NAVY); doc.rect(0, 0, PW, 78, "F");
    setFill(GOLD); doc.rect(0, 78, PW, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); setText(GOLD);
    doc.text("APPLICATION DEVELOPMENT, READINESS & RESILIENCE FRAMEWORK", ML, 30);
    doc.setFontSize(19); setText([255, 255, 255]);
    doc.text("Application Readiness Checklist", ML, 58);

    // ---------- metadata ----------
    y = 102;
    function meta(label, val) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); setText(NAVY);
      doc.text(label, x0, y);
      doc.setFont("helvetica", "normal"); setText([45, 45, 45]);
      doc.text(pdfSafe(val), x0 + doc.getTextWidth(label) + 10, y); y += 15;
    }
    meta("Application:", app);
    meta("Tier:", tierLabel(cfg.tier));
    meta("Profile:", (cfg.facing === "public" ? "Public-facing" : "Internal") + "   ·   " +
      platformLabel(cfg.platform) + "   ·   " + (cfg.delivery === "vendor" ? "Vendor-built" : "Internal team") +
      (cfg.build === "existing" ? "   ·   retrofit" : ""));
    doc.setFont("helvetica", "bold"); setText(NAVY); doc.text("Generated:", x0, y);
    doc.setFont("helvetica", "normal"); setText([45, 45, 45]); doc.text(date, x0 + 60, y);
    doc.setFont("helvetica", "bold"); setText(NAVY); doc.text("Prepared by:", x0 + 250, y);
    fieldBox(x0 + 318, y, 165, 11, "prepared_by"); y += 20;
    doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.5); doc.line(x0, y, x0 + W, y); y += 18;

    // ---------- checklist ----------
    var by = group(rows);
    SECTIONS.forEach(function (s) {
      var items = by[s[0]]; if (!items || !items.length) return;
      ensure(30);
      setFill(NAVY); doc.rect(x0, y, W, 17, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); setText([255, 255, 255]);
      doc.text(s[1] + "     Gate " + s[2], x0 + 7, y + 12); y += 25;

      items.forEach(function (r) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        var tLines = doc.splitTextToSize(pdfSafe(r.item.title), W - 62);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        var wLines = doc.splitTextToSize(pdfSafe("Why: " + r.item.why), W - 20);
        var blockH = tLines.length * 12 + wLines.length * 9.5 + 50;
        ensure(blockH);
        var top = y;

        if (CB) {
          var cb = new CB(); cb.fieldName = "chk_" + (fld++);
          cb.Rect = [x0, top - 9.5, 12, 12]; cb.caption = "4"; cb.appearanceState = "Off";
          doc.addField(cb);
        } else {
          doc.setDrawColor(90, 90, 90); doc.setLineWidth(0.9); doc.rect(x0, top - 8.5, 11, 11);
        }
        // obligation tag (right-aligned, first line)
        doc.setFont("helvetica", "bold"); doc.setFontSize(7);
        setText(r.ob === "M" ? [163, 45, 45] : [133, 79, 11]);
        doc.text(LABELS[r.ob].toUpperCase(), x0 + W, top, { align: "right" });
        // title
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); setText(INK);
        tLines.forEach(function (ln, i) { doc.text(ln, x0 + 20, top + i * 12); });
        y = top + tLines.length * 12 + 2;
        // why
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); setText(GRAY);
        wLines.forEach(function (ln) { doc.text(ln, x0 + 20, y); y += 9.5; });
        y += 10;
        // fillable owner / target / notes
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setText(NAVY);
        doc.text("Owner", x0 + 20, y); fieldBox(x0 + 58, y, 150, 15, "owner");
        doc.text("Target date", x0 + 232, y); fieldBox(x0 + 300, y, 82, 15, "target");
        y += 20;
        doc.text("Notes", x0 + 20, y); fieldBox(x0 + 58, y, W - 58, 15, "notes");
        y += 16;
        doc.setDrawColor(232, 232, 232); doc.setLineWidth(0.5); doc.line(x0, y, x0 + W, y); y += 10;
      });
      y += 6;
    });

    // ---------- sign-off ----------
    ensure(30);
    setFill(NAVY); doc.rect(x0, y, W, 17, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); setText([255, 255, 255]);
    doc.text("Sign-off     go-live approval", x0 + 7, y + 12); y += 27;
    ["Product Owner", "Architecture", "Operations / SRE", "Security & Privacy"].forEach(function (role) {
      ensure(26);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setText(INK);
      doc.text(role, x0, y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setText(NAVY);
      doc.text("Name", x0 + 150, y); fieldBox(x0 + 184, y, 173, 15, "signoff_name");
      doc.text("Date", x0 + 372, y); fieldBox(x0 + 402, y, 81, 15, "signoff_date");
      y += 26;
    });

    // ---------- footer + page numbers ----------
    var pages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.5); doc.line(ML, PH - 32, PW - MR, PH - 32);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); setText(GRAY);
      doc.text("Application Readiness Checklist   ·   " + pdfSafe(app), ML, PH - 20);
      doc.text("Page " + p + " of " + pages, PW - MR, PH - 20, { align: "right" });
      doc.text("bcgov.github.io/app-readiness-framework   ·   Generated " + date, ML, PH - 11);
    }

    var name = slug(cfg.app || "application") + "-readiness-checklist.pdf";
    var w = window.open(doc.output("bloburl"), "_blank");
    if (!w) { doc.save(name); }
  }

  /* --- labels ------------------------------------------------------------ */
  function tierLabel(t) {
    return { "1": "Tier 1 — Mission-critical", "2": "Tier 2 — Business-important",
             "3": "Tier 3 — Supporting" }[t]; }
  function platformLabel(p) {
    return { openshift: "OpenShift", salesforce: "Salesforce", cloud: "Public cloud (Azure/AWS)",
             desktop: "Desktop client", other: "Other platform" }[p] || p; }

  /* --- render ------------------------------------------------------------ */
  function pill(ob) {
    var cls = { M: "arr-ob-must", S: "arr-ob-should", Y: "arr-ob-may" }[ob];
    return '<span class="arr-ob ' + cls + '">' + LABELS[ob] + '</span>';
  }

  // Each section links out to its detailed best-practice page.
  var SECTION_DOC = {
    design: "../../design-build/nfrs/",
    build: "../../design-build/cicd-devsecops/",
    resilience: "../../design-build/application-resilience/",
    data: "../../design-build/data-management/",
    observability: "../../design-build/observability/",
    security: "../../design-build/security-privacy/",
    performance: "../../design-build/nfrs/#performance",
    operability: "../../readiness/production-readiness-review/",
    contractual: "../../readiness/production-readiness-review/",
    cost: "../../readiness/production-readiness-review/"
  };

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  function copyText(btn, text) {
    var label = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", label);
    function done() { btn.textContent = "Copied ✓"; setTimeout(function () { btn.textContent = label; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  // The one-pager: only the remaining (unchecked) items, ready to become tasks.
  function onePagerHtml(cfg, rows) {
    var by = group(rows);
    var h = '<div class="arr-op-actions">' +
      '<button class="md-button md-button--primary arr-op-pdf">Export as PDF</button>' +
      '<button class="md-button arr-op-copy">Copy as text</button>' +
      '<span class="arr-op-note">Add these to ServiceNow, JIRA, or your tool of choice.</span></div>' +
      '<div class="arr-op-sheet"><div class="arr-op-title"><h2>Remaining readiness items</h2>' +
      '<p class="arr-op-app">' + esc(cfg.app || "Application") + '</p>' +
      '<p class="arr-op-meta">' + esc(metaLine(cfg)) + ' &middot; ' + rows.length + ' items to action</p></div>';
    if (!rows.length) {
      h += '<p class="arr-op-empty">Nothing left — every applicable item is checked off.</p>';
    } else {
      SECTIONS.forEach(function (s) {
        var items = by[s[0]];
        if (!items || !items.length) return;
        h += '<h3 class="arr-op-sec">' + esc(s[1]) + ' <span>Gate ' + s[2] + '</span></h3><ul class="arr-op-list">';
        items.forEach(function (r) {
          h += '<li><span class="arr-op-box"></span><span class="arr-op-item">' +
            '<strong>' + esc(r.item.title) + '</strong> <em class="arr-op-ob">' + LABELS[r.ob] + '</em>' +
            '<br><span class="arr-op-why">' + esc(r.item.why) + '</span></span></li>';
        });
        h += '</ul>';
      });
    }
    h += '<p class="arr-op-foot">Generated from the Application Development, Readiness &amp; Resilience Framework.</p></div>';
    return h;
  }

  function renderResults(root, cfg, selected) {
    var by = group(selected);
    var flat = [];

    var html = '<div class="arr-gen-summary">' +
      '<div class="arr-gen-crumbs">' +
        '<span class="pill pill-t' + cfg.tier + '">' + tierLabel(cfg.tier) + '</span>' +
        '<span class="arr-crumb">' + (cfg.facing === "public" ? "Public-facing" : "Internal") + '</span>' +
        '<span class="arr-crumb">' + platformLabel(cfg.platform) + '</span>' +
        '<span class="arr-crumb">' + (cfg.delivery === "vendor" ? "Vendor-built" : "Internal team") + '</span>' +
        (cfg.build === "existing" ? '<span class="arr-crumb">Retrofit</span>' : '') +
      '</div>' +
      '<div class="arr-gen-progress"><span class="arr-done-n">0</span> done &middot; ' +
        '<span class="arr-remaining-n">' + selected.length + '</span> of ' + selected.length + ' remaining</div>' +
      '</div>';

    html += '<div class="arr-gen-howto"><strong>How to use this:</strong> tick the items already done, ' +
      'then <em>Create one-pager of remaining items</em> for a clean list of what\'s left — paste it into ' +
      'ServiceNow (or your tool of choice) to create tasks. Each item links to the detailed guidance.</div>';

    html += '<div class="arr-gen-actions">' +
      '<button class="md-button md-button--primary arr-op-btn">Create one-pager of remaining items</button>' +
      '<button class="md-button arr-copy-btn">Copy remaining as text</button>' +
      '<button class="md-button arr-dl" data-fmt="md">Download list (.md)</button>' +
      '<button class="md-button arr-dl" data-fmt="csv">Download for ServiceNow (.csv)</button>' +
      '</div>';

    html += '<div class="arr-onepager" hidden></div>';

    SECTIONS.forEach(function (s) {
      var key = s[0], label = s[1], gate = s[2];
      var items = by[key];
      if (!items || !items.length) return;
      var doc = SECTION_DOC[key];
      html += '<div class="arr-gen-section"><h3>' + esc(label) +
              ' <span class="arr-gate">Gate ' + gate + '</span></h3><ul class="arr-gen-list">';
      items.forEach(function (r) {
        var idx = flat.length; flat.push(r);
        html += '<li data-idx="' + idx + '">' +
          '<label class="arr-check" title="Mark done"><input type="checkbox" class="arr-item-done"></label>' +
          pill(r.ob) +
          '<div class="arr-gen-item">' +
            '<div class="arr-gen-title">' + esc(r.item.title) +
              (doc ? ' <a class="arr-gen-doc" href="' + doc + '">details ↗</a>' : '') + '</div>' +
            '<div class="arr-gen-why"><span>Why</span> ' + esc(r.item.why) + '</div>' +
            '<div class="arr-gen-ev"><span>Evidence</span> ' + esc(r.item.evidence) + '</div>' +
          '</div></li>';
      });
      html += '</ul></div>';
    });

    var out = root.querySelector(".arr-gen-out");
    out.innerHTML = html;
    out.hidden = false;

    var doneN = out.querySelector(".arr-done-n"), remN = out.querySelector(".arr-remaining-n");
    function remainingRows() {
      var rows = [];
      out.querySelectorAll(".arr-gen-list li").forEach(function (li) {
        var cb = li.querySelector(".arr-item-done");
        if (cb && !cb.checked) rows.push(flat[+li.getAttribute("data-idx")]);
      });
      return rows;
    }
    function updateProgress() {
      var total = flat.length, remaining = remainingRows().length;
      doneN.textContent = total - remaining; remN.textContent = remaining;
    }
    out.addEventListener("change", function (e) {
      if (e.target && e.target.classList.contains("arr-item-done")) {
        var li = e.target.closest("li"); if (li) li.classList.toggle("done", e.target.checked);
        updateProgress();
      }
    });

    out.querySelector(".arr-op-btn").addEventListener("click", function () {
      var rows = remainingRows();
      var panel = out.querySelector(".arr-onepager");
      panel.innerHTML = onePagerHtml(cfg, rows);
      panel.hidden = false;
      panel.querySelector(".arr-op-pdf").addEventListener("click", function () { openPdf(cfg, rows); });
      var cp = panel.querySelector(".arr-op-copy");
      if (cp) cp.addEventListener("click", function () { copyText(cp, toPlainText(cfg, rows)); });
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var copyBtn = out.querySelector(".arr-copy-btn");
    copyBtn.addEventListener("click", function () { copyText(copyBtn, toPlainText(cfg, remainingRows())); });

    out.querySelectorAll(".arr-dl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var base = slug(cfg.app || "application") + "-readiness";
        var fmt = btn.getAttribute("data-fmt"), rows = remainingRows();
        if (fmt === "csv") download(base + "-servicenow.csv", "text/csv", toCsv(cfg, rows));
        else download(base + ".md", "text/markdown", toMarkdownList(cfg, rows));
      });
    });

    updateProgress();
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function readConfig(root) {
    function val(name) {
      var el = root.querySelector('[name="' + name + '"]:checked') || root.querySelector('[name="' + name + '"]');
      return el ? el.value : null;
    }
    return {
      app: (root.querySelector('[name="app"]').value || "").trim(),
      build: val("build"),
      tier: val("tier"),
      facing: val("facing"),
      platform: val("platform"),
      delivery: val("delivery"),
      includeOptional: root.querySelector('[name="optional"]').checked
    };
  }

  function init() {
    var root = document.getElementById("arr-gen");
    if (!root || root.dataset.wired) return;
    root.dataset.wired = "1";

    root.querySelector(".arr-gen-run").addEventListener("click", function () {
      var cfg = readConfig(root);
      if (!cfg.tier) { return; }
      renderResults(root, cfg, selectItems(cfg));
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
