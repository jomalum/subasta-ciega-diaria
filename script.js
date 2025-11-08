// ============================
// CONFIGURACIÓN DE LA API
// ============================
const API_URL = 'https://script.google.com/macros/s/AKfycbwQTHENsIOA2tLCuEmSfHAW8lucD7LSK4TwN75bM3nXjr4JNDKTxKSIfJL_AWtO7Pdjlw/exec';

let currentEmail = null;

// ============================
// FUNCIONES DE LOGIN
// ============================

async function startLogin() {
  const email = document.getElementById('email').value.trim();
  const wsp = document.getElementById('wsp').value.trim();
  const status = document.getElementById('login-status');
  status.className = 'status';
  status.textContent = 'Procesando...';

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
      currentEmail = email;
      status.className = 'status success';
      status.textContent = data.message;

      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('validation-section').classList.remove('hidden');
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al iniciar sesión. Verifica la URL del Apps Script.';
  }
}

async function validateCode() {
  const code = document.getElementById('validation-code').value.trim();
  const status = document.getElementById('validation-status');
  status.className = 'status';
  status.textContent = 'Validando...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate_code_and_claim',
        email: currentEmail,
        code: code
      })
    });
    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message;
      showDashboard(data.user);
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al validar código.';
  }
}

// ============================
// DASHBOARD Y OFERTAS
// ============================

function showDashboard(user) {
  document.getElementById('validation-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('offer-section').classList.remove('hidden');
  document.getElementById('prize-section').classList.remove('hidden');

  document.getElementById('user-email').textContent = currentEmail;
  document.getElementById('user-points').textContent = user.puntos;
  document.getElementById('user-fichas').textContent = user.fichas;
  document.getElementById('user-streak').textContent = user.diasRacha;
}

async function submitOffer() {
  const value = document.getElementById('offer-value').value;
  const type = document.getElementById('currency-type').value;
  const status = document.getElementById('offer-status');
  status.className = 'status';
  status.textContent = 'Enviando oferta...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit_offer',
        email: currentEmail,
        offer_value: value,
        currency_type: type
      })
    });
    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message;
      document.getElementById('user-points').textContent = data.new_points;
      document.getElementById('user-fichas').textContent = data.new_fichas;
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al enviar oferta.';
  }
}

async function loadCurrentPrize() {
  const status = document.getElementById('prize-status');
  status.className = 'status';
  status.textContent = 'Cargando premio...';

  try {
    const res = await fetch(`${API_URL}?action=get_current_prize`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('prize-name').textContent = data.prize.nombre;
      document.getElementById('prize-value').textContent = data.prize.valor;
      document.getElementById('prize-winner').textContent = data.prize.ganador;
      status.className = 'status success';
      status.textContent = 'Premio cargado correctamente.';
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error al obtener el premio actual.';
  }
}


