// ============================
// CONFIGURACIÓN DE LA API
// ============================
const API_URL = 'https://script.google.com/macros/s/AKfycbwQTHENsIOA2tLCuEmSfHAW8lucD7LSK4TwN75bM3nXjr4JNDKTxKSIfJL_AWtO7Pdjlw/exec';

let currentEmail = null;
let currentWsp = null;
let currentFullUserData = {};
const SESSION_EXPIRATION_MINUTES = 60;

// ============================
// GESTIÓN DE SESIÓN Y PERSISTENCIA
// ============================

function saveSession(user) {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + (SESSION_EXPIRATION_MINUTES * 60 * 1000));
    
    const sessionData = {
        email: currentEmail,
        wsp: currentWsp,
        user: user,
        expires: expiration.toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
}

function loadSession() {
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return false;
    
    const sessionData = JSON.parse(sessionStr);
    const now = new Date();
    const expiration = new Date(sessionData.expires);
    
    if (now > expiration) {
        clearSession(false);
        return false; 
    }

    currentEmail = sessionData.email;
    currentWsp = sessionData.wsp;
    currentFullUserData = sessionData.user;
    
    showDashboard(sessionData.user);
    
    return true; 
}

function clearSession(reload = true) {
    localStorage.removeItem('userSession');
    currentEmail = null;
    currentWsp = null;
    currentFullUserData = {};
    if (reload) {
        location.reload(); 
    }
}

// ============================
// FUNCIONES DE VISTAS
// ============================
function showLoginSection(event) {
  if (event) event.preventDefault();
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('offer-section').classList.add('hidden');
  document.getElementById('prize-section').classList.add('hidden');
  closeModal();
}

function showRegisterSection(event) {
  if (event) event.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('offer-section').classList.add('hidden');
  document.getElementById('prize-section').classList.add('hidden');
  closeModal();
}

function openModal() {
  document.getElementById('data-completion-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('data-completion-modal').classList.add('hidden');
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
  status.classList.remove('hidden');
  
  if (!email || !wsp) {
    status.className = 'status error';
    status.textContent = 'Por favor completa todos los campos.';
    return;
  }

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
      
      saveSession(data.user);
      
      document.getElementById('login-section').classList.add('hidden');
      showDashboard(data.user); 
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    console.error('Error en login:', err);
    status.className = 'status error';
    status.textContent = 'Error de conexión al iniciar sesión.';
  }
}

async function startRegister() {
  const email = document.getElementById('register-email').value.trim();
  const wsp = document.getElementById('register-wsp').value.trim();
  const status = document.getElementById('register-status');
  status.className = 'status';
  status.textContent = 'Registrando usuario...';
  status.classList.remove('hidden');

  if (!email || !wsp) {
    status.className = 'status error';
    status.textContent = 'Por favor completa todos los campos.';
    return;
  }

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
      
      document.getElementById('register-email').value = '';
      document.getElementById('register-wsp').value = '';
      
      showLoginSection();
      document.getElementById('login-email').value = email;
      document.getElementById('login-wsp').value = wsp;
      
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    console.error('Error en registro:', err);
    status.className = 'status error';
    status.textContent = 'Error de conexión al registrar usuario.';
  }
}

// ============================
// DASHBOARD Y CRÉDITOS DIARIOS - CORREGIDO
// ============================

