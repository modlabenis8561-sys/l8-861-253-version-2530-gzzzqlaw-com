(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    play();
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  function createResultCard(movie) {
    return [
      '<article class="movie-card compact">',
      '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<span class="poster-frame">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-title">' + escapeHtml(movie.title) + '</span>',
      '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-kicker"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-input");
    var empty = document.getElementById("search-empty");
    var title = document.getElementById("search-title");
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;
    if (!query) {
      results.innerHTML = "";
      if (empty) {
        empty.textContent = "请输入关键词";
        empty.classList.add("is-visible");
      }
      return;
    }
    var keyword = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "“" + query + "”的搜索结果";
    }
    results.innerHTML = matched.map(createResultCard).join("");
    if (empty) {
      empty.textContent = "没有找到匹配的影片";
      empty.classList.toggle("is-visible", matched.length === 0);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
