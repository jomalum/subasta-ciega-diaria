// **IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU PROYECTO DE APPS SCRIPT**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1fV6Vt45V6VourCOiHPJBJ78jVc7r6RzpLRRC51sbtJSoS0P9p2aUgcT1hz-Z6zhg/exec";

// Referencias de Login/Error (Existen en index.html)
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// REFERENCIAS DE MAIN PAGE: Declaradas pero no inicializadas globalmente para evitar el crash.
let personalDataModal;
let claimButton;

// Variable global para almacenar el email del usuario logeado
let userEmail = ''; 

// --- Funciones de Utilidad ---

function showErrorModal(message) {
    errorContent.textContent = message;
    errorModal.style.display = 'block';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

// Función de redirección
function redirectToMain(email) {
    localStorage.setItem('userEmail', email); // Guarda el email para usarlo en main.html
    window.location.href = `${WEB_APP_URL}?page=main`;
}

// Se ejecuta al cargar la página (determina si es login o main)
if (window.location.search.includes('page=main')) {
    userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        // Inicializar la página principal cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', initializeMainPage);
    } else {
        // Si no hay email, redirigir al login
        window.location.href = WEB_APP_URL; 
    }
}


// ----------------------------------------------------------------------
// --- LÓGICA DE LOGIN / REGISTRO (index.html) ---
// ----------------------------------------------------------------------
// Estas funciones están en el scope global y funcionarán si el script no se detiene.

function register() {
  document.getElementById('modal-registro').style.display = "block";
  messageBox.textContent = '';
  regEmailInput.value = '';
  regPhoneInput.value = '';
  closeErrorModal();
}

function closeModal() {
  document.getElementById('modal-registro').style.display = "none";
}

async function login() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.';
    messageBox.style.color = '#E53935';
    return;
  }
  
  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('email', email);
  formData.append('phone', phone);
  
  messageBox.textContent = 'Iniciando sesión...';
  messageBox.style.color = '#00897B';

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });

    const result = await response.json();
    
    if (result.success) {
      redirectToMain(result.userEmail); 
    } else {
      messageBox.textContent = '❌ ' + result.message;
      messageBox.style.color = '#E53935';
    }
  } catch (error) {
    messageBox.textContent = '❌ Error de Conexión: No se pudo conectar con el servidor.';
    messageBox.style.color = '#E53935';
  }
}

async function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim();

  const validationErrorMsg = 'Por favor, rellena los campos de registro correctamente:\n\n- El CORREO ELECTRÓNICO debe ser válido (ej. A@B.COM).\n- El N° DE CELULAR debe tener 9 dígitos.';

  if (email === '' || !email.includes('@') || phone.length !== 9) {
    showErrorModal(validationErrorMsg);
    return;
  }
  
  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('email', email);
  formData.append('phone', phone);
  
  const confirmButton = document.querySelector('.modal-footer .green');
  confirmButton.textContent = 'Registrando...';
  confirmButton.disabled = true;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });

    const result = await response.json();
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Ya puedes iniciar sesión.';
      messageBox.style.color = '#43A047';
      
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone;
      document.getElementById('modal-registro').style.display = "none";
    } else {
      showErrorModal('❌ Error de Registro:\n\n' + result.message);
    }
  } catch (error) {
    showErrorModal('❌ Error de Conexión: No se pudo conectar con el servidor.');
  } finally {
    confirmButton.textContent = 'Confirmar Registro';
    confirmButton.disabled = false;
  }
}


// ----------------------------------------------------------------------
// --- LÓGICA DE PÁGINA PRINCIPAL (main.html) ---
// ----------------------------------------------------------------------

async function initializeMainPage() {
    // AHORA LAS REFERENCIAS A ELEMENTOS DE main.html SOLO SE HACEN AQUÍ
    personalDataModal = document.getElementById('personal-data-modal');
    claimButton = document.getElementById('claim-button');
    
    document.getElementById('user-email').textContent = userEmail;
    await checkUserState();
}

