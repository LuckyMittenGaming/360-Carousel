
const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".carousel-card");
const totalCards = cards.length;
const radius = 600;
let currentProgress = 0;
let spinActive = false;
let autoSpin;
let dragStartProgress = 0;
let lastX = 0;
const dragDistancePerRotation = 800;
const dragThreshold = 10;
const proxy = document.createElement("div");
document.body.appendChild(proxy);

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
    const distanceFromCenter = Math.abs(clampedRotation / 90); // 0 = center, 1 = edge

    // ✨ Visual Enhancements
    const scale = 1 + (1 - distanceFromCenter) * 0.3; // Smooth scale in
    const opacity = 1.1 - distanceFromCenter;           // Smooth fade in/out
    const zIndex = distanceFromCenter < 0.2 ? 8 : 1;

    const blur = Math.min(20, distanceFromCenter * -4); // Optional blur
    card.style.filter = `blur(${blur}px)`;              // Set blur

    gsap.set(card, {
      rotationY: clampedRotation,
      scale: scale,
      zIndex: zIndex,
      opacity: opacity,
      transformOrigin: `50% 50% -${radius}px`
    });
  });
}

function startAutoSpin() {
  if (spinActive) return;
  spinActive = true;
  autoSpin = gsap.to({}, {
    duration: 100,
    repeat: -1,
    onUpdate: () => {
      currentProgress += 0.0005;
      setCardTransforms(currentProgress);
    }
  });
}

function stopAutoSpin() {
  if (autoSpin) autoSpin.kill();
  spinActive = false;
}

function snapToCard(index) {
  const targetProgress = index / totalCards;
  gsap.to({}, {
    duration: 0.6,
    onUpdate: function () {
      const progress = gsap.getProperty(this, "progress") * (targetProgress - currentProgress) + currentProgress;
      setCardTransforms(progress);
    },
    onComplete: () => {
      currentProgress = targetProgress;
    }
  });
}

setCardTransforms(0);
//startAutoSpin();//

Draggable.create(proxy, {
  trigger: ".carousel-container",
  type: "x",
  onPress() {
    stopAutoSpin();
    lastX = this.x;
    dragStartProgress = currentProgress;
  },
  onDrag() {
    const dragOffset = this.startX - this.x;
    const progressDelta = dragOffset / dragDistancePerRotation;
    const newProgress = dragStartProgress + progressDelta;
    setCardTransforms(newProgress);
  },
  onRelease() {
    const moved = Math.abs(this.x - lastX);
    if (moved > dragThreshold) {
      let closestIndex = 0;
      let smallestDiff = Infinity;
      cards.forEach((card, i) => {
        const angle = gsap.getProperty(card, "rotationY");
        const diff = Math.abs(angle);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestIndex = i;
        }
      });
      snapToCard(closestIndex);
    }
    //startAutoSpin();
  }
});

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    stopAutoSpin();
    snapToCard(index);
  });
});

document.getElementById("arrow-left").addEventListener("click", () => {
  stopAutoSpin();
  const index = Math.round(currentProgress * totalCards) + 1;
  snapToCard((index + totalCards) % totalCards);
  //setTimeout(startAutoSpin, 10000);
});
document.getElementById("arrow-right").addEventListener("click", () => {
  stopAutoSpin();
  const index = Math.round(currentProgress * totalCards) - 1;
  snapToCard((index + totalCards) % totalCards);
  //setTimeout(startAutoSpin, 10000);
});
