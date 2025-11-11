// Obtiene la referencia al modal y al cuadro de mensajes
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');

// Obtener referencias a los campos de registro y previsualización
const regEmailInput = document.getElementById('reg-email');
const regPhoneInput = document.getElementById('reg-phone');
const previewEmail = document.getElementById('preview-email');
const previewPhone = document.getElementById('preview-phone');

// --- Funciones del Modal de Registro ---

/**
 * Muestra la ventana emergente (modal) de registro.
 */
function register() {
  modal.style.display = "block";
  messageBox.textContent = ''; // Limpia el mensaje de la sección de login
  
  // Limpiar y resetear campos y previsualización al abrir
  regEmailInput.value = '';
  regPhoneInput.value = '';
  updatePreview();
}

/**
 * Oculta la ventana emergente (modal) de registro.
 */
function closeModal() {
  modal.style.display = "none";
}

// Escucha los cambios en los campos del modal para actualizar la previsualización
regEmailInput.addEventListener('input', updatePreview);
regPhoneInput.addEventListener('input', updatePreview);

/**
 * Actualiza el texto de previsualización en el modal.
 */
function updatePreview() {
    const email = regEmailInput.value.trim();
    const phone = regPhoneInput.value.trim();

    previewEmail.textContent = 'Correo Electrónico: ' + (email || 'N/A');
    previewPhone.textContent = 'N° de Celular: ' + (phone || 'N/A');
}

/**
 * Simula el proceso de registro y valida los datos.
 */
function submitRegistration() {
  const email = regEmailInput.value.trim();
  const phone = regPhoneInput.value.trim();

  // Validación: Correo no vacío y contiene '@', Celular debe tener exactamente 9 dígitos
  if (email === '' || !email.includes('@') || phone.length !== 9) {
    alert('❌ Por favor, rellena los campos de registro correctamente:\n- El EMAIL debe ser válido.\n- El CELULAR debe tener 9 dígitos.');
    return;
  }

  // Simulación de registro exitoso
  messageBox.textContent = '✅ ¡Usuario registrado exitosamente! Ya puedes iniciar sesión con tu correo ' + email + '.';
  messageBox.style.color = '#B5EAD7'; // Color pastel de éxito
  
  // Opcional: Copiar el email y celular al formulario de login
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;

  closeModal(); // Cierra el modal tras el registro
}

// --- Función de Inicio de Sesión ---

/**
 * Simula la función de iniciar sesión.
 */
function login() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  // Validación de campos
  if (email === '' || phone.length !== 9) {
    messageBox.textContent = '❌ Por favor, ingresa un EMAIL y un CELULAR de 9 dígitos.';
    messageBox.style.color = '#FFADAD'; // Color pastel de error
    return;
  }
  
  // Lógica de autenticación SIMULADA
  // Si deseas una prueba exitosa, usa EMAIL=TEST@TEST.COM y CELULAR=123456789
  if (email === 'TEST@TEST.COM' && phone === '123456789') { 
    messageBox.textContent = '✅ ¡Bienvenido! Iniciando sesión...';
    messageBox.style.color = '#A0CED9'; // Color pastel de éxito de login
  } else {
    messageBox.textContent = '❌ Credenciales incorrectas o usuario no registrado.';
    messageBox.style.color = '#FFADAD'; // Color pastel de error
  }
}
