-- Tabla para guardar conversaciones del chatbot
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_chatbot_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_created ON chatbot_conversations(created_at);

-- Insertar algunas conversaciones de ejemplo
INSERT INTO chatbot_conversations (user_id, user_message, bot_response) VALUES
(1, 'Hola', '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'),
(1, 'Que productos tienen?', 'Ofrecemos: Muebles, Puertas, Ventanas, Closets modulares y Cocinas integrales'),
(2, 'Cuanto tarda un pedido?', 'Los tiempos de entrega varían según el producto y la carga actual.');
