/* Rent Before You Buy — minimal site JS
   Only powers the checklist (checkbox persistence + print) and the
   cost-vs-remorse calculator. No tracking, no analytics, no third-party calls. */

(function () {
  "use strict";

  /* ---------- Checklist: localStorage persistence ---------- */
  function initChecklist() {
    var root = document.querySelector("[data-checklist]");
    if (!root) return;

    var id = root.getAttribute("data-checklist");
    var key = "rbyb-checklist-" + id;

    // Load saved state
    try {
      var saved = JSON.parse(localStorage.getItem(key) || "{}");
      root.querySelectorAll("input[type='checkbox']").forEach(function (cb) {
        var name = cb.getAttribute("name");
        if (!name) return;
        if (saved[name]) {
          cb.checked = true;
        }
        cb.addEventListener("change", function () {
          var state = JSON.parse(localStorage.getItem(key) || "{}");
          state[name] = cb.checked;
          localStorage.setItem(key, JSON.stringify(state));
        });
      });
      root.querySelectorAll("textarea.notes").forEach(function (ta) {
        var name = ta.getAttribute("name");
        if (!name) return;
        if (saved[name]) ta.value = saved[name];
        ta.addEventListener("input", function () {
          var state = JSON.parse(localStorage.getItem(key) || "{}");
          state[name] = ta.value;
          localStorage.setItem(key, JSON.stringify(state));
        });
      });
    } catch (e) {
      // localStorage unavailable — silently degrade, page still works.
    }

    // Reset button
    var resetBtn = document.querySelector("[data-action='reset-checklist']");
    if (resetBtn) {
      resetBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!confirm("Clear all checked items and notes on this device?")) return;
        try { localStorage.removeItem(key); } catch (e) {}
        root.querySelectorAll("input[type='checkbox']").forEach(function (cb) { cb.checked = false; });
        root.querySelectorAll("textarea.notes").forEach(function (ta) { ta.value = ""; });
      });
    }

    // Print button
    var printBtn = document.querySelector("[data-action='print-checklist']");
    if (printBtn) {
      printBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.print();
      });
    }
  }

  /* ---------- Cost-vs-remorse calculator ---------- */
  function initCalculator() {
    var calc = document.querySelector("[data-calc]");
    if (!calc) return;

    var inputs = calc.querySelectorAll("input[type='number']");
    var outRental = calc.querySelector("[data-out='rental']");
    var outRemorse = calc.querySelector("[data-out='remorse']");
    var outRatio = calc.querySelector("[data-out='ratio']");
    var outVerdict = calc.querySelector("[data-out='verdict']");

    function parseNum(v) {
      var n = parseFloat(v);
      if (isNaN(n) || n < 0) return 0;
      return n;
    }

    function fmt(n) {
      if (isNaN(n)) n = 0;
      return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }

    function recalc() {
      var rentalDays = parseNum(calc.querySelector("[data-in='rental-days']").value) || 1;
      var dailyRate = parseNum(calc.querySelector("[data-in='daily-rate']").value);
      var insurance = parseNum(calc.querySelector("[data-in='insurance']").value);
      var fuel = parseNum(calc.querySelector("[data-in='fuel']").value);
      var other = parseNum(calc.querySelector("[data-in='other']").value);
      var purchasePrice = parseNum(calc.querySelector("[data-in='purchase-price']").value);
      var remorsePct = parseNum(calc.querySelector("[data-in='remorse-pct']").value);

      var rentalCost = rentalDays * dailyRate + insurance + fuel + other;
      // Buyer's remorse "exposure" — a heuristic, not a forecast.
      // We frame it as: if you turn over the wrong car in 1-2 years, what
      // depreciation + transaction cost hit might you eat? User-controlled %.
      var remorseExposure = purchasePrice * (remorsePct / 100);

      var ratio = rentalCost > 0 ? remorseExposure / rentalCost : 0;

      if (outRental) outRental.textContent = fmt(rentalCost);
      if (outRemorse) outRemorse.textContent = fmt(remorseExposure);
      if (outRatio) outRatio.textContent = ratio > 0 ? ratio.toFixed(1) + "×" : "—";

      if (outVerdict) {
        var v;
        if (rentalCost === 0 || purchasePrice === 0) {
          v = "Enter your numbers above to see the comparison.";
        } else if (ratio >= 10) {
          v = "The rental test costs a small fraction of the regret risk. Strong case for testing first.";
        } else if (ratio >= 3) {
          v = "The rental test is meaningfully cheaper than the regret exposure. Worth doing.";
        } else if (ratio >= 1) {
          v = "The rental cost is in the same ballpark as the regret exposure. Decide based on how uncertain you are.";
        } else {
          v = "The rental test would cost more than the modeled regret exposure. Probably skip unless you have other reasons.";
        }
        outVerdict.textContent = v;
      }
    }

    inputs.forEach(function (inp) {
      inp.addEventListener("input", recalc);
      inp.addEventListener("change", recalc);
    });
    recalc();
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initChecklist();
    initCalculator();
  });
})();
