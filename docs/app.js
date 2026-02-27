const btn = document.getElementById('copyEmail');
const msg = document.getElementById('copyMsg');
if (btn) {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('carlos.aguero@aprendetidyverse.com');
      msg.textContent = 'Correo copiado ✅';
    } catch {
      msg.textContent = 'No se pudo copiar. Usa: carlos.aguero@aprendetidyverse.com';
    }
  });
}
