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

  /* NOTE: the live checklist is maintained in docs/checklist/checklist-items.csv
     (edit it in Excel — no code). The SECTIONS and CATALOG below are only a
     FALLBACK used if that CSV can't be loaded; keep them in sync when you can,
     but the CSV is the source of truth. See loadCatalog()/catalogFromCsv(). */
  var SECTIONS = [
    ["design",        "Design & decisions",        "G1"],
    ["build",         "Build & pipeline",          "G2"],
    ["resilience",    "Resilience & performance",  "G3"],
    ["data",          "Data & DR",                 "G3"],
    ["observability", "Observability",             "G3"],
    ["security",      "Security & access",         "G3"],
    ["operability",   "Operability & support",     "G3"],
    ["vendor",        "Vendor (contractual)",      "G3"]
  ];

  function I(section, title, why, evidence, t, opts) {
    var o = { section: section, title: title, why: why, evidence: evidence, t: t };
    if (opts) { for (var k in opts) o[k] = opts[k]; }
    return o;
  }

  /* opts: facing 'public'|'internal', platform [..], vendor true (vendor-only) */
  var CATALOG = [
    /* --- Design & decisions (G1) --- */
    I("design", "Assign & justify a criticality tier",
      "Decides which guardrails apply and right-sizes cost \u2014 don't over- or under-build.",
      "Tier + written rationale in the ServiceNow readiness record and an ADR.",
      ["M","M","M"], { link: "../../principles/criticality-tiers/" }),
    I("design", "Capture non-functional requirements (RTO/RPO, performance)",
      "NFRs drive design and cost and are the thing most often missed.",
      "Completed NFR worksheet in the repo.",
      ["M","M","S"], { link: "../../design-build/nfrs/" }),
    I("design", "Record architecture decisions (ADRs) + architecture diagram",
      "Decisions must be traceable, not just diagrammed.",
      "/adr folder + diagram in the repo.",
      ["M","M","S"], { link: "../../starters/#architecture-decision-record-adr" }),
    I("design", "Threat model + STRA (and PIA if personal information)",
      "Security & privacy risk must be assessed before build, not at go-live.",
      "STRA (+PIA) reference and status.",
      ["M","M","S"], { link: "../../design-build/security-privacy/" }),
    I("design", "Solution & interface documentation",
      "Support needs the whole solution; old-vs-new must be traceable; dependencies visible.",
      "Living solution doc + changelog + integrations. In-house = Must; COTS = link the vendor's changelog.",
      ["M","M","S"], { covers: "Solution doc \u00b7 changelog / release notes \u00b7 integrations & dependencies", link: "../../readiness/production-readiness-review/" }),
    I("design", "Accessibility by design (WCAG 2.2 AA)",
      "Legally required for public-facing services (Accessible BC Act); expected internally.",
      "Accessibility conformance assessment against WCAG 2.2 AA.",
      ["M","M","S"], { link: "https://www.w3.org/WAI/WCAG22/quickref/" }),
    I("design", "Secure operating funding",
      "Funding must be secured before the project starts; no funded support = no go-live.",
      "Operating-cost estimate + Expense Authority approval + funded support model.",
      ["M","M","S"], { covers: "Cost estimate \u00b7 EA approval \u00b7 funded support model", link: "../../readiness/production-readiness-review/" }),

    /* --- Build & pipeline (G2) --- */
    I("build", "Use the standard CI/CD pipeline (BC Gov Quick Start template)",
      "One compliant pipeline bakes in everything below \u2014 don't reinvent it as 14 separate items.",
      "Repo on the Quick Start template, or GitHub Actions containing these stages.",
      ["M","M","M"], { covers: "Build \u00b7 unit/integration tests \u00b7 SAST \u00b7 SCA \u00b7 secret scan \u00b7 image scan \u00b7 SBOM \u00b7 signing \u00b7 provenance \u00b7 DAST \u00b7 licence check \u00b7 dependency currency \u00b7 signed commits \u00b7 branch protection", link: "../../design-build/cicd-devsecops/" }),
    I("build", "Enforce test coverage & test strategy",
      "Coverage decays without a gate; contract tests protect integrations.",
      "Coverage gate \u2014 in-house 85% (T1/T2); COTS/contracted = report only.",
      ["M","M","S"], { covers: "Coverage gate \u00b7 unit / integration / contract tests \u00b7 UAT \u00b7 test data", link: "../../design-build/cicd-devsecops/#the-mandatory-pipeline-attributes" }),
    I("build", "Externalise configuration & secrets; deploy via IaC / GitOps",
      "Config in images or changed by hand causes drift; secrets never belong in code.",
      "Config per environment + managed secrets store ({{SECRETS}}) + IaC in the repo.",
      ["M","M","S"], { covers: "Externalised config \u00b7 managed secrets \u00b7 IaC \u00b7 GitOps", link: "../../design-build/cicd-devsecops/" }),
    I("build", "Follow Salesforce build practices",
      "Salesforce enforces hard per-transaction limits and deploys metadata, not containers.",
      "Bulkified code + documented sandbox & deployment path.",
      ["M","M","S"], { platform: ["salesforce"], covers: "Governor limits / bulkification \u00b7 sandbox & deployment strategy" }),

    /* --- Resilience & performance (G3) --- */
    I("resilience", "Build a resilient, 12-factor application",
      "Infrastructure is only ~half of resilience \u2014 the application itself must be built for it.",
      "Conformance to the BC Gov app-resiliency guidelines / 12-factor.",
      ["M","M","S"], { covers: "Stateless \u00b7 timeouts & retries with backoff \u00b7 idempotency \u00b7 circuit breakers \u00b7 graceful shutdown \u00b7 health probes \u00b7 >=2 replicas / PDB \u00b7 resource limits / HPA \u00b7 zero-downtime + progressive delivery", link: "https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/app-resiliency-guidelines/" }),
    I("resilience", "Prove resilience & performance",
      "Peak load and failure are where apps fall over \u2014 prove it before users do.",
      "Load/performance test to peak + chaos/failover test + capacity/autoscaling validation.",
      ["M","S","Y"], { covers: "Load / peak test \u00b7 chaos / failover test \u00b7 capacity & autoscaling validation", link: "../../design-build/application-resilience/" }),

    /* --- Data & DR (G3) --- */
    I("data", "Data governance",
      "Someone must own quality, definitions and access; classification drives controls.",
      "Classification + named Data Owner/Steward/Custodian + Data Interoperability engaged.",
      ["M","M","S"], { covers: "Data classification \u00b7 Owner / Steward / Custodian \u00b7 Data Interoperability", link: "../../design-build/data-management/" }),
    I("data", "Data lifecycle (retention / archival / deletion)",
      "Data can't grow forever; retention is legal / FOIPPA-driven.",
      "Retention/archival/deletion schedule implemented in the app.",
      ["M","M","S"], { link: "../../design-build/data-management/#5-retention-archival-deletion" }),
    I("data", "Backups & disaster recovery",
      "An untested backup is not a backup; you only know your RTO once you've failed over.",
      "HA data layer + tested restore (meets RPO) + DR/failover tested (Tier 1).",
      ["M","M","S"], { covers: "HA data layer \u00b7 tested restore (RPO) \u00b7 DR / failover (RTO)", link: "../../design-build/application-resilience/#11-resilient-data-layer" }),

    /* --- Observability (G3) --- */
    I("observability", "Monitoring & logging",
      "You can't operate what you can't see.",
      "Metrics + dashboards ({{MONITOR}}) + structured logs with trace IDs ({{LOGS}}) + tracing.",
      ["M","M","S"], { covers: "Metrics & dashboards \u00b7 structured logs \u00b7 distributed tracing", link: "../../design-build/observability/" }),
    I("observability", "SLOs & alerting",
      "Alerts with no SLO or owner are just noise.",
      "SLIs/SLOs defined + actionable alerts routed to the on-call owner.",
      ["M","S","Y"], { link: "../../design-build/observability/" }),

    /* --- Security & access (G3) --- */
    I("security", "Authentication & access",
      "Use approved SSO; least-privilege RBAC; a defined access process.",
      "IDIR/Keycloak/BC Services Card + RBAC + access-management process (approvers/support).",
      ["M","M","M"], { covers: "SSO (IDIR / Keycloak / BCSC) \u00b7 RBAC \u00b7 access-management process", link: "../../design-build/security-privacy/" }),
    I("security", "API management \u2014 use APS",
      "Govern endpoints centrally: auth, rate limiting/throttling, and versioning.",
      "APS (gov API gateway) config; versioned, backward-compatible API.",
      ["M","S","Y"], { covers: "API gateway (APS) \u00b7 rate limiting / throttling \u00b7 versioning & backward compatibility" }),
    I("security", "Data protection & privacy",
      "Encrypt data, keep it in an approved region, and design for privacy (FOIPPA).",
      "TLS in transit + at-rest encryption + data residency + privacy-by-design notes.",
      ["M","M","S"], { covers: "Encryption in transit & at rest \u00b7 data residency (in-Canada) \u00b7 privacy-by-design", link: "../../design-build/security-privacy/" }),
    I("security", "Security testing & vulnerability management",
      "Independent testing catches what the pipeline misses; findings need a fix-by clock.",
      "Penetration test (orderable service) + TLS scan + owned vulnerability-management SLAs.",
      ["M","S","Y"], { covers: "Penetration test \u00b7 TLS scan \u00b7 vulnerability-management SLAs", link: "../../design-build/security-privacy/#5-vulnerability-management" }),

    /* --- Operability & support (G3) --- */
    I("operability", "Runbook & funded support model",
      "Someone who didn't build it must be able to operate it, and support must be funded.",
      "Runbook (deploy/rollback/restart/failures/escalation) + agreed on-call/support hours.",
      ["M","M","S"], { covers: "Runbook \u00b7 on-call / support model & hours", link: "../../starters/#runbook" }),
    I("operability", "Register & manage change",
      "The CMDB is where apps are tracked; change needs control and a rollback authority.",
      "CMDB CI + change/release process + named rollback authority.",
      ["M","M","S"], { covers: "CMDB registration \u00b7 change / release management \u00b7 rollback authority", link: "../../reference/servicenow-process/" }),
    I("operability", "Service Desk & handover",
      "The front line takes the calls; defects and training must transfer.",
      "Service Desk enabled (script/KB/escalation) + defect tombstone list + user docs/training.",
      ["M","M","S"], { covers: "Service Desk \u00b7 defect tombstone list \u00b7 user docs & training", link: "../../readiness/production-readiness-review/" }),
    I("operability", "Decommission / end-of-life plan",
      "Apps without a retirement plan become zombie risk (orphaned data, expiring certs).",
      "Decommission plan: data disposition, teardown steps, named owner.",
      ["M","S","S"]),

    /* --- Vendor (contractual) (G3) --- */
    I("vendor", "Vendor SOW deliverables (single checklist)",
      "If it isn't in the contract, the vendor isn't obliged to do it.",
      "SOW listing coverage %, SBOM, runbook, support terms, SLA, third-party support agreements, maintenance terms.",
      ["M","M","M"], { vendor: true, covers: "Coverage % \u00b7 SBOM \u00b7 runbook \u00b7 support terms \u00b7 SLA \u00b7 third-party support \u00b7 maintenance terms", link: "../../readiness/production-readiness-review/#9-contractual-vendor-built" })
  ];

  /* --- filtering --------------------------------------------------------- */
  function tierIndex(tier) { return { "1": 0, "2": 1, "3": 2 }[tier]; }

  function applies(item, cfg) {
    if (item.facing && item.facing !== cfg.facing) return false;
    if (item.vendor && cfg.delivery !== "vendor") return false;
    if (item.platform && item.platform.indexOf(cfg.platform) === -1) return false;
    return true;
  }

  // Platform decides the implementation of a capability. {{MONITOR}}/{{LOGS}}/{{SECRETS}}
  // tokens in item text are resolved to the selected platform's actual tooling.
  var PLATFORM_TOOLS = {
    openshift:  { monitor: "Sysdig", logs: "the Hive", secrets: "HashiCorp Vault (Agent Injector / CSI)" },
    salesforce: { monitor: "Salesforce Event Monitoring", logs: "Salesforce native logging / Event Monitoring", secrets: "Named Credentials & protected settings" },
    cloud:      { monitor: "the cloud provider's monitoring (Azure Monitor / CloudWatch)", logs: "the cloud provider's logging (App Insights / CloudWatch Logs)", secrets: "the cloud secrets manager (Key Vault / Secrets Manager)" },
    datacenter: { monitor: "the data-centre monitoring stack", logs: "central logging", secrets: "an approved managed secrets store" },
    desktop:    { monitor: "endpoint / application monitoring", logs: "central logging", secrets: "an approved managed secrets store" },
    other:      { monitor: "your monitoring platform", logs: "central logging", secrets: "a managed secrets store" }
  };
  function platformTool(platform, key) {
    return (PLATFORM_TOOLS[platform] || PLATFORM_TOOLS.other)[key] || PLATFORM_TOOLS.other[key];
  }
  function resolveTokens(text, platform) {
    return String(text)
      .replace(/\{\{MONITOR\}\}/g, platformTool(platform, "monitor"))
      .replace(/\{\{LOGS\}\}/g, platformTool(platform, "logs"))
      .replace(/\{\{SECRETS\}\}/g, platformTool(platform, "secrets"));
  }
  // Where an item applies. "" = universal (all platforms/tiers); otherwise the
  // platform / audience / delivery condition that scopes it.
  function appliesTag(item) {
    if (item.facing === "public") return "Public-facing";
    if (item.vendor) return "Vendor deliverable";
    if (item.platform && item.platform.length) {
      return item.platform.map(function (p) { return platformLabel(p); }).join(" / ") + "-specific";
    }
    return "";
  }

  function selectItems(cfg) {
    var idx = tierIndex(cfg.tier);
    var out = [];
    CATALOG.forEach(function (item) {
      if (!applies(item, cfg)) return;
      var ob = item.t[idx];
      if (ob === "-") return;
      if (ob === "Y" && !cfg.includeOptional) return;
      // resolve platform tooling; keep a platform-stable key off the raw title
      var resolved = {
        section: item.section,
        title: resolveTokens(item.title, cfg.platform),
        why: resolveTokens(item.why, cfg.platform),
        evidence: resolveTokens(item.evidence, cfg.platform),
        covers: item.covers ? resolveTokens(item.covers, cfg.platform) : "",
        link: item.link || SECTION_DOC[item.section] || "",
        applies: appliesTag(item),
        key: item.section + "::" + slug(item.title)
      };
      out.push({ item: resolved, ob: ob });
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

  // Progress as an Excel-friendly CSV that round-trips (config header + item table).
  function toProgressCsv(cfg, out) {
    function q(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
    var lines = ["Application readiness — saved progress",
      "Application," + q(cfg.app || ""),
      "Tier," + q(cfg.tier),
      "Audience," + q(cfg.facing),
      "Platform," + q(cfg.platform),
      "Delivery," + q(cfg.delivery),
      "Build," + q(cfg.build),
      "IncludeOptional," + q(cfg.includeOptional ? "yes" : "no"),
      "",
      ["Section", "Gate", "Obligation", "Item", "Done", "Evidence", "Why", "Key"].join(",")];
    itemRows(out).forEach(function (r) {
      var m = sectionMeta(r.item.section);
      lines.push([q(m[1]), q(m[2]), q(LABELS[r.ob]), q(r.item.title),
        q(r.done ? "Yes" : "No"), q(r.evidence), q(r.item.why), q(r.key)].join(","));
    });
    return lines.join("\r\n");
  }
  function parseCsv(text) {
    var rows = [], row = [], field = "", i = 0, inQ = false, c;
    text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    while (i < text.length) {
      c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ",") { row.push(field); field = ""; i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    row.push(field); rows.push(row);
    return rows;
  }
  function fromProgressCsv(text) {
    var rows = parseCsv(text), cfg = {}, headerIdx = -1;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r[0] === "Section" && r[1] === "Gate") { headerIdx = i; break; }
      if (r.length >= 2) {
        var k = r[0], v = r[1];
        if (k === "Application") cfg.app = v;
        else if (k === "Tier") cfg.tier = v;
        else if (k === "Audience") cfg.facing = v;
        else if (k === "Platform") cfg.platform = v;
        else if (k === "Delivery") cfg.delivery = v;
        else if (k === "Build") cfg.build = v;
        else if (k === "IncludeOptional") cfg.includeOptional = (v || "").toLowerCase() === "yes";
      }
    }
    var items = {};
    if (headerIdx >= 0) {
      var hdr = rows[headerIdx], ki = hdr.indexOf("Key"), di = hdr.indexOf("Done"), ei = hdr.indexOf("Evidence");
      for (var j = headerIdx + 1; j < rows.length; j++) {
        var rr = rows[j];
        if (!rr || !rr[ki]) continue;
        items[rr[ki]] = { done: (rr[di] || "").toLowerCase() === "yes", evidence: rr[ei] || "" };
      }
    }
    return { cfg: cfg, items: items };
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
        // obligation tag (right-aligned, first line) + applicability
        doc.setFont("helvetica", "bold"); doc.setFontSize(7);
        setText(r.ob === "M" ? [163, 45, 45] : [133, 79, 11]);
        doc.text(LABELS[r.ob].toUpperCase(), x0 + W, top, { align: "right" });
        if (r.item.applies) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); setText([140, 140, 140]);
          doc.text(r.item.applies, x0 + W, top + 9, { align: "right" });
        }
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
             datacenter: "BC Gov Data Centre", desktop: "Desktop client", other: "Other platform" }[p] || p; }

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

  /* --- per-item state, persistence, reports ----------------------------- */
  function itemRows(out) {
    var flat = out._flat || [];
    var arr = [];
    out.querySelectorAll(".arr-gen-list li").forEach(function (li) {
      var r = flat[+li.getAttribute("data-idx")];
      if (!r) return;
      var cb = li.querySelector(".arr-item-done"), ev = li.querySelector(".arr-item-evidence");
      arr.push({ item: r.item, ob: r.ob, key: li.getAttribute("data-key"),
        done: cb ? cb.checked : false, evidence: ev ? ev.value.trim() : "" });
    });
    return arr;
  }
  function remainingRows(out) {
    return itemRows(out).filter(function (r) { return !r.done; })
      .map(function (r) { return { item: r.item, ob: r.ob }; });
  }
  function updateProgress(out) {
    var rows = itemRows(out), total = rows.length;
    var done = rows.filter(function (r) { return r.done; }).length;
    var d = out.querySelector(".arr-done-n"), rem = out.querySelector(".arr-remaining-n");
    if (d) d.textContent = done;
    if (rem) rem.textContent = total - done;
  }
  function stateKey(cfg) { return "arr-state:" + slug(cfg.app || "application"); }
  function collectState(cfg, out) {
    var items = {};
    itemRows(out).forEach(function (r) {
      if (r.done || r.evidence) items[r.key] = { done: r.done, evidence: r.evidence };
    });
    return { version: 1, savedAt: todayStr(), cfg: cfg, items: items };
  }
  function saveLocal(cfg, out) {
    try { localStorage.setItem(stateKey(cfg), JSON.stringify(collectState(cfg, out))); } catch (e) {}
  }
  function loadLocal(cfg) {
    try { var s = localStorage.getItem(stateKey(cfg)); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function applyItemStates(out, items) {
    if (!items) return;
    out.querySelectorAll(".arr-gen-list li").forEach(function (li) {
      var st = items[li.getAttribute("data-key")];
      if (!st) return;
      var ev = li.querySelector(".arr-item-evidence");
      if (ev) ev.value = st.evidence || "";
      var has = !!(st.evidence || "").trim();
      li.classList.toggle("has-evidence", has);
      var cb = li.querySelector(".arr-item-done");
      if (cb) { cb.checked = !!st.done && has; li.classList.toggle("done", cb.checked); }
    });
    updateProgress(out);
  }

  // Verification report: what's done (with evidence) and what's outstanding.
  function toVerificationReport(cfg, out) {
    var states = itemRows(out);
    var done = states.filter(function (r) { return r.done; });
    var pend = states.filter(function (r) { return !r.done; });
    var h = "# Readiness verification report — " + (cfg.app || "Application") + "\n\n> " +
      metaLine(cfg) + "\n>\n> " + done.length + " of " + states.length +
      " items complete · generated " + todayStr() + "\n";
    h += "\n## Completed (with evidence)\n";
    if (!done.length) h += "\n_None yet._\n";
    SECTIONS.forEach(function (s) {
      var items = done.filter(function (r) { return r.item.section === s[0]; });
      if (!items.length) return;
      h += "\n### " + s[1] + "\n";
      items.forEach(function (r) {
        h += "- [x] **" + LABELS[r.ob] + "** — " + r.item.title + "\n" +
             "  - Evidence: " + (r.evidence || "_(none provided)_") + "\n";
      });
    });
    h += "\n## Outstanding\n";
    if (!pend.length) h += "\n_None — all applicable items complete._\n";
    SECTIONS.forEach(function (s) {
      var items = pend.filter(function (r) { return r.item.section === s[0]; });
      if (!items.length) return;
      h += "\n### " + s[1] + "\n";
      items.forEach(function (r) { h += "- [ ] **" + LABELS[r.ob] + "** — " + r.item.title + "\n"; });
    });
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

    html += '<div class="arr-gen-howto"><strong>How to use this:</strong> for each item, ' +
      'paste an <strong>evidence link</strong> (repo / PR / doc) and tick it done — evidence is required to ' +
      'mark an item complete. Your progress <strong>auto-saves in this browser</strong>; use ' +
      '<em>Save / Load progress</em> to move it between machines. Then export a ' +
      '<em>one-pager</em> of what\'s left, or a <em>verification report</em> of what\'s done.</div>';

    html += '<div class="arr-gen-actions">' +
      '<button class="md-button md-button--primary arr-op-btn">Create one-pager of remaining items</button>' +
      '<button class="md-button arr-full-pdf">Full checklist (PDF)</button>' +
      '<button class="md-button arr-report-btn">Verification report (.md)</button>' +
      '<button class="md-button arr-dl" data-fmt="csv">Tasks for ServiceNow (.csv)</button>' +
      '</div>';

    html += '<div class="arr-gen-progressbar">' +
      '<button class="md-button arr-save-btn">Save progress (.csv)</button>' +
      '<label class="md-button arr-load-lbl">Load progress (.csv)' +
        '<input type="file" class="arr-load-input" accept=".csv,text/csv" hidden></label>' +
      '<span class="arr-autosave">Progress auto-saves in this browser; the CSV opens in Excel and re-imports here.</span>' +
      '</div>';

    html += '<div class="arr-onepager" hidden></div>';

    SECTIONS.forEach(function (s) {
      var key = s[0], label = s[1], gate = s[2];
      var items = by[key];
      if (!items || !items.length) return;
      var docUrl = SECTION_DOC[key];
      html += '<div class="arr-gen-section"><h3>' + esc(label) +
              ' <span class="arr-gate">Gate ' + gate + '</span></h3><ul class="arr-gen-list">';
      items.forEach(function (r) {
        var idx = flat.length; flat.push(r);
        var dkey = r.item.key || (r.item.section + "::" + slug(r.item.title));
        var docUrl = r.item.link;
        html += '<li data-idx="' + idx + '" data-key="' + dkey + '">' +
          '<label class="arr-check" title="Add evidence, then tick"><input type="checkbox" class="arr-item-done"></label>' +
          pill(r.ob) +
          '<div class="arr-gen-item">' +
            '<div class="arr-gen-title">' + esc(r.item.title) +
              (docUrl ? ' <a class="arr-gen-doc" href="' + docUrl + '" target="_blank" rel="noopener">details ↗</a>' : '') +
              (r.item.applies ? ' <span class="arr-applies">' + esc(r.item.applies) + '</span>' : '') + '</div>' +
            '<div class="arr-gen-why"><span>Why</span> ' + esc(r.item.why) + '</div>' +
            '<div class="arr-gen-ev"><span>Evidence expected</span> ' + esc(r.item.evidence) + '</div>' +
            (r.item.covers ? '<div class="arr-gen-covers"><span>Covers</span> ' + esc(r.item.covers) + '</div>' : '') +
            '<div class="arr-gen-eviform">' +
              '<input type="text" class="arr-item-evidence" placeholder="Paste your evidence link (repo / PR / doc) — required to mark done">' +
              '<span class="arr-evi-hint">Add evidence to mark this done</span>' +
            '</div>' +
          '</div></li>';
      });
      html += '</ul></div>';
    });

    var out = root.querySelector(".arr-gen-out");
    out.innerHTML = html;
    out.hidden = false;
    out._flat = flat;

    // tick requires evidence; clearing evidence unticks
    out.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.classList.contains("arr-item-done")) {
        var li = t.closest("li"), ev = li.querySelector(".arr-item-evidence");
        if (t.checked && !(ev && ev.value.trim())) {
          t.checked = false;
          li.classList.add("needs-evidence");
          if (ev) ev.focus();
          setTimeout(function () { li.classList.remove("needs-evidence"); }, 2500);
          return;
        }
        li.classList.toggle("done", t.checked);
        updateProgress(out); saveLocal(cfg, out);
      }
    });
    out.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.classList.contains("arr-item-evidence")) {
        var li = t.closest("li"), has = !!t.value.trim();
        li.classList.toggle("has-evidence", has);
        li.classList.remove("needs-evidence");
        if (!has) { var cb = li.querySelector(".arr-item-done"); if (cb && cb.checked) { cb.checked = false; li.classList.remove("done"); updateProgress(out); } }
        saveLocal(cfg, out);
      }
    });

    out.querySelector(".arr-op-btn").addEventListener("click", function () {
      var rows = remainingRows(out);
      var panel = out.querySelector(".arr-onepager");
      panel.innerHTML = onePagerHtml(cfg, rows);
      panel.hidden = false;
      panel.querySelector(".arr-op-pdf").addEventListener("click", function () { openPdf(cfg, rows); });
      var cp = panel.querySelector(".arr-op-copy");
      if (cp) cp.addEventListener("click", function () { copyText(cp, toPlainText(cfg, rows)); });
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    out.querySelector(".arr-full-pdf").addEventListener("click", function () { openPdf(cfg, selected, true); });

    out.querySelector(".arr-report-btn").addEventListener("click", function () {
      download(slug(cfg.app || "application") + "-verification-report.md", "text/markdown", toVerificationReport(cfg, out));
    });

    out.querySelectorAll(".arr-dl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        download(slug(cfg.app || "application") + "-readiness-servicenow.csv", "text/csv", toCsv(cfg, remainingRows(out)));
      });
    });

    out.querySelector(".arr-save-btn").addEventListener("click", function () {
      download(slug(cfg.app || "application") + "-progress.csv", "text/csv", toProgressCsv(cfg, out));
    });
    var loadInput = out.querySelector(".arr-load-input");
    loadInput.addEventListener("change", function () {
      var f = loadInput.files && loadInput.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var st = fromProgressCsv(fr.result);
          setFormConfig(root, st.cfg);
          runGenerate(root, st);
        } catch (e) { alert("Sorry — that doesn't look like a saved progress CSV."); }
      };
      fr.readAsText(f);
    });

    updateProgress(out);
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

  function setFormConfig(root, cfg) {
    if (!cfg) return;
    if (cfg.app != null) root.querySelector('[name="app"]').value = cfg.app;
    ["build", "tier", "facing", "delivery"].forEach(function (n) {
      var el = root.querySelector('[name="' + n + '"][value="' + cfg[n] + '"]');
      if (el) el.checked = true;
    });
    if (cfg.platform) { var p = root.querySelector('[name="platform"]'); if (p) p.value = cfg.platform; }
    var o = root.querySelector('[name="optional"]'); if (o) o.checked = !!cfg.includeOptional;
  }

  function runGenerate(root, stateObj) {
    var cfg = readConfig(root);
    if (!cfg.tier) return;
    renderResults(root, cfg, selectItems(cfg));
    var out = root.querySelector(".arr-gen-out");
    var st = stateObj || loadLocal(cfg);
    if (st && st.items) applyItemStates(out, st.items);
    try { localStorage.setItem("arr-last", JSON.stringify({ cfg: cfg, at: todayStr() })); } catch (e) {}
  }

  // If they left progress last time, offer a one-click resume.
  function showResume(root) {
    try {
      var last = JSON.parse(localStorage.getItem("arr-last") || "null");
      if (!last || !last.cfg || !last.cfg.app) return;
      var saved = loadLocal(last.cfg);
      if (!saved || !saved.items || !Object.keys(saved.items).length) return;
      var form = root.querySelector(".arr-gen-form");
      var banner = document.createElement("div");
      banner.className = "arr-resume";
      banner.innerHTML = '<span>You have saved progress for <strong>' + esc(last.cfg.app) + '</strong>' +
        (last.at ? ' (last saved ' + esc(last.at) + ')' : '') + '.</span>' +
        '<button type="button" class="md-button md-button--primary arr-resume-btn">Resume where I left off</button>';
      form.parentNode.insertBefore(banner, form);
      banner.querySelector(".arr-resume-btn").addEventListener("click", function () {
        setFormConfig(root, last.cfg); runGenerate(root); banner.remove();
      });
    } catch (e) {}
  }

  /* --- editable source: build the catalog from checklist-items.csv -------- *
   * The checklist is maintained in docs/checklist/checklist-items.csv, which
   * anyone can open and edit in Excel (no code). The tool fetches it on load
   * and builds the whole checklist from it. The CATALOG/SECTIONS defined at
   * the top of this file are only a safety fallback if the CSV can't be read. */
  function catalogFromCsv(text) {
    var rows = parseCsv(text);
    if (!rows || rows.length < 2) return null;
    var hdr = rows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
    function ix(n) { return hdr.indexOf(n); }
    var iS = ix("section"), iG = ix("gate"), iItem = ix("item"), iWhy = ix("why"),
        iEv = ix("evidence"), iCov = ix("covers"), iT1 = ix("tier 1"),
        iT2 = ix("tier 2"), iT3 = ix("tier 3"), iAp = ix("applies to"),
        iLink = ix("more info");
    if (iS < 0 || iItem < 0 || iT1 < 0) return null;
    var OB = { "must": "M", "should": "S", "optional": "Y", "n/a": "-", "na": "-", "-": "-", "": "-" };
    function ob(v) { return OB[String(v || "").trim().toLowerCase()] || "-"; }
    var PLAT = { "openshift": "openshift", "salesforce": "salesforce",
      "public cloud": "cloud", "cloud": "cloud", "bc gov data centre": "datacenter",
      "bc gov data center": "datacenter", "desktop": "desktop" };
    var cat = [], secs = [], seen = {};
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row) continue;
      var title = String(row[iItem] || "").trim();
      if (!title) continue;
      var sec = String(row[iS] || "").trim();
      var gate = iG >= 0 ? String(row[iG] || "").trim() : "";
      if (sec && !seen[sec]) { seen[sec] = true; secs.push([sec, sec, gate]); }
      var link = iLink >= 0 ? String(row[iLink] || "").trim() : "";
      if (link && !/^(https?:|\.\.?\/|\/|#)/.test(link)) link = "";
      var item = {
        section: sec, title: title,
        why: iWhy >= 0 ? String(row[iWhy] || "").trim() : "",
        evidence: iEv >= 0 ? String(row[iEv] || "").trim() : "",
        covers: iCov >= 0 ? String(row[iCov] || "").trim() : "",
        link: link,
        t: [ob(row[iT1]), ob(row[iT2]), ob(row[iT3])]
      };
      var ap = String((iAp >= 0 ? row[iAp] : "") || "").toLowerCase();
      if (ap.indexOf("vendor") > -1) item.vendor = true;
      if (ap.indexOf("public-facing") > -1 || ap.indexOf("public facing") > -1) item.facing = "public";
      var plats = [];
      for (var key in PLAT) { if (ap.indexOf(key) > -1 && plats.indexOf(PLAT[key]) < 0) plats.push(PLAT[key]); }
      if (plats.length) item.platform = plats;
      cat.push(item);
    }
    if (!cat.length) return null;
    return { sections: secs, catalog: cat };
  }

  function loadCatalog(done) {
    var finish = function () { try { done(); } catch (e) {} };
    if (typeof fetch !== "function") { finish(); return; }
    fetch("../checklist-items.csv", { cache: "no-cache" }).then(function (resp) {
      return resp && resp.ok ? resp.text() : null;
    }).then(function (text) {
      if (text) {
        var res = catalogFromCsv(text);
        if (res && res.catalog.length) { CATALOG = res.catalog; SECTIONS = res.sections; }
      }
      finish();
    }).catch(finish);
  }

  function init() {
    var root = document.getElementById("arr-gen");
    if (!root || root.dataset.wired) return;
    root.dataset.wired = "1";
    root.querySelector(".arr-gen-run").addEventListener("click", function () { runGenerate(root); });
    // Load the editable CSV source; it overrides the built-in fallback catalog.
    loadCatalog(function () { showResume(root); });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
