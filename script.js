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
      showDashboard(data.user); 
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
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.add('hidden');
  closeModal(); 
  
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('offer-section').classList.remove('hidden');
  document.getElementById('prize-section').classList.remove('hidden');

  const claimButton = document.getElementById('claim-credits-button');
  const hasFullName = user.nombre1 && user.nombre1.trim() !== '';

  document.getElementById('user-display-name').textContent = user.nombre1 ? user.nombre1.toUpperCase() : 'USUARIO';
  document.getElementById('user-email').textContent = currentEmail;
  document.getElementById('user-credits').textContent = user.puntos; // ID CORRECTO
  document.getElementById('user-fichas').textContent = user.fichas;
  document.getElementById('user-streak').textContent = user.diasRacha;
  
  // Establecer el texto del botón basado en si los datos están llenos
  if (!hasFullName) {
    claimButton.textContent = '➡️ COMPLETA TUS DATOS';
  } else {
    claimButton.textContent = '✅ RECOGER CRÉDITOS DEL DÍA';
  }
}

async function claimDailyCredits() {
  const user = currentFullUserData;
  
  // Revisar si Primer Nombre ya está lleno 
  if (user.nombre1 && user.nombre1.trim() !== '') {
    // Si ya tiene datos, procede a reclamar directamente
    await submitFullUserDataAndClaim(true); // onlyClaim = true
    return;
  }
  
  // Si no tiene datos, muestra el modal y precarga la info
  document.getElementById('modal-email').value = currentEmail;
  document.getElementById('modal-wsp').value = currentWsp || user.wspNumber;
  document.getElementById('modal-nombre1').value = user.nombre1 || '';
  document.getElementById('modal-nombre2').value = user.nombre2 || '';
  document.getElementById('modal-apellidoPaterno').value = user.apellidoPaterno || '';
  document.getElementById('modal-apellidoMaterno').value = user.apellidoMaterno || '';

  openModal();
  document.getElementById('modal-status').classList.add('hidden'); 
}

async function submitFullUserDataAndClaim(onlyClaim = false) {
  const status = document.getElementById('modal-status');
  const claimButton = document.getElementById('claim-credits-button');

  status.className = 'status';
  status.classList.remove('hidden');
  status.textContent = onlyClaim ? 'Reclamando créditos...' : 'Guardando datos y reclamando créditos...';

  const data = {
    email: currentEmail,
    only_claim: onlyClaim,
    nombre1: onlyClaim ? currentFullUserData.nombre1 : document.getElementById('modal-nombre1').value.trim(),
    nombre2: onlyClaim ? currentFullUserData.nombre2 : document.getElementById('modal-nombre2').value.trim(),
    apellidoPaterno: onlyClaim ? currentFullUserData.apellidoPaterno : document.getElementById('modal-apellidoPaterno').value.trim(),
    apellidoMaterno: onlyClaim ? currentFullUserData.apellidoMaterno : document.getElementById('modal-apellidoMaterno').value.trim(),
  };

  if (!onlyClaim && (!data.nombre1 || !data.apellidoPaterno || !data.apellidoMaterno)) {
    status.className = 'status error';
    status.textContent = 'Error: Primer Nombre, Apellido Paterno y Apellido Materno son obligatorios.';
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit_full_data_and_claim',
        ...data 
      })
    });
    const result = await res.json();

    if (result.success) {
      status.className = 'status success';
      status.textContent = result.message;
      
      if (result.user) {
        // Asegura que los créditos se muestren al actualizar el dashboard
        showDashboard(result.user); 
        
        // Actualizar datos locales
        Object.assign(currentFullUserData, result.user);
        currentFullUserData.nombre1 = data.nombre1;
        currentFullUserData.nombre2 = data.nombre2;
        currentFullUserData.apellidoPaterno = data.apellidoPaterno;
        currentFullUserData.apellidoMaterno = data.apellidoMaterno;

        // Si se llenaron los datos por primera vez, actualizamos el botón y cerramos el modal
        if (!onlyClaim) {
           claimButton.textContent = '✅ RECOGER CRÉDITOS DEL DÍA';
           setTimeout(closeModal, 2000); 
        }
      }
      
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
      document.getElementById('user-credits').textContent = data.new_points; // ID CORRECTO
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

