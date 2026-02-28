const form = document.getElementById('enrollForm');
const msg = document.getElementById('formMsg');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

const PHONE_REGEX = /^(?:6[0-4]|7[0-2]|8[3-9])[0-9]{2}-[0-9]{4}$/;

const cfg = window.ENROLL_CONFIG || {};

function normalizePhoneCR(v) {
  return `506${(v || '').replace(/\D/g, '')}`;
}

async function getUsdCrcRate() {
  const r = await fetch('https://open.er-api.com/v6/latest/USD');
  const j = await r.json();
  if (!j?.rates?.CRC) throw new Error('No se pudo obtener tipo de cambio USD/CRC.');
  return Number(j.rates.CRC);
}

async function sendWhatsApp(number, text) {
  const url = `${cfg.evolutionBaseUrl}/message/sendText/${cfg.evolutionInstance}`;
  const payload = {
    number,
    text,
    delay: 500,
    linkPreview: false
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.evolutionApiKey
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${t.slice(0, 120)}`);
  }
}

phoneInput?.addEventListener('input', (e) => {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;

  if (!e.target.value) {
    e.target.setCustomValidity('Ingrese su número de teléfono.');
  } else if (!PHONE_REGEX.test(e.target.value)) {
    e.target.setCustomValidity('Use formato 8888-8888. Prefijos móviles válidos: 60-64, 70-72, 83-89.');
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

  if (!cfg.evolutionBaseUrl || !cfg.evolutionInstance || !cfg.evolutionApiKey) {
    msg.textContent = '⚠️ Falta configuración de mensajería.';
    return;
  }

  const phoneOk = PHONE_REGEX.test(phoneInput?.value || '');
  if (!phoneOk) {
    phoneInput?.setCustomValidity('Use formato 8888-8888. Prefijos móviles válidos: 60-64, 70-72, 83-89.');
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

  const phone = normalizePhoneCR(phoneInput.value);

  try {
    const rate = await getUsdCrcRate();
    const crc = (Number(cfg.priceUsd || 99) * rate).toFixed(2);

    const ownerText = [
      `📥 Nueva inscripción en ${cfg.courseName}`,
      `Correo: ${emailValue}`,
      `Teléfono: +${phone}`,
      `Monto referencia: USD ${cfg.priceUsd || 99} ≈ ₡${Number(crc).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `TC USD/CRC actual: ${rate.toFixed(2)}`
    ].join('\n');

    const userText = `Muchas gracias por inscribirse en el curso ${cfg.courseName}. Para confirmar su compra, por favor adjunte una captura del comprobante SINPE. El monto es USD ${cfg.priceUsd || 99}, equivalente aprox. a ₡${Number(crc).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} al tipo de cambio del momento.`;

    await sendWhatsApp(cfg.ownerNumber, ownerText);
    await sendWhatsApp(phone, userText);

    msg.textContent = '✅ Inscripción enviada correctamente. Le contactaremos por WhatsApp.';
    form.reset();
  } catch (err) {
    msg.textContent = `⚠️ ${err.message}`;
  }
});
