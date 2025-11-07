// 🚨 ¡REEMPLAZA ESTA LÍNEA CON LA URL REAL DE TU API DE APPS SCRIPT!
const API_ENDPOINT_URL = 'https://script.google.com/macros/s/TU_URL_DE_IMPLEMENTACION/exec';

let userEmail = localStorage.getItem('subasta_user_email');
let userWsp = localStorage.getItem('subasta_user_wsp');
let modal;
let loginStatusMessage;

// ====================================================================
// FUNCIONES DE INTERFAZ Y MANEJO DE ESTADO
// ====================================================================

function updateDashboard(userData) {
    document.getElementById('puntos-diarios').textContent = userData.puntos;
    document.getElementById('fichas-racha').textContent = userData.fichas;
    document.getElementById('dias-racha').textContent = userData.diasRacha;
    
    // Habilitar oferta con Fichas Racha si tiene al menos 1
    const fichaOption = document.querySelector('#currency-type option[value="FICHAS_RACHA"]');
    if (userData.fichas > 0) {
        fichaOption.disabled = false;
    } else {
        fichaOption.disabled = true;
    }
}

function displayMessage(message, isSuccess = true) {
    const msgEl = document.getElementById('offer-message');
    msgEl.textContent = message;
    msgEl.style.display = 'block';
    msgEl.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    msgEl.style.color = isSuccess ? '#155724' : '#721c24';
}

function displayLoginMessage(message, isSuccess = true) {
    loginStatusMessage.textContent = message;
    loginStatusMessage.style.display = 'block';
    loginStatusMessage.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    loginStatusMessage.style.color = isSuccess ? '#155724' : '#721c24';
}

// ====================================================================
// LÓGICA DEL MODAL DE LOGIN (3 PASOS)
// ====================================================================

function openModal() {
    modal.style.display = 'block';
    
    // Rellenar campos si existen en localStorage
    if (userEmail) {
        document.getElementById('reg-email').value = userEmail;
    }
    if (userWsp) {
        document.getElementById('reg-wsp').value = userWsp;
    }
    
    // Resetear el modal al paso 1
    document.getElementById('login-status-message').style.display = 'none';
    document.getElementById('step-2-validate').style.display = 'none';
    document.getElementById('step-3-success').style.display = 'none';
    document.getElementById('step-1-login').style.display = 'block'; 
}

function closeModal() {
    modal.style.display = 'none';
}

// ====================================================================
// FUNCIONES DE COMUNICACIÓN CON LA API (Apps Script)
// ====================================================================

/**
 * Carga los datos del dashboard si el usuario ya está logueado.
 */
