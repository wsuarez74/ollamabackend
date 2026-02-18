const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // 👈 NUEVA LÍNEA
// ============= RUTAS =============

// ✅ Ruta principal
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>DeepSeek API</title></head>
            <body style="font-family: Arial; padding: 2rem;">
                <h1>🚀 DeepSeek API funcionando</h1>
                <p>Rutas disponibles:</p>
                <ul>
                    <li><a href="/health">/health</a> - Verificar estado</li>
                    <li><a href="/test">/test</a> - Página de prueba</li>
                </ul>
                <p><strong>Endpoint del chat:</strong> POST /api/chat</p>
            </body>
        </html>
    `);
});

// ✅ Ruta de health - ¡AHORA SÍ!
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ✅ Ruta de prueba simple
app.get('/test', (req, res) => {
    res.send('<h1>✅ Test exitoso</h1><p>El servidor está respondiendo.</p>');
});

// ✅ Ruta del chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        console.log('📝 Mensaje:', message);

        // Verificar que la API key existe
        if (!process.env.DEEPSEEK_API_KEY) {
            return res.status(500).json({ 
                error: 'API Key no configurada',
                details: 'Agrega DEEPSEEK_API_KEY en las variables de entorno de Render'
            });
        }

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "Eres un asistente útil." },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 segundos de timeout
        });

        const reply = response.data.choices[0].message.content;
        console.log('✅ Respuesta enviada');
        
        res.json({ 
            reply: reply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error completo:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Si es error de la API de DeepSeek
        if (error.response) {
            res.status(error.response.status).json({ 
                error: 'Error de DeepSeek API',
                details: error.response.data
            });
        } 
        // Si es error de timeout
        else if (error.code === 'ECONNABORTED') {
            res.status(504).json({ 
                error: 'Timeout',
                details: 'La API de DeepSeek tardó demasiado en responder'
            });
        }
        // Error general
        else {
            res.status(500).json({ 
                error: 'Error interno',
                details: error.message
            });
        }
    }
});

// ✅ Manejador para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        availableEndpoints: {
            GET: ['/', '/health', '/test'],
            POST: ['/api/chat']
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`📁 Rutas disponibles:`);
    console.log(`   - GET  /`);
    console.log(`   - GET  /health`);
    console.log(`   - GET  /test`);
    console.log(`   - POST /api/chat`);
    console.log('='.repeat(50));
});
