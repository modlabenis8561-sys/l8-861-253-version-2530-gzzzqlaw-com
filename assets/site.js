(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    var list = qs('[data-card-list]');
    var panel = qs('[data-filter-panel]');
    if (!list || !panel) {
      return;
    }
    var cards = qsa('[data-card]', list);
    var search = qs('[data-live-search]', panel);
    var region = qs('[data-region-filter]', panel);
    var type = qs('[data-type-filter]', panel);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (search && query) {
      search.value = query;
    }
    function matchCard(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var keyword = normalize(search ? search.value : '');
      var regionValue = region ? region.value : '全部地区';
      var typeValue = type ? type.value : '全部类型';
      var regionMatch = regionValue === '全部地区' || normalize(card.getAttribute('data-region')).indexOf(normalize(regionValue)) !== -1;
      var typeMatch = typeValue === '全部类型' || normalize(card.getAttribute('data-type')).indexOf(normalize(typeValue)) !== -1;
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      return regionMatch && typeMatch && keywordMatch;
    }
    function apply() {
      cards.forEach(function (card) {
        card.classList.toggle('hidden', !matchCard(card));
      });
    }
    if (search) {
      search.addEventListener('input', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    apply();
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(current);
        start();
      });
    });
    start();
  }

  window.setupVideoPlayer = function (mediaUrl) {
    var player = qs('[data-player]');
    if (!player) {
      return;
    }
    var video = qs('video', player);
    var veil = qs('.player-veil', player);
    if (!video || !veil) {
      return;
    }
    var loaded = false;
    function attach() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            capLevelToPlayerSize: true
          });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }
        loaded = true;
      }
      video.controls = true;
      veil.classList.add('is-hidden');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }
    veil.addEventListener('click', attach);
    video.addEventListener('click', function () {
      if (!loaded) {
        attach();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupFilters();
    setupHero();
  });
}());
