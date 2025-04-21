// Carousel Functionality
const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".carousel-card");
const totalCards = cards.length;
const radius = 600;
let currentProgress = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setCardTransforms(progress) {
  currentProgress = progress;
  const baseAngle = progress * 360;

  cards.forEach((card, i) => {
    const cardAngle = i * (360 / totalCards);
    let rotation = cardAngle - baseAngle;

    while (rotation > 180) rotation -= 360;
    while (rotation < -180) rotation += 360;

    const clampedRotation = clamp(rotation, -90, 90);
    const distanceFromCenter = Math.abs(clampedRotation / 90);

    const scale = 1 + (1 - distanceFromCenter) * 0.3;
    const opacity = 1.1 - distanceFromCenter;
    const zIndex = distanceFromCenter < 0.2 ? 8 : 1;
    const blur = Math.min(20, distanceFromCenter * -4);
    
    card.style.filter = `blur(${blur}px)`;

    gsap.set(card, {
      rotationY: clampedRotation,
      scale: scale,
      zIndex: zIndex,
      opacity: opacity,
      transformOrigin: `50% 50% -${radius}px`
    });
  });
}

function snapToCard(index) {
  const targetProgress = index / totalCards;
  gsap.to({progress: currentProgress}, {
    progress: targetProgress,
    duration: 0.8,
    ease: "power3.out",
    onUpdate: function() {
      setCardTransforms(this.targets()[0].progress);
    }
  });
}

// Enhanced Lightbox Functionality
let currentImageIndex = 0;
let currentGallery = [];

function initLightbox() {
  document.querySelectorAll('.interior-lightbox-thumbs img').forEach((img) => {
    img.addEventListener('click', function() {
      const card = this.closest('.carousel-card');
      const thumbs = card.querySelectorAll('.interior-lightbox-thumbs img');
      
      // Build gallery array and get current index
      currentGallery = Array.from(thumbs).map(img => img.dataset.full);
      currentImageIndex = Array.from(thumbs).indexOf(this);
      
      // Update lightbox content BEFORE showing it
      updateLightboxImage();
      
      // Now show the lightbox
      document.getElementById('lightbox-overlay').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('lightbox-prev').addEventListener('click', prevImage);
  document.getElementById('lightbox-next').addEventListener('click', nextImage);
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  
  document.addEventListener('keydown', handleKeyDown);
}

function updateLightboxImage() {
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = currentGallery[currentImageIndex];
  document.querySelector('.image-counter').textContent = 
    `${currentImageIndex + 1}/${currentGallery.length}`;
  
  // Preload adjacent images
  preloadImage(currentImageIndex - 1);
  preloadImage(currentImageIndex + 1);
}

function preloadImage(index) {
  if (index >= 0 && index < currentGallery.length) {
    const img = new Image();
    img.src = currentGallery[index];
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
  const lightbox = document.getElementById('lightbox-overlay');
  if (lightbox.style.display !== 'flex') return;
  
  switch(e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      prevImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  setCardTransforms(0);
  initLightbox();
  
  // Arrow navigation
  document.getElementById("arrow-left").addEventListener("click", () => {
    const index = Math.round(currentProgress * totalCards) + 1;
    snapToCard((index + totalCards) % totalCards);
  });
  
  document.getElementById("arrow-right").addEventListener("click", () => {
    const index = Math.round(currentProgress * totalCards) - 1;
    snapToCard((index + totalCards) % totalCards);
  });
});