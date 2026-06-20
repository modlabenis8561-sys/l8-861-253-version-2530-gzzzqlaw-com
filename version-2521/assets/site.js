(function() {
    function qsAll(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    qsAll(document, "[data-menu-button]").forEach(function(button) {
        button.addEventListener("click", function() {
            var nav = document.querySelector("[data-mobile-nav]");
            if (nav) {
                nav.classList.toggle("is-open");
            }
        });
    });

    qsAll(document, "[data-carousel]").forEach(function(carousel) {
        var slides = qsAll(carousel, "[data-slide]");
        var dots = qsAll(carousel, "[data-carousel-dot]");
        var prev = carousel.querySelector("[data-carousel-prev]");
        var next = carousel.querySelector("[data-carousel-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function(dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-carousel-dot")) || 0);
                restart();
            });
        });

        show(0);
        restart();
    });

    qsAll(document, ".horizontal-section").forEach(function(section) {
        var list = section.querySelector("[data-horizontal-list]");
        var left = section.querySelector("[data-scroll-left]");
        var right = section.querySelector("[data-scroll-right]");
        if (!list) {
            return;
        }
        if (left) {
            left.addEventListener("click", function() {
                list.scrollBy({ left: -420, behavior: "smooth" });
            });
        }
        if (right) {
            right.addEventListener("click", function() {
                list.scrollBy({ left: 420, behavior: "smooth" });
            });
        }
    });

    qsAll(document, "[data-filter-panel]").forEach(function(panel) {
        var input = panel.querySelector("[data-filter-search]");
        var selects = qsAll(panel, "[data-filter-select]");
        var scope = panel.parentElement || document;
        var cards = qsAll(scope, ".movie-card, .rank-row");
        if (!cards.length) {
            cards = qsAll(document, ".movie-card, .rank-row");
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function(card) {
                var matched = true;
                if (query) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-keywords") || ""
                    ].join(" ").toLowerCase();
                    matched = haystack.indexOf(query) !== -1;
                }
                selects.forEach(function(select) {
                    var key = select.getAttribute("data-filter-key");
                    var value = select.value;
                    if (matched && key && value && (card.getAttribute("data-" + key) || "") !== value) {
                        matched = false;
                    }
                });
                card.classList.toggle("is-hidden", !matched);
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function(select) {
            select.addEventListener("change", apply);
        });
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".play-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        load();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && result.catch) {
            result.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
