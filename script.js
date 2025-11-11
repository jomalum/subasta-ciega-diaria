
const API_URL = "https://script.google.com/macros/s/AKfycbxZC-jyT42Un1bGmd83PlqLTdEWKlRTKk_BdvXlSDcLeZL-jfAD8ni-M49h-Mw1Tjmn/exec"; // <-- reemplazar

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

  msg.innerHTML = "";

  if (!email || !phone) {
    msg.innerHTML = "Completa los campos.";
    return;
  }

  const payload = {
    action: action,
    email: email,
    phone: phone
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    msg.innerHTML = data.message;
  })
  .catch(() => {
    msg.innerHTML = "Error de conexión.";
  });
}

