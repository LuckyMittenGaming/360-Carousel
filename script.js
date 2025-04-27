// Carousel Functionality
let isAnimating = false;
let currentProgress = 0;
const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".carousel-card");
const totalCards = cards.length;
const baseCards = 10;
const baseRadius = 800;
const maxRadius = 1400;

// Dynamic radius calculation for better card spacing
function getAdjustedRadius() {
  if (totalCards <= baseCards) return baseRadius;
  const extraCards = totalCards - baseCards;
  const scaleFactor = 1 + (extraCards * 0.04);
  return Math.min(baseRadius * scaleFactor, maxRadius);
}

function setCardTransforms(progress) {
  const radius = getAdjustedRadius();
  const baseAngle = progress * 360;

  cards.forEach((card, i) => {
    const cardAngle = i * (360 / totalCards);
    let rotation = ((cardAngle - baseAngle + 180) % 360) - 180;
    
    // Normalize rotation to [-180, 180]
    rotation = ((rotation + 180) % 360 + 360) % 360 - 180;

    const distanceFromCenter = Math.abs(rotation / 90);
    const scale = 0.8 + (1 - distanceFromCenter) * 0.5;
    const opacity = 0.3 + (1 - distanceFromCenter) * 0.7;
    const zIndex = Math.round(100 * (1 - distanceFromCenter));
    const blur = Math.min(10, distanceFromCenter * 15);
    
    gsap.set(card, {
      rotationY: rotation,
      scale: scale,
      zIndex: zIndex,
      opacity: opacity,
      filter: `blur(${blur}px)`,
      transformOrigin: `50% 50% -${radius}px`
    });
  });
}

function animateToCard(targetIndex, duration = 0.5) {
  if (isAnimating) return;
  isAnimating = true;
  
  const startProgress = currentProgress;
  const endProgress = (targetIndex / totalCards) % 1;
  
  // Calculate shortest path
  let delta = endProgress - startProgress;
  if (Math.abs(delta) > 0.5) {
    delta = delta > 0 ? delta - 1 : delta + 1;
  }
  
  gsap.to({progress: startProgress}, {
    progress: startProgress + delta,
    duration: duration,
    ease: "power2.out",
    onUpdate: function() {
      currentProgress = this.targets()[0].progress;
      setCardTransforms(currentProgress);
    },
    onComplete: () => {
      // Normalize progress after animation
      currentProgress = (currentProgress + 1) % 1;
      isAnimating = false;
    }
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  setCardTransforms(0);
  initLightbox();
  
  // Arrow navigation
  document.getElementById("arrow-left").addEventListener("click", () => {
    const currentIndex = Math.round(currentProgress * totalCards) % totalCards;
    const targetIndex = (currentIndex - 1 + totalCards) % totalCards;
    animateToCard(targetIndex);
  });
  
  document.getElementById("arrow-right").addEventListener("click", () => {
    const currentIndex = Math.round(currentProgress * totalCards) % totalCards;
    const targetIndex = (currentIndex + 1) % totalCards;
    animateToCard(targetIndex);
  });
});

// Keep the rest of your lightbox code the same...

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

document.addEventListener('DOMContentLoaded', () => {
  setCardTransforms(0);
  initLightbox();

  const leftArrow = document.querySelector(".arrow-left");
  const rightArrow = document.querySelector(".arrow-right");

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener("click", () => {
      const targetProgress = (currentProgress - (1 / totalCards) + 1) % 1;
      snapToCard(Math.round(targetProgress * totalCards));
    });

    rightArrow.addEventListener("click", () => {
      const targetProgress = (currentProgress + (1 / totalCards)) % 1;
      snapToCard(Math.round(targetProgress * totalCards));
    });
  }
});
