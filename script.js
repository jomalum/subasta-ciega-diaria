// **IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU PROYECTO DE APPS SCRIPT**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1fV6Vt45V6VourCOiHPJBJ78jVc7r6RzpLRRC51sbtJSoS0P9p2aUgcT1hz-Z6zhg/exec";

// Obtiene referencias (asegura que estén disponibles al cargar)
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');

// Referencias del nuevo modal de error
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// --- Funciones del Modal de Error Personalizado ---

function showErrorModal(message) {
    if (errorContent && errorModal) {
      errorContent.textContent = message;
      errorModal.style.display = 'block';
    }
}

function closeErrorModal() {
    if (errorModal) {
      errorModal.style.display = 'none';
    }
}


// --- Funciones del Modal de Registro (UI) ---

function register() {
  if (modal) {
    modal.style.display = "block";
    messageBox.textContent = '';
    regEmailInput.value = '';
    regPhoneInput.value = '';
    closeErrorModal();
  }
}

function closeModal() {
  if (modal) {
    modal.style.display = "none";
  }
}


// --- Lógica de Registro (Conexión con Google Sheets) ---

async function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim();

  const validationErrorMsg = 'Por favor, rellena los campos de registro correctamente:\n\n- El CORREO ELECTRÓNICO debe ser válido (ej. A@B.COM).\n- El N° DE CELULAR debe tener 9 dígitos.';
  if (email === '' || !email.includes('@') || phone.length !== 9) {
    showErrorModal(validationErrorMsg);
    return;
  }
  
  // Datos a enviar a Google Apps Script
  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('email', email); // Se envía en MAYÚSCULAS gracias al HTML
  formData.append('phone', phone);
  
  const confirmButton = document.querySelector('.modal-footer .green');
  confirmButton.textContent = 'Registrando...';
  confirmButton.disabled = true;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData,
      // La redirección 'follow' es estándar, pero podría fallar en algunos entornos
      redirect: 'follow' 
    });
    const result = await response.json();
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Ya puedes iniciar sesión.';
      messageBox.style.color = '#43A047';
      
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone;
      closeModal();
    } else {
      showErrorModal('❌ Error de Registro:\n\n' + result.message);
    }
  } catch (error) {
    showErrorModal('❌ Error de Conexión: No se pudo conectar con el servidor.');
    console.error('Error:', error);
  } finally {
    confirmButton.textContent = 'Confirmar Registro';
    confirmButton.disabled = false;
  }
}

// --- Lógica de Login (Conexión con Google Sheets) ---

async function login() {
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  
  if (!emailInput || !phoneInput) return;
  
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.';
    messageBox.style.color = '#E53935'; 
    return;
  }
  
  // Datos a enviar a Google Apps Script
  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('email', email); // Se envía en MAYÚSCULAS gracias al HTML
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
      messageBox.textContent = '✅ ' + result.message + ' Bienvenido!';
      messageBox.style.color = '#00897B'; 
      // Aquí iría la redirección a la página principal:
      // window.location.href = `${WEB_APP_URL}?page=main`;
    } else {
      messageBox.textContent = '❌ ' + result.message;
      messageBox.style.color = '#E53935';
    }
  } catch (error) {
    messageBox.textContent = '❌ Error de Conexión: No se pudo conectar con el servidor.';
    messageBox.style.color = '#E53935';
    console.error('Error:', error);
  }
}
