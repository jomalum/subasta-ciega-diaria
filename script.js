const API_URL = "https://script.google.com/macros/s/AKfycbxZC-jyT42Un1bGmd83PlqLTdEWKlRTKk_BdvXlSDcLeZL-jfAD8ni-M49h-Mw1Tjmn/exec"; // ← reemplazar; // ¡REEMPLAZAR ESTA URL con la de tu despliegue final!

function register() {
  sendRequest("register_user");
}

function login() {
  sendRequest("login_user");
}

function sendRequest(action) {
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const msg = document.getElementById("msg");

  // Limpia el mensaje anterior
  msg.innerHTML = "";

  // Validación básica
  if (!email || !phone) {
    msg.innerHTML = "Completa los campos.";
    msg.style.color = '#e74c3c';
    return;
  }

  // Preparación de la data
  const data = {
    action: action,
    email: email,
    phone: phone
  };

  // Solicitud Fetch a la API
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => {
    // Verifica si la respuesta HTTP es OK
    if (!r.ok) {
        throw new Error(`Error HTTP: ${r.status}`);
    }
    return r.json();
  })
  .then(res => {
    // Muestra el mensaje devuelto por Google Apps Script
    msg.innerHTML = res.message;
    // Asigna color basado en si fue un éxito o un error de lógica
    msg.style.color = res.success ? '#28a745' : '#e74c3c'; 
  })
  .catch((error) => {
    // Bloque que captura el "Error de conexión" (el error que tenías)
    console.error("Error de conexión/red:", error);
    msg.innerHTML = "❌ Error de conexión. Verifica la API_URL o el estado del servidor.";
    msg.style.color = '#e74c3c';
  });
}