async function checkUserState() {
    const formData = new FormData();
    formData.append('action', 'checkUser');
    formData.append('email', userEmail);
    
    const statusDiv = document.getElementById('claim-status');
    statusDiv.textContent = 'Verificando...';
    claimButton.disabled = true;

    try {
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
        const result = await response.json();

        document.getElementById('erdna-balance').textContent = result.erdna || 0;
        document.getElementById('modal-phone').value = result.phone || 'N/A'; // Rellena el celular

        if (result.needsRegistration) {
            // Mostrar modal de registro de datos personales
            claimButton.textContent = 'Completar Datos Personales';
            claimButton.onclick = showPersonalDataModal;
            claimButton.disabled = false;
            statusDiv.textContent = '¡Completa tus datos para empezar a ganar Erdna!';
        } else {
            // Usuario ya tiene datos, verificar reclamo diario
            updateClaimStatus(result.lastClaimDate);
        }
    } catch (error) {
        statusDiv.textContent = 'Error al cargar estado.';
        console.error('Error al verificar estado:', error);
    }
}

function updateClaimStatus(lastClaimDate) {
    
    if (!lastClaimDate || lastClaimDate === 'N/A') {
        document.getElementById('claim-status').textContent = '¡Puedes reclamar tus 5 Erdna de hoy!';
        claimButton.textContent = 'Reclamar Erdna';
        claimButton.onclick = tryClaim; 
        claimButton.disabled = false;
        return;
    }
    
    // Comparación solo de la fecha (DD/MM/YYYY)
    const today = new Date();
    const todayDateStr = today.toLocaleDateString("es-ES"); // Ej: 11/11/2025
    const lastClaimDateOnly = lastClaimDate.split(' ')[0]; // Tomamos DD/MM/YYYY
    
    if (lastClaimDateOnly === todayDateStr) {
        document.getElementById('claim-status').textContent = `Monedas reclamadas hoy. Último reclamo: ${lastClaimDate}`;
        claimButton.textContent = 'Reclamado (Vuelve mañana)';
        claimButton.disabled = true;
    } else {
        document.getElementById('claim-status').textContent = '¡Puedes reclamar tus 5 Erdna de hoy!';
        claimButton.textContent = 'Reclamar Erdna';
        claimButton.onclick = tryClaim; 
        claimButton.disabled = false;
    }
}

function showPersonalDataModal() {
    // Llenar campos no editables
    document.getElementById('modal-email').value = userEmail;
    
    // Abrir modal
    personalDataModal.style.display = 'block';
}

async function savePersonalData() {
    const names = document.getElementById('modal-names').value.trim();
    const paterno = document.getElementById('modal-paterno').value.trim();
    const materno = document.getElementById('modal-materno').value.trim();
    
    const errorMsgDiv = document.getElementById('modal-error');
    errorMsgDiv.textContent = '';

    if (names === '' || paterno === '' || materno === '') {
        errorMsgDiv.textContent = 'Todos los campos de nombres y apellidos son obligatorios.';
        return;
    }
    
    const saveButton = personalDataModal.querySelector('.save-btn');
    saveButton.textContent = 'Guardando...';
    saveButton.disabled = true;

    const formData = new FormData();
    formData.append('action', 'savePersonalData');
    formData.append('email', userEmail);
    formData.append('names', names);
    formData.append('paterno', paterno);
    formData.append('materno', materno);

    try {
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            personalDataModal.style.display = 'none'; // Cerrar modal
            await checkUserState(); // Refrescar el estado para activar el botón de reclamo
        } else {
            errorMsgDiv.textContent = 'Error al guardar: ' + result.message;
        }
    } catch (error) {
        errorMsgDiv.textContent = 'Error de conexión al guardar datos.';
        console.error('Error al guardar datos:', error);
    } finally {
        saveButton.textContent = 'Guardar';
        saveButton.disabled = false;
    }
}


async function tryClaim() {
    claimButton.textContent = 'Reclamando...';
    claimButton.disabled = true;
    
    const formData = new FormData();
    formData.append('action', 'claimDaily');
    formData.append('email', userEmail);
    
    const statusDiv = document.getElementById('claim-status');

    try {
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            statusDiv.textContent = result.message;
            document.getElementById('erdna-balance').textContent = result.newBalance;
            updateClaimStatus(result.lastClaim);
        } else {
            statusDiv.textContent = `❌ ${result.message}`;
            updateClaimStatus(result.lastClaim); 
        }
    } catch (error) {
        statusDiv.textContent = 'Error de conexión al reclamar.';
        console.error('Error al reclamar:', error);
        claimButton.textContent = 'Reclamar Erdna';
        claimButton.disabled = false;
    }
}
