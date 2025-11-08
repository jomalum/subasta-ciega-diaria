// ============================
// CONFIGURACIÓN DE LA API
// ============================
const API_URL = 'https://script.google.com/macros/s/AKfycbwQTHENsIOA2tLCuEmSfHAW8lucD7LSK4TwN75bM3nXjr4JNDKTxKSIfJL_AWtO7Pdjlw/exec';

let currentEmail = null;
let currentWsp = null;
let currentFullUserData = {}; // Para guardar datos del usuario

// ============================
// FUNCIONES DE VISTAS
// ============================
function showLoginSection(event) {
  if (event) event.preventDefault();
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  closeModal();
}

function showRegisterSection(event) {
  if (event) event.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
  closeModal();
}

function openModal() {
  document.getElementById('data-completion-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('data-completion-modal').style.display = 'none';
}


// ============================
// FUNCIONES DE LOGIN Y REGISTRO
// ============================

async function startLogin() {
  const email = document.getElementById('login-email').value.trim();
  const wsp = document.getElementById('login-wsp').value.trim();
  const status = document.getElementById('login-status');
  status.className = 'status';
  status.textContent = 'Verificando credenciales...';
  
  // Validación de 9 dígitos en el cliente
  if (!/^\d{9}$/.test(wsp)) {
    status.className = 'status error';
    status.textContent = 'Número de WhatsApp debe tener exactamente 9 dígitos.';
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login_user',
        email: email,
        wsp_number: wsp
      })
    });
    const data = await res.json();

    if (data.success) {
      currentEmail = email;
      currentWsp = wsp; 
      currentFullUserData = data.user; 
      status.className = 'status success';
      status.textContent = data.message;
      
      document.getElementById('login-section').classList.add('hidden');
      showDashboard(data.user); // Redirección directa al dashboard
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al iniciar sesión. Verifica la URL del Apps Script.';
  }
}

async function startRegister() {
  const email = document.getElementById('register-email').value.trim();
  const wsp = document.getElementById('register-wsp').value.trim();
  const status = document.getElementById('register-status');
  status.className = 'status';
  status.textContent = 'Registrando usuario...';

  // Validación de 9 dígitos en el cliente
  if (!/^\d{9}$/.test(wsp)) {
    status.className = 'status error';
    status.textContent = 'Número de WhatsApp debe tener exactamente 9 dígitos.';
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'register_new_user',
        email: email,
        wsp_number: wsp
      })
    });
    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message;
      
      // Tras el registro, volvemos al login para que inicie sesión
      showLoginSection();
      document.getElementById('login-email').value = email;
      document.getElementById('login-wsp').value = wsp;
      
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al registrar usuario. Verifica la URL del Apps Script.';
  }
}


// ============================
// DASHBOARD Y CRÉDITOS DIARIOS
// ============================

function showDashboard(user) {
  // Oculta las secciones iniciales y muestra el tablero/oferta/premio
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.add('hidden');
  closeModal(); 
  
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('offer-section').classList.remove('hidden');
  document.getElementById('prize-section').classList.remove('hidden');

  document.getElementById('user-email').textContent = currentEmail;
  document.getElementById('user-points').textContent = user.puntos;
  document.getElementById('user-fichas').textContent = user.fichas;
  document.getElementById('user-streak').textContent = user.diasRacha;
}

function claimDailyCredits() {
  const user = currentFullUserData;
  
  // 1. Rellenar modal con datos predeterminados
  document.getElementById('modal-email').value = currentEmail;
  document.getElementById('modal-wsp').value = currentWsp || user.wspNumber;
  
  // Rellenar campos de nombre
  document.getElementById('modal-nombre1').value = user.nombre1 || '';
  document.getElementById('modal-nombre2').value = user.nombre2 || '';
  document.getElementById('modal-apellidoPaterno').value = user.apellidoPaterno || '';
  document.getElementById('modal-apellidoMaterno').value = user.apellidoMaterno || '';

  // 2. Mostrar modal
  openModal();
  document.getElementById('modal-status').classList.add('hidden'); // Limpiar status
}

async function submitFullUserDataAndClaim() {
  const status = document.getElementById('modal-status');
  status.className = 'status';
  status.textContent = 'Guardando datos y reclamando puntos...';
  status.classList.remove('hidden');

  const data = {
    nombre1: document.getElementById('modal-nombre1').value.trim(),
    nombre2: document.getElementById('modal-nombre2').value.trim(),
    apellidoPaterno: document.getElementById('modal-apellidoPaterno').value.trim(),
    apellidoMaterno: document.getElementById('modal-apellidoMaterno').value.trim(),
  };

  if (!data.nombre1 || !data.apellidoPaterno || !data.apellidoMaterno) {
    status.className = 'status error';
    status.textContent = 'Error: Primer Nombre, Apellido Paterno y Apellido Materno son obligatorios.';
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit_full_data_and_claim',
        email: currentEmail,
        ...data 
      })
    });
    const result = await res.json();

    if (result.success) {
      status.className = 'status success';
      status.textContent = result.message;
      
      if (result.user) {
        showDashboard(result.user);
      }
      
      // Actualizar los datos locales del usuario
      currentFullUserData.nombre1 = data.nombre1;
      currentFullUserData.nombre2 = data.nombre2;
      currentFullUserData.apellidoPaterno = data.apellidoPaterno;
      currentFullUserData.apellidoMaterno = data.apellidoMaterno;

      setTimeout(closeModal, 2000); 
      
    } else {
      status.className = 'status error';
      status.textContent = result.message;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = 'Error de conexión al enviar datos y reclamar puntos.';
  }
}

// ============================
// OFERTAS Y PREMIOS
// ============================

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

