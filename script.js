// Carousel Functionality
let isAnimating = false;
const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".carousel-card");
const totalCards = cards.length;
const baseCards = 10;
const baseRadius = 800;
const maxRadius = 1400;

// Dynamic radius calculation for better card spacing
function getAdjustedRadius() {
  if (totalCards <= baseCards) return baseRadius;
  const visibleRange = Math.min(5, Math.floor (totalCards/3));
  const extraCards = totalCards - baseCards;
  const scaleFactor = 1 + (extraCards * 0.04);
  return Math.min(baseRadius * scaleFactor, maxRadius);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setCardTransforms(progress) {
  currentProgress = progress;
  const radius = getAdjustedRadius();
  const baseAngle = progress * 360;
  const activeRange = Math.min (7, totalCards);

  cards.forEach((card, i) => {
    const cardAngle = i * (360 / totalCards);
    let rotation = ((cardAngle - baseAngle + 180) % 360) - 180;

    // Normalize rotation to [-180, 180]
    rotation = ((rotation + 180) % 360 + 360) % 360 - 180;

    const clampedRotation = Math.max(-90, Math.min(90, rotation));
    const distanceFromCenter = Math.abs(clampedRotation / 90);

    if (distanceFromCenter < 0.7) { // Only animate visible cards
    const scale = 0.8 + (1 - distanceFromCenter) * 0.5;
    const opacity = 0.3 + (1 - distanceFromCenter) * 0.7;
    const zIndex = Math.round(100 * (1 - distanceFromCenter));
    const blur = Math.min(10, distanceFromCenter * 15);
    
    gsap.set(card, {
      rotationY: clampedRotation,
      scale: scale,
      zIndex: zIndex,
      opacity: opacity,
      filter: `blur(${blur}px)`,
      transformOrigin: `50% 50% -${radius}px`,
      duration: 0.7,
      ease: "power2.out"
    });
  } else {
    
    // Hide non-visible cards
      gsap.set(card, {
        opacity: 0,
        scale: 0.7,
        zIndex: 0
      });
    }
  });
}


function snapToCard(index) {
  if (isAnimating) return; // Prevent interruptions
  const currentIndex = Math.round(currentProgress * totalCards) % totalCards;
  let delta = index - currentIndex;
  
  // Choose the shortest rotation direction
  if (Math.abs(delta) > totalCards / 2) {
    delta = delta > 0 ? delta - totalCards : delta + totalCards;
  }
  
  const targetProgress = currentProgress + (delta / totalCards);
  
  gsap.to({progress: currentProgress}, {
    progress: targetProgress,
    duration: 0.2,
    ease: "power1.out",
    onUpdate: function() {
      // Normalize progress to avoid floating point errors
      this.targets()[0].progress = (this.targets()[0].progress + 1) % 1;
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
  
  // Continuous loop navigation
  document.getElementById("arrow-left").addEventListener("click", () => {
    // Move backward (previous card)
    const targetProgress = (currentProgress - (1 / totalCards) + 1) % 1;
    snapToCard(Math.round(targetProgress * totalCards));
  });
  
   document.getElementById("arrow-right").addEventListener("click", () => {
    // Move forward (next card)
    const targetProgress = (currentProgress + (1 / totalCards)) % 1;
    snapToCard(Math.round(targetProgress * totalCards));
  });
});
