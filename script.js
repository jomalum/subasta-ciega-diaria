// **IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU PROYECTO DE APPS SCRIPT**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZC-jyT42Un1bGmd83PlzLTdEWKlRTKk_BdvXlSDcLeZL-jfAD8ni-M49h-Mw1Tjmn/exec";

// Referencias de Login/Error
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// Referencias de Main Page
const personalDataModal = document.getElementById('personal-data-modal');
const claimButton = document.getElementById('claim-button');

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

// Función que se ejecuta al cargar main.html
if (window.location.search.includes('page=main')) {
    userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.addEventListener('DOMContentLoaded', initializeMainPage);
    } else {
        // Si no hay email, redirigir al login
        window.location.href = WEB_APP_URL; 
    }
} else {
    // Código de login/registro (Se ejecuta en index.html)
    // ... (Tus funciones register y closeModal anteriores van aquí) ...
}

// ----------------------------------------------------------------------
// --- LÓGICA DE LOGIN / REGISTRO (index.html) ---
// ----------------------------------------------------------------------

// Funciones de Login y Registro modificadas para usar redirectToMain
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
      // ÉXITO: Redirigir a la página principal
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

// Tu función submitRegistration va aquí
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

// Tu función register (de index.html)
function register() {
  document.getElementById('modal-registro').style.display = "block";
  messageBox.textContent = '';
  regEmailInput.value = '';
  regPhoneInput.value = '';
  closeErrorModal();
}

// Tu función closeModal (de index.html)
function closeModal() {
  document.getElementById('modal-registro').style.display = "none";
}


// ----------------------------------------------------------------------
// --- LÓGICA DE PÁGINA PRINCIPAL (main.html) ---
// ----------------------------------------------------------------------

async function initializeMainPage() {
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
    const today = new Date();
    // Compara solo la fecha, ignorando la hora
    const lastClaimDateOnly = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
    const todayDateOnly = today.toDateString();

    if (lastClaimDateOnly === todayDateOnly) {
        document.getElementById('claim-status').textContent = `Monedas reclamadas hoy. Último reclamo: ${lastClaimDate}`;
        claimButton.textContent = 'Reclamado (Vuelve mañana)';
        claimButton.disabled = true;
    } else {
        document.getElementById('claim-status').textContent = '¡Puedes reclamar tus 5 Erdna de hoy!';
        claimButton.textContent = 'Reclamar Erdna';
        claimButton.onclick = tryClaim; // Restablecer la función de reclamo
        claimButton.disabled = false;
    }
}

function showPersonalDataModal() {
    // Llenar campos no editables
    document.getElementById('modal-email').value = userEmail;
    // (Necesitas obtener el celular si solo tienes el email aquí, o pasarlo desde login)
    // Por simplicidad, aquí usaremos un placeholder o lo dejaremos vacío si no lo pasamos
    document.getElementById('modal-phone').value = 'PENDIENTE DE CARGA'; 
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
            updateClaimStatus(result.lastClaim); // Actualiza solo el estado del botón
        }
    } catch (error) {
        statusDiv.textContent = 'Error de conexión al reclamar.';
        console.error('Error al reclamar:', error);
        claimButton.textContent = 'Reclamar Erdna';
        claimButton.disabled = false;
    }
}
