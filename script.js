// **IMPORTANTE: REEMPLAZA ESTA URL CON LA URL DE TU PROYECTO DE APPS SCRIPT**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1fV6Vt45V6VourCOiHPJBJ78jVc7r6RzpLRRC51sbtJSoS0P9p2aUgcT1hz-Z6zhg/exec"; // [cite: 16]

// Obtiene referencias
const modal = document.getElementById('modal-registro'); // [cite: 17]
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');

// Referencias del nuevo modal de error
const errorModal = document.getElementById('error-modal'); // [cite: 18]
const errorContent = document.getElementById('error-content');

// --- Funciones del Modal de Error Personalizado ---

function showErrorModal(message) {
    errorContent.textContent = message;
    errorModal.style.display = 'block'; // [cite: 20]
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}


// --- Funciones del Modal de Registro (UI) ---

function register() {
  modal.style.display = "block";
  messageBox.textContent = ''; // [cite: 21]
  regEmailInput.value = '';
  regPhoneInput.value = '';
  closeErrorModal();
}

function closeModal() {
  modal.style.display = "none"; // [cite: 22]
}


// --- Lógica de Registro (Conexión con Google Sheets) ---

async function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim(); // [cite: 23]

  // Validación local (antes de enviar al servidor)
  const validationErrorMsg = 'Por favor, rellena los campos de registro correctamente:\n\n- El CORREO ELECTRÓNICO debe ser válido (ej. A@B.COM).\n- El N° DE CELULAR debe tener 9 dígitos.';
  if (email === '' || !email.includes('@') || phone.length !== 9) { // [cite: 24]
    showErrorModal(validationErrorMsg);
    return; // [cite: 25]
  }
  
  // Datos a enviar a Google Apps Script
  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('email', email); // [cite: 26]
  formData.append('phone', phone);
  
  // Deshabilitar botón para evitar envíos múltiples
  const confirmButton = document.querySelector('.modal-footer .green');
  confirmButton.textContent = 'Registrando...';
  confirmButton.disabled = true; // [cite: 27]

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });
    const result = await response.json(); // [cite: 28]
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Ya puedes iniciar sesión.';
      messageBox.style.color = '#43A047'; // Verde de éxito // [cite: 29]
      
      // Llenar campos de login y cerrar modal
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone; // [cite: 30]
      closeModal();
    } else {
      // Mostrar error que viene del servidor (ej. usuario ya existe)
      showErrorModal('❌ Error de Registro:\n\n' + result.message); // [cite: 31]
    }
  } catch (error) {
    showErrorModal('❌ Error de Conexión: No se pudo conectar con el servidor.'); // [cite: 32]
    console.error('Error:', error);
  } finally {
    confirmButton.textContent = 'Confirmar Registro'; // [cite: 33]
    confirmButton.disabled = false;
  }
}

// --- Lógica de Login (Conexión con Google Sheets) ---

async function login() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim(); // [cite: 34]
  
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.'; // [cite: 35]
    messageBox.style.color = '#E53935'; // Rojo de error
    return; // [cite: 36]
  }
  
  // Datos a enviar a Google Apps Script
  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('email', email); // [cite: 37]
  formData.append('phone', phone);
  
  messageBox.textContent = 'Iniciando sesión...';
  messageBox.style.color = '#00897B';
  try { // [cite: 38]
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });
    const result = await response.json(); // [cite: 39]
    
    if (result.success) {
      messageBox.textContent = '✅ ' + result.message + ' Bienvenido!';
      messageBox.style.color = '#00897B'; // Turquesa de éxito // 
      
      // ****** CÓDIGO DE REDIRECCIÓN AÑADIDO/MODIFICADO AQUÍ ******
      google.script.run.withSuccessHandler(function(url) {
          window.top.location.href = url;
      }).getWebAppUrlForMainPage();
      // ************************************************************

    } else { // [cite: 41]
      messageBox.textContent = '❌ ' + result.message;
      messageBox.style.color = '#E53935'; // Rojo de error // [cite: 42]
    }
  } catch (error) {
    messageBox.textContent = '❌ Error de Conexión: No se pudo conectar con el servidor.';
    messageBox.style.color = '#E53935'; // 
    console.error('Error:', error);
  } // <-- Cierre correcto del try...catch
} // <-- Cierre correcto de la función login()
