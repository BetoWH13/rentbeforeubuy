/* Drive Before Buy — minimal site JS
   Powers the checklist only: progressive sections, local persistence, reset, and print.
   No tracking, analytics, or third-party calls. */

(function () {
  "use strict";

  function appendThemeStylesheet(href, marker) {
    if (document.querySelector("link[" + marker + "]")) return;
    var theme = document.createElement("link");
    theme.rel = "stylesheet";
    theme.href = href;
    theme.setAttribute(marker, "");
    document.head.appendChild(theme);
  }

  function initInnerTheme() {
    var checklist = document.querySelector("[data-checklist='weekend-test-v2']");
    if (!checklist) return;

    document.body.classList.add("inner-v2", "checklist-page");
    appendThemeStylesheet("/assets/site-theme-v2.css", "data-inner-theme-v2");
  }

  function initChecklistSections(root) {
    if (!root || root.classList.contains("enhanced")) return;
    var sections = Array.prototype.slice.call(root.querySelectorAll(":scope > section"));
    if (!sections.length) return;

    function openSection(section) {
      if (!section) return;
      section.classList.add("is-open");
      var toggle = section.querySelector(".checklist-section-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
    }

    sections.forEach(function (section, index) {
      var heading = section.querySelector("h3");
      if (!heading) return;

      var body = document.createElement("div");
      body.className = "checklist-body";
      while (heading.nextSibling) body.appendChild(heading.nextSibling);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "checklist-section-toggle";
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");

      var count = section.querySelectorAll("input[type='checkbox']").length;
      var badge = document.createElement("span");
      badge.className = "checklist-count";
      badge.textContent = count + " checks";

      var label = document.createElement("span");
      label.className = "checklist-section-heading";
      label.textContent = heading.textContent;
      button.appendChild(label);
      button.appendChild(badge);
      section.removeChild(heading);
      section.insertBefore(button, section.firstChild);
      section.appendChild(body);
      if (index === 0) section.classList.add("is-open");

      button.addEventListener("click", function () {
        var isOpen = section.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });

    document.querySelectorAll(".section-jump a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function () {
        var target = document.querySelector(link.getAttribute("href"));
        openSection(target);
      });
    });

    if (window.location.hash) openSection(document.querySelector(window.location.hash));

    root.classList.add("enhanced");
  }

  function initChecklist() {
    var root = document.querySelector("[data-checklist]");
    if (!root) return;

    initChecklistSections(root);

    var id = root.getAttribute("data-checklist");
    var key = "rbyb-checklist-" + id;

    try {
      var saved = JSON.parse(localStorage.getItem(key) || "{}");
      root.querySelectorAll("input[type='checkbox']").forEach(function (cb) {
        var name = cb.getAttribute("name");
        if (!name) return;
        if (saved[name]) cb.checked = true;
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
      // localStorage unavailable — page still works without persistence.
    }

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

    var printHeights = [];
    function expandNotesForPrint() {
      printHeights = [];
      root.querySelectorAll("textarea.notes").forEach(function (ta) {
        printHeights.push([ta, ta.style.height]);
        ta.style.height = "auto";
        ta.style.height = Math.max(56, ta.scrollHeight) + "px";
      });
    }
    function restoreNotesAfterPrint() {
      printHeights.forEach(function (entry) { entry[0].style.height = entry[1]; });
      printHeights = [];
    }
    if ("onbeforeprint" in window) {
      window.addEventListener("beforeprint", expandNotesForPrint);
      window.addEventListener("afterprint", restoreNotesAfterPrint);
    }

    var printBtn = document.querySelector("[data-action='print-checklist']");
    if (printBtn) {
      printBtn.addEventListener("click", function (e) {
        e.preventDefault();
        expandNotesForPrint();
        window.print();
      });
    }
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initInnerTheme();
    initChecklist();
  });
})();
