(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";

                if (value) {
                    event.preventDefault();
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
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
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-rail]").forEach(function (button) {
            button.addEventListener("click", function () {
                var wrap = button.closest(".rail-wrap");
                var rail = wrap ? wrap.querySelector(".movie-rail") : null;
                var dir = button.getAttribute("data-rail");
                if (rail) {
                    rail.scrollBy({
                        left: dir === "left" ? -420 : 420,
                        behavior: "smooth"
                    });
                }
            });
        });

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        if (filterInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";

            if (filterInput.hasAttribute("data-search-page") && initial) {
                filterInput.value = initial;
            }

            function applyFilter() {
                var value = filterInput.value.trim().toLowerCase();
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var match = !value || haystack.indexOf(value) !== -1;

                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }
    });
})();
