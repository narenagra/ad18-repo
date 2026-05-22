/* =============================================
   AD18PICTURES — Master Script v2
   ============================================= */

/* ---- Page Loader ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 400);
});

/* ---- Theme Toggle ---- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
let isDark = localStorage.getItem('ad18-theme') !== 'light';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('ad18-theme', isDark ? 'dark' : 'light');
}
applyTheme();

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  applyTheme();
});

/* ---- Custom Cursor ---- */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursor.style.background = 'rgba(168, 85, 247, 0.4)';
    follower.style.width = '56px';
    follower.style.height = '56px';
    follower.style.borderColor = 'rgba(168, 85, 247, 0.3)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursor.style.background = 'var(--accent-3, #38bdf8)';
    follower.style.width = '40px';
    follower.style.height = '40px';
    follower.style.borderColor = 'rgba(255,255,255,0.15)';
  });
});

/* ---- Back to Top ---- */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 600);
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---- Navbar Scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  document.querySelectorAll('.nav-links a').forEach(a => {
    const section = document.querySelector(a.getAttribute('href'));
    if (section) {
      const rect = section.getBoundingClientRect();
      a.classList.toggle('active', rect.top <= 150 && rect.bottom >= 150);
    }
  });
});

/* ---- Mobile Menu ---- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ---- 3D Hero Canvas ---- */
const canvas = document.createElement('canvas');
const heroCanvas = document.getElementById('heroCanvas');
heroCanvas.appendChild(canvas);
const ctx = canvas.getContext('2d');

let particles = [];
let mouse3D = { x: 0, y: 0 };

function resizeCanvas() {
  canvas.width = heroCanvas.offsetWidth;
  canvas.height = heroCanvas.offsetHeight;
}
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random() * 300;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.speedZ = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.z += this.speedZ;

    const dx = mouse3D.x - this.x;
    const dy = mouse3D.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      this.x -= dx * 0.005;
      this.y -= dy * 0.005;
    }

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    if (this.z < 0 || this.z > 300) this.speedZ *= -1;
  }
  draw() {
    const scale = 1 + this.z / 600;
    const x = this.x;
    const y = this.y;
    const size = this.size * scale;
    const alpha = this.opacity * (0.4 + this.z / 500);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(108, 92, 231, ${alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

document.addEventListener('mousemove', e => {
  const rect = heroCanvas.getBoundingClientRect();
  mouse3D.x = e.clientX - rect.left;
  mouse3D.y = e.clientY - rect.top;
});

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 120)})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener('resize', resizeCanvas);

/* ---- 3D Card Tilt ---- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
});

/* ---- Scroll Reveal ---- */
const aosElements = document.querySelectorAll('[data-aos]');
const aosObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      aosObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
aosElements.forEach(el => aosObserver.observe(el));

/* ---- Counter Animation ---- */
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      const duration = 2000;
      const start = performance.now();

      function updateCounter(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(updateCounter);
        else el.textContent = target + '+';
      }
      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(el => counterObserver.observe(el));

/* ---- Portfolio Filter ---- */
const filterBtns = document.querySelectorAll('.filter-btn');
const workItems = document.querySelectorAll('.work-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    workItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'block';
        setTimeout(() => item.style.opacity = '1', 10);
      } else {
        item.style.opacity = '0';
        setTimeout(() => item.style.display = 'none', 400);
      }
    });
  });
});

/* ---- Testimonials Slider ---- */
const track = document.getElementById('testimonialsTrack');
const testBtns = document.querySelectorAll('.test-btn');
let currentSlide = 0;

function goToSlide(index) {
  if (!track) return;
  currentSlide = index;
  const cardWidth = track.children[0]?.offsetWidth || 0;
  const gap = 24;
  track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
  testBtns.forEach(b => b.classList.remove('active'));
  testBtns[index]?.classList.add('active');
}

testBtns.forEach(btn => {
  btn.addEventListener('click', () => goToSlide(parseInt(btn.dataset.slide)));
});

let testInterval = setInterval(() => {
  const next = (currentSlide + 1) % testBtns.length;
  goToSlide(next);
}, 5000);

if (track) {
  track.addEventListener('mouseenter', () => clearInterval(testInterval));
  track.addEventListener('mouseleave', () => {
    testInterval = setInterval(() => {
      const next = (currentSlide + 1) % testBtns.length;
      goToSlide(next);
    }, 5000);
  });
}

/* ---- Touch Swipe for Testimonials ---- */
let touchStartX = 0;
let touchEndX = 0;

if (track) {
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < testBtns.length - 1) {
        goToSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
    }
  }, { passive: true });
}

/* ---- Smooth Anchor Scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    }
  });
});

/* ---- Real-time Form Validation ---- */
const form = document.getElementById('contactForm');
if (form) {
  const fields = form.querySelectorAll('input, textarea, select');

  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-group')?.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return true;
    const error = group.querySelector('.error-msg');
    let valid = true;
    let msg = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
      valid = false;
      msg = field.id === 'budget' ? 'Please select an option' : 'This field is required';
    }

    if (valid && field.type === 'email' && field.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(field.value.trim())) {
        valid = false;
        msg = 'Enter a valid email address';
      }
    }

    group.classList.toggle('error', !valid);
    if (error) error.textContent = msg;
    return valid;
  }

  /* ---- Form Submit ---- */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });
    if (!allValid) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    const data = new FormData(form);

    try {
      const res = await fetch(form.action, { method: 'POST', body: data });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Server returned ${res.status}`);
      }

      const json = await res.json();

      if (json.ok) {
        btn.innerHTML = '<span>Message Sent! 🎉</span><i class="fas fa-check"></i>';
        form.reset();
        fields.forEach(f => f.closest('.form-group')?.classList.remove('error'));
      } else {
        btn.innerHTML = `<span>${json.error || 'Failed'}</span><i class="fas fa-exclamation-triangle"></i>`;
      }
    } catch (err) {
      console.warn('Form submit error:', err);
      if (location.protocol === 'file:') {
        btn.innerHTML = '<span>Open via local server to test</span><i class="fas fa-info-circle"></i>';
      } else {
        btn.innerHTML = '<span>Server unreachable — check PHP</span><i class="fas fa-exclamation-triangle"></i>';
      }
    }

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 3000);
  });
}

/* ---- ResizeObserver for Testimonials ---- */
if (track && window.ResizeObserver) {
  const ro = new ResizeObserver(() => goToSlide(currentSlide));
  ro.observe(track);
}

/* ---- Parallax depth on scroll ---- */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;

  document.querySelectorAll('[data-speed]').forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 0.1;
    const y = scrolled * speed;
    el.style.transform = `translateY(${y}px)`;
  });
});
