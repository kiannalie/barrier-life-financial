// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// FAQ accordion (used on inner pages)
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

// ── Quote Form ──────────────────────────────────────────────

// Option buttons: radio-like selection within each grid
document.querySelectorAll('.options-grid').forEach(grid => {
  grid.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});

// Multi-step form navigation
let currentStep = 1;
const totalSteps = 3;

function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(el => {
    el.style.display = 'none';
  });
  // Show target step
  const target = document.getElementById('form-step-' + step);
  if (target) {
    target.style.display = 'block';
    target.style.animation = 'lpFadeUp 0.35s ease both';
  }

  // Update step indicator dots
  for (let i = 1; i <= totalSteps; i++) {
    const dot = document.getElementById('step-dot-' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < step)      dot.classList.add('done');
    else if (i === step) dot.classList.add('active');
  }
  // Update step lines
  for (let i = 1; i < totalSteps; i++) {
    const line = document.getElementById('step-line-' + i);
    if (line) line.classList.toggle('done', i < step);
  }

  currentStep = step;
  // Scroll form into view smoothly
  const formSection = document.getElementById('quote-form');
  if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.step-next').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentStep < totalSteps) goToStep(currentStep + 1);
  });
});

// Form submission → success screen
const quoteForm = document.getElementById('quoteForm');
const successScreen = document.getElementById('successScreen');
if (quoteForm && successScreen) {
  quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    quoteForm.style.display = 'none';
    document.querySelector('.step-indicator').style.display = 'none';
    successScreen.classList.add('visible');
  });
}
