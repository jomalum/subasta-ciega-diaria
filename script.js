const API_URL = "https://script.google.com/macros/s/AKfycbxZC-jyT42Un1bGmd83PlqLTdEWKlRTKk_BdvXlSDcLeZL-jfAD8ni-M49h-Mw1Tjmn/exec"; // ← reemplazar; // ¡REEMPLAZAR ESTA URL con la de tu despliegue final!

function register() {
  sendRequest("register_user");
}

function login() {
  sendRequest("login_user");
}

function sendRequest(action) {
  // Nota: Usa document.getElementById porque los IDs son los mismos en ambas páginas
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const msg = document.getElementById("msg");

  msg.innerHTML = "";

  if (!email || !phone) {
    msg.innerHTML = "Completa los campos.";
    msg.style.color = '#e74c3c';
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
    if (!r.ok) {
        throw new Error(`Error HTTP: ${r.status}`);
    }
    return r.json();
  })
  .then(res => {
    msg.innerHTML = res.message;
    msg.style.color = res.success ? '#28a745' : '#e74c3c'; 
  })
  .catch((error) => {
    console.error("Error de conexión/red:", error);
    msg.innerHTML = "❌ Error de conexión. Verifica la API_URL o el estado del servidor.";
    msg.style.color = '#e74c3c';
  });
}
