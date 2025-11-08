// ============================
// CONFIGURACIÓN DE LA API
// ============================
const API_URL = 'https://script.google.com/macros/s/AKfycbwQTHENsIOA2tLCuEmSfHAW8lucD7LSK4TwN75bM3nXjr4JNDKTxKSIfJL_AWtO7Pdjlw/exec';

let currentEmail = null;

// ============================
// FUNCIONES DE VISTAS
// ============================

function showLoginSection(event) {
  if (event) event.preventDefault();
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
}

function showRegisterSection(event) {
  if (event) event.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
}


// ============================
// FUNCIONES DE LOGIN Y REGISTRO
// ============================

async function checkUserExists() {
  const email = document.getElementById('login-email').value.trim();
  const status = document.getElementById('login-status');
  status.className = 'status';
  status.textContent = 'Verificando usuario...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'check_user_exists',
        email: email
      })
    });
    const data = await res.json();

    if (data.exists) {
      currentEmail = email;
      // Si el usuario existe, pasa directamente a la validación de código
      status.className = 'status success';
      status.textContent = 'Usuario encontrado. Por favor, ingresa tu código de validación.';
      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('validation-section').classList.remove('hidden');
    } else {
      status.className = 'status error';
      status.textContent = data.message || 'Usuario no encontrado. Por favor, regístrate.';
      // Opcional: Llevar al usuario a la sección de registro
      // showRegisterSection(); 
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al verificar el usuario.';
  }
}

async function startRegister() {
  const email = document.getElementById('register-email').value.trim();
  const wsp = document.getElementById('register-wsp').value.trim();
  const status = document.getElementById('register-status');
  status.className = 'status';
  status.textContent = 'Registrando usuario...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'register_new_user', // Nueva acción para el registro
        email: email,
        wsp_number: wsp
      })
    });
    const data = await res.json();

    if (data.success) {
      currentEmail = email;
      status.className = 'status success';
      status.textContent = data.message;
      
      document.getElementById('register-section').classList.add('hidden');
      document.getElementById('validation-section').classList.remove('hidden');
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al registrar usuario. Verifica la URL del Apps Script.';
  }
}


async function validateCode() {
  const code = document.getElementById('validation-code').value.trim();
  const status = document.getElementById('validation-status');
  status.className = 'status';
  status.textContent = 'Validando...';
  
  if (!currentEmail) {
    status.className = 'status error';
    status.textContent = 'Error: No se ha iniciado sesión o registrado un correo.';
    return;
  }
  
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
  // Oculta todas las secciones iniciales y muestra el tablero/oferta/premio
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.add('hidden');
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

  if (!currentEmail) {
    status.className = 'status error';
    status.textContent = 'Error: No se ha iniciado sesión.';
    return;
  }

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

