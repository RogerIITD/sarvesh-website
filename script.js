(function () {
  "use strict";

  // --- Scroll fade-in with IntersectionObserver ---
  const postcards = document.querySelectorAll(".postcard");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.3 }
  );
  postcards.forEach((card) => observer.observe(card));

  // Make hero visible immediately
  const hero = document.querySelector(".postcard--hero");
  if (hero) hero.classList.add("visible");

  // --- Scroll progress bar ---
  const container = document.querySelector(".postcards");
  const progressBar = document.querySelector(".scroll-progress-bar");

  if (container && progressBar) {
    container.addEventListener("scroll", () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    });
  }

  // --- Audio playback for shayari cards ---
  let currentAudio = null;
  let currentCard = null;

  document.querySelectorAll(".shayari-card").forEach((card) => {
    const btn = card.querySelector(".play-btn");
    const audioSrc = card.dataset.audio;

    btn.addEventListener("click", () => {
      // If clicking the same card that's playing, pause it
      if (currentCard === card && currentAudio && !currentAudio.paused) {
        pauseAudio(card);
        return;
      }

      // Stop any currently playing audio
      if (currentAudio) {
        pauseAudio(currentCard);
      }

      // Play new audio
      currentAudio = new Audio(audioSrc);
      currentCard = card;
      currentAudio.play();
      setPlaying(card, true);

      currentAudio.addEventListener("ended", () => {
        setPlaying(card, false);
        currentAudio = null;
        currentCard = null;
      });
    });
  });

  function pauseAudio(card) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      currentCard = null;
    }
    setPlaying(card, false);
  }

  function setPlaying(card, playing) {
    const playIcon = card.querySelector(".play-icon");
    const pauseIcon = card.querySelector(".pause-icon");
    const wave = card.querySelector(".sound-wave");

    playIcon.hidden = playing;
    pauseIcon.hidden = !playing;
    wave.hidden = !playing;
  }

  // --- Song player ---
  const songBtn = document.querySelector(".song-play-btn");
  if (songBtn) {
    let songAudio = null;
    const barFill = document.querySelector(".song-bar-fill");
    const bar = document.querySelector(".song-bar");
    const currentTime = document.querySelector(".song-current");
    const durationEl = document.querySelector(".song-duration");

    songBtn.addEventListener("click", () => {
      if (!songAudio) {
        songAudio = new Audio(songBtn.dataset.audio);

        songAudio.addEventListener("loadedmetadata", () => {
          durationEl.textContent = formatTime(songAudio.duration);
        });

        songAudio.addEventListener("timeupdate", () => {
          if (songAudio.duration) {
            const pct = (songAudio.currentTime / songAudio.duration) * 100;
            barFill.style.width = pct + "%";
            currentTime.textContent = formatTime(songAudio.currentTime);
          }
        });

        songAudio.addEventListener("ended", () => {
          setSongPlaying(false);
          barFill.style.width = "0%";
          currentTime.textContent = "0:00";
          songAudio = null;
        });
      }

      if (songAudio.paused) {
        // Stop shayari audio if playing
        if (currentAudio) {
          pauseAudio(currentCard);
        }
        songAudio.play();
        setSongPlaying(true);
      } else {
        songAudio.pause();
        setSongPlaying(false);
      }
    });

    // Click on progress bar to seek
    if (bar) {
      bar.addEventListener("click", (e) => {
        if (songAudio && songAudio.duration) {
          const rect = bar.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          songAudio.currentTime = pct * songAudio.duration;
        }
      });
    }

    function setSongPlaying(playing) {
      songBtn.querySelector(".play-icon").hidden = playing;
      songBtn.querySelector(".pause-icon").hidden = !playing;
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }
})();
