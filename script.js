// =========================================================
// CONFIGURACIÓN GLOBAL
// =========================================================

// ⚠️ IMPORTANTE: Reemplaza esta URL con la URL de tu proyecto desplegado
// en Google Apps Script (tipo "Aplicación web").
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1fV6Vt45V6VourCOiHPJBJ78jVc7r6RzpLRRC51sbtJSoS0P9p2aUgcT1hz-Z6zhg/exec";

// =========================================================
// REFERENCIAS DEL DOM
// =========================================================
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');

// Modal de error
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// =========================================================
// FUNCIONES DE MODALES DE ERROR
// =========================================================
function showErrorModal(message) {
  errorContent.textContent = message;
  errorModal.style.display = 'block';
}

function closeErrorModal() {
  errorModal.style.display = 'none';
}

// =========================================================
// FUNCIONES DE MODAL DE REGISTRO
// =========================================================
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

// =========================================================
// REGISTRO DE NUEVO USUARIO
// =========================================================
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
      messageBox.style.color = '#43A047'; // Verde éxito
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

// =========================================================
// INICIO DE SESIÓN
// =========================================================
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
      messageBox.textContent = '✅ ' + result.message + ' Bienvenido!';
      messageBox.style.color = '#00897B';

      // 🔁 Redirección con parámetros
      const query = `?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
      window.location.href = 'principal.html' + query;

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
