const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client();

// Cargamos el menú desde el JSON
const menu = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));

// Objeto para guardar el estado de cada usuario
let userSessions = {};

// Función para enviar el menú principal
function sendMenu(sender) {
  let menuText = '📋 *Selecciona una opción:*\n';
  for (const key in menu) {
    menuText += `${key}. ${menu[key].description}\n`;
  }
  client.sendMessage(sender, menuText);
}

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Escanea el QR con tu dispositivo.');
});

client.on('ready', () => {
  console.log('¡Cliente listo!');
});

client.on('message', async msg => {
  const sender = msg.from;
  const text = msg.body.trim().toLowerCase();

  // Si el usuario escribe "menu", mostramos el menú y reiniciamos la sesión
  if (text === 'menu') {
    sendMenu(sender);
    delete userSessions[sender];
    return;
  }

  // Si el usuario ya tiene una sesión activa (flujo en curso)
  if (userSessions[sender]) {
    let session = userSessions[sender];
    let currentOption = menu[session.option];
    let currentStepIndex = session.step;

    // Guardamos la respuesta del paso actual
    const field = currentOption.steps[currentStepIndex].field;
    session.data[field] = msg.body; // Aquí podrías agregar validaciones

    // Avanzamos al siguiente paso
    session.step++;

    if (session.step < currentOption.steps.length) {
      // Si quedan más pasos, enviamos el siguiente prompt
      msg.reply(currentOption.steps[session.step].prompt);
    } else {
      // Si se completaron todos los pasos, confirmamos y regresamos al menú
      msg.reply(`✅ Reporte completado. Datos registrados`);
      delete userSessions[sender];
      // Regresamos al menú principal
      sendMenu(sender);
    }
    return;
  }

  // Si el mensaje es una opción válida del menú
  if (menu[text]) {
    // Iniciamos la sesión para ese usuario
    userSessions[sender] = {
      option: text,
      step: 0,
      data: {}
    };
    // Enviamos el primer prompt para esa opción
    msg.reply(menu[text].steps[0].prompt);
  } else {
    // Si la opción no es válida, se solicita que escriba "menu"
    msg.reply('❌ Opción no válida. Escribe "menu" para ver las opciones disponibles.');
  }
});

client.initialize();