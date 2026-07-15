require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Middlewares
const { verificarToken, soloAdmin } = require('./src/middlewares/auth.middleware');

// Rutas
const productosRoutes = require('./src/routes/productos.routes');
const facturasRoutes = require('./src/routes/facturas.routes');
const clientesRoutes = require('./src/routes/clientes.routes');
const promocionesRoutes = require('./src/routes/promociones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ═══════════════════════════════════════
//  RUTAS PÚBLICAS
// ═══════════════════════════════════════
app.use('/api/productos', productosRoutes);
app.use('/api/promociones', promocionesRoutes);

// ═══════════════════════════════════════
//  RUTAS PROTEGIDAS (requieren login)
// ═══════════════════════════════════════
app.use('/api/clientes', clientesRoutes);
app.use('/api/facturas', facturasRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Bodega Tito funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});