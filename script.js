// **IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU PROYECTO DE APPS SCRIPT**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1fV6Vt45V6VourCOiHPJBJ78jVc7r6RzpLRRC51sbtJSoS0P9p2aUgcT1hz-Z6zhg/exec";

// Obtiene referencias
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');

// Referencias del nuevo modal de error
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// --- Funciones del Modal de Error Personalizado ---

function showErrorModal(message) {
    errorContent.textContent = message;
    errorModal.style.display = 'block';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

// --- Funciones del Modal de Registro (UI) ---

function register() {
  modal.style.display = "block";
  messageBox.textContent = '';
  regEmailInput.value = '';
  regPhoneInput.value = '';
  closeErrorModal();
}

function closeModal() {
  modal.style.display = "none";
}

// --- Lógica de Registro (Conexión con Google Sheets) ---

async function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim();

  // Validación local (antes de enviar al servidor)
  const validationErrorMsg = 'Por favor, rellena los campos de registro correctamente:\n\n- El CORREO ELECTRÓNICO debe ser válido (ej. A@B.COM).\n- El N° DE CELULAR debe tener 9 dígitos.';
  if (email === '' || !email.includes('@') || phone.length !== 9) {
    showErrorModal(validationErrorMsg);
    return;
  }
  
  // Datos a enviar a Google Apps Script (USANDO FORMDATA COMO ORIGINAL)
  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('email', email);
  formData.append('phone', phone);
  
  // Deshabilitar botón para evitar envíos múltiples
  const confirmButton = document.querySelector('.modal-footer .green');
  const originalText = confirmButton.textContent;
  confirmButton.textContent = 'Registrando...';
  confirmButton.disabled = true;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Ya puedes iniciar sesión.';
      messageBox.style.color = '#43A047'; // Verde de éxito
      
      // Llenar campos de login y cerrar modal
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone;
      closeModal();
    } else {
      // Mostrar error que viene del servidor (ej. usuario ya existe)
      showErrorModal('❌ Error de Registro:\n\n' + result.message);
    }
  } catch (error) {
    showErrorModal('❌ Error de Conexión: No se pudo conectar con el servidor.\n\nVerifica:\n1. Tu conexión a internet\n2. Que la URL de WEB_APP_URL sea correcta\n3. Que la aplicación esté desplegada');
    console.error('Error:', error);
  } finally {
    confirmButton.textContent = originalText;
    confirmButton.disabled = false;
  }
}

// --- Lógica de Login (Conexión con Google Sheets) ---

async function login() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.';
    messageBox.style.color = '#E53935'; // Rojo de error
    return;
  }
  
  // Datos a enviar a Google Apps Script (USANDO FORMDATA COMO ORIGINAL)
  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('email', email);
  formData.append('phone', phone);
  
  messageBox.textContent = 'Iniciando sesión...';
  messageBox.style.color = '#00897B';
  
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Redirigiendo...';
      messageBox.style.color = '#00897B';
      
      // Redirección usando google.script.run
      google.script.run
        .withSuccessHandler(function(url) {
          window.top.location.href = url;
        })
        .withFailureHandler(function(error) {
          messageBox.textContent = '❌ Error al redirigir: ' + error;
          messageBox.style.color = '#E53935';
        })
        .getMainPageUrl();
        
    } else {
      messageBox.textContent = '❌ ' + result.message;
      messageBox.style.color = '#E53935';
    }
  } catch (error) {
    messageBox.textContent = '❌ Error de Conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    messageBox.style.color = '#E53935';
    console.error('Error:', error);
  }
}
