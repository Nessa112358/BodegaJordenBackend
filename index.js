require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const { verificarToken, soloAdmin } = require('./src/middlewares/auth.middleware');
const productosRoutes = require('./src/routes/productos.routes');
const facturasRoutes = require('./src/routes/facturas.routes');
const clientesRoutes = require('./src/routes/clientes.routes');
const promocionesRoutes = require('./src/routes/promociones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*'  // permite cualquier origen mientras desarrollan
}));
app.use(express.json());

// ═══════════════════════════════════════
//  RUTAS
// ═══════════════════════════════════════
// Rutas públicas (sin autenticación)
app.use('/api/productos', productosRoutes);
app.use('/api/promociones', promocionesRoutes);

// Rutas que requieren login de cliente
app.use('/api/clientes', verificarToken, clientesRoutes);
app.use('/api/facturas', verificarToken, facturasRoutes);

// Rutas solo para admin
app.use('/api/admin', soloAdmin, adminRoutes);

app.use('/api/productos', productosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/promociones', promocionesRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Bodega Tito funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});