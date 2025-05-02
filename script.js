// carousel.js

// ---- State & Elements ----
let isAnimating = false;
let currentProgress = 0;
const carousel = document.getElementById("carousel");
const cards = Array.from(document.querySelectorAll(".carousel-card"));
const totalCards = cards.length;

const baseCards   = 10;
const baseRadius  = 800;
const maxRadius   = 1400;

// ---- Helper: Slightly lift the active card ----
function centerActiveCard() {
  const activeIndex = Math.round(currentProgress * totalCards) % totalCards;
  const activeCard  = cards[activeIndex];
  gsap.to(activeCard, {
    y:  -10,
    duration: 0.3
  });
}

// ---- Helper: Dynamic radius based on card count ----
function getAdjustedRadius() {
  if (totalCards <= baseCards) return baseRadius;
  const extraCards  = totalCards - baseCards;
  const scaleFactor = 1 + extraCards * 0.04;
  return Math.min(baseRadius * scaleFactor, maxRadius);
}

// ---- Core: Position & style each card ----
function setCardTransforms(progress) {
  const radius    = getAdjustedRadius();
  const baseAngle = progress * 360;

  cards.forEach((card, i) => {
    // Calculate normalized rotation
    const cardAngle = i * (360 / totalCards);
    let rotation    = ((cardAngle - baseAngle + 180) % 360) - 180;
    rotation        = ((rotation + 180) % 360 + 360) % 360 - 180;

    // Depth-based scale & opacity
    const norm    = Math.abs(rotation / 90);
    const scale   = 0.8 + (1 - norm) * 0.5;
    const opacity = 0.3 + (1 - norm) * 0.7;
    const zIndex  = Math.round(100 * (1 - norm));

    // **Combined transform** for GPU-only work
    const transform = `
      rotateY(${rotation}deg)
      translateZ(${radius}px)
      scale(${scale})
    `.trim();

    gsap.set(card, {
      transform,
      opacity,
      zIndex
    });
  });
}

// ---- Core: Animate to a given card index ----
function animateToCard(targetIndex, duration = 0.6) {
  if (isAnimating) return;
  isAnimating = true;

  const start = currentProgress;
  let end     = (targetIndex / totalCards) % 1;
  let delta   = end - start;
  if (Math.abs(delta) > 0.5) delta += delta > 0 ? -1 : 1;

  gsap.to({ p: start }, {
    p:     start + delta,
    duration,
    // ← linear, perfectly even motion
    ease:  "none",
    onUpdate() {
      currentProgress = this.targets()[0].p;
      setCardTransforms(currentProgress);
    },
    onComplete() {
      currentProgress = (currentProgress % 1 + 1) % 1;
      centerActiveCard();
      isAnimating = false;
    }
  });
}

// ---- Init: wire up arrows & lightbox ----
function initCarousel() {
  setCardTransforms(0);
  centerActiveCard();
  initLightbox();

  document.getElementById("arrow-left").addEventListener("click", () => {
    const idx = Math.round(currentProgress * totalCards) % totalCards;
    animateToCard((idx - 1 + totalCards) % totalCards);
  });
  document.getElementById("arrow-right").addEventListener("click", () => {
    const idx = Math.round(currentProgress * totalCards) % totalCards;
    animateToCard((idx + 1) % totalCards);
  });
}

document.addEventListener("DOMContentLoaded", initCarousel);

// ---- Enhanced Lightbox Functionality (unchanged) ----
let currentImageIndex = 0;
let currentGallery    = [];

function initLightbox() {
  document.querySelectorAll('.interior-lightbox-thumbs img').forEach(img => {
    img.addEventListener('click', function() {
      const card   = this.closest('.carousel-card');
      const thumbs = card.querySelectorAll('.interior-lightbox-thumbs img');

      currentGallery    = Array.from(thumbs).map(img => img.dataset.full);
      currentImageIndex = Array.from(thumbs).indexOf(this);
      updateLightboxImage();

      document.getElementById('lightbox-overlay').style.display = 'flex';
      document.body.style.overflow = 'hidden';

      const lightboxImg = document.getElementById('lightbox-img');
      lightboxImg.style.transformOrigin = 'center center';
      const hammer = new Hammer(lightboxImg);
      hammer.get('pinch').set({ enable: true });
      hammer.get('pan').set({ enable: true });

      let currentScale = 1;
      hammer.on('pinch pinchmove', e => {
        currentScale = Math.max(1, e.scale);
        lightboxImg.style.transform = `scale(${currentScale})`;
      });
      hammer.on('doubletap', () => {
        currentScale = currentScale === 1 ? 2 : 1;
        lightboxImg.style.transform = `scale(${currentScale})`;
      });
    });
  });

  document.getElementById('lightbox-prev').addEventListener('click', prevImage);
  document.getElementById('lightbox-next').addEventListener('click', nextImage);
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', handleKeyDown);
}

function updateLightboxImage() {
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src   = currentGallery[currentImageIndex];
  document.querySelector('.image-counter').textContent =
    `${currentImageIndex + 1}/${currentGallery.length}`;
  preloadImage(currentImageIndex - 1);
  preloadImage(currentImageIndex + 1);
}

function preloadImage(idx) {
  if (idx >= 0 && idx < currentGallery.length) {
    const img = new Image();
    img.src   = currentGallery[idx];
  }
}
function prevImage() {
  currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
  updateLightboxImage();
}
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
  updateLightboxImage();
}
function closeLightbox() {
  document.getElementById('lightbox-overlay').style.display = 'none';
  document.body.style.overflow = 'auto';
}
function handleKeyDown(e) {
  const overlay = document.getElementById('lightbox-overlay');
  if (overlay.style.display !== 'flex') return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
}
