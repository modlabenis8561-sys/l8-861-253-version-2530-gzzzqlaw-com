(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroSliders() {
    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-dot]"));
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === index);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-dot")) || 0);
          restart();
        });
      });
      restart();
    });
  }

  function setupLocalFilters() {
    var inputs = document.querySelectorAll(".local-filter");
    inputs.forEach(function (input) {
      var targetId = input.getAttribute("data-target");
      var grid = targetId ? document.getElementById(targetId) : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-filter") || "";
          card.hidden = query.length > 0 && haystack.indexOf(query) === -1;
        });
      });
    });
  }

  function createSearchCard(movie) {
    var link = document.createElement("a");
    link.className = "movie-card";
    link.href = movie.url;

    var frame = document.createElement("span");
    frame.className = "poster-frame";

    var image = document.createElement("img");
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = "lazy";

    var shade = document.createElement("span");
    shade.className = "poster-shade";

    var badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = movie.type;

    var chip = document.createElement("span");
    chip.className = "play-chip";
    chip.textContent = "▶";

    frame.appendChild(image);
    frame.appendChild(shade);
    frame.appendChild(badge);
    frame.appendChild(chip);

    var copy = document.createElement("span");
    copy.className = "card-copy";

    var title = document.createElement("strong");
    title.textContent = movie.title;

    var meta = document.createElement("span");
    meta.className = "card-meta";
    meta.textContent = movie.year + " · " + movie.region + " · " + movie.genre;

    var desc = document.createElement("span");
    desc.className = "card-desc";
    desc.textContent = movie.description;

    copy.appendChild(title);
    copy.appendChild(meta);
    copy.appendChild(desc);

    link.appendChild(frame);
    link.appendChild(copy);
    return link;
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var suggestions = document.querySelector("[data-search-suggestions]");
    var title = document.querySelector("[data-search-title]");
    var message = document.querySelector("[data-search-message]");
    var formInput = document.querySelector(".search-page-form input[name='q']");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (formInput) {
      formInput.value = query;
    }
    if (!query) {
      return;
    }

    var lowerQuery = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.search.indexOf(lowerQuery) !== -1;
    }).slice(0, 96);

    results.innerHTML = "";
    matched.forEach(function (movie) {
      results.appendChild(createSearchCard(movie));
    });

    if (suggestions) {
      suggestions.style.display = "none";
    }
    if (title) {
      title.textContent = "“" + query + "” 的搜索结果";
    }
    if (message) {
      message.textContent = matched.length ? "点击卡片进入播放页面观看。" : "没有找到相关内容，请更换关键词。";
    }
  }

  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream();
      hideOverlay();
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showOverlay();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  onReady(function () {
    setupMobileNavigation();
    setupHeroSliders();
    setupLocalFilters();
    setupSearchPage();
  });
})();
