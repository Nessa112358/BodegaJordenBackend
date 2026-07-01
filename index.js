require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const productosRoutes = require('./src/routes/productos.routes');
const facturasRoutes = require('./src/routes/facturas.routes');
const clientesRoutes = require('./src/routes/clientes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*'  // permite cualquier origen mientras desarrollan
}));
app.use(express.json());

// ═══════════════════════════════════════
//  RUTAS
// ═══════════════════════════════════════
app.use('/api/productos', productosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/clientes', clientesRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Bodega Tito funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});