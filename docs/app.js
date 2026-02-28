const form = document.getElementById('enrollForm');
const msg = document.getElementById('formMsg');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

const PHONE_REGEX = /^(?:6[0-4]|7[0-2]|8[3-9])[0-9]{2}-[0-9]{4}$/;

phoneInput?.addEventListener('input', (e) => {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;

  // Validación inmediata en español
  if (!e.target.value) {
    e.target.setCustomValidity('Ingrese su número de teléfono.');
  } else if (!PHONE_REGEX.test(e.target.value)) {
    e.target.setCustomValidity(
      'Use formato 8888-8888. Prefijos móviles válidos: 60-64, 70-72, 83-89.'
    );
  } else {
    e.target.setCustomValidity('');
  }
});

emailInput?.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!value) {
    e.target.setCustomValidity('Ingrese su correo electrónico.');
  } else if (!ok) {
    e.target.setCustomValidity('Ingrese un correo válido. Ejemplo: nombre@correo.com');
  } else {
    e.target.setCustomValidity('');
  }
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Enviando...';

  const phoneOk = PHONE_REGEX.test(phoneInput?.value || '');
  if (!phoneOk) {
    phoneInput?.setCustomValidity(
      'Use formato 8888-8888. Prefijos móviles válidos: 60-64, 70-72, 83-89.'
    );
    phoneInput?.reportValidity();
    msg.textContent = '⚠️ Revise el teléfono: formato o prefijo inválido para móvil en Costa Rica.';
    phoneInput?.focus();
    return;
  }

  const emailValue = (emailInput?.value || '').trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  if (!emailOk) {
    emailInput?.setCustomValidity('Ingrese un correo válido. Ejemplo: nombre@correo.com');
    emailInput?.reportValidity();
    msg.textContent = '⚠️ Revise el correo electrónico.';
    emailInput?.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const apiUrl = window.ENROLL_API_URL || 'http://127.0.0.1:8790/api/inscripciones';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const out = await res.json();
    if (!res.ok) throw new Error(out.error || 'No se pudo guardar');
    msg.textContent = '✅ Inscripción guardada. Le contactaremos por WhatsApp para completar la inscripción.';
    form.reset();
  } catch (err) {
    msg.textContent = `⚠️ ${err.message}`;
  }
});
