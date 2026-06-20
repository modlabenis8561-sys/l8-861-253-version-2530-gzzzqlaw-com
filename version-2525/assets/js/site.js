(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

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

        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var grid = document.querySelector('[data-catalog-grid]');
        if (!grid) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-state]');
        var cards = selectAll('.movie-card', grid);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = textOf(card);
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (type && (card.getAttribute('data-type') || '').indexOf(type) === -1) {
                    ok = false;
                }
                if (year && (card.getAttribute('data-year') || '') !== year) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function bindStream(video, streamUrl) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }
        function attach() {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hls = hls;
                return Promise.resolve();
            }
            video.src = streamUrl;
            return Promise.resolve();
        }
        if (window.Hls) {
            return attach();
        }
        return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js').then(attach).catch(function () {
            video.src = streamUrl;
        });
    }

    window.initVideoPlayer = function (videoId, buttonId, maskId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var mask = document.getElementById(maskId);
        var prepared = false;
        if (!video || !streamUrl) {
            return;
        }

        function start() {
            if (mask) {
                mask.classList.add('is-hidden');
            }
            if (!prepared) {
                prepared = true;
                bindStream(video, streamUrl).then(function () {
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {});
                    }
                });
                return;
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (mask) {
            mask.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
