const prisma = require('../lib/prisma');

// Formatear producto para que el front lo entienda
const formatearProducto = (p) => ({
  id:        p.idproducto,
  brand:     p.nomart,
  title:     p.nomart,
  unit:      p.medidas?.desmed || '',
  price:     Number(p.preven).toFixed(2),
  oldPrice:  Number(p.precom).toFixed(2),
  discount:  null,
  image:     p.imagenurl || null,
  stock:     p.stock,
  categoria: p.categoria?.deslin || '',
});

// GET /api/productos
const getProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true, medidas: true }
    });
    res.json(productos.map(formatearProducto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

// GET /api/productos/:id
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await prisma.producto.findUnique({
      where: { idproducto: parseInt(id) },
      include: { categoria: true, medidas: true }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(formatearProducto(producto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// GET /api/productos/categoria/:id
const getProductosByCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const productos = await prisma.producto.findMany({
      where: { activo: true, idcategoria: parseInt(id) },
      include: { categoria: true, medidas: true }
    });
    res.json(productos.map(formatearProducto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos por categoría" });
  }
};

// POST /api/productos
const createProducto = async (req, res) => {
  try {
    const {
      nomart, preven, imagenurl, stock,
      idcategoria, stockMinimo, idUnidadMedida,
      nroart, codbar, valcom, precom, fereg
    } = req.body;

    const nuevoProducto = await prisma.producto.create({
      data: {
        nomart, preven, imagenurl, stock,
        idcategoria, stockMinimo, idUnidadMedida,
        nroart, codbar, valcom, precom,
        fereg: new Date(fereg),
        activo: true
      }
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// GET /api/categorias
const getCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  createProducto,
  getCategorias,
};