/* Application Readiness — portfolio dashboard charts.
   Snapshot of the ServiceNow readiness records. Update the DATA block when the
   numbers change (or wire to an export later). */

(function () {
  var DATA = {
    tier:   { labels: ["Tier 1 — Mission-critical", "Tier 2 — Business-important", "Tier 3 — Supporting"],
              values: [2, 1, 1],
              colors: ["#da1e28", "#f1c21b", "#198038"] },
    status: { labels: ["Draft", "In review", "Conditional", "Approved"],
              values: [1, 1, 1, 1],
              colors: ["#8d8d8d", "#0043ce", "#f1c21b", "#198038"] },
    gate:   { labels: ["G1 Design", "G2 Build", "G3 PRR", "G4 Operate"],
              values: [1, 0, 2, 1],
              colors: ["#85B7EB", "#378ADD", "#185FA5", "#0C447C"] }
  };

  function makeDoughnut(id, d) {
    var el = document.getElementById(id);
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, {
      type: "doughnut",
      data: { labels: d.labels, datasets: [{ data: d.values, backgroundColor: d.colors, borderWidth: 2, borderColor: "transparent" }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "58%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } } } }
    });
  }

  function makeBar(id, d) {
    var el = document.getElementById(id);
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, {
      type: "bar",
      data: { labels: d.labels, datasets: [{ data: d.values, backgroundColor: d.colors }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
                  x: { ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 } } } } }
    });
  }

  function render() {
    if (typeof Chart === "undefined") return;
    makeDoughnut("arrTierChart", DATA.tier);
    makeBar("arrStatusChart", DATA.status);
    makeBar("arrGateChart", DATA.gate);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(render);
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }
})();
