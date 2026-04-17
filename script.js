const revealItems = document.querySelectorAll('.reveal');
const tempSlider = document.getElementById('tempSlider');
const tempValue = document.getElementById('tempValue');
const oilBar = document.getElementById('oilBar');
const gasBar = document.getElementById('gasBar');
const charBar = document.getElementById('charBar');
const cursorGlow = document.getElementById('cursorGlow');
const noiseCanvas = document.getElementById('noiseCanvas');
const tiltCards = document.querySelectorAll('.tilt-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: '0px 0px -40px 0px'
});

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 55, 320)}ms`;
  observer.observe(item);
});

function updateYields(value) {
  const normalized = (value - 320) / 500;
  const oil = Math.round(65 - normalized * 25);
  const gas = Math.round(14 + normalized * 26);
  const char = Math.max(10, 100 - oil - gas);

  tempValue.textContent = value;
  oilBar.style.width = `${oil}%`;
  gasBar.style.width = `${gas}%`;
  charBar.style.width = `${char}%`;
}

if (tempSlider) {
  updateYields(Number(tempSlider.value));
  tempSlider.addEventListener('input', (event) => {
    updateYields(Number(event.target.value));
  });
}

window.addEventListener('pointermove', (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});

function setupTilt(card) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
}

tiltCards.forEach(setupTilt);

function drawNoise() {
  if (!noiseCanvas) return;

  const ctx = noiseCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  noiseCanvas.width = width * dpr;
  noiseCanvas.height = height * dpr;
  noiseCanvas.style.width = `${width}px`;
  noiseCanvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const dots = Math.floor((width * height) / 9000);
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < dots; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.5;
    const alpha = Math.random() * 0.14;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, size, size);
  }
}

drawNoise();
window.addEventListener('resize', drawNoise);
