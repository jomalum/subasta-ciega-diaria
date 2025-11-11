// ID de tu hoja de cálculo de Google
const SHEET_ID = "1xQZhT8qLIoZhfibsfOSvNOQUBkIruoGkBAL86KEhd6Q"; 
const SHEET_NAME = "USUARIOS"; 

// Función principal para manejar peticiones web (GET)
function doGet(e) {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

// Función para manejar peticiones POST (registro y login)
function doPost(e) {
  const params = e.parameter;
  const action = params.action;
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
     return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Error del servidor: Hoja no encontrada." }))
        .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'register') {
    return handleRegister(params, sheet);
  } else if (action === 'login') {
    return handleLogin(params, sheet);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Acción no válida." }))
    .setMimeType(ContentService.MimeType.JSON);
}


// --- Lógica de Registro ---
function handleRegister(params, sheet) {
  // CLAVE: Convertir a MAYÚSCULAS al guardar
  const email = params.email.toUpperCase(); 
  const phone = params.phone;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { 
    if (data[i][0] === email || data[i][1] == phone) { // Note: Usamos == para el teléfono por si es texto/número
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "El CORREO ELECTRÓNICO o N° DE CELULAR ya está registrado." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 2. Si no existe, registrar el nuevo usuario
  const newRow = [
    email,
    phone,
    new Date().toLocaleDateString("es-ES") + " " + new Date().toLocaleTimeString("es-ES"),
    "ACTIVO"
  ];
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    message: "Usuario registrado exitosamente." 
  })).setMimeType(ContentService.MimeType.JSON);
}


// --- Lógica de Inicio de Sesión ---
function handleLogin(params, sheet) {
  // CLAVE: Convertir a MAYÚSCULAS al buscar
  const email = params.email.toUpperCase(); 
  const phone = params.phone;
  
  const data = sheet.getDataRange().getValues();
  
  // Buscar las credenciales en la base de datos
  for (let i = 1; i < data.length; i++) {
    // data[i][0] es CORREO, data[i][1] es CELULAR
    if (data[i][0] === email && data[i][1] == phone) { 
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Inicio de sesión exitoso." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Si no encuentra coincidencia
  return ContentService.createTextOutput(JSON.stringify({ 
    success: false, 
    message: "Credenciales inválidas. Correo o celular incorrectos." 
  })).setMimeType(ContentService.MimeType.JSON);
}
