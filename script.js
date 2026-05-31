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

// Option buttons: radio-like selection within each grid
document.querySelectorAll('.options-grid').forEach(grid => {
  grid.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      grid.removeAttribute('data-error');
    });
  });
});

// Multi-step form navigation
let currentStep = 1;
const totalSteps = 3;

function validateStep(step) {
  const stepEl = document.getElementById('form-step-' + step);
  let valid = true;
  let firstInvalid = null;

  stepEl.querySelectorAll('[data-required="true"]').forEach(grid => {
    if (!grid.querySelector('.opt-btn.selected')) {
      grid.setAttribute('data-error', 'true');
      if (!firstInvalid) firstInvalid = grid;
      valid = false;
    }
  });

  stepEl.querySelectorAll('input[required]').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('input-error');
      input.addEventListener('input', () => input.classList.remove('input-error'), { once: true });
      if (!firstInvalid) firstInvalid = input;
      valid = false;
    }
  });

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function goToStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.style.display = 'none');
  const target = document.getElementById('form-step-' + step);
  if (target) {
    target.style.display = 'block';
    target.style.animation = 'lpFadeUp 0.35s ease both';
  }

  for (let i = 1; i <= totalSteps; i++) {
    const dot = document.getElementById('step-dot-' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < step)       dot.classList.add('done');
    else if (i === step) dot.classList.add('active');
  }
  for (let i = 1; i < totalSteps; i++) {
    const line = document.getElementById('step-line-' + i);
    if (line) line.classList.toggle('done', i < step);
  }

  currentStep = step;
  const formSection = document.getElementById('quote-form');
  if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.step-next').forEach(btn => {
  btn.addEventListener('click', () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  });
});

// Form submission → Ringy
const quoteForm = document.getElementById('quoteForm');
const successScreen = document.getElementById('successScreen');

if (quoteForm && successScreen) {
  quoteForm.addEventListener('submit', async e => {
    e.preventDefault();

    const getSelected = field => {
      const grid = document.querySelector(`[data-field="${field}"]`);
      return grid ? (grid.querySelector('.opt-btn.selected')?.textContent.trim() ?? '') : '';
    };

    const payload = {
      coverageType: getSelected('coverageType'),
      reason:       getSelected('reason'),
      age:          getSelected('age'),
      health:       getSelected('health'),
      budget:       getSelected('budget'),
      beneficiary:  document.getElementById('beneficiary')?.value ?? '',
      timeline:     getSelected('timeline'),
      firstName:    document.getElementById('firstName')?.value ?? '',
      lastName:     document.getElementById('lastName')?.value ?? '',
      phone:        document.getElementById('phoneNumber')?.value ?? '',
      zip:          document.getElementById('zipCode')?.value ?? '',
      email:        document.getElementById('emailAddress')?.value ?? '',
    };

    const submitBtn = quoteForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch('/.netlify/functions/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        quoteForm.style.display = 'none';
        document.querySelector('.step-indicator').style.display = 'none';
        successScreen.classList.add('visible');
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Something went wrong — try again';
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Something went wrong — try again';
    }
  });
}
