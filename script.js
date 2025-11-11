// Obtiene referencias
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');

// Referencias del nuevo modal de error
const errorModal = document.getElementById('error-modal');
const errorContent = document.getElementById('error-content');

// --- Funciones del Modal de Error Personalizado ---

/**
 * Muestra el modal de error con el mensaje especificado.
 * @param {string} message - El mensaje de error a mostrar.
 */
function showErrorModal(message) {
    errorContent.textContent = message;
    errorModal.style.display = 'block';
}

/**
 * Oculta el modal de error.
 */
function closeErrorModal() {
    errorModal.style.display = 'none';
}


// --- Funciones del Modal de Registro ---

function register() {
  modal.style.display = "block";
  messageBox.textContent = '';
  regEmailInput.value = '';
  regPhoneInput.value = '';
  closeErrorModal(); // Asegura que el modal de error esté oculto
}

function closeModal() {
  modal.style.display = "none";
}

function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim();

  // Mensaje de error multilínea para el nuevo modal
  const validationErrorMsg = 'Por favor, rellena los campos de registro correctamente:\n\n- El CORREO ELECTRÓNICO debe ser válido (ej. A@B.COM).\n- El N° DE CELULAR debe tener 9 dígitos.';

  // Validación
  if (email === '' || !email.includes('@') || phone.length !== 9) {
    showErrorModal(validationErrorMsg); // Muestra el modal de error personalizado
    return;
  }

  // Simulación de registro exitoso
  messageBox.textContent = '✅ ¡Usuario registrado exitosamente! Ya puedes iniciar sesión con tu correo ' + email + '.';
  messageBox.style.color = '#B5EAD7';
  
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;

  closeModal(); 
}

// --- Función de Inicio de Sesión ---

function login() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  // Validación de campos
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.';
    messageBox.style.color = '#FFADAD';
    return;
  }
  
  // Lógica de autenticación SIMULADA
  if (email === 'TEST@TEST.COM' && phone === '123456789') { 
    messageBox.textContent = '✅ ¡Bienvenido! Iniciando sesión...';
    messageBox.style.color = '#A0CED9';
  } else {
    messageBox.textContent = '❌ Credenciales incorrectas o usuario no registrado.';
    messageBox.style.color = '#FFADAD';
  }
}
