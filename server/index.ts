import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './database/config';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import productionRoutes from './routes/production';
import predictionRoutes from './routes/predictions';
import parametersRoutes from './routes/parameters';
import ordersRoutes from './routes/orders';
import chatbotRoutes from './routes/chatbot';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Determinar __dirname correctamente
let __dirname: string;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch {
  // Fallback para tsx/ts-node
  __dirname = path.resolve(process.cwd(), 'server');
}

// Middleware
app.use(cors());
// Accept primitives too to avoid 400 when body is a JSON string
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  console.log(`📁 Sirviendo archivos estáticos desde: ${distPath}`);
}

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/parameters', parametersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Ruta de prueba
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// En producción, servir index.html para rutas específicas (SPA routing)
if (process.env.NODE_ENV === 'production') {
  // Servir index.html para rutas de la aplicación
  const routes = ['/', '/login', '/register', '/dashboard', '/admin', '/production', '/predictions', '/parameters', '/orders', '/chatbot'];
  routes.forEach(route => {
    app.get(route, (req, res) => {
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
      res.sendFile(indexPath);
    });
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.VITE_DB_NAME}`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});
