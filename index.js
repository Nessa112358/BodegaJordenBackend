require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════
//  PRODUCTOS
// ═══════════════════════════════════════

// GET - Listar todos los productos activos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },        // solo productos activos
      include: {
        categoria: true,              // trae el nombre de la categoría
        medidas: true,                // trae la unidad de medida
      }
    });
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// POST - Agregar un producto nuevo
app.post('/api/productos', async (req, res) => {
  try {
    const {
      descripcion,
      preven,
      imagenurl,
      stock,
      idcategoria,
      stockMinimo,
      idUnidadMedida,
      nroart,
      codbar,
      valcom,
      precom,
      fereg
    } = req.body;

    const nuevoProducto = await prisma.producto.create({
      data: {
        descripcion,
        preven,
        imagenurl,
        stock,
        idcategoria,

        stockMinimo,
        idUnidadMedida,
        nroart,
        codbar,
        valcom,
        precom,
        fereg: new Date(fereg),       // convertimos la fecha
        activo: true
      }
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});