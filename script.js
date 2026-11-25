(() => {
  "use strict";

  /* ---------------------------------------------------------------
     CONFIG
     Put the address of your own download service here.
     See README.md ("Connecting the download button") for the format.
     Leave it empty and the site shows a "not connected yet" message.
  ---------------------------------------------------------------- */
  const API_ENDPOINT = "https://instagramsaver-backend.onrender.com/process";
  const REQUEST_TIMEOUT_MS = 20000;

  const form = document.getElementById("saver-form");
  const input = document.getElementById("url");
  const result = document.getElementById("result");
  const pageTitle = document.getElementById("page-title");
  const modeButtons = document.querySelectorAll(".mode button");
  const submitBtn = form.querySelector("button[type=submit]");

  let mode = "video";
  let lastData = null;

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  // Only ever link to https addresses returned by the service.
  function safeUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:" ? u.href : "";
    } catch {
      return "";
    }
  }

  function isInstagramUrl(value) {
    try {
      const u = new URL(value);
      const hostOk =
        u.protocol === "https:" &&
        (u.hostname === "instagram.com" || u.hostname.endsWith(".instagram.com"));
      const pathOk = /\/(reel|reels|p|tv)\/[\w-]+/.test(u.pathname);
      return hostOk && pathOk;
    } catch {
      return false;
    }
  }

  function showMessage(text, kind) {
    result.hidden = false;
    result.className = "result is-" + kind;
    result.textContent = text;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
  }

  function renderResult(data) {
    result.className = "result is-ready";
    result.replaceChildren();

    const row = el("div", "result-row");
    const thumb = safeUrl(data.thumbnail);
    if (thumb) {
      const img = el("img", "result-thumb");
      img.src = thumb;
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      row.append(img);
    }
    const meta = el("div", "result-meta");
    meta.append(el("p", "result-title", data.title || "Instagram reel"));
    if (data.author) {
      meta.append(el("p", "result-author", "@" + String(data.author).replace(/^@/, "")));
    }
    row.append(meta);
    result.append(row);

    const fileUrl = safeUrl(mode === "audio" ? data.audioUrl : data.videoUrl);
    if (fileUrl) {
      const link = el(
        "a",
        "btn-grad result-link",
        mode === "audio" ? "Download audio (MP3)" : "Download video (MP4)"
      );
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = "";
      result.append(link);
    } else {
      result.append(el("p", "result-note", "This reel isn't available as " + mode + "."));
    }
    result.hidden = false;
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      modeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      pageTitle.textContent = mode === "audio" ? "INSTAGRAM AUDIO SAVER" : "INSTAGRAM REEL SAVER";
      if (lastData) renderResult(lastData);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      showMessage("Paste an Instagram reel link first.", "error");
      input.focus();
      return;
    }
    if (!isInstagramUrl(value)) {
      showMessage(
        "That doesn't look like an Instagram reel link. It should start with https://www.instagram.com/reel/",
        "error"
      );
      return;
    }
    if (!API_ENDPOINT) {
      showMessage(
        "The download service isn't connected yet. Add your service address in script.js (see README.md).",
        "error"
      );
      return;
    }

    setLoading(true);
    showMessage("Fetching your reel…", "loading");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: controller.signal,
      });
      if (res.status === 404) throw new Error("not-found");
      if (!res.ok) throw new Error("server");
      const data = await res.json();
      lastData = data;
      renderResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        showMessage("This is taking too long. Try again in a moment.", "error");
      } else if (err.message === "not-found") {
        showMessage("Couldn't find this reel. It may be private or removed.", "error");
      } else {
        showMessage("Something went wrong. Check the link and try again.", "error");
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  });
})();
