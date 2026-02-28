const form = document.getElementById('enrollForm');
const msg = document.getElementById('formMsg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Enviando...';
  const data = Object.fromEntries(new FormData(form).entries());

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
  } catch (err) {
    msg.textContent = `⚠️ ${err.message}`;
  }
});

