
function initAnimations() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // For generic elements we use the "in-view" class
        if (!entry.target.classList.contains('reveal')) {
          entry.target.classList.add('in-view');
        } else {
          // For reveal elements used on the About page we add the "active" class
          entry.target.classList.add('active');
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: CONFIG.scrollOffset });

  // Observe various components as well as all .reveal elements
  $$('.service-card, .timeline-item, .contact-card, .vision-card, .mission-card, .reveal').forEach(el => {
    // Give reveal elements a slightly longer transition so they appear "slower"
    if (el.classList.contains('reveal')) {
      el.style.transition = 'opacity 1.6s cubic-bezier(.2,.8,.2,1), transform 1.6s cubic-bezier(.2,.8,.2,1)';
    } else {
      el.classList.add('fade-up');
    }
    io.observe(el);
  });
}

/* ---------- 3D TILT CARDS ---------- */
$$('[data-tilt]').forEach(card => {
  if (prefersReducedMotion) return;
  let rect = card.getBoundingClientRect();
  let ticking = false;

  function updateTilt(e) {
    const { left, top, width, height } = rect;
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    const rotateX = -y * CONFIG.tiltMax;
    const rotateY = x * CONFIG.tiltMax;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    ticking = false;
  }

  card.addEventListener('mousemove', e => {
    rect = card.getBoundingClientRect();
    if (!ticking) {
      requestAnimationFrame(() => updateTilt(e));
      ticking = true;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ---------- RIPPLE BUTTONS ---------- */
$$('.cta-button, .search-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const ripple = btn.querySelector('.ripple') || document.createElement('span');
    ripple.className = 'ripple';
    btn.appendChild(ripple);
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    setTimeout(() => ripple.remove(), 600);
  });
});


/* ---------- SMOOTH SCROLL & SPA ---------- */
$$('a[href^="#"], .nav-link, .sub-nav-link, .cta-button').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        if (targetEl.classList.contains('page')) {
          switchPage(targetId);
        } else {
          if (document.getElementById('home') && !document.getElementById('home').classList.contains('active')) {
            switchPage('home');
          }
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          if (link.classList.contains('nav-link')) link.classList.add('active');
        }
      } else {
        console.warn('No page or section found for #' + targetId);
      }
    }
  });
});

let currentPage = 'home';  // Add this line before the function

function switchPage(id) {
  if (id === currentPage) return;

  const target = document.getElementById(id);
  if (!target) {
    console.warn('switchPage: target not found →', id);
    return;
  }

  // If target is a full SPA page, activate it
  if (target.classList.contains('page')) {
    const current = document.getElementById(currentPage);
    if (current) current.classList.remove('active');

    target.classList.add('active');
    // Trigger reveals
    target.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));

    currentPage = id;
    window.scrollTo({ top: 0 });

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
    if (activeLink) activeLink.classList.add('active');

    return;
  }

  // Otherwise it's a section within a page (e.g., services inside #home)
  const current = document.getElementById(currentPage);
  if (current) current.classList.remove('active');

  const home = document.getElementById('home');
  if (home) home.classList.add('active');
  currentPage = 'home';

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
  if (activeLink) activeLink.classList.add('active');
}
window.switchPage = switchPage;



// search placeholder animation

// SEARCH PLACEHOLDER TYPING EFFECT
const searchInput = document.getElementById("searchInput");

const placeholders = [
  "Search Tatito nexus...",
  "Search Tatito franchises...",
  "Search Tatito services...",
  "Search AI tools...",
  "Search careers..."
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typePlaceholder() {
  if (!searchInput) return;

  const currentText = placeholders[textIndex];
  
  if (!isDeleting) {
    // typing
    searchInput.placeholder = currentText.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentText.length) {
      setTimeout(() => (isDeleting = true), 1200);
    }
  } else {
    // deleting
    searchInput.placeholder = currentText.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % placeholders.length;
    }
  }

  setTimeout(typePlaceholder, isDeleting ? 50 : 90);
}

// Start animation
typePlaceholder();



function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


/* ---------- FONT SIZE CONTROLS (increase / decrease) ---------- */
(function () {
  const INCREASE_BTN = document.querySelector('.font-increase');
  const DECREASE_BTN = document.querySelector('.font-decrease');
  const STORAGE_KEY = 'tatito-font-size';
  const MIN_SIZE = 12; // px
  const MAX_SIZE = 22; // px
  const STEP = 1; // px

  function getSavedSize() {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return parseFloat(s);
    const computed = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return computed;
  }

  function applySize(size) {
    const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
    document.documentElement.style.fontSize = clamped + 'px';
    localStorage.setItem(STORAGE_KEY, String(clamped));
  }

  function change(delta) {
    const current = getSavedSize();
    const next = Math.round((current + delta) * 10) / 10;
    applySize(next);
    showNotification(`Font size ${delta > 0 ? 'increased' : 'decreased'} to ${parseFloat(next).toFixed(0)}px`, 'success');
  }

  if (INCREASE_BTN) INCREASE_BTN.addEventListener('click', () => change(STEP));
  if (DECREASE_BTN) DECREASE_BTN.addEventListener('click', () => change(-STEP));

  // Optional keyboard shortcuts: Ctrl/Cmd + =  and Ctrl/Cmd + -
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
      e.preventDefault(); change(STEP);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault(); change(-STEP);
    }
  });

  // Apply saved size on load
  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) document.documentElement.style.fontSize = saved + 'px';
  });

})();


