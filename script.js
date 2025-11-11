const API_URL = "https://script.google.com/macros/s/AKfycbxZC-jyT42Un1bGmd83PlqLTdEWKlRTKk_BdvXlSDcLeZL-jfAD8ni-M49h-Mw1Tjmn/exec"; // ← reemplazar; // ¡REEMPLAZAR ESTA URL con la de tu despliegue final!

function register() {
  sendRequest("register_user");
}

function login() {
  sendRequest("login_user");
}

function sendRequest(action) {
  const email = document.getElementById("email").value.trim();
  // El segundo campo es 'phone' basado en tu lógica de codigo.gs
  const phone = document.getElementById("phone").value.trim(); 
  const msg = document.getElementById("msg");

  // Limpia el mensaje anterior
  msg.innerHTML = "";

  if (!email || !phone) {
    msg.innerHTML = "Completa todos los campos (Email y Número de Teléfono).";
    return;
  }

  const data = {
    action: action,
    email: email,
    phone: phone
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => {
    // Verifica si la respuesta es OK antes de intentar leer el JSON
    if (!r.ok) {
        throw new Error("HTTP Status " + r.status);
    }
    return r.json();
  })
  .then(res => {
    // Si la respuesta del backend es un mensaje de éxito/error
    msg.innerHTML = res.message; 
    msg.style.color = res.success ? '#28a745' : '#e74c3c'; // Verde para éxito, Rojo para error
  })
  .catch((error) => {
    // Bloque que maneja el "Error de conexión."
    console.error("Fetch Error:", error);
    msg.innerHTML = "❌ Error de conexión. Verifica la API_URL o el estado del servidor.";
    msg.style.color = '#e74c3c';
  });
}

