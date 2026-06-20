(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('[data-carousel="hero"]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var clearFilter = document.querySelector('[data-clear-filter]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .ranking-card'));

  function applyLocalFilter() {
    var value = filterInput ? filterInput.value.trim().toLowerCase() : '';
    filterItems.forEach(function (item) {
      var text = [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-region') || '',
        item.getAttribute('data-type') || '',
        item.getAttribute('data-year') || '',
        item.getAttribute('data-category') || '',
        item.textContent || ''
      ].join(' ').toLowerCase();
      item.classList.toggle('is-filter-hidden', value && text.indexOf(value) === -1);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyLocalFilter);
  }

  if (clearFilter) {
    clearFilter.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      applyLocalFilter();
    });
  }
})();

function setupMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var loaded = false;

  function loadAndPlay() {
    if (!video || !streamUrl) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    var playAction = video.play();
    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', loadAndPlay);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
}

function initSearchPage() {
  var input = document.getElementById('siteSearchInput');
  var form = document.getElementById('siteSearchForm');
  var results = document.getElementById('searchResults');
  var hint = document.getElementById('searchHint');
  var data = window.SEARCH_MOVIES || [];
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function makeCard(movie) {
    var tags = [movie.genre, movie.tags].filter(Boolean).join(',').split(/[,，、/|]+/).filter(Boolean).slice(0, 3);
    var tagHtml = tags.map(function (tag) {
      return '<span>' + escapeHtml(tag.trim()) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
          '<div class="poster-shell"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'"></div>' +
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
          '<div class="tag-row">' + tagHtml + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function render(query) {
    var value = query.trim().toLowerCase();
    if (!results) {
      return;
    }

    if (!value) {
      results.innerHTML = '<div class="empty-state">输入关键词后即可查看匹配影片。</div>';
      if (hint) {
        hint.textContent = '请输入关键词浏览匹配结果。';
      }
      return;
    }

    var matched = data.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ').toLowerCase();
      return text.indexOf(value) !== -1;
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
      if (hint) {
        hint.textContent = '可以尝试更换片名、地区、类型或年份。';
      }
      return;
    }

    results.innerHTML = matched.map(makeCard).join('');
    if (hint) {
      hint.textContent = '已显示相关影片，点击卡片进入详情页。';
    }
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
    });
  }

  render(initial);
}