function showDashboard(user) {
  console.log('Mostrando dashboard con usuario:', user);
  
  // Ocultar todas las secciones primero
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.add('hidden');
  closeModal(); // IMPORTANTE: Cerrar modal al mostrar dashboard
  
  // Mostrar secciones del dashboard
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('offer-section').classList.remove('hidden');
  document.getElementById('prize-section').classList.remove('hidden');

  const claimButton = document.getElementById('claim-credits-button');
  const hasFullName = user.nombre1 && user.nombre1.trim() !== '';
  const hasFullData = hasFullName && 
                     user.apellidoPaterno && user.apellidoPaterno.trim() !== '' && 
                     user.apellidoMaterno && user.apellidoMaterno.trim() !== '';

  // Actualizar información del usuario
  document.getElementById('user-display-name').textContent = user.nombre1 ? user.nombre1.toUpperCase() : 'USUARIO';
  document.getElementById('user-email').textContent = currentEmail;
  document.getElementById('user-credits').textContent = user.puntos || 0;
  document.getElementById('user-fichas').textContent = user.fichas || 0;
  document.getElementById('user-streak').textContent = user.diasRacha || 0;
  document.getElementById('user-email-display').textContent = currentEmail;
  
  // Lógica del botón de reclamar - CORREGIDO
  if (!hasFullData) {
    claimButton.textContent = '➡️ COMPLETA TUS DATOS';
    claimButton.style.background = '#ffc107';
    claimButton.style.color = '#000';
  } else {
    claimButton.textContent = '✅ RECOGER CRÉDITOS DEL DÍA';
    claimButton.style.background = '#28a745';
    claimButton.style.color = '#fff';
  }

  // Limpiar status del dashboard
  const dashboardStatus = document.getElementById('dashboard-status');
  if (dashboardStatus) {
    dashboardStatus.textContent = '';
    dashboardStatus.className = 'status hidden';
  }
}

async function claimDailyCredits() {
  console.log('claimDailyCredits llamado');
  const user = currentFullUserData;
  
  // Verificar si el usuario tiene datos completos
  const hasFullData = user.nombre1 && user.nombre1.trim() !== '' && 
                     user.apellidoPaterno && user.apellidoPaterno.trim() !== '' && 
                     user.apellidoMaterno && user.apellidoMaterno.trim() !== '';

  // Si ya tiene datos completos, procede a reclamar directamente
  if (hasFullData) {
    console.log('Usuario con datos completos, reclamando directamente');
    await submitFullUserDataAndClaim(true); // onlyClaim = true
    return;
  }
  
  // Si no tiene datos completos, muestra el modal para completarlos
  console.log('Usuario sin datos completos, mostrando modal');
  document.getElementById('modal-email').value = currentEmail;
  document.getElementById('modal-wsp').value = currentWsp || user.wspNumber;
  document.getElementById('modal-nombre1').value = user.nombre1 || '';
  document.getElementById('modal-nombre2').value = user.nombre2 || '';
  document.getElementById('modal-apellidoPaterno').value = user.apellidoPaterno || '';
  document.getElementById('modal-apellidoMaterno').value = user.apellidoMaterno || '';

  openModal();
  const modalStatus = document.getElementById('modal-status');
  modalStatus.textContent = '';
  modalStatus.className = 'status hidden';
}

