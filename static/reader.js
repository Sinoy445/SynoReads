(function () {
  var root = document.documentElement;

  // Theme: use the saved choice, or the computer's own setting the first time
  var theme = localStorage.getItem("theme");
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  root.setAttribute("data-theme", theme);

  // Font size: use the saved size, or 19px
  var size = parseInt(localStorage.getItem("fontSize")) || 19;
  root.style.setProperty("--reader-size", size + "px");

  // Line height: use the saved choice, or 1.8
  var lineHeight = parseFloat(localStorage.getItem("lineHeight")) || 1.8;
  root.style.setProperty("--line-height", lineHeight);

  // Text alignment: use the saved choice, or justify
  var textAlign = localStorage.getItem("textAlign") || "justify";
  root.style.setProperty("--text-align", textAlign);

  // Content padding: use the saved choice, or 24px
  var contentPadding = parseInt(localStorage.getItem("contentPadding")) || 24;
  root.style.setProperty("--content-padding", contentPadding + "px");

  // Reading fonts: saved choice, or Garamond
  var fonts = [
    { key: "garamond", name: "Garamond", stack: '"EB Garamond", Georgia, serif' },
    { key: "literata", name: "Literata", stack: '"Literata", Georgia, serif' },
    { key: "sans",     name: "Sans",     stack: '"Atkinson Hyperlegible", Verdana, sans-serif' },
    { key: "mono",     name: "Typewriter", stack: '"Courier Prime", "Courier New", monospace' }
  ];
  var fontIndex = Math.max(0, fonts.findIndex(function (f) { return f.key === localStorage.getItem("readerFont"); }));

  function applyFont() {
    var f = fonts[fontIndex];
    root.style.setProperty("--reader-font", f.stack);
    root.setAttribute("data-font", f.key);
    var label = document.getElementById("fontLabel");
    if (label) label.textContent = f.name;
  }
  applyFont();
  document.addEventListener("DOMContentLoaded", applyFont);

  window.cycleFont = function () {
    fontIndex = (fontIndex + 1) % fonts.length;
    localStorage.setItem("readerFont", fonts[fontIndex].key);
    applyFont();
  };

  // Load user preferences from server if logged in
  loadUserPreferences();

  // Side prev/next: wakes on load, on a click/tap, or when the pointer nears the left/right
  // edge; ghosts again after 5s of inactivity or when the pointer moves away.
  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.getElementById("floatNav");
    if (!nav) return;
    var timer = null, tapped = false;

    function hide() { nav.classList.remove("visible"); }
    function arm() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (nav.matches(":hover")) { arm(); return; }   // don't vanish under the cursor
        tapped = false;
        hide();
      }, 5000);
    }
    function show() { nav.classList.add("visible"); arm(); }

    document.addEventListener("mousemove", function (e) {
      var near = e.clientX <= 140 || e.clientX >= window.innerWidth - 140;
      if (near) show();
      else if (!tapped && !nav.matches(":hover")) hide();
    });
    function tap() { tapped = true; show(); }
    document.addEventListener("click", tap);
    document.addEventListener("touchstart", tap, { passive: true });

    show();
  });

  window.toggleTheme = function () {
    theme = theme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  window.changeSize = function (change) {
    size = Math.min(30, Math.max(14, size + change));
    root.style.setProperty("--reader-size", size + "px");
    localStorage.setItem("fontSize", size);
    saveUserPreferences();
  };

  window.changeLineHeight = function (change) {
    lineHeight = Math.min(2.5, Math.max(1.5, lineHeight + change));
    root.style.setProperty("--line-height", lineHeight);
    localStorage.setItem("lineHeight", lineHeight);
    saveUserPreferences();
  };

  window.toggleAlign = function () {
    textAlign = textAlign === "justify" ? "left" : "justify";
    root.style.setProperty("--text-align", textAlign);
    localStorage.setItem("textAlign", textAlign);
    saveUserPreferences();
  };

  window.changePadding = function (change) {
    contentPadding = Math.max(12, Math.min(48, contentPadding + change));
    root.style.setProperty("--content-padding", contentPadding + "px");
    localStorage.setItem("contentPadding", contentPadding);
    saveUserPreferences();
  };

  // ---- Reading progress (stored in this browser only) ----
  var PKEY = "synoreadsProgress";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; }
  }
  function saveProgress(map) {
    try { localStorage.setItem(PKEY, JSON.stringify(map)); } catch (e) {}
  }
  // Where "continue" should take you: finished chapter -> the next one, else back into this one
  function target(e) {
    if (e.done && e.hasNext) {
      var n = e.chapter + 1;
      return { chapter: n, url: "/novel/" + e.novelId + "/chapter/" + n, text: "Continue with chapter " + n };
    }
    return { chapter: e.chapter, url: e.url, text: "Continue chapter " + e.chapter + (e.chapterTitle ? ": " + e.chapterTitle : "") };
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  // User preferences API functions
  function saveUserPreferencesToServer() {
    var prefs = {
      fontSize: size,
      readerFont: fonts[fontIndex].key,
      theme: theme,
      lineHeight: lineHeight,
      textAlign: textAlign,
      contentPadding: contentPadding
    };

    fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prefs)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status !== 'success') {
        console.warn('Failed to save user preferences');
      }
    })
    .catch(err => {
      console.error('Error saving user preferences:', err);
    });
  }

  function loadUserPreferencesFromServer() {
    fetch('/api/user/preferences', {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(prefs => {
      if (prefs && !prefs.error) {
        // Apply preferences
        if (prefs.fontSize) {
          size = prefs.fontSize;
          root.style.setProperty("--reader-size", size + "px");
          localStorage.setItem("fontSize", size);
        }
        if (prefs.readerFont) {
          var fontIndexNew = fonts.findIndex(function (f) { return f.key === prefs.readerFont; });
          if (fontIndexNew >= 0) {
            fontIndex = fontIndexNew;
            applyFont();
          }
        }
        if (prefs.theme) {
          theme = prefs.theme;
          root.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);
        }
        if (prefs.lineHeight) {
          lineHeight = prefs.lineHeight;
          root.style.setProperty("--line-height", lineHeight);
          localStorage.setItem("lineHeight", lineHeight);
        }
        if (prefs.textAlign) {
          textAlign = prefs.textAlign;
          root.style.setProperty("--text-align", textAlign);
          localStorage.setItem("textAlign", textAlign);
        }
        if (prefs.contentPadding) {
          contentPadding = prefs.contentPadding;
          root.style.setProperty("--content-padding", contentPadding + "px");
          localStorage.setItem("contentPadding", contentPadding);
        }
      }
    })
    .catch(err => {
      console.error('Error loading user preferences:', err);
    });
  }

  // User preferences API functions
  function saveUserPreferences() {
    // Only save if we have a way to identify the user (simplified check)
    if (typeof saveUserPreferencesToServer === 'function') {
      saveUserPreferencesToServer();
    }
  }

  function loadUserPreferences() {
    // Only load if we have a way to identify the user
    if (typeof loadUserPreferencesFromServer === 'function') {
      loadUserPreferencesFromServer();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var b = document.body, all = loadProgress();

    // Chapter page: remember chapter + scroll position
    if (b.dataset.chapter) {
      var id = b.dataset.novelId, ch = parseInt(b.dataset.chapter, 10);
      var before = all[id] && all[id].chapter === ch ? all[id] : null;
      var ratio = before ? before.scroll : 0;

      function save() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0) ratio = Math.max(0, Math.min(1, window.scrollY / max));
        var map = loadProgress();
        map[id] = {
          novelId: id, novelTitle: b.dataset.novelTitle,
          chapter: ch, chapterTitle: b.dataset.chapterTitle,
          url: location.pathname, hasNext: b.dataset.hasNext === "1",
          scroll: Math.round(ratio * 1000) / 1000, done: ratio >= 0.95, ts: Date.now()
        };
        saveProgress(map);
      }
      save();                                   // opening a chapter counts as reading it
      window.addEventListener("load", function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (before && before.scroll > 0.02 && before.scroll < 0.95 && max > 0) window.scrollTo(0, before.scroll * max);
        var t = null;
        window.addEventListener("scroll", function () {
          if (t) return;
          t = setTimeout(function () { t = null; save(); }, 400);
        }, { passive: true });
        window.addEventListener("pagehide", save);
      });
    }

    // Home page: banner + last-read novels first
    var list = document.querySelectorAll(".novel[data-novel-id]");
    if (list.length) {
      var seen = Array.prototype.slice.call(list).filter(function (n) { return all[n.dataset.novelId]; });
      seen.sort(function (a, c) { return all[c.dataset.novelId].ts - all[a.dataset.novelId].ts; });
      var first = list[0];
      seen.slice().reverse().forEach(function (n) { first.parentNode.insertBefore(n, first.parentNode.querySelector(".novel")); });
      seen.forEach(function (n) {
        var e = all[n.dataset.novelId], inner = n.querySelector("div");
        if (inner) inner.appendChild(el("div", "progress", "Last read: chapter " + e.chapter));
      });
      var box = document.getElementById("continue");
      if (box && seen.length) {
        var e0 = all[seen[0].dataset.novelId], t0 = target(e0);
        var a = el("a", "", e0.novelTitle + " — " + t0.text);
        a.href = t0.url;
        box.appendChild(el("span", "label", "Pick up where you left off"));
        box.appendChild(a);
        box.hidden = false;
      }
    }

    // Novel page: continue box + mark the chapter you left off at
    var toc = document.querySelector(".contents[data-novel-id]");
    if (toc && all[toc.dataset.novelId]) {
      var e1 = all[toc.dataset.novelId], t1 = target(e1), r = document.getElementById("resume");
      if (r) {
        var a1 = el("a", "", t1.text);
        a1.href = t1.url;
        r.appendChild(el("span", "label", "Pick up where you left off"));
        r.appendChild(a1);
        r.hidden = false;
      }
      var mark = toc.querySelector('a[href$="/chapter/' + e1.chapter + '"]');
      if (mark) mark.classList.add("last-read");
    }

    // Handle follow/unfollow buttons
    document.addEventListener('click', function(e) {
      if (e.target.matches('[data-action="follow"], [data-action="unfollow"]')) {
        e.preventDefault();
        var action = e.target.getAttribute('data-action');
        var novelId = e.target.getAttribute('data-novel-id');

        fetch('/api/user/follow/' + novelId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            // Update button text and class
            if (data.action === 'followed') {
              e.target.textContent = 'Following';
              e.target.classList.add('following');
              e.target.setAttribute('data-action', 'unfollow');
            } else {
              e.target.textContent = 'Follow';
              e.target.classList.remove('following');
              e.target.setAttribute('data-action', 'follow');
            }
          } else {
            alert('Failed to update follow status');
          }
        })
        .catch(err => {
          console.error('Error:', err);
          alert('An error occurred while updating follow status');
        });
      }
    });
  });
})();