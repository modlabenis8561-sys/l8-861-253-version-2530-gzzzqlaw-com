function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var overlay = document.getElementById(config.overlayId);
  var button = document.getElementById(config.buttonId);
  var source = config.source;
  var attached = false;
  var hls = null;

  function attach() {
    if (attached || !video || !source) {
      return;
    }
    attached = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (!video) {
    return;
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      start();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