async function loadDashboardData() {
    if (!userEmail) return;

    try {
        const response = await fetch(`${API_ENDPOINT_URL}?action=get_dashboard_data&email=${userEmail}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('user-email').textContent = userEmail;
            updateDashboard(data.user);
        } else {
            document.getElementById('user-email').textContent = 'Visitante (No Logueado)';
            // Si el backend dice que no existe, limpiamos el localStorage
            if (data.message.includes('no registrado')) {
                localStorage.removeItem('subasta_user_email');
                localStorage.removeItem('subasta_user_wsp');
                userEmail = null;
                userWsp = null;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
    }
}


/**
 * PASO 1: Iniciar sesión o registrar.
 */
async function handleStartLogin() {
    const email = document.getElementById('reg-email').value.toLowerCase();
    const wsp = document.getElementById('reg-wsp').value.trim();
    
    if (!email || !email.includes('@')) {
        displayLoginMessage("Ingresa un correo electrónico válido.", false);
        return;
    }
    // Validación de formato: solo dígitos, longitud mínima 8
    if (!/^\d{8,}$/.test(wsp)) {
        displayLoginMessage("Número de WhatsApp inválido (solo dígitos, min 8).", false);
        return;
    }
    
    document.getElementById('start-login-button').disabled = true;

    try {
        const response = await fetch(API_ENDPOINT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'start_login',
                email: email,
                wsp_number: wsp
            })
        });
        const data = await response.json();

        if (data.success) {
            // Guardar email y wsp
            userEmail = email;
            userWsp = data.wsp_number;
            localStorage.setItem('subasta_user_email', userEmail);
            localStorage.setItem('subasta_user_wsp', userWsp);
            
            // Pasar al paso 2
            document.getElementById('step-1-login').style.display = 'none';
            document.getElementById('step-2-validate').style.display = 'block';
            
            // Mostrar el código en el mensaje (SIMULACIÓN)
            document.getElementById('wsp-message').innerHTML = `Hemos generado el código <b>${data.code_generated}</b>. Ingrésalo abajo para reclamar tus Puntos Diarios.`;
            displayLoginMessage(data.message, true); 
            
        } else {
            displayLoginMessage(data.message, false);
        }
    } catch (error) {
        displayLoginMessage('Error de conexión al iniciar sesión.', false);
    } finally {
        document.getElementById('start-login-button').disabled = false;
    }
}


/**
 * PASO 2: Validar código y reclamar puntos.
 */
async function handleValidateCodeAndClaim() {
    const code = document.getElementById('validation-code').value.trim();
    
    if (code.length !== 4 || isNaN(code)) {
        displayLoginMessage("El código debe ser de 4 dígitos numéricos.", false);
        return;
    }
    
    document.getElementById('validate-code-button').disabled = true;

    try {
        const response = await fetch(API_ENDPOINT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'validate_code_and_claim',
                email: userEmail,
                code: code
            })
        });
        const data = await response.json();

        if (data.success) {
            // Mostrar paso 3: Éxito
            document.getElementById('step-2-validate').style.display = 'none';
            document.getElementById('step-3-success').style.display = 'block';
            document.getElementById('success-message').textContent = data.message;
            
            // Actualizar el dashboard principal
            if (data.user) {
                updateDashboard(data.user);
                document.getElementById('user-email').textContent = userEmail;
            }
            
            // Resetear el campo de código para la próxima vez
            document.getElementById('validation-code').value = ''; 
            setTimeout(closeModal, 3000); // Cerrar después de 3 segundos
            
        } else {
            displayLoginMessage(data.message, false);
        }
    } catch (error) {
        displayLoginMessage('Error de conexión al validar el código.', false);
    } finally {
        document.getElementById('validate-code-button').disabled = false;
    }
}

/**
 * Maneja el envío de la oferta.
 */
async function handleSubmitOffer() {
    if (!userEmail) {
        displayMessage("Primero debes iniciar sesión y reclamar tus puntos.", false);
        return;
    }

    const offerValue = document.getElementById('offer-value').value;
    const currencyType = document.getElementById('currency-type').value;

    if (!offerValue || isNaN(offerValue) || offerValue < 1 || offerValue > 1000) {
        displayMessage("El valor de la oferta debe ser un número entre 1 y 1000 puntos.", false);
        return;
    }

    document.getElementById('submit-offer-button').disabled = true;

    try {
        const response = await fetch(API_ENDPOINT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submit_offer',
                email: userEmail,
                offer_value: offerValue,
                currency_type: currencyType
            })
        });
        const data = await response.json();

        if (data.success) {
            // Actualizar solo los puntos y fichas en el dashboard después de la oferta
            const newUserData = {
                puntos: data.new_points, 
                fichas: data.new_fichas,
                diasRacha: document.getElementById('dias-racha').textContent 
            };
            updateDashboard(newUserData);
            displayMessage(data.message, true);
        } else {
            displayMessage(data.message, false);
        }
    } catch (error) {
        displayMessage('Error al enviar la oferta.', false);
    } finally {
        document.getElementById('submit-offer-button').disabled = false;
    }
}


/**
 * Carga los datos del premio actual y del resultado de ayer.
 */
async function loadPrizeData() {
    try {
        const responsePrize = await fetch(`${API_ENDPOINT_URL}?action=get_current_prize`);
        const dataPrize = await responsePrize.json();

        if (dataPrize.success) {
            document.getElementById('prize-name').textContent = dataPrize.prize.nombre;
            document.getElementById('prize-value').textContent = `$${dataPrize.prize.valor} USD`;

            // Mostrar el resultado de la subasta pasada
            document.getElementById('yesterday-date').textContent = dataPrize.prize.fecha;
            document.getElementById('winner-email').textContent = dataPrize.prize.ganador;
            document.getElementById('winning-offer').textContent = dataPrize.prize.oferta_ganadora;

            if (userEmail && dataPrize.prize.ganador === userEmail) {
                document.getElementById('share-button').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del premio:', error);
    }
}


// ====================================================================
// INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('login-modal');
    loginStatusMessage = document.getElementById('login-status-message');
    
    // 1. Cargar la info del premio
    loadPrizeData();

    // 2. Cargar el dashboard del usuario (si está en localStorage)
    loadDashboardData(); 

    // 3. Asignar Eventos a Botones del Modal y Principal
    document.getElementById('open-login-modal').addEventListener('click', openModal);
    document.getElementById('close-modal-button').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Eventos de la lógica
    document.getElementById('start-login-button').addEventListener('click', handleStartLogin);
    document.getElementById('validate-code-button').addEventListener('click', handleValidateCodeAndClaim);
    document.getElementById('submit-offer-button').addEventListener('click', handleSubmitOffer);
    
    // Implementación simple del botón de compartir
    document.getElementById('share-button').addEventListener('click', () => {
        const winningOffer = document.getElementById('winning-offer').textContent;
        const prizeName = document.getElementById('prize-name').textContent;
        const shareText = `¡Acabo de ganar la Subasta Ciega Diaria con la oferta ${winningOffer} y me llevé ${prizeName}! ¡Juega tú también!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Ganador de Subasta Ciega',
                text: shareText,
                url: window.location.href,
            });
        } else {
            prompt("Copia y comparte este mensaje:", shareText + ' ' + window.location.href);
        }
    });

});
