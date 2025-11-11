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

  // 1. Limpia el mensaje anterior
  msg.innerHTML = "";

  // 2. Validación básica
  if (!email || !phone) {
    msg.innerHTML = "Completa los campos.";
    return;
  }

  // 3. Preparación de la data
  const data = {
    action: action,
    email: email,
    phone: phone
  };

  // 4. Solicitud Fetch a la API
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => {
    // Maneja respuestas HTTP que no son 200 (aunque fetch no lo hace por defecto)
    if (!r.ok) {
        throw new Error(`Error HTTP: ${r.status}`);
    }
    return r.json();
  })
  .then(res => {
    // Muestra el mensaje de éxito o error devuelto por codigo.gs
    msg.innerHTML = res.message;
    // Añade color para diferenciar éxito/error
    msg.style.color = res.success ? '#28a745' : '#e74c3c'; 
  })
  .catch((error) => {
    // ESTE BLOQUE SE EJECUTA CUANDO HAY FALLO DE RED/SERVIDOR (EL ERROR QUE TENÍAS)
    console.error("Error de conexión/red:", error);
    msg.innerHTML = "❌ Error de conexión. Verifica la API_URL o el estado del servidor.";
    msg.style.color = '#e74c3c';
  });
}

