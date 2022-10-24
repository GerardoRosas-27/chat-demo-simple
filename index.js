const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const qr = require('qr-image')

const client = new Client();


client.on('qr', qr => generateImage(qr, () => {
    qrcode.generate(qr, { small: true });
    console.log(`Ver QR http://localhost:${port}/qr`)
    //socketEvents.sendQR(qr)
}))

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    console.log("mesnaje: ", msg.body);
    if (msg.body == 'Hola') {
        msg.reply('hola soy un bot');
    }
});

const generateImage = (base64, cb = () => {}) => {
    let qr_svg = qr.image(base64, { type: 'svg', margin: 4 });
    qr_svg.pipe(require('fs').createWriteStream('./qr-code.svg'));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
    cb()
}

client.initialize();