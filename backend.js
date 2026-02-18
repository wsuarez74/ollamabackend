// backend.js - ¡Este código va en tu servidor, NUNCA en tu sitio web!

const express = require('express');
const axios = require('axios');
const app = express();

// Middleware para que el servidor entienda JSON
app.use(express.json());

// === ¡MUY IMPORTANTE! ===
// Aquí cargamos la API Key desde una variable de entorno.
// NUNCA escribas tu API Key directamente en el código.
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Endpoint correcto

// Endpoint que nuestro sitio web va a llamar
app.post('/api/chat', async (req, res) => {
    // 1. Recibimos la pregunta del usuario desde nuestro sitio web
    const userMessage = req.body.message;

    try {
        // 2. Preparamos la solicitud para DeepSeek
        const requestBody = {
            model: "deepseek-chat", // O "deepseek-reasoner" para el modelo con razonamiento
            messages: [
                { role: "system", content: "Eres un asistente útil y amigable." }, // Contexto opcional
                { role: "user", content: userMessage }
            ],
            temperature: 0.7, // Controla la creatividad de la respuesta
            max_tokens: 512,   // Longitud máxima de la respuesta
            // stream: false // Lo pondremos en 'false' para este ejemplo
        };

        // 3. Enviamos la solicitud a DeepSeek de forma segura
        const response = await axios.post(DEEPSEEK_API_URL, requestBody, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 4. La respuesta de DeepSeek llega aquí. La enviamos de vuelta a nuestro sitio web.
        const aiResponse = response.data.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        // 5. Manejamos cualquier error (problemas de red, API key inválida, etc.)
        console.error('Error al llamar a DeepSeek API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Lo siento, hubo un problema al procesar tu solicitud.' });
    }
});

// Iniciamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
