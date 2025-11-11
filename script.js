const url = "AQUI_TU_URL_DEL_APPS_SCRIPT"; // Reemplazar

function toUpperEmail() {
    let email = document.getElementById("email");
    email.value = email.value.toUpperCase();
}

function validatePhone() {
    let phone = document.getElementById("phone");
    phone.value = phone.value.replace(/\D/g, ""); // solo números

    if (phone.value.length > 9) phone.value = phone.value.slice(0,9);
}

function login() {
    sendData("login");
}

function register() {
    sendData("register");
}

function sendData(action) {
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (email === "" || phone === "") {
        document.getElementById("msg").innerText = "Completa todos los campos.";
        return;
    }

    if (phone.length !== 9) {
        document.getElementById("msg").innerText = "Número inválido (9 dígitos).";
        return;
    }

    document.getElementById("msg").innerText = "Procesando...";

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: action,
            email: email,
            phone: phone
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("msg").innerText = data.message;
    })
    .catch(err => {
        document.getElementById("msg").innerText = "Error de conexión.";
        console.log(err);
    });
}
