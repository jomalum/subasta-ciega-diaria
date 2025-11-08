// ============================
// CONFIGURACIÓN GLOBAL
// ============================
const API_URL = 'https://script.google.com/macros/s/AKfycbwQTHENsIOA2tLCuEmSfHAW8lucD7LSK4TwN75bM3nXjr4JNDKTxKSIfJL_AWtO7Pdjlw/exec';

// ============================
// FUNCIÓN DE SUSCRIPCIÓN
// ============================
async function suscribirse() {
  const email = document.getElementById('email').value.trim();
  const wsp = document.getElementById('wsp').value.trim();
  const status = document.getElementById('status');

  status.className = 'status';
  status.textContent = 'Procesando suscripción...';

  if (!email || !wsp) {
    status.className = 'status error';
    status.textContent = 'Por favor ingresa correo y número.';
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'start_login',
        email: email,
        wsp_number: wsp
      })
    });

    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message + ' Redirigiendo a validación...';
      setTimeout(() => window.location.href = 'validar.html', 2500);
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error al conectar con el servidor.';
  }
}

// ============================
// FUNCIÓN DE VALIDACIÓN
// ============================
async function validarCodigo() {
  const email = document.getElementById('email').value.trim();
  const code = document.getElementById('code').value.trim();
  const status = document.getElementById('status');

  status.className = 'status';
  status.textContent = 'Validando código...';

  if (!email || !code) {
    status.className = 'status error';
    status.textContent = 'Por favor ingresa correo y código.';
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate_code_and_claim',
        email: email,
        code: code
      })
    });

    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message + ' 🎉';
      setTimeout(() => window.location.href = 'index.html', 2500);
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error al validar el código.';
  }
}

