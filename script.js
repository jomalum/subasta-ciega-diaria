// 🚨 ¡REEMPLAZA ESTA LÍNEA CON LA URL REAL DE TU API DE APPS SCRIPT!
const API_ENDPOINT_URL = 'https://script.google.com/macros/s/TU_URL_DE_IMPLEMENTACION/exec';

let userEmail = localStorage.getItem('subasta_user_email'); // Usar localStorage para recordar al usuario

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

// ====================================================================
// FUNCIONES DE COMUNICACIÓN CON LA API (Apps Script)
// ====================================================================

/**
 * Llama a la API para obtener datos del premio actual y del resultado de ayer.
 */
async function loadPrizeData() {
    try {
        // Obtener datos del premio actual
        const responsePrize = await fetch(`${API_ENDPOINT_URL}?action=get_current_prize`);
        const dataPrize = await responsePrize.json();

        if (dataPrize.success) {
            document.getElementById('prize-name').textContent = dataPrize.prize.nombre;
            document.getElementById('prize-value').textContent = `$${dataPrize.prize.valor} USD`;

            // Mostrar el resultado de la subasta pasada
            document.getElementById('yesterday-date').textContent = dataPrize.prize.fecha;
            document.getElementById('winner-email').textContent = dataPrize.prize.ganador;
            document.getElementById('winning-offer').textContent = dataPrize.prize.oferta_ganadora;

            if (dataPrize.prize.ganador === userEmail) {
                document.getElementById('share-button').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del premio:', error);
    }
}


/**
 * Maneja el registro, login y reclamo de puntos diarios.
 */
async function handleClaim() {
    if (!userEmail) {
        // Pedir el email si no está en localStorage
        let emailInput = prompt("¡Bienvenido! Ingresa tu correo electrónico para empezar a jugar:");
        if (!emailInput || !emailInput.includes('@')) {
            alert("Correo electrónico no válido.");
            return;
        }
        userEmail = emailInput.toLowerCase();
        localStorage.setItem('subasta_user_email', userEmail);
    }
    
    document.getElementById('user-email').textContent = userEmail;
    document.getElementById('claim-button').disabled = true;

    try {
        const response = await fetch(API_ENDPOINT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login_and_claim',
                email: userEmail
            })
        });
        const data = await response.json();

        if (data.success) {
            updateDashboard(data.user);
            displayMessage(data.message, true);
        } else {
            displayMessage(data.message, false);
        }
    } catch (error) {
        displayMessage('Error de conexión con el servidor.', false);
    } finally {
        document.getElementById('claim-button').disabled = false;
    }
}


/**
 * Maneja el envío de la oferta.
 */
async function handleSubmitOffer() {
    if (!userEmail) {
        alert("Primero debes reclamar tus puntos y registrarte.");
        return;
    }

    const offerValue = document.getElementById('offer-value').value;
    const currencyType = document.getElementById('currency-type').value;

    if (!offerValue || isNaN(offerValue) || offerValue < 1 || offerValue > 1000) {
        displayMessage("El valor de la oferta debe ser un número entre 1 y 1000.", false);
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
                diasRacha: document.getElementById('dias-racha').textContent // Mantener el valor actual
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


// ====================================================================
// INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la info del premio
    loadPrizeData();

    // 2. Intentar cargar datos del usuario si ya está registrado
    if (userEmail) {
        handleClaim(); // Esto también sirve para cargar los datos y reclamar
    } else {
        document.getElementById('user-email').textContent = 'Visitante';
    }

    // 3. Asignar Eventos a Botones
    document.getElementById('claim-button').addEventListener('click', handleClaim);
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
            // Fallback para navegadores que no soportan la API nativa de compartir
            prompt("Copia y comparte este mensaje:", shareText + ' ' + window.location.href);
        }
    });

    // 4. Contador regresivo (Simulado, requiere lógica de tiempo real precisa)
    // Se recomienda usar una librería de terceros para un contador exacto si se aloja en hosting estático.
    // Por simplicidad, se omite el código del contador de tiempo real aquí.
});
