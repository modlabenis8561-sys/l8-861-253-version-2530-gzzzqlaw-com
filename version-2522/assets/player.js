function bindPlayer(streamUrl) {
    var video = document.getElementById("player-video");
    var overlay = document.getElementById("player-overlay");
    var initialized = false;
    var hls = null;

    function start() {
        if (!video || !streamUrl) {
            return;
        }

        if (overlay) {
            overlay.classList.add("hidden");
        }

        if (!initialized) {
            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                if (overlay) {
                    overlay.classList.remove("hidden");
                    var label = overlay.querySelector("strong");
                    if (label) {
                        label.textContent = "点击继续播放";
                    }
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!initialized) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