async function submitFullUserDataAndClaim(onlyClaim = false) {
  console.log('submitFullUserDataAndClaim llamado con onlyClaim:', onlyClaim);
  
  const status = onlyClaim ? document.getElementById('dashboard-status') : document.getElementById('modal-status');
  const claimButton = document.getElementById('claim-credits-button');

  status.className = 'status';
  status.classList.remove('hidden');
  status.textContent = onlyClaim ? 'Reclamando créditos...' : 'Guardando datos y reclamando créditos...';

  const data = {
    action: 'submit_full_data_and_claim',
    email: currentEmail,
    only_claim: onlyClaim,
    nombre1: onlyClaim ? currentFullUserData.nombre1 : document.getElementById('modal-nombre1').value.trim(),
    nombre2: onlyClaim ? currentFullUserData.nombre2 : document.getElementById('modal-nombre2').value.trim(),
    apellidoPaterno: onlyClaim ? currentFullUserData.apellidoPaterno : document.getElementById('modal-apellidoPaterno').value.trim(),
    apellidoMaterno: onlyClaim ? currentFullUserData.apellidoMaterno : document.getElementById('modal-apellidoMaterno').value.trim(),
  };

  console.log('Datos enviados al servidor:', data);

  // Validación de campos obligatorios solo cuando no es onlyClaim
  if (!onlyClaim && (!data.nombre1 || !data.apellidoPaterno || !data.apellidoMaterno)) {
    status.className = 'status error';
    status.textContent = 'Error: Primer Nombre, Apellido Paterno y Apellido Materno son obligatorios.';
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    
    console.log('Respuesta del servidor:', result);

    if (result.success) {
      status.className = 'status success';
      status.textContent = result.message;
      
      if (result.user) {
        // Actualizar datos locales con la respuesta del servidor
        Object.assign(currentFullUserData, result.user);
        
        // Mostrar el dashboard actualizado
        showDashboard(result.user);
        
        // Guardar sesión actualizada
        saveSession(currentFullUserData);
        
        // Si se llenaron los datos por primera vez, actualizamos el botón y cerramos el modal
        if (!onlyClaim) {
          claimButton.textContent = '✅ RECOGER CRÉDITOS DEL DÍA';
          claimButton.style.background = '#28a745';
          claimButton.style.color = '#fff';
          setTimeout(closeModal, 2000); 
        }
      }
      
    } else {
      status.className = 'status error';
      status.textContent = result.message;
    }
  } catch (err) {
    console.error('Error en submitFullUserDataAndClaim:', err);
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
  status.classList.remove('hidden');

  if (!currentEmail) {
    status.className = 'status error';
    status.textContent = 'Error: No se ha iniciado sesión.';
    return;
  }

  if (!value || value <= 0) {
    status.className = 'status error';
    status.textContent = 'Error: Ingresa un monto válido para la oferta.';
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit_offer',
        email: currentEmail,
        offer_value: parseInt(value),
        currency_type: type
      })
    });
    const data = await res.json();

    if (data.success) {
      status.className = 'status success';
      status.textContent = data.message;
      
      // Actualizar saldos en el dashboard
      document.getElementById('user-credits').textContent = data.new_points;
      document.getElementById('user-fichas').textContent = data.new_fichas;
      
      // Actualizar datos locales
      currentFullUserData.puntos = data.new_points;
      currentFullUserData.fichas = data.new_fichas;
      saveSession(currentFullUserData);
      
      // Limpiar campo de oferta
      document.getElementById('offer-value').value = '';
      
    } else {
      status.className = 'status error';
      status.textContent = data.message;
    }
  } catch (err) {
    console.error('Error en submitOffer:', err);
    status.className = 'status error';
    status.textContent = 'Error de conexión al enviar oferta.';
  }
}

async function loadCurrentPrize() {
  const status = document.getElementById('prize-status');
  status.className = 'status';
  status.textContent = 'Cargando premio...';
  status.classList.remove('hidden');

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
    console.error('Error en loadCurrentPrize:', err);
    status.className = 'status error';
    status.textContent = 'Error al obtener el premio actual.';
  }
}

// ============================
// MANEJO DE TECLAS Y EVENTOS
// ============================

// Permitir enviar formularios con Enter
document.addEventListener('DOMContentLoaded', function() {
  // Login con Enter
  document.getElementById('login-email').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') startLogin();
  });
  document.getElementById('login-wsp').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') startLogin();
  });

  // Registro con Enter
  document.getElementById('register-email').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') startRegister();
  });
  document.getElementById('register-wsp').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') startRegister();
  });

  // Oferta con Enter
  document.getElementById('offer-value').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitOffer();
  });

  // Modal con Enter
  const modalInputs = document.querySelectorAll('#data-completion-modal input');
  modalInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') submitFullUserDataAndClaim();
    });
  });

  // Cerrar modal haciendo clic fuera
  document.getElementById('data-completion-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
});

// ============================
// INICIALIZACIÓN
// ============================

function init() {
  console.log('Inicializando aplicación...');
  
  // Verificar si hay una sesión activa
  if (!loadSession()) {
    console.log('No hay sesión activa, mostrando login');
    showLoginSection();
  } else {
    console.log('Sesión cargada correctamente');
  }
  
  // Cargar premio actual al iniciar
  setTimeout(loadCurrentPrize, 1000);
}

// Iniciar la aplicación cuando se carga la página
window.addEventListener('load', init);
