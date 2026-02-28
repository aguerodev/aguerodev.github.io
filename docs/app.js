const form = document.getElementById('enrollForm');
const msg = document.getElementById('formMsg');
const phoneInput = document.getElementById('phone');

let iti = null;
if (phoneInput && window.intlTelInput) {
  iti = window.intlTelInput(phoneInput, {
    initialCountry: 'cr',
    preferredCountries: ['cr', 'pa', 'ni', 'hn', 'sv', 'gt', 'mx', 'us'],
    nationalMode: false,
    autoPlaceholder: 'aggressive',
    formatAsYouType: true,
    utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24.6.0/build/js/utils.js'
  });
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Enviando...';
  const data = Object.fromEntries(new FormData(form).entries());

  if (iti) {
    data.phone = iti.getNumber();
  }

  try {
    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });

    const out = await res.json();
    if (!res.ok) throw new Error(out.error || 'No se pudo guardar');
    msg.textContent = '✅ Inscripción guardada. Le contactaremos por WhatsApp para completar la inscripción.';
    form.reset();
    if (iti) iti.setCountry('cr');
  } catch (err) {
    msg.textContent = `⚠️ ${err.message}`;
  }
});
