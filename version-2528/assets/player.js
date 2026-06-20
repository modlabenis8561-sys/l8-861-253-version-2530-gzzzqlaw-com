(function () {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('play-overlay');
  var streamUrl = window.playerStreamUrl;
  var hls = null;
  var prepared = false;

  if (!video || !button || !streamUrl) {
    return;
  }

  function hideButton() {
    button.classList.add('is-hidden');
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  function preparePlayer() {
    if (prepared) {
      playVideo();
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          hls = null;
          video.src = streamUrl;
          video.load();
        }
      });
      return;
    }

    video.src = streamUrl;
    video.load();
    playVideo();
  }

  button.addEventListener('click', function () {
    hideButton();
    preparePlayer();
  });

  video.addEventListener('click', function () {
    if (!prepared) {
      hideButton();
      preparePlayer();
    }
  });

  video.addEventListener('play', hideButton);
})();
