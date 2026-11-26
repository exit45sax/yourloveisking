(function () {
  "use strict";
  var C = window.YLIK || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s || "").replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var PLAY = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z"/></svg>';

  /* ---------- nav ---------- */
  var nav = $("#nav"), menu = $("#menu"), menuBtn = $("#menuBtn");
  function onScroll() { nav.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("locked", open);
  }
  menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- hero video ---------- */
  var hv = $("#heroVideo"), vt = $("#videoToggle");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hv) {
    if (reduce) { hv.removeAttribute("autoplay"); hv.pause(); vt.classList.add("paused"); vt.setAttribute("aria-label", "Play background video"); }
    var p = hv.play && !reduce ? hv.play() : null;
    if (p && p.catch) p.catch(function () { vt.classList.add("paused"); });
    vt.addEventListener("click", function () {
      if (hv.paused) { hv.play(); vt.classList.remove("paused"); vt.setAttribute("aria-label", "Pause background video"); }
      else { hv.pause(); vt.classList.add("paused"); vt.setAttribute("aria-label", "Play background video"); }
    });
  }

  /* ---------- videos ---------- */
  var vids = (C.videos || []).filter(function (v) { return v && v.id; });
  var posters = ["img/live-stage-wide.webp", "img/justine-sax.webp", "img/live-stage-golden.webp", "img/justine-live.webp", "img/bass-live.webp", "img/live-stage-pink.webp"];
  function thumb(v, i) { return v.poster || posters[i % posters.length]; }
  function card(v, i, big) {
    return '<button type="button" class="vid" data-play="' + i + '" aria-label="Play ' + esc(v.title) + ' with sound">' +
      '<img src="' + esc(thumb(v, i)) + '" alt="" loading="lazy">' +
      '<span class="big-play">' + PLAY + '</span>' +
      '<span class="cap"><small>' + esc(v.subtitle || "") + '</small><b>' + esc(v.title || "") + '</b></span></button>';
  }
  var featured = $("#featured"), grid = $("#videoGrid");
  if (vids.length) {
    featured.innerHTML = card(vids[0], 0, true);
    grid.innerHTML = vids.slice(1).map(function (v, i) { return card(v, i + 1); }).join("");
  } else {
    // No YouTube links yet: show the silent live loop so the section is never empty.
    featured.innerHTML = '<div class="vid static"><video src="media/hero-loop.mp4" poster="media/hero-poster.jpg" muted loop playsinline autoplay aria-label="Live footage from Nostalgia Fishtown"></video>' +
      '<span class="cap"><small>Live · Nostalgia Fishtown</small><b>Full performance videos coming soon</b></span></div>';
    grid.style.display = "none";
  }

  /* ---------- video modal ---------- */
  var modal = $("#modal"), frame = $("#modalFrame"), lastFocus = null;
  function openVideo(i) {
    var v = vids[i];
    lastFocus = document.activeElement;
    if (v) {
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    } else {
      frame.innerHTML = '<video src="media/hero-loop.mp4" controls autoplay playsinline></video>';
    }
    modal.hidden = false; document.body.classList.add("locked");
    if (hv && !hv.paused) { hv.pause(); hv.dataset.resume = "1"; }
    $("#modalClose").focus();
  }
  function closeVideo() {
    modal.hidden = true; frame.innerHTML = ""; document.body.classList.remove("locked");
    if (hv && hv.dataset.resume) { hv.play(); delete hv.dataset.resume; }
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-play]");
    if (!t) return;
    if (!vids.length) { document.getElementById("watch").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); return; }
    openVideo(parseInt(t.getAttribute("data-play"), 10) || 0);
  });
  $("#modalClose").addEventListener("click", closeVideo);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeVideo(); });

  /* ---------- gallery lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), gImgs = $$("#gallery img"), gi = 0;
  function showLb(i) { gi = (i + gImgs.length) % gImgs.length; lbImg.src = gImgs[gi].src; lbImg.alt = gImgs[gi].alt; }
  $$("#gallery .g").forEach(function (b, i) {
    b.setAttribute("aria-label", "View photo: " + gImgs[i].alt);
    b.addEventListener("click", function () { lastFocus = b; showLb(i); lb.hidden = false; document.body.classList.add("locked"); $("#lbClose").focus(); });
  });
  function closeLb() { lb.hidden = true; document.body.classList.remove("locked"); if (lastFocus) lastFocus.focus(); }
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { showLb(gi - 1); });
  $("#lbNext").addEventListener("click", function () { showLb(gi + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) showLb(gi + (dx < 0 ? 1 : -1)); tx = null; });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (!bioModal.hidden) closeBio(); if (!modal.hidden) closeVideo(); if (!lb.hidden) closeLb(); if (menu.classList.contains("open")) setMenu(false); }
    if (!bioModal.hidden && e.key === "ArrowRight") fillBio(bioIdx + 1);
    if (!bioModal.hidden && e.key === "ArrowLeft") fillBio(bioIdx - 1);
    if (!lb.hidden && e.key === "ArrowRight") showLb(gi + 1);
    if (!lb.hidden && e.key === "ArrowLeft") showLb(gi - 1);
  });

  /* ---------- band bios ---------- */
  var bioModal = $("#bioModal"), bioPanel = $("#bioPanel"), bioIdx = 0, bioOpener = null;
  var members = $$(".member");
  function fillBio(i) {
    bioIdx = (i + members.length) % members.length;
    var mem = members[bioIdx], img = $("img", mem);
    var bi = $("#bioImg");
    bi.src = img.getAttribute("src"); bi.alt = img.alt;
    bi.style.setProperty("--pos", img.style.getPropertyValue("--pos") || "50% 25%");
    $("#bioName").textContent = $(".member-cap strong", mem).textContent;
    $("#bioRole").textContent = $(".member-cap span", mem).textContent;
    $("#bioCopy").innerHTML = $(".bio-text", mem).innerHTML;
    $("#bioCopy").scrollTop = 0;
  }
  function openBio(i) {
    bioOpener = document.activeElement;
    fillBio(i);
    bioModal.hidden = false; document.body.classList.add("locked");
    requestAnimationFrame(function () { requestAnimationFrame(function () { bioModal.classList.add("show"); }); });
    $("#bioClose").focus();
  }
  function closeBio() {
    bioModal.classList.remove("show");
    setTimeout(function () { bioModal.hidden = true; document.body.classList.remove("locked"); }, reduce ? 0 : 380);
    if (bioOpener) bioOpener.focus();
  }
  members.forEach(function (mem, i) { $(".member-open", mem).addEventListener("click", function () { openBio(i); }); });
  $("#bioClose").addEventListener("click", closeBio);
  $("#bioPrev").addEventListener("click", function () { fillBio(bioIdx - 1); });
  $("#bioNext").addEventListener("click", function () { fillBio(bioIdx + 1); });
  bioModal.addEventListener("click", function (e) { if (e.target === bioModal) closeBio(); });

  /* ---------- shows ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var shows = (C.shows || []).filter(function (s) { return s && s.date && new Date(s.date + "T23:59:59") >= today; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  $("#showList").innerHTML = shows.map(function (s) {
    var d = new Date(s.date + "T12:00:00");
    return '<div class="show"><div class="show-date">' + MON[d.getMonth()] + " " + d.getDate() + '<br><small style="font-size:13px;color:#BFB1A0">' + d.getFullYear() + '</small></div>' +
      '<div class="show-info"><b>' + esc(s.venue) + '</b><span>' + esc(s.city) + (s.time ? " · " + esc(s.time) : "") + '</span></div>' +
      (s.tickets ? '<a class="btn btn-line" href="' + esc(s.tickets) + '" rel="noopener" target="_blank">Tickets</a>' : "") + '</div>';
  }).join("");

  /* ---------- socials ---------- */
  var S = C.social || {}, names = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", bandsintown: "Bandsintown" };
  $("#socials").innerHTML = Object.keys(names).filter(function (k) { return S[k]; }).map(function (k) {
    return '<a href="' + esc(S[k]) + '" rel="noopener" target="_blank">' + names[k] + "</a>";
  }).join("");
  if (S.bandsintown) { var bb = $("#bitBtn"); bb.href = S.bandsintown; bb.target = "_blank"; bb.rel = "noopener"; bb.hidden = false; }

  /* ---------- press kit ---------- */
  var email = C.email || "YourLoveisKingSade@gmail.com", K = C.presskit || {};
  var kitNames = { onesheet: "One-Sheet", stageplot: "Stage Plot & Input List", rider: "Tech Rider", photos: "Hi-Res Photos" };
  $$("[data-kit]").forEach(function (a) {
    var k = a.getAttribute("data-kit");
    if (K[k]) { a.href = K[k]; a.setAttribute("download", ""); }
    else {
      a.href = "mailto:" + email + "?subject=" + encodeURIComponent("Press kit request: " + kitNames[k]);
      var em = $("em", a); if (em) em.textContent = "Request by email";
    }
  });

  /* ---------- booking form ---------- */
  var form = $("#bookForm"), status = $("#formStatus"), send = $("#sendBtn");
  function val(n) { var el = form.elements[n]; return el ? el.value.trim() : ""; }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status"; status.textContent = "";
    var ok = true;
    ["name", "email"].forEach(function (n) {
      var el = form.elements[n], bad = !el.value.trim() || (n === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute("aria-invalid", bad ? "true" : "false"); if (bad) ok = false;
    });
    if (!ok) { status.className = "form-status err"; status.textContent = "Please add your name and a valid email."; return; }
    if (form.elements.botcheck.checked) return;
    var subject = "Booking inquiry — " + (val("organization") || val("name"));
    var lines = ["Name: " + val("name"), "Email: " + val("email"), "Phone: " + val("phone"), "Venue / organization: " + val("organization"),
      "I am a: " + val("role"), "Event date: " + val("event_date"), "", val("message")];
    if (!C.web3formsKey) {
      window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with the inquiry filled in — just press send.";
      return;
    }
    send.disabled = true; send.textContent = "Sending…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: C.web3formsKey, subject: subject, from_name: "YourLoveisKing.com", replyto: val("email"),
        name: val("name"), email: val("email"), phone: val("phone"), organization: val("organization"), role: val("role"),
        event_date: val("event_date"), message: val("message") })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.success) throw new Error(j.message || "Send failed");
      form.reset(); status.className = "form-status ok";
      status.textContent = "Thank you — your inquiry is on its way. Expect a reply within one business day.";
    }).catch(function () {
      status.className = "form-status err";
      status.innerHTML = 'Sorry, that didn\'t send. Please email us at <a href="mailto:' + esc(email) + '">' + esc(email) + "</a>.";
    }).then(function () { send.disabled = false; send.textContent = "Send booking inquiry"; });
  });

  /* ---------- small touches ---------- */
  $("#yr").textContent = new Date().getFullYear();
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".section .wrap > *, .quote-inner, .proof-grid > div, .member, .kit-card").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
