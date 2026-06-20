(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  var cardList = document.querySelector('[data-card-list]');

  if (filterScope && cardList) {
    var keywordInput = filterScope.querySelector('[data-filter-keyword]');
    var yearSelect = filterScope.querySelector('[data-filter-year]');
    var genreSelect = filterScope.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchGenre));
      });
    }

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });
  }

  var results = document.querySelector('[data-search-results]');
  var pageInput = document.querySelector('[data-search-page-input]');

  if (results && window.movieSearchData) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (pageInput) {
      pageInput.value = query;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch(term) {
      var normalized = String(term || '').trim().toLowerCase();
      if (!normalized) {
        results.innerHTML = '<p class="lead-text">请输入关键词查找影片。</p>';
        return;
      }

      var matches = window.movieSearchData.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags]
          .join(' ')
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }).slice(0, 80);

      if (!matches.length) {
        results.innerHTML = '<p class="lead-text">未找到符合条件的作品。</p>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-card" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<div>' +
          '<h2>' + escapeHtml(movie.title) + '</h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="ranking-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '</div>' +
          '</a>';
      }).join('');
    }

    renderSearch(query);
  }
})();
