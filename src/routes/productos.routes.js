const { Router } = require('express');
const {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  createProducto,
  getCategorias,
} = require('../controllers/productos.controller');

const router = Router();



router.get('/categorias', getCategorias);              // ⚠️ debe ir ANTES de /:id
router.get('/categoria/:id', getProductosByCategoria);
router.get('/:id', getProductoById);
router.get('/marca/:id', getProductosByMarca);
router.get('/', getProductos);
router.post('/', createProducto);

module.exports = router;