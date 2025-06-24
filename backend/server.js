// Cargar las variables de entorno
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Twilio = require('twilio');

// Validar que todas las variables de entorno estén presentes
const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER',
    'AGENT_PHONE_NUMBER'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error(`Error: Las siguientes variables de entorno no están configuradas: ${missingVars.join(', ')}`);
    process.exit(1);
}

// Inicializar el cliente de Twilio
const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
app.use(cors());
app.use(express.json());

// Función para validar número de teléfono
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};

// --- Endpoint para enviar SMS ---
app.post('/send-sms', async (req, res) => {
    const { to, body } = req.body;
    
    // Validación de entrada
    if (!to || !body) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan el destinatario y el cuerpo del mensaje.' 
        });
    }
    
    if (!isValidPhoneNumber(to)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Número de teléfono inválido.' 
        });
    }
    
    if (body.length > 1600) {
        return res.status(400).json({ 
            success: false, 
            message: 'El mensaje es demasiado largo.' 
        });
    }

    try {
        await client.messages.create({
            body: body.trim(),
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        
        res.json({ success: true, message: 'SMS enviado con éxito.' });
    } catch (error) {
        console.error('Error al enviar SMS:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error al enviar SMS.' 
        });
    }
});

// --- Endpoint para realizar llamadas (Click-to-Call) ---
app.post('/make-call', async (req, res) => {
    const { to } = req.body;
    
    // Validación de entrada
    if (!to) {
        return res.status(400).json({ 
            success: false, 
            message: 'Falta el número del destinatario.' 
        });
    }
    
    if (!isValidPhoneNumber(to)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Número de teléfono inválido.' 
        });
    }

    try {
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.say({ 
            voice: 'alice', 
            language: 'es-MX' 
        }, 'Conectando con el cliente, por favor espere.');
        twiml.dial(to);

        await client.calls.create({
            twiml: twiml.toString(),
            to: process.env.AGENT_PHONE_NUMBER,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        res.json({ 
            success: true, 
            message: 'Llamada iniciada. Tu teléfono sonará primero.' 
        });
    } catch (error) {
        console.error('Error al iniciar la llamada:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error al iniciar la llamada.' 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor de Twilio escuchando en el puerto ${PORT}`));
