(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = 'search.html';

            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === active);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function restartSlider() {
        if (timer) {
            window.clearInterval(timer);
        }

        startSlider();
    }

    if (slides.length) {
        showSlide(0);
        startSlider();
    }

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(active - 1);
            restartSlider();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            restartSlider();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            restartSlider();
        });
    });

    var searchInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-result]');

    function normalize(value) {
        return (value || '').toString().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value.trim() : '');
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesRegion = !region || card.getAttribute('data-region') === region;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var matched = matchesKeyword && matchesRegion && matchesYear;

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    if (regionSelect) {
        regionSelect.addEventListener('change', applyFilters);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    applyFilters();

    window.initMoviePlayer = function (src) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var hls = null;
        var attached = false;

        if (!video || !overlay || !src) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }

            attached = true;
        }

        function play() {
            attach();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!attached) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
