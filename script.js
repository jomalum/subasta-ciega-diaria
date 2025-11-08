async function submitFullUserDataAndClaim(onlyClaim = false) {
  console.log('submitFullUserDataAndClaim llamado con onlyClaim:', onlyClaim);
  
  const status = document.getElementById('modal-status') || document.getElementById('dashboard-status');
  const claimButton = document.getElementById('claim-credits-button');

  status.className = 'status';
  status.classList.remove('hidden');
  status.textContent = onlyClaim ? 'Reclamando créditos...' : 'Guardando datos y reclamando créditos...';

  const data = {
    action: 'submit_full_data_and_claim',
    email: currentEmail,
    only_claim: onlyClaim,
    nombre1: onlyClaim ? currentFullUserData.nombre1 : document.getElementById('modal-nombre1').value.trim(),
    nombre2: onlyClaim ? currentFullUserData.nombre2 : document.getElementById('modal-nombre2').value.trim(),
    apellidoPaterno: onlyClaim ? currentFullUserData.apellidoPaterno : document.getElementById('modal-apellidoPaterno').value.trim(),
    apellidoMaterno: onlyClaim ? currentFullUserData.apellidoMaterno : document.getElementById('modal-apellidoMaterno').value.trim(),
  };

  console.log('Datos enviados:', data);

  if (!onlyClaim && (!data.nombre1 || !data.apellidoPaterno || !data.apellidoMaterno)) {
    status.className = 'status error';
    status.textContent = 'Error: Primer Nombre, Apellido Paterno y Apellido Materno son obligatorios.';
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    
    console.log('Respuesta del servidor:', result);

    if (result.success) {
      status.className = 'status success';
      status.textContent = result.message;
      
      if (result.user) {
        showDashboard(result.user);
        
        Object.assign(currentFullUserData, result.user);
        currentFullUserData.nombre1 = data.nombre1;
        currentFullUserData.nombre2 = data.nombre2;
        currentFullUserData.apellidoPaterno = data.apellidoPaterno;
        currentFullUserData.apellidoMaterno = data.apellidoMaterno;

        saveSession(currentFullUserData);
        
        if (!onlyClaim) {
           claimButton.textContent = '✅ RECOGER CRÉDITOS DEL DÍA';
           setTimeout(closeModal, 2000); 
        }
      }
      
    } else {
      status.className = 'status error';
      status.textContent = result.message;
    }
  } catch (err) {
    console.error('Error en submitFullUserDataAndClaim:', err);
    status.className = 'status error';
    status.textContent = 'Error de conexión al enviar datos y reclamar puntos.';
  }
}
