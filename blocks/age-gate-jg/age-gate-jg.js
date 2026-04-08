import { readBlockConfig } from '../../scripts/aem.js';

const SESSION_KEY = 'age-gate-jg-verified';

function getAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function parseDate(value) {
  const parts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!parts) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const year = parseInt(parts[3], 10);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1) return null;
  return d;
}

export default function decorate(block) {
  const cfg = readBlockConfig(block);

  const minAge = Math.max(1, parseInt(cfg['minimum-age'], 10) || 21);
  const heading = cfg.heading || 'Age Verification Required';
  const subheading = cfg.subheading || `You must be ${minAge} years of age or older to enter this site.`;
  const label = cfg['input-label'] || 'Enter your date of birth';
  const btnText = cfg['button-text'] || 'Submit';
  const failMsg = cfg['underage-message'] || `Sorry, you must be ${minAge} or older to access this site.`;
  const legal = cfg['legal-text'] || 'By entering this site you agree to our Terms of Use and Privacy Policy.';

  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    block.closest('.section')?.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'age-gate-jg-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Age Verification');

  overlay.innerHTML = `
    <div class="age-gate-jg-card">
      <h1 class="age-gate-jg-heading">${heading}</h1>
      <p class="age-gate-jg-subheading">${subheading}</p>
      <form class="age-gate-jg-form" novalidate>
        <label class="age-gate-jg-label" for="agjg-dob">${label}</label>
        <input
          class="age-gate-jg-input"
          id="agjg-dob"
          type="text"
          inputmode="numeric"
          placeholder="MM/DD/YYYY"
          maxlength="10"
          autocomplete="bday"
          aria-required="true"
          aria-describedby="agjg-error"
        />
        <p class="age-gate-jg-error" id="agjg-error" role="alert" aria-live="polite"></p>
        <button class="age-gate-jg-btn" type="submit">${btnText}</button>
      </form>
      <p class="age-gate-jg-legal">${legal}</p>
    </div>
  `;

  document.body.append(overlay);
  document.body.classList.add('age-gate-jg-open');

  const input = overlay.querySelector('.age-gate-jg-input');
  const error = overlay.querySelector('.age-gate-jg-error');
  const form = overlay.querySelector('.age-gate-jg-form');

  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    let out = digits;
    if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    input.value = out;
    error.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dob = parseDate(input.value.trim());
    if (!dob) {
      error.textContent = 'Please enter a valid date in MM/DD/YYYY format.';
      input.focus();
      return;
    }
    if (getAge(dob) >= minAge) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      overlay.classList.add('age-gate-jg-exit');
      document.body.classList.remove('age-gate-jg-open');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      block.closest('.section')?.remove();
    } else {
      error.textContent = failMsg;
      input.value = '';
      input.focus();
    }
  });

  block.closest('.section').style.display = 'none';
  requestAnimationFrame(() => input.focus());
}
