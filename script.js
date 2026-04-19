const revealItems = document.querySelectorAll('.reveal');
const tempSlider = document.getElementById('tempSlider');
const tempValue = document.getElementById('tempValue');
const oilBar = document.getElementById('oilBar');
const gasBar = document.getElementById('gasBar');
const charBar = document.getElementById('charBar');
const cursorGlow = document.getElementById('cursorGlow');
const noiseCanvas = document.getElementById('noiseCanvas');
const tiltCards = document.querySelectorAll('.tilt-card');
const pyroxaiLauncher = document.getElementById('pyroxaiLauncher');
const pyroxaiChat = document.getElementById('pyroxaiChat');
const pyroxaiClose = document.getElementById('pyroxaiClose');
const pyroxaiForm = document.getElementById('pyroxaiForm');
const pyroxaiInput = document.getElementById('pyroxaiInput');
const pyroxaiMessages = document.getElementById('pyroxaiMessages');
const urlParams = new URLSearchParams(window.location.search);
const forceLiteMode = urlParams.get('fx') !== 'full';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const enableHeavyFx = !forceLiteMode && !prefersReducedMotion && !hasCoarsePointer && window.innerWidth >= 900;

if (forceLiteMode) {
  document.documentElement.classList.add('perf-lite');
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: forceLiteMode ? 0.08 : 0.16,
  rootMargin: '0px 0px -40px 0px'
});

revealItems.forEach((item, index) => {
  item.style.transitionDelay = forceLiteMode ? '0ms' : `${Math.min(index * 55, 320)}ms`;
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

if (cursorGlow && enableHeavyFx) {
  let cursorX = 0;
  let cursorY = 0;
  let cursorRaf = null;

  const paintCursor = () => {
    cursorGlow.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    cursorRaf = null;
  };

  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    if (!cursorRaf) {
      cursorRaf = window.requestAnimationFrame(paintCursor);
    }
  }, { passive: true });
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

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

if (enableHeavyFx) {
  tiltCards.forEach(setupTilt);
}

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

  if (!enableHeavyFx || forceLiteMode) {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  const dots = Math.floor((width * height) / 14000);
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
let noiseResizeTimer = null;
if (!forceLiteMode) {
  window.addEventListener('resize', () => {
    clearTimeout(noiseResizeTimer);
    noiseResizeTimer = setTimeout(drawNoise, 150);
  });
}

function addChatMessage(role, text) {
  if (!pyroxaiMessages) return;
  const article = document.createElement('article');
  article.className = `pyroxai-msg ${role === 'user' ? 'pyroxai-msg-user' : 'pyroxai-msg-ai'}`;
  article.textContent = text;
  pyroxaiMessages.appendChild(article);
  pyroxaiMessages.scrollTop = pyroxaiMessages.scrollHeight;
}

async function askGroq(message) {
  const response = await fetch('/api/pyroxai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `PyroXai error ${response.status}`);
  }

  return data.reply?.trim() || 'No response received.';
}

if (pyroxaiLauncher && pyroxaiChat && pyroxaiClose && pyroxaiForm && pyroxaiInput) {
  pyroxaiLauncher.addEventListener('click', () => {
    pyroxaiChat.classList.toggle('is-open');
    if (pyroxaiChat.classList.contains('is-open')) {
      pyroxaiInput.focus();
    }
  });

  pyroxaiClose.addEventListener('click', () => {
    pyroxaiChat.classList.remove('is-open');
  });

  pyroxaiForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = pyroxaiInput.value.trim();
    if (!text) return;

    addChatMessage('user', text);
    pyroxaiInput.value = '';
    addChatMessage('ai', 'Thinking...');

    try {
      const answer = await askGroq(text);
      const thinking = pyroxaiMessages.lastElementChild;
      if (thinking) {
        thinking.textContent = answer;
      }
    } catch (error) {
      const thinking = pyroxaiMessages.lastElementChild;
      if (thinking) {
        thinking.textContent = `PyroXai error: ${error.message}`;
      }
    }
  });
}
