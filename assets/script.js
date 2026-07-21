/* Drive Before Buy — theme loader only */
(function () {
  "use strict";

  function addStylesheet(href, marker) {
    if (document.querySelector("link[" + marker + "]")) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(marker, "");
    document.head.appendChild(link);
  }

  function initThemes() {
    var checklist = document.querySelector("[data-checklist='weekend-test-v2']");
    var calculator = document.querySelector("[data-calc]");
    var evPage = window.location.pathname === "/rent-before-buying-an-ev/";

    if (checklist || calculator || evPage) {
      document.body.classList.add("inner-v2");
      addStylesheet("/assets/site-theme-v2.css", "data-inner-theme-v2");
    }
    if (checklist) document.body.classList.add("checklist-page");
    if (calculator) {
      document.body.classList.add("cost-tool-page");
      addStylesheet("/assets/site-theme-v2-cost.css", "data-inner-theme-v2-cost");
    }
    if (evPage) {
      document.body.classList.add("category-page", "ev-page");
      addStylesheet("/assets/site-theme-v2-category.css", "data-inner-theme-v2-category");
    }
  }

  function loadCore() {
    if (document.querySelector("script[data-site-core]")) return;
    var core = document.createElement("script");
    core.src = "/assets/script-core.js";
    core.defer = true;
    core.setAttribute("data-site-core", "");
    document.head.appendChild(core);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemes, { once: true });
  } else {
    initThemes();
  }
  loadCore();
})();