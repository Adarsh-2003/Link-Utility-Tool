(function () {
  var input = document.getElementById("input");
  var cleanBtn = document.getElementById("cleanBtn");
  var copyBtn = document.getElementById("copyBtn");
  var status = document.getElementById("status");
  var resultWrap = document.getElementById("resultWrap");
  var resultLink = document.getElementById("resultLink");

  var lastClean = "";

  function stripProblematicWhitespace(str) {
    return str.replace(/\s+/g, "");
  }

  function normalizeUrl(str) {
    var s = stripProblematicWhitespace(str).trim();
    if (!s) return "";

    if (!/^https?:\/\//i.test(s)) {
      s = "https://" + s;
    }

    try {
      var u = new URL(s);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "";
      return u.href;
    } catch (e) {
      return "";
    }
  }

  function setStatus(message, kind) {
    status.textContent = message || "";
    status.classList.remove("error", "ok");
    if (kind) status.classList.add(kind);
  }

  function showResult(href) {
    lastClean = href;
    resultLink.href = href;
    resultLink.textContent = href;
    resultWrap.classList.remove("hidden");
    copyBtn.disabled = false;
  }

  function hideResult() {
    resultWrap.classList.add("hidden");
    copyBtn.disabled = true;
    lastClean = "";
  }

  function clean() {
    var raw = input.value;
    var cleaned = normalizeUrl(raw);

    if (!raw.trim()) {
      setStatus("Paste a link first.", "error");
      hideResult();
      return;
    }

    if (!cleaned) {
      setStatus("Could not build a valid URL. Check the text and try again.", "error");
      hideResult();
      return;
    }

    input.value = cleaned;
    showResult(cleaned);
    setStatus("Spaces removed — link is ready.", "ok");
  }

  function copyClean() {
    if (!lastClean) return;

    function done() {
      setStatus("Copied to clipboard.", "ok");
    }

    function fail() {
      setStatus("Copy blocked — select the link and copy manually (Ctrl+C).", "error");
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastClean).then(done).catch(fail);
    } else {
      var ta = document.createElement("textarea");
      ta.value = lastClean;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        fail();
      }
      document.body.removeChild(ta);
    }
  }

  cleanBtn.addEventListener("click", clean);
  copyBtn.addEventListener("click", copyClean);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clean();
    }
  });

  input.addEventListener("paste", function () {
    setTimeout(function () {
      clean();
    }, 0);
  });
})();
