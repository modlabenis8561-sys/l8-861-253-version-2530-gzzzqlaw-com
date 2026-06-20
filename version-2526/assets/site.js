
(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var toggle = one('[data-menu-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = one('[data-hero]');
    if (!root) {
      return;
    }
    var slides = all('[data-hero-slide]', root);
    var dots = all('[data-hero-dot]', root);
    var prev = one('[data-hero-prev]', root);
    var next = one('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    all('[data-filter-root]').forEach(function (root) {
      var form = one('[data-filter-form]', root);
      var cards = all('[data-movie-card]', root);
      var empty = one('[data-empty-state]', root);
      if (!form || !cards.length) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      var qInput = form.querySelector('input[name="q"]');
      if (qInput && q) {
        qInput.value = q;
      }

      function val(name) {
        var field = form.elements[name];
        return field ? String(field.value || '').trim().toLowerCase() : '';
      }

      function update() {
        var query = val('q');
        var year = val('year');
        var region = val('region');
        var type = val('type');
        var visible = 0;
        cards.forEach(function (card) {
          var hay = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var ok = true;
          if (query && hay.indexOf(query) === -1) {
            ok = false;
          }
          if (year && String(card.getAttribute('data-year') || '').toLowerCase() !== year) {
            ok = false;
          }
          if (region && String(card.getAttribute('data-region') || '').toLowerCase().indexOf(region) === -1) {
            ok = false;
          }
          if (type && String(card.getAttribute('data-type') || '').toLowerCase().indexOf(type) === -1) {
            ok = false;
          }
          card.classList.toggle('filter-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      form.addEventListener('input', update);
      form.addEventListener('change', update);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        update();
      });
      update();
    });
  }

  function setupPlayers() {
    all('[data-player]').forEach(function (shell) {
      var video = one('video', shell);
      var button = one('[data-player-button]', shell);
      var error = one('[data-player-error]', shell);
      var stream = shell.getAttribute('data-stream');
      var hls = null;
      var attached = false;

      if (!video || !stream) {
        return;
      }

      function showError(message) {
        if (!error) {
          return;
        }
        error.textContent = message;
        error.classList.add('is-visible');
      }

      function hideError() {
        if (error) {
          error.textContent = '';
          error.classList.remove('is-visible');
        }
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        hideError();
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showError('播放加载失败，请刷新重试');
              hls.destroy();
            }
          });
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        var task = video.play();
        if (task && typeof task.catch === 'function') {
          task.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && !video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        showError('播放加载失败，请刷新重试');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
