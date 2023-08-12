const trailer1 = document.querySelector(".cursor-outer");
let mouseMovingTimeout;
let isTrailerFaded = false;

function hideCursor() {
  trailer1.style.display = "none";
}

function showCursor() {
  trailer1.style.display = "block";
}

function fadeOutTrailer() {
  trailer1.style.opacity = 0;
  isTrailerFaded = true;
}

function fadeInTrailer() {
  trailer1.style.opacity = 0.75;
  isTrailerFaded = false;
}

function resetMouseMovingTimeout() {
  clearTimeout(mouseMovingTimeout);
  mouseMovingTimeout = setTimeout(fadeOutTrailer, 1250);
  fadeInTrailer();
}

document.body.addEventListener("mouseenter", () => {
  showCursor();
  resetMouseMovingTimeout();
});

document.body.addEventListener("mouseleave", () => {
  hideCursor();
  fadeOutTrailer();
});

window.onmousemove = e => {
  const x = e.clientX - trailer1.offsetWidth / 2,
    y = e.clientY - trailer1.offsetHeight / 2;

  const keyframes = {
    transform: `translate(${x}px, ${y}px)`
  };

  trailer1.animate(keyframes, {
    duration: 1000,
    fill: "forwards"
  });

  if (isTrailerFaded) {
    fadeInTrailer();
  }

  resetMouseMovingTimeout();
};

trailer1.addEventListener("mouseenter", fadeInTrailer);
trailer1.addEventListener("mouseleave", fadeOutTrailer);
