// Obtiene la referencia al modal y al cuadro de mensajes
const modal = document.getElementById('modal-registro');
const messageBox = document.getElementById('msg');

// --- Funciones del Modal de Registro ---

/**
 * Muestra la ventana emergente (modal) de registro.
 */
function register() {
  modal.style.display = "block";
  messageBox.textContent = ''; // Limpia el mensaje de la sección de login
  messageBox.style.color = 'red'; // Restablece el color del mensaje (por si acaso)
}

/**
 * Oculta la ventana emergente (modal) de registro.
 */
function closeModal() {
  modal.style.display = "none";
}

/**
 * Cierra el modal si el usuario hace clic fuera del contenido.
 */
window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
}

/**
 * Simula el proceso de registro y muestra un mensaje de éxito.
 */
function submitRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();

  // Validación básica
  if (name === '' || email === '' || phone.length !== 9 || !email.includes('@')) {
    alert('❌ Por favor, rellena todos los campos de registro correctamente (Email válido y Celular de 9 dígitos).');
    return;
  }

  // Simulación de registro exitoso (Aquí iría tu código para guardar el usuario en una base de datos)
  messageBox.textContent = '✅ ¡Usuario ' + name + ' registrado exitosamente! Ya puedes iniciar sesión.';
  messageBox.style.color = '#28a745'; // Color verde para éxito
  
  // Opcional: Copiar el email y celular al formulario de login para comodidad del usuario
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;

  closeModal(); // Cierra el modal tras el registro
  
  // Limpiar los campos del modal
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-phone').value = '';
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
    messageBox.style.color = 'red';
    return;
  }
  
  // Lógica de autenticación SIMULADA
  // Puedes usar cualquier par EMAIL/CELULAR aquí para simular el éxito
  if (email === 'ADMIN@TEST.COM' && phone === '123456789') { 
    messageBox.textContent = '✅ ¡Bienvenido de nuevo, ' + email + '! Iniciando sesión...';
    messageBox.style.color = '#007bff'; // Color azul para éxito de login
    // En una aplicación real, aquí harías la redirección:
    // setTimeout(() => { window.location.href = 'pagina_principal.html'; }, 1000);
  } else {
    messageBox.textContent = '❌ Credenciales incorrectas o usuario no registrado.';
    messageBox.style.color = 'red';
  }
}
