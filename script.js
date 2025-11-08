// 🚨 URL DE LA API: DEBES PEGAR TU URL DE IMPLEMENTACIÓN DE APPS SCRIPT AQUÍ
const API_ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbx8stgDl7HFzxM6qmDtm_KUfT5Y5NASOanqlzq2vvPLELNrAHTJthVveOXYncx-_Uw8EA/exec'; 

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
    setTimeout(() => { msgEl.style.display = 'none'; }, 5000); 
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
    
    if (userEmail) {
        document.getElementById('reg-email').value = userEmail;
    }
    if (userWsp) {
        document.getElementById('reg-wsp').value = userWsp;
    }
    
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

async function loadDashboardData() {
    if (!userEmail) return;

    try {
        const response = await fetch(`${API_ENDPOINT_URL}?action=get_dashboard_data&email=${userEmail}`);
        
        if (!response.ok) {
            console.error('Error HTTP al cargar dashboard:', response.statusText);
            document.getElementById('user-email').textContent = 'Error de Conexión';
            return;
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('user-email').textContent = userEmail;
            updateDashboard(data.user);
        } else {
            document.getElementById('user-email').textContent = 'Visitante (No Logueado)';
            if (data.message.includes('no registrado')) {
                localStorage.removeItem('subasta_user_email');
                localStorage.removeItem('subasta_user_wsp');
                userEmail = null;
                userWsp = null;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del dashboard (red/json):', error);
        document.getElementById('user-email').textContent = 'Error de Conexión (Red)';
    }
}


async function handleStartLogin() {
    const email = document.getElementById('reg-email').value.toLowerCase();
    const wsp = document.getElementById('reg-wsp').value.trim();
    
    if (!email || !email.includes('@')) {
        displayLoginMessage("Ingresa un correo electrónico válido.", false);
        return;
    }
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
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            userEmail = email;
            userWsp = data.wsp_number;
            localStorage.setItem('subasta_user_email', userEmail);
            localStorage.setItem('subasta_user_wsp', userWsp);
            
            document.getElementById('step-1-login').style.display = 'none';
            document.getElementById('step-2-validate').style.display = 'block';
            
            document.getElementById('wsp-message').innerHTML = `Hemos generado el código <b>${data.code_generated}</b>. Ingrésalo abajo para reclamar tus Puntos Diarios.`;
            displayLoginMessage(data.message, true); 
            
        } else {
            displayLoginMessage(data.message, false);
        }
    } catch (error) {
        console.error('Error en handleStartLogin:', error);
        displayLoginMessage('Error de conexión al iniciar sesión. Asegúrate de que la URL de tu Apps Script es correcta y el acceso es "Cualquiera".', false);
    } finally {
        document.getElementById('start-login-button').disabled = false;
    }
}


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
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            document.getElementById('step-2-validate').style.display = 'none';
            document.getElementById('step-3-success').style.display = 'block';
            document.getElementById('success-message').textContent = data.message;
            
            if (data.user) {
                updateDashboard(data.user);
                document.getElementById('user-email').textContent = userEmail;
            }
            
            document.getElementById('validation-code').value = ''; 
            setTimeout(closeModal, 3000); 
            
        } else {
            displayLoginMessage(data.message, false);
        }
    } catch (error) {
        console.error('Error en handleValidateCodeAndClaim:', error);
        displayLoginMessage('Error de conexión al validar el código.', false);
    } finally {
        document.getElementById('validate-code-button').disabled = false;
    }
}

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
                offer_value: parseInt(offerValue),
                currency_type: currencyType
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            const currentDays = document.getElementById('dias-racha').textContent;
            const newUserData = {
                puntos: data.new_points, 
                fichas: data.new_fichas,
                diasRacha: currentDays 
            };
            updateDashboard(newUserData);
            displayMessage(data.message, true);
            document.getElementById('offer-value').value = '';
        } else {
            displayMessage(data.message, false);
        }
    } catch (error) {
        console.error('Error al enviar la oferta:', error);
        displayMessage('Error al enviar la oferta (red/servidor).', false);
    } finally {
        document.getElementById('submit-offer-button').disabled = false;
    }
}


async function loadPrizeData() {
    try {
        const responsePrize = await fetch(`${API_ENDPOINT_URL}?action=get_current_prize`);
        
        if (!responsePrize.ok) {
            throw new Error(`Error HTTP: ${responsePrize.status}`);
        }

        const dataPrize = await responsePrize.json();

        if (dataPrize.success) {
            document.getElementById('prize-name').textContent = dataPrize.prize.nombre;
            document.getElementById('prize-value').textContent = `$${dataPrize.prize.valor} USD`;

            document.getElementById('yesterday-date').textContent = dataPrize.prize.fecha;
            document.getElementById('winner-email').textContent = dataPrize.prize.ganador;
            document.getElementById('winning-offer').textContent = dataPrize.prize.oferta_ganadora;

            if (userEmail && dataPrize.prize.ganador === userEmail) {
                document.getElementById('share-button').style.display = 'block';
            } else {
                document.getElementById('share-button').style.display = 'none';
            }
            
            const prizeDateStr = dataPrize.prize.fecha; 
            const parts = prizeDateStr.split('/');
            const deadline = new Date(parts[2], parts[1] - 1, parseInt(parts[0]) + 1, 0, 0, 0); 
            
            const updateCountdown = () => {
                const now = new Date();
                const diff = deadline.getTime() - now.getTime();
                
                if (diff < 0) {
                    document.getElementById('countdown').textContent = 'Subasta Cerrada. Esperando resultados...';
                    return;
                }
                
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                document.getElementById('countdown').textContent = `${hours}h ${minutes}m ${seconds}s`;
            };
            
            setInterval(updateCountdown, 1000);
            updateCountdown(); 
            
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
    
    loadPrizeData();
    loadDashboardData(); 

    document.getElementById('open-login-modal').addEventListener('click', openModal);
    document.getElementById('close-modal-button').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    document.getElementById('start-login-button').addEventListener('click', handleStartLogin);
    document.getElementById('validate-code-button').addEventListener('click', handleValidateCodeAndClaim);
    document.getElementById('submit-offer-button').addEventListener('click', handleSubmitOffer);
    
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


